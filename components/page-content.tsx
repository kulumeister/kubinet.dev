import { useState, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { updatePageContent } from '@/lib/page-content-service';
import { PageContent } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// ReactMarkdown'ı dinamik olarak yüklüyoruz
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <p>İçerik yükleniyor...</p>,
  ssr: true
});

type PageContentProps = {
  content: PageContent;
  isAuthenticated: boolean;
  userId?: string;
};

export const PageContentDisplay = memo(function PageContentDisplay({ content, isAuthenticated, userId }: PageContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content.content);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePageContent(content.page_key, editContent, userId);
      setIsEditing(false);
      router.refresh(); // Sayfayı yenilemek için
    } catch (error) {
      console.error('İçerik kaydedilirken hata oluştu:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // İçerik büyük olduğunda gereksiz yeniden render'ları önlemek için memoization
  const renderedContent = useMemo(() => (
    <div className="prose prose-stone dark:prose-invert max-w-none">
      <ReactMarkdown>{content.content}</ReactMarkdown>
    </div>
  ), [content.content]);

  const renderedEditPreview = useMemo(() => (
    <div className="prose prose-stone dark:prose-invert max-w-none">
      <ReactMarkdown>{editContent}</ReactMarkdown>
    </div>
  ), [editContent]);

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="edit">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="edit">Düzenle</TabsTrigger>
              <TabsTrigger value="preview">Önizle</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="edit">
            <Textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              className="min-h-[300px]" 
              placeholder="Markdown formatında içerik yazabilirsiniz"
            />
          </TabsContent>
          <TabsContent value="preview">
            <Card className="p-4 min-h-[300px] overflow-auto">
              {renderedEditPreview}
            </Card>
          </TabsContent>
        </Tabs>
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
            İptal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {renderedContent}
      
      {isAuthenticated && (
        <div className="mt-6">
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Düzenle
          </Button>
        </div>
      )}
    </div>
  );
}); 