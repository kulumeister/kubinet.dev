/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Resimleri optimize et
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Performans optimizasyonları
  poweredByHeader: false, // X-Powered-By header'ı kaldır
  compress: true, // Gzip sıkıştırmayı aktifleştir
  reactStrictMode: true, // React strict mode aktifleştir
  
  // Tüm sayfaları dinamik olarak oluştur - önbelleksiz
  staticPageGenerationTimeout: 60,
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Her sayfayı dinamik yap
  output: 'standalone',
  
  // Ek performans optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

export default nextConfig
