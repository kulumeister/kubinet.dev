"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">kubinet.dev</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/blog"
              className={cn(
                "transition-colors hover:text-foreground/80",
                (pathname === "/blog" || pathname.startsWith("/blog/"))
                  ? "text-foreground font-bold"
                  : "text-foreground/60",
              )}
            >
              Blog
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center md:hidden">
            <Link
              href="/"
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/blog"
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
                (pathname === "/blog" || pathname.startsWith("/blog/"))
                  ? "text-foreground font-bold"
                  : "text-foreground/60",
              )}
            >
              Blog
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
