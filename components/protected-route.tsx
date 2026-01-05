// components/protected-route.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SignInModal } from "@/components/signin-modal"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      setShowSignIn(true)
    }
  }, [loading, user, requireAuth])

  const handleSignInSuccess = () => {
    setShowSignIn(false)
  }

  const handleClose = () => {
    setShowSignIn(false)
    if (requireAuth) {
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <>
        <SignInModal
          isOpen={showSignIn}
          onClose={handleClose}
          onSuccess={handleSignInSuccess}
        />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-zinc-400">Checking authentication...</p>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}