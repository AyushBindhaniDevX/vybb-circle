// components/signin-modal.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { toast } from "sonner"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      toast.success(`Welcome, ${result.user.displayName || result.user.email}!`)
      onClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      toast.error(error.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleGuestContinue = () => {
    toast.info("You can browse events, but need to sign in to book tickets")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4 text-zinc-500" />
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
            <svg
              className="h-8 w-8 text-violet-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Welcome to Vybb Live</h2>
          <p className="mt-2 text-zinc-400">Sign in to book experiences and access your tickets</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-zinc-950 text-zinc-500">Or continue as guest</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 border-white/10 hover:border-violet-500/50 hover:bg-violet-500/10"
            onClick={handleGuestContinue}
          >
            Continue as Guest
          </Button>
        </div>

        <p className="mt-8 text-xs text-zinc-500 text-center">
          By signing in, you agree to our{" "}
          <a href="#" className="text-violet-400 hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-violet-400 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}