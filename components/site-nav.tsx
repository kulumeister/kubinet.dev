"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LogoutDialog } from "./logout-dialog"

export function SiteNav() {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  return (
    <>
      <nav className="flex justify-center space-x-4">
        <Link href="/" prefetch={true} className={`hover:underline ${pathname === "/" ? "font-bold" : ""}`}>
          ana sayfa
        </Link>
        <span>|</span>
        <Link href="/blog" prefetch={true} className={`hover:underline ${pathname.startsWith("/blog") && pathname !== "/blog/create" ? "font-bold" : ""}`}>
          blog
        </Link>
        
        {isAuthenticated && (
          <>
            <span>|</span>
            <Link href="/blog/create" prefetch={true} className={`hover:underline ${pathname === "/blog/create" ? "font-bold" : ""}`}>
              gönderi oluştur
            </Link>
            <span>|</span>
            <button 
              onClick={() => setIsLogoutOpen(true)} 
              className="hover:underline"
            >
              çıkış
            </button>
          </>
        )}
      </nav>
      
      <LogoutDialog isOpen={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
    </>
  )
}
