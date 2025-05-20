import { supabase } from './supabase'
import type { BlogPost } from './supabase'

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

export const BlogService = {
  /**
   * Tüm yayınlanmış blog yazılarını getirir
   */
  async getPublishedPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("Blog yazıları getirilemedi:", error)
      return []
    }
    
    return data as BlogPost[]
  },

  /**
   * Belirli bir slug'a sahip blog yazısını getirir
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error(`${slug} slug'ına sahip yazı getirilemedi:`, error)
      return null
    }
    
    return data as BlogPost
  },

  /**
   * Yeni bir blog yazısı oluşturur
   */
  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { 
          ...post, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select('id, title, slug')
      .single()
    
    if (error) {
      console.error("Blog yazısı oluşturulamadı:", error)
      return null
    }
    
    // Yeni yazı oluşturulduğunda sayfaları yenile
    await revalidateContent();
    
    return data as BlogPost
  },

  /**
   * Varolan bir blog yazısını günceller
   */
  async updatePost(id: string, post: Partial<Omit<BlogPost, 'id' | 'created_at' | 'author_id'>>): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .update({ 
        ...post, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select('id, title, updated_at, slug')
      .single()
    
    if (error) {
      console.error("Blog yazısı güncellenemedi:", error)
      return null
    }
    
    // Yazı güncellendiğinde hem blog sayfasını hem de ilgili detay sayfasını yenile
    if (data && data.slug) {
      await revalidateContent(`/blog/${data.slug}`);
      await revalidateContent('/blog');
    }
    
    return data as BlogPost
  },

  /**
   * Bir blog yazısını siler
   */
  async deletePost(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error("Blog yazısı silinemedi:", error)
      return false
    }
    
    // Yazı silindiğinde blog sayfasını yenile
    await revalidateContent('/blog');
    
    return true
  },
  
  /**
   * Kullanıcı için tüm blog yazılarını getirir (admin paneli için)
   */
  async getAllPosts(userId: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, created_at, published')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("Blog yazıları getirilemedi:", error)
      return []
    }
    
    return data as BlogPost[]
  }
} 