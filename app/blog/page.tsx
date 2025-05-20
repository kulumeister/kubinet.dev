import { Suspense } from "react"
import Link from "next/link"
import { BlogService } from "@/lib/blog-service" 
import { LoadingSpinner } from "@/components/loading-spinner"

// Her 10 dakikada bir yenile (ISR - Arkaplan yenileme)
export const revalidate = 600

// Okuma süresini hesapla
function calculateReadingTime(content: string): string {
  // Ortalama okuma hızı: dakikada 200 kelime
  const words = content?.trim().split(/\s+/).length || 0
  const minutes = Math.ceil(words / 200)
  return `${minutes} dk`
}

export default function Blog() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-8">son gönderiler</h1>
      <Suspense fallback={<LoadingSpinner message="Blog gönderileri yükleniyor..." />}>
        <BlogPosts />
      </Suspense>
    </div>
  )
}

// Asenkron içerik bileşeni
async function BlogPosts() {
  // Blog yazılarını veritabanından getir
  const posts = await BlogService.getPublishedPosts()
  
  // Blog içeriklerini getir (tam post bilgisi)
  const postsWithContent = await Promise.all(
    posts.map(post => BlogService.getPostBySlug(post.slug))
  )
  
  // Yazılar yoksa bu içeriği göster
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground">Henüz blog yazısı bulunmamaktadır.</p>
    )
  }

  // Yazıları tarih formatını dönüştürerek göster
  return (
    <ul className="space-y-4 font-mono">
      {postsWithContent.map((post) => {
        if (!post) return null
        
        // ISO tarih formatını insan tarafından okunabilir hale getir
        const date = new Date(post.created_at)
        const formattedDate = new Intl.DateTimeFormat("tr-TR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Europe/Istanbul"
        }).format(date)
        
        // Okuma süresini hesapla
        const readingTime = calculateReadingTime(post.content)
        
        return (
          <li key={post.slug} className="flex">
            <span className="text-gray-600 w-36">{formattedDate}</span>
            <Link href={`/blog/${post.slug}`} className="font-bold hover:underline">
              {post.title}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
