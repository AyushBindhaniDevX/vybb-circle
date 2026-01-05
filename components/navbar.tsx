"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { motion } from "framer-motion"

export const Navbar = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) { console.error(error) }
  }

  return (
    <nav className="fixed top-0 z-[100] w-full border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black italic tracking-tighter text-white uppercase">
            VYBB <span className="text-violet-500 group-hover:text-fuchsia-500 transition-colors">LIVE</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <Link href="/events" className="hover:text-white transition-colors">Experiences</Link>
            <Link href="/about" className="hover:text-white transition-colors">Our Story</Link>
          </div>

          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-white/5" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="outline" className="rounded-full border-violet-500/30 bg-violet-500/5 text-violet-400 hover:bg-violet-600 hover:text-white transition-all font-black text-[10px] tracking-widest px-6 h-10">
                  MY TICKETS
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut} className="text-zinc-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest">
                SIGN OUT
              </Button>
            </div>
          ) : (
            <Link href="/events">
              <Button className="bg-white text-black hover:bg-violet-600 hover:text-white rounded-full font-black text-[10px] tracking-[0.2em] px-8 h-10 shadow-xl shadow-violet-500/10">
                JOIN CIRCLE
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}