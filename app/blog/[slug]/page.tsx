import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BlogService } from "@/lib/blog-service"
import BlogPostClient from "@/app/blog/[slug]/client"
import { LoadingSpinner } from "@/components/loading-spinner"

// Her 10 dakikada bir yenile (ISR - Arkaplan yenileme)
export const revalidate = 600

export async function generateStaticParams() {
  const posts = await BlogService.getPublishedPosts()
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Gönderi yükleniyor..." />}>
      <BlogPostContent params={params} />
    </Suspense>
  )
}

// Asenkron içerik bileşeni
async function BlogPostContent({ params }: { params: { slug: string } }) {
  // Dinamik rota parametrelerine erişmeden önce params'ı bekle
  const resolvedParams = await params
  const { slug } = resolvedParams
  
  const post = await BlogService.getPostBySlug(slug)
  
  if (!post || !post.published) {
    notFound()
  }
  
  return <BlogPostClient post={post} />
} 