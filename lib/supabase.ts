import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL veya anonim anahtar bulunamadı. Çevre değişkenlerini kontrol edin.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  username: string
  email: string
  created_at: string
}

export type BlogPost = {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  published: boolean
  slug: string
}

export type PageContent = {
  id: string
  page_key: string
  content: string
  last_updated_by?: string
  created_at: string
  updated_at: string
} 