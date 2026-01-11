"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { motion } from "framer-motion"
import { Shield, User, Ticket, LogOut, Zap } from "lucide-react" // Added Zap and Ticket for hierarchy
import { useEffect, useState } from "react"
import { isAdminUser } from "@/lib/db-utils"
import { cn } from "@/lib/utils"

export const Navbar = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Experience Monitor: Detect scroll to change background intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        const adminStatus = await isAdminUser(user.email)
        setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [user])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) { console.error("Sign-out Error:", error) }
  }

  return (
    <nav className={cn(
      "fixed top-0 z-[100] w-full transition-all duration-500 border-b",
      scrolled 
        ? "bg-black/80 backdrop-blur-2xl border-white/10 py-3" 
        : "bg-transparent border-transparent py-5"
    )}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-black italic tracking-tighter text-white uppercase"
          >
            VYBB <span className="text-violet-500 group-hover:text-rose-500 transition-colors">LIVE</span>
          </motion.div>
        </Link>
        
        <div className="flex items-center gap-10">
          {/* Main Registry Links */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            <Link href="/events" className="hover:text-white transition-colors relative group">
              Experiences
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-violet-500 transition-all group-hover:w-full" />
            </Link>
            <Link href="/about" className="hover:text-white transition-colors relative group">
              Our Story
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-violet-500 transition-all group-hover:w-full" />
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-violet-400 transition-colors flex items-center gap-1.5 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                <Shield className="h-3 w-3" />
                ADMIN
              </Link>
            )}
          </div>

          {/* Identity & Actions */}
          <div className="flex items-center gap-4 border-l border-white/10 pl-8">
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-full bg-white/5" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile">
                  <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-violet-600 hover:border-violet-500 transition-all font-black text-[9px] tracking-widest px-5 h-10 gap-2">
                    <Ticket className="h-3 w-3" />
                    MY VAULT
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 p-0 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-violet-600 hover:text-white rounded-xl font-black text-[9px] tracking-widest px-8 h-10 shadow-2xl transition-all active:scale-95 group">
                  JOIN CIRCLE <Zap className="ml-2 h-3 w-3 group-hover:fill-current" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
