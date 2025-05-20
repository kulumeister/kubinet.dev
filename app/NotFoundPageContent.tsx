"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react'

// Gif listesi
const gifs = [
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMm1xbHd1Ynp5Y3RpOHl4YTZzamZldjE1dGJiY3BreHZ1ZHA1MW44ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2JhpjWPccQhsAMfu/giphy.gif", // Süngerbob
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExemFzYWlsMGhpN3k3YjY3YWRtdGF1YWlnZnUxdWN2cGczcjlyN3oxYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CqVNwrLt9KEDK/giphy.gif", // Şaşkın kedi
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjgzOTF5cW1sMjBodzBxNmF5c2xyeDNsNHBpcmRqdjRsNHg0amV6bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/S604D5NhkhPgSPpwta/giphy.gif", // Chewbacca
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExamZpb3Z4Yml1dDdnaHoyZDExaHY0Z3AzamF5ZXl6ZjBxNG9kZnJzeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/piTF2qfkyjpG4EB5Kk/giphy.gif", // Lich King

]

export default function NotFoundPageContent() {
  const [randomGif, setRandomGif] = useState<string | null>(null)

  useEffect(() => {
    // Sayfa yüklendiğinde rastgele bir GIF seç
    const randomIndex = Math.floor(Math.random() * gifs.length)
    setRandomGif(gifs[randomIndex])
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="mb-8">
        {randomGif && (
          <Image 
            src={randomGif}
            alt="Rastgele GIF" 
            width={300}
            height={300}
            className="rounded-md"
            priority
          />
        )}
      </div>
      <h2 className="text-3xl font-bold mb-4">404 - yanlış yola girdin!</h2>
      <p className="text-gray-600 mb-8">aradığınız sayfa galiba başka diyarlara göç etti.  
belki yanlış bir linke tıkladınız ya da ben bir şeyleri eksik bıraktım 🙈</p>
    </div>
  )
} 