import { Suspense } from 'react';
import { getPageContent } from '@/lib/page-content-service';
import { PageContentClient } from '@/components/page-content-client';
import { LoadingSpinner } from '@/components/loading-spinner';

// Sayfa geçişlerinde daha iyi performans için statik olarak oluştur
// Ve RevalidatePath ile gerektiğinde yenile
export const revalidate = 3600; // 1 saat cache

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner message="İçerik yükleniyor..." />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const content = await getPageContent('homepage');
  
  if (!content) {
    return (
      <div className="space-y-8">
        <p className="text-xl">Ana sayfa içeriği bulunamadı.</p>
      </div>
    );
  }

  return <PageContentClient content={content} />;
}
