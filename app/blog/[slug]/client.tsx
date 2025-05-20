"use client"

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BlogService } from "@/lib/blog-service"
import { BlogPost } from "@/lib/supabase"
import { useAuth } from '@/lib/auth-context'
import { parseMarkdownSync } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.title = `${post.title} - kubinet.dev`
  }, [post.title])

  // Tarih formatını çevir
  const formattedDate = useMemo(() => {
    const date = new Date(post.created_at)
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Istanbul"
    }).format(date)
  }, [post.created_at])

  // Okuma süresini hesapla
  const readingTime = useMemo(() => {
    // Ortalama okuma hızı: dakikada 200 kelime
    const words = post.content.trim().split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} dk okuma`
  }, [post.content])

  // Markdown içeriğini önizleme için HTML'e memoize et
  const htmlContent = useMemo(() => {
    return parseMarkdownSync(content)
  }, [content])

  // Görüntüleme için markdown içeriği oluştur
  const displayHtml = useMemo(() => {
    return parseMarkdownSync(post.content)
  }, [post.content])

  const updatePreview = (newContent: string) => {
    setContent(newContent)
  }

  const handleEdit = async () => {
    setIsLoading(true)
    try {
      const updatedPost = await BlogService.updatePost(post.id, {
        title,
        content,
      })
      
      if (updatedPost) {
        toast.success("Gönderi başarıyla güncellendi")
        setIsEditing(false)
        router.refresh()
      } else {
        toast.error("Gönderi güncellenirken bir hata oluştu")
      }
    } catch (error) {
      console.error("Gönderi güncelleme hatası:", error)
      toast.error("Gönderi güncellenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const success = await BlogService.deletePost(post.id)
      
      if (success) {
        toast.success("Gönderi başarıyla silindi")
        router.push('/blog')
      } else {
        toast.error("Gönderi silinirken bir hata oluştu")
      }
    } catch (error) {
      console.error("Gönderi silme hatası:", error)
      toast.error("Gönderi silinirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">Gönderiyi Düzenle</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input 
              id="title"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="content">İçerik</Label>
            <Tabs defaultValue="edit">
              <div className="flex justify-between items-center mb-2">
                <TabsList>
                  <TabsTrigger value="edit">Düzenle</TabsTrigger>
                  <TabsTrigger value="preview">Önizle</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="edit">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => updatePreview(e.target.value)}
                  className="min-h-[400px] font-mono"
                />
              </TabsContent>
              <TabsContent value="preview">
                <Card className="p-4 min-h-[400px] overflow-auto">
                  <div className="prose prose-stone dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
              İptal
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="prose max-w-none">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{formattedDate} · {readingTime}</p>
      
      <div dangerouslySetInnerHTML={{ __html: displayHtml }} />
      
      {isAuthenticated && (
        <div className="flex space-x-2 mt-8">
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Düzenle
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Sil</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Gönderiyi silmek istiyor musunuz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. Bu gönderi kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
                  {isLoading ? "Siliniyor..." : "Evet, Sil"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </article>
  )
} 