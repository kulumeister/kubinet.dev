import { supabase, PageContent } from './supabase';

// Revalidation işlemini yapan fonksiyon
async function revalidateContent(path?: string): Promise<void> {
  try {
    const API_TOKEN = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN || "gizli-token";
    
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: API_TOKEN,
        path 
      }),
    });
  } catch (error) {
    console.error('Revalidation hatası:', error);
  }
}

/**
 * Sayfa içeriğini doğrudan veritabanından getirir
 */
export async function getPageContent(pageKey: string): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('page_contents')
    .select('*')
    .eq('page_key', pageKey)
    .single();
  
  if (error) {
    console.error('Sayfa içeriği alınırken hata oluştu:', error);
    return null;
  }
  
  return data as PageContent;
}

export async function updatePageContent(
  pageKey: string, 
  content: string, 
  userId?: string
): Promise<PageContent | null> {
  const updateData: { content: string; last_updated_by?: string } = {
    content,
  };

  if (userId) updateData.last_updated_by = userId;

  const { data, error } = await supabase
    .from('page_contents')
    .update(updateData)
    .eq('page_key', pageKey)
    .select()
    .single();
  
  if (error) {
    console.error('Sayfa içeriği güncellenirken hata oluştu:', error);
    return null;
  }
  
  // Sayfa içeriği güncellendiğinde ilgili sayfayı yenile
  if (pageKey === 'homepage') {
    await revalidateContent('/');
  } else {
    // Diğer sayfa türleri için gerekirse burada ek yollar eklenebilir
    await revalidateContent(`/${pageKey}`);
  }
  
  return data as PageContent;
} 