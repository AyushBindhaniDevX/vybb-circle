"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ShieldCheck, Zap, Sparkles, ArrowRight, Fingerprint } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      toast.success(`Identity Synced: Welcome, ${result.user.displayName || result.user.email}!`)
      router.push("/events")
    } catch (error: any) {
      console.error("Registry Sync Error:", error)
      toast.error(error.message || "Failed to initialize identity protocol")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 overflow-hidden flex flex-col items-center justify-center p-6 relative">
      {/* Cinematic Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c026d3]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              VYBB <span className="text-violet-500">CIRCLE</span>
            </h1>
          </Link>
          
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative group">
             <Fingerprint className="h-12 w-12 text-violet-500 group-hover:scale-110 transition-transform duration-500" />
             <div className="absolute inset-0 rounded-[2rem] bg-violet-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
            Initialize <span className="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">Identity</span>
          </h2>
          <p className="text-zinc-500 font-medium uppercase tracking-[0.3em] text-[10px]">
            Registry Access Protocol v1.0
          </p>
        </motion.div>

        {/* Action Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 shadow-3xl backdrop-blur-3xl relative overflow-hidden"
        >
          {/* Subtle Scan Line Effect */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-shimmer" />

          <div className="space-y-6 relative z-10">
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-20 rounded-[1.5rem] bg-white text-black hover:bg-violet-600 hover:text-white font-black text-lg transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <Zap className="h-6 w-6 animate-spin text-violet-500" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  SYNC WITH GOOGLE
                </>
              )}
            </Button>

            <div className="relative py-4 flex items-center justify-center">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
               <span className="relative px-4 bg-zinc-950 text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em]">Encrypted Connection</span>
            </div>

            <Link href="/events" className="block">
              <Button
                variant="ghost"
                className="w-full h-16 rounded-2xl border border-white/5 hover:bg-white/5 text-zinc-500 hover:text-white font-bold uppercase tracking-widest text-[10px] gap-2"
              >
                Continue as Spectator <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Row */}
        <div className="mt-12 grid grid-cols-3 gap-4">
           {[
             { icon: ShieldCheck, label: "Vault Access" },
             { icon: Zap, label: "Live Sync" },
             { icon: Sparkles, label: "Elite Perks" }
           ].map((feat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 + (i * 0.1) }}
               className="text-center p-4"
             >
               <feat.icon className="h-5 w-5 mx-auto mb-2 text-violet-500/50" />
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">{feat.label}</p>
             </motion.div>
           ))}
        </div>

        {/* Legal Strip */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-[9px] font-bold text-zinc-600 text-center uppercase tracking-widest leading-loose"
        >
          By initializing identity, you agree to the <br/>
          <a href="#" className="text-violet-400 hover:underline">Registry Terms</a> and <a href="#" className="text-violet-400 hover:underline">Privacy Protocol</a>
        </motion.p>
      </div>
    </main>
  )
}
