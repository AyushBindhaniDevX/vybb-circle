// components/navbar.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export const Navbar = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleMyTickets = () => {
    if (user) {
      router.push("/profile")
    } else {
      // Show sign in modal or redirect
      router.push("/")
    }
  }

  const handleJoinCircle = () => {
    router.push("/events")
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-white">
            VYBB <span className="text-violet-500">LIVE</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/events"
            className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white md:block"
          >
            Experiences
          </Link>
          <Link
            href="/about"
            className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white md:block"
          >
            Our Story
          </Link>
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-800" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-violet-400">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-zinc-300">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              <Button
                variant="outline"
                className="border-violet-500/50 bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white"
                onClick={handleMyTickets}
              >
                My Tickets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-500 hover:text-white"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              className="bg-violet-600 font-semibold text-white hover:bg-violet-700"
              onClick={handleJoinCircle}
            >
              Join Circle
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}