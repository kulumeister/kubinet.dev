"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { LogOutIcon } from "lucide-react"

type LogoutDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ isOpen, onOpenChange }: LogoutDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      onOpenChange(false)
      router.refresh()
      router.push('/')
    } catch (err) {
      console.error("Çıkış hatası:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-border bg-card">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-mono text-center">çıkış yap</DialogTitle>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="p-6 pt-2 text-center flex flex-col items-center space-y-4">
          <div className="bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center">
            <LogOutIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Çıkış yapmak istediğinize emin misiniz?
          </p>
        </div>
        <DialogFooter className="p-6 pt-2 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            size="sm"
            className="border-input"
          >
            İptal
          </Button>
          <Button 
            onClick={handleLogout} 
            disabled={loading}
            size="sm"
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 