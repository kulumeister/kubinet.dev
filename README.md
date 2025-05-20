# [kubinet.dev](https://kubinet.dev)

`kubinet.dev`, Next.js tabanlı, blog özellikli kişisel bir web sayfası projesidir. Benim için kafama esenleri yazdığım, küçük ama bana ait bir dijital köşe. Hem kişisel portfolyo hem de not defteri gibi düşünebilirsin.

## Projeyi Çalıştırma ve Kurulum

Projeyi yerel makinenizde çalıştırmak veya bir sunucuya dağıtmak için aşağıdaki adımları izleyebilirsiniz.

### 1. Gerekli Bağımlılıkların Kurulumu

Proje dosyalarını indirdikten sonra, projenin kök dizininde terminalinizi açın ve aşağıdaki komutu çalıştırarak gerekli tüm paketleri yükleyin:

```bash
npm install
```

### 2. Geliştirme Ortamında Çalıştırma

Projeyi geliştirme modunda başlatmak için aşağıdaki komutu kullanın:

```bash
npm run dev
```

Bu komut genellikle projeyi `http://localhost:3000` adresinde başlatır.

### 3. Projeyi Build Etme (Production için Hazırlık)

Projeyi production ortamına dağıtmadan önce optimize edilmiş bir sürümünü oluşturmanız gerekir. Bunun için aşağıdaki komutu çalıştırın:

```bash
npm run build
```

Bu komut, projenin `build` edilmiş halini `.next` klasörü içine oluşturacaktır.

### 4. Production Ortamında Çalıştırma

Projeyi build ettikten sonra, production modunda başlatmak için aşağıdaki komutu kullanın:

```bash
npm run start
```

`package.json` dosyasında tanımlandığı üzere, bu komut varsayılan olarak projeyi `3001` portunda başlatacaktır (`next start -p 3001`).

Eğer projeyi farklı bir portta çalıştırmak isterseniz, `package.json` dosyasındaki `scripts` bölümünde yer alan `start` komutunu düzenleyebilirsiniz. Örneğin, `-p 3001` kısmını silerseniz, Next.js varsayılan olarak `3000` portunu kullanacaktır. Dilerseniz `-p <istediğiniz_port_numarası>` şeklinde farklı bir port da belirleyebilirsiniz.

Örnek `package.json` ilgili satır:
```json
// ...
"scripts": {
  // ...
  "start": "next start -p 3001",
  // ...
},
// ...
```

## Supabase Kurulumu

Bu belge, `kubinet.dev` projesi için Supabase entegrasyonunun nasıl kurulacağını açıklar.

### Adımlar

1.  **Yeni Proje Oluşturma**:
    *   [Supabase Dashboard](https://app.supabase.com)'a gidin ve yeni bir proje oluşturun.

2.  **Veritabanı Şemasını Kurma**:
    *   Supabase Dashboard'da **SQL Editörü**'ne gidin.
    *   `schema.sql` dosyasının içeriğini kopyalayın (proje içerisinde bu dosyanın olması beklenir, eğer yoksa manuel oluşturmanız gerekebilir).
    *   SQL Editörü'ne yapıştırın ve çalıştırın.

3.  **URL ve Anahtarları Alma**:
    *   Proje ayarları > **API** sayfasına gidin.
    *   "anon" / "public" anahtarını ve URL'yi kopyalayın.
    *   Bu bilgileri projenizin kök dizininde **`.env.local`** adlı bir dosya oluşturarak aşağıdaki formatta ekleyin:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=<sizin-supabase-url>
        NEXT_PUBLIC_SUPABASE_ANON_KEY=<sizin-anonim-anahtar>
        NEXT_PUBLIC_KUBI_KEY=<sizin-belirlediğiniz-gizli-anahtar>
        ```

4.  **Kullanıcı Oluşturma**:
    *   Supabase Dashboard'unda Authentication > **Users** bölümüne gidin.
    *   "Create User" (Kullanıcı Oluştur) seçeneği ile sitenin kullanıcısını oluşturun (E-posta ve şifre belirleyerek).
    *   **Not**: Bu proje tek bir kullanıcı için tasarlandığından, kayıt olma gibi özellikler aktif edilmemiştir. Supabase'in "Allow new users to sign up" ayarının kapalı olduğundan emin olun (Authentication > Sign In / Providers > User Signups altında).

## Kullanım Özellikleri

Bu Supabase yapılandırması aşağıdaki temel işlevselliği sağlar:

*   **Kimlik Doğrulama**: Kullanıcı için güvenli giriş sistemi.
*   **Blog Gönderi Depolama**: Blog yazılarınız için veritabanı altyapısı.
*   **Sayfa İçeriği Yönetimi**: Ana sayfa ve diğer statik sayfaların içeriklerinin dinamik olarak yönetimi.
*   **Güvenlik Politikaları**:
    *   Tüm ziyaretçiler yayınlanmış blog gönderilerini okuyabilir.
    *   Yalnızca giriş yapmış kullanıcı yeni gönderi oluşturabilir, mevcut gönderileri düzenleyebilir ve silebilir.

## Güvenlik Notları

*   `KUBI_KEY` anahtarınızı ve Supabase anahtarlarınızı daima güvenli ortamlarda saklayın.
*   Supabase anahtarlarınızı **asla** istemci tarafı (frontend) kodunuzda doğrudan ifşa etmeyin. `.env.local` dosyası bu amaçla kullanılır ve Next.js tarafından güvenli bir şekilde yönetilir.
*   API isteklerinizin, Supabase tarafında tanımladığınız güvenlik kurallarına (Row Level Security) uygun olduğundan emin olun.

## Sayfa İçeriği Yönetimi (`page_contents` Tablosu)

Ana sayfa ve diğer statik sayfaların içerikleri `page_contents` adlı bir tabloda saklanır.

*   **Sayfa Tanımlama**:
    *   Her sayfa, `page_key` adı verilen benzersiz bir anahtar ile tanımlanır.
    *   Örnek anahtarlar: `homepage` (ana sayfa için), `about` (hakkında sayfası için), `contact` (iletişim sayfası için) vb.
*   **İçerik Düzenleme İşlemi**:
    *   Giriş yapmış kullanıcı için ilgili sayfalarda bir "Düzenle" butonu görünür.
    *   Bu butona tıklandığında, sayfa içeriğini düzenlemek için bir form açılır.
    *   Giriş yapmamış kullanıcılar düzenleme butonunu göremezler.
*   **Varsayılan İçerikler**:
    *   Veritabanı şeması (`schema.sql`) ilk kez kurulduğunda, bazı sayfalar için varsayılan içerikler otomatik olarak eklenir.

## Site Özelleştirmeleri ve İpuçları

*   **Favicon Değişikliği**:
    *   Sitenin favicon'ları `public/` klasörü altında bulunmaktadır.
    *   Bu klasördeki dosyaları (örn: `favicon.ico`, `apple-touch-icon.png` vb.) kendi ikonlarınızla değiştirerek site ikonlarını güncelleyebilirsiniz.
*   **404 Sayfası Yönetimi**:
    *   **GIF'ler**: Kayıp sayfa (404) üzerinde rastgele gösterilen GIF'ler `app/NotFoundPageContent.tsx` dosyasındaki `gifs` dizisinden yönetilmektedir. Bu diziyi güncelleyerek farklı GIF'ler ekleyebilir veya mevcutları değiştirebilirsiniz.
    *   **Sayfa Başlığı**: 404 sayfasının tarayıcı sekmesinde görünen başlığı `app/not-found.tsx` dosyasındaki `metadata` objesi üzerinden ayarlanmaktadır.
*   **Gizli Giriş Modalı**:
    *   Sitenin herhangi bir yerinde "kubinet.dev" yazısına  **üç kez** hızlıca tıklandığında giriş yapma modalı açılır. 
    *   Giriş yapmak için `.env.local` dosyanızda tanımladığınız `NEXT_PUBLIC_KUBI_KEY` değerini ve Supabase'de oluşturduğunuz kullanıcının e-posta ve şifresini kullanmanız gerekecektir.
*   **Markdown Desteği**:
    *   Blog gönderileri ve `page_contents` tablosu aracılığıyla yönetilen sayfa içerikleri **Markdown** formatını desteklemektedir. İçeriklerinizi Markdown sözdizimi kullanarak zengin metin formatında (başlıklar, listeler, kalın/italik metin, kod blokları vb.) oluşturabilirsiniz. 

## Todo (Yapılacaklar)

Projeye gelecekte eklemeyi planladığım özellikler:

- Blog gönderilerine yorum yapabilme özelliği eklenecek.
- Navigasyon çubuğuna (navbar) yeni sayfalar (örneğin "Projelerim", "Hakkımda" gibi) dinamik olarak eklenebilecek.

    