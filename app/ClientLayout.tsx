"use client"

import { useState, useRef, useEffect, memo, useCallback } from "react"
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { usePathname, useRouter } from "next/navigation"
import { SiteNav } from "@/components/site-nav"
import { AuthDialog } from "@/components/auth-dialog"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

const HeaderContent = memo(function HeaderContent() {
  const pathname = usePathname()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isAuthenticated } = useAuth()

  const handleTitleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); // Sayfanın yenilenmesini önle
    clickCountRef.current += 1

    // İlk tıklama ise zamanlayıcı başlat
    if (clickCountRef.current === 1) {
      clickTimerRef.current = setTimeout(() => {
        // 2 saniye içinde yeterli tıklama olmadıysa sıfırla
        clickCountRef.current = 0
        clickTimerRef.current = null
      }, 2000)
    }

    // 2 saniye içinde 3 tıklama olursa ve kullanıcı giriş yapmadıysa modalı aç
    if (clickCountRef.current === 3 && !isAuthenticated) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
      }
      clickCountRef.current = 0
      setIsAuthOpen(true)
    } else if (clickCountRef.current === 3) {
      // Kullanıcı giriş yaptıysa sadece sayacı sıfırla
      clickCountRef.current = 0
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Temizleme işlevi
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
      }
    }
  }, [])

  return (
    <>
      <header className="mb-16 text-center">
        <h1 className="text-3xl font-mono mb-8">
          {pathname === "/" ? (
          <a href="#" onClick={handleTitleClick} className="cursor-pointer">
            kubinet.dev
          </a>
          ) : (
            <Link href="/" prefetch={true} className="cursor-pointer">
              kubinet.dev
            </Link>
          )}
        </h1>
        <nav className="flex justify-center space-x-4">
          <SiteNav />
        </nav>
      </header>
      <AuthDialog isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  )
})

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <div className="max-w-2xl mx-auto px-4 py-16">
            <HeaderContent />
            <main>{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
