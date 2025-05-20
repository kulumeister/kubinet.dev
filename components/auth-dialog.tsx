"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { LockIcon, KeyIcon, MailIcon } from "lucide-react"

type AuthDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

// Giriş denemesi limiti ve engelleme süresi (saniye)
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 300 // 5 dakika

export function AuthDialog({ isOpen, onOpenChange }: AuthDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secret, setSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [secretVerified, setSecretVerified] = useState(false)
  // Gizli anahtar için brute force koruması
  const [secretAttempts, setSecretAttempts] = useState(0)
  const [secretLockedUntil, setSecretLockedUntil] = useState<number | null>(null)
  const router = useRouter()

  // Sayfa yüklendiğinde localStorage'dan login deneme sayısını ve engelleme zamanını getir
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Login için
      const attempts = parseInt(localStorage.getItem('loginAttempts') || '0', 10)
      const lockedTime = localStorage.getItem('lockedUntil') 
        ? parseInt(localStorage.getItem('lockedUntil') || '0', 10)
        : null
      
      // Gizli anahtar için
      const secretAttempts = parseInt(localStorage.getItem('secretAttempts') || '0', 10)
      const secretLockedTime = localStorage.getItem('secretLockedUntil') 
        ? parseInt(localStorage.getItem('secretLockedUntil') || '0', 10)
        : null
      
      // Engelleme süresi dolmuşsa sıfırla - login
      if (lockedTime && Date.now() > lockedTime) {
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lockedUntil')
        setLoginAttempts(0)
        setLockedUntil(null)
      } else {
        setLoginAttempts(attempts)
        setLockedUntil(lockedTime)
      }
      
      // Engelleme süresi dolmuşsa sıfırla - gizli anahtar
      if (secretLockedTime && Date.now() > secretLockedTime) {
        localStorage.removeItem('secretAttempts')
        localStorage.removeItem('secretLockedUntil')
        setSecretAttempts(0)
        setSecretLockedUntil(null)
      } else {
        setSecretAttempts(secretAttempts)
        setSecretLockedUntil(secretLockedTime)
      }
    }
  }, [isOpen])

  // Modal kapandığında secret ve doğrulama durumunu sıfırla
  useEffect(() => {
    if (!isOpen) {
      setSecret("")
      setSecretVerified(false)
    }
  }, [isOpen])

  // Kalan engelleme süresini hesapla
  const getRemainingLockoutTime = (lockTime: number | null): string => {
    if (!lockTime) return ''
    
    const remainingSeconds = Math.ceil((lockTime - Date.now()) / 1000)
    if (remainingSeconds <= 0) return ''
    
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    
    return `${minutes} dakika ${seconds} saniye`
  }

  const verifySecret = () => {
    // Eğer hesap kilitliyse giriş denemeyi engelle
    if (secretLockedUntil && Date.now() < secretLockedUntil) {
      setError(`Çok fazla başarısız deneme. Lütfen ${getRemainingLockoutTime(secretLockedUntil)} sonra tekrar deneyin.`)
      return
    }
    
    // NEXT_PUBLIC_ ile başlayan değişkenlere client-side'dan erişilebilir
    const correctKey = process.env.NEXT_PUBLIC_KUBI_KEY
    
    if (!secret) {
      setError("Lütfen gizli anahtarı giriniz")
      return
    }
    
    if (secret === correctKey) {
      // Başarılı doğrulama - sayaçları sıfırla
      localStorage.removeItem('secretAttempts')
      localStorage.removeItem('secretLockedUntil')
      setSecretAttempts(0)
      setSecretLockedUntil(null)
      
      setSecretVerified(true)
      setError(null)
    } else {
      // Başarısız doğrulama - sayacı artır
      const newAttempts = secretAttempts + 1
      setSecretAttempts(newAttempts)
      localStorage.setItem('secretAttempts', newAttempts.toString())
      
      // Maksimum deneme sayısını aştıysa kilitle
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutTime = Date.now() + (LOCKOUT_DURATION * 1000)
        setSecretLockedUntil(lockoutTime)
        localStorage.setItem('secretLockedUntil', lockoutTime.toString())
        setError(`Çok fazla başarısız deneme. Giriş ${LOCKOUT_DURATION / 60} dakika kilitlendi.`)
      } else {
        setError(`Gizli anahtar doğru değil. ${MAX_LOGIN_ATTEMPTS - newAttempts} deneme hakkınız kaldı.`)
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Eğer hesap kilitliyse giriş denemeyi engelle
    if (lockedUntil && Date.now() < lockedUntil) {
      setError(`Çok fazla başarısız giriş denemesi. Lütfen ${getRemainingLockoutTime(lockedUntil)} sonra tekrar deneyin.`)
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        throw loginError
      }

      // Başarılı giriş - sayaçları sıfırla
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('lockedUntil')
      setLoginAttempts(0)
      setLockedUntil(null)
      
      // Modalı kapat ve sayfayı yenile
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      // Başarısız giriş - sayacı artır
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      localStorage.setItem('loginAttempts', newAttempts.toString())
      
      // Maksimum deneme sayısını aştıysa hesabı kilitle
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutTime = Date.now() + (LOCKOUT_DURATION * 1000)
        setLockedUntil(lockoutTime)
        localStorage.setItem('lockedUntil', lockoutTime.toString())
        setError(`Çok fazla başarısız giriş denemesi. Hesabınız ${LOCKOUT_DURATION / 60} dakika kilitlendi.`)
      } else {
        setError(`Giriş başarısız oldu. ${MAX_LOGIN_ATTEMPTS - newAttempts} deneme hakkınız kaldı.`)
      }
      
      console.error("Giriş hatası:", err)
    } finally {
      setLoading(false)
    }
  }

  // Bir input'un devre dışı olup olmadığını kontrol et (linter hatası çözümü)
  const isDisabled = (lockTime: number | null): boolean => {
    return lockTime !== null && Date.now() < lockTime;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-border bg-card">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-mono text-center">kubinet.dev</DialogTitle>
        </DialogHeader>
        <Separator className="my-4" />
        
        {!secretVerified ? (
          // Secret input form
          <form onSubmit={(e) => { e.preventDefault(); verifySecret(); }} className="p-6 pt-2 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="secret" className="text-sm font-normal text-muted-foreground">
                Gizli Anahtar
              </Label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="secret"
                  type="password" 
                  placeholder="Gizli anahtarı giriniz" 
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  required
                  disabled={isDisabled(secretLockedUntil)}
                  className="pl-10 border-input bg-transparent"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={loading || isDisabled(secretLockedUntil)}
                className="bg-foreground text-background hover:bg-foreground/90"
                size="sm"
              >
                Doğrula
              </Button>
            </div>
          </form>
        ) : (
          // Email/Password login form
          <form onSubmit={handleLogin} className="p-6 pt-2 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-normal text-muted-foreground">
                E-posta
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="E-posta adresiniz" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isDisabled(lockedUntil)}
                  className="pl-10 border-input bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-normal text-muted-foreground">
                Şifre
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password" 
                  placeholder="Şifreniz"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isDisabled(lockedUntil)}
                  className="pl-10 border-input bg-transparent"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={loading || isDisabled(lockedUntil)}
                className="bg-foreground text-background hover:bg-foreground/90"
                size="sm"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 