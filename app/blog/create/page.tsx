"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { marked } from "marked"
import { BlogService } from "@/lib/blog-service"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function CreateBlogPost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [slug, setSlug] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Başlık değişince otomatik slug oluştur
  useEffect(() => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  }, [title]);

  useEffect(() => {
    // Markdown içeriğini HTML'e dönüştür
    setHtmlContent(marked.parse(content) as string)
  }, [content])

  // Kullanıcının oturum açtığını kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      
      // Oturum açılmamışsa blog sayfasına yönlendir
      if (!data.session) {
        toast.error("Bu sayfaya erişmek için oturum açmanız gerekiyor")
        router.push("/blog")
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error("Bu işlem için oturum açmanız gerekiyor")
      return
    }
    
    if (!title || !content || !slug) {
      toast.error("Lütfen tüm alanları doldurun")
      return
    }
    
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("Kullanıcı bilgisi bulunamadı")
      }
      
      const result = await BlogService.createPost({
        title,
        content,
        slug,
        author_id: userData.user.id,
        published: true, // Varsayılan olarak yayınla
      })
      
      if (result) {
        toast.success("Gönderi başarıyla oluşturuldu")
        router.push("/blog")
      } else {
        toast.error("Gönderi oluşturulurken bir hata oluştu")
      }
    } catch (error) {
      console.error("Gönderi oluşturma hatası:", error)
      toast.error("Gönderi oluşturulurken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            placeholder="Gönderi başlığını girin"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">URL Yolu (Slug)</Label>
          <Input
            id="slug"
            placeholder="gonderinizin-url-yolu"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
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
                placeholder="Markdown formatında içeriğinizi yazın..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono"
                required
              />
            </TabsContent>
            <TabsContent value="preview">
              <Card className="p-4 min-h-[400px] overflow-auto">
                <div className="prose prose-neutral max-w-none">
                  {/* Markdown içeriğini HTML olarak göster */}
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex space-x-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/blog")}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Oluşturuluyor..." : "Gönderi Oluştur"}
          </Button>
        </div>
      </form>
    </div>
  )
} 