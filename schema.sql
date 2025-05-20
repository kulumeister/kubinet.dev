-- Blog veritabanı şeması

-- Posts tablosu: Blog yazılarını depolamak için
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  published BOOLEAN DEFAULT FALSE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Posts tablosu için indeksler
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);

-- RLS (Row Level Security) Kuralları
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Herkes yayınlanmış gönderileri okuyabilir
CREATE POLICY "Yayınlanmış gönderiler herkes tarafından görüntülenebilir" 
  ON public.posts 
  FOR SELECT 
  USING (published = true);

-- Kullanıcılar kendi gönderilerini görüntüleyebilir, düzenleyebilir, silebilir
CREATE POLICY "Kullanıcılar kendi gönderilerini yönetebilir" 
  ON public.posts 
  FOR ALL 
  USING (auth.uid() = author_id);

-- Sayfa içerikleri tablosu: Ana sayfa ve diğer statik sayfaların içeriklerini depolamak için
CREATE TABLE IF NOT EXISTS public.page_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Page contents için index
CREATE INDEX IF NOT EXISTS page_contents_page_key_idx ON public.page_contents(page_key);

-- Page contents için RLS kuralları
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

-- Herkes sayfa içeriklerini okuyabilir
CREATE POLICY "Sayfa içerikleri herkes tarafından görüntülenebilir" 
  ON public.page_contents 
  FOR SELECT 
  USING (true);

-- Sadece giriş yapmış kullanıcılar sayfa içeriklerini düzenleyebilir
CREATE POLICY "Giriş yapmış kullanıcılar sayfa içeriklerini düzenleyebilir" 
  ON public.page_contents 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- İsteğe bağlı: Profil tablosu kullanıcı bilgilerini depolamak için
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Profile tablosu için RLS kuralları
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiller herkese görünür
CREATE POLICY "Profiller herkes tarafından görüntülenebilir" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Kullanıcılar kendi profillerini düzenleyebilir
CREATE POLICY "Kullanıcılar kendi profillerini düzenleyebilir" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Kullanıcı oluşturulduğunda profil oluşturmak için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email, -- Başlangıçta e-posta adresini kullanıcı adı olarak kullan
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı oluşturma tetikleyicisi
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Mevcut olan page_contents tablosundan title sütununu kaldır (eğer tablo varsa)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'page_contents' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE public.page_contents DROP COLUMN title;
  END IF;
END
$$;

-- Varsayılan ana sayfa içeriği oluştur
INSERT INTO public.page_contents (page_key, content)
VALUES ('homepage', 'Kubinet.dev - Yazılım Geliştirme & Teknoloji Danışmanlığı

Modern web uygulamaları, mobil çözümler ve bulut mimarileri konusunda uzmanlaşmış bir yazılım geliştirme ve danışmanlık hizmetleri sunuyoruz.

## Hizmetlerimiz

- Full-stack web uygulamaları geliştirme
- Mobil uygulama geliştirme (iOS/Android)
- Bulut mimarileri ve DevOps çözümleri
- Teknik danışmanlık ve eğitim

## İletişim

Projeleriniz için bizimle iletişime geçebilirsiniz:

- E-posta: info@kubinet.dev
- LinkedIn: linkedin.com/company/kubinet
- GitHub: github.com/kubinet

Kaliteli, ölçeklenebilir ve kullanıcı dostu çözümler için doğru adrestesiniz.')
ON CONFLICT (page_key) 
DO UPDATE SET content = EXCLUDED.content; 