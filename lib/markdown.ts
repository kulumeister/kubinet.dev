import { marked } from 'marked';

// Önceden ayarlanmış marked yapılandırması
const renderer = new marked.Renderer();

// Markdown işleme performansını artırmak için marked'ı yapılandır
marked.setOptions({
  renderer: renderer,
});

// Önceden işlenmiş markdown için bir önbellek
const markdownCache = new Map<string, { html: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 saat

/**
 * Markdown içeriğini HTML'e dönüştürür ve önbelleğe alır (senkron)
 */
export function parseMarkdownSync(markdown: string): string {
  if (!markdown || markdown.trim() === '') {
    return '';
  }
  
  // Önbellekte varsa ve taze ise
  const cachedResult = markdownCache.get(markdown);
  const now = Date.now();
  
  if (cachedResult && now - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.html;
  }
  
  try {
    // marked senkron kullanım için parse kullanılır
    const html = marked.parse(markdown, { 
      gfm: true,
      breaks: true
    }) as string;
    
    // Önbelleğe kaydet
    markdownCache.set(markdown, { html, timestamp: now });
    
    return html;
  } catch (error) {
    console.error('Markdown işlenirken hata:', error);
    return `<p>İçerik işlenirken bir hata oluştu.</p>`;
  }
}

/**
 * Önbelleği temizler
 */
export function clearMarkdownCache(): void {
  markdownCache.clear();
} 