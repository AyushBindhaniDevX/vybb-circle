"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Users, Music, Heart, Sparkles, Zap, Globe, Mic2, 
  History, Fingerprint, ShieldCheck, Activity 
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    /* FIX: Added relative and z-0 to the main container to manage layering */
    <main className="relative min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      
      {/* 1. CINEMATIC BACKGROUND - FIX: Lowered z-index and fixed position */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/5 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/5 blur-[120px] rounded-full" />
      </div>

      <Navbar />
      
      {/* 2. CONTENT WRAPPER - FIX: Added z-10 and relative to bring text to front */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-44 pb-24 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center mb-32"
        >
          <motion.div variants={fadeIn}>
            <span className="inline-block px-6 py-2 rounded-full border border-violet-500/20 bg-violet-500/5 text-[9px] font-black uppercase tracking-[0.4em] text-violet-400 mb-8 backdrop-blur-xl">
              <History className="inline-block h-3 w-3 mr-3" /> Registry Protocol v1.0
            </span>
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-7xl md:text-[9rem] font-black italic tracking-tighter uppercase leading-[0.8] mb-12">
            LOOP <br />
            <span className="bg-gradient-to-r from-violet-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">ORIGIN</span>
          </motion.h1>
          <motion.p variants={fadeIn} className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-medium lowercase border-l-2 border-violet-500/30 pl-8 text-left leading-relaxed">
            Born in Bhubaneswar, 2024. VYBB Circle was founded as a private registry for those who value the depth of a jam over the noise of a crowd.
          </motion.p>
        </motion.div>

        {/* CORE PHILOSOPHY GRID */}
        <div className="grid lg:grid-cols-12 gap-16 mb-40 items-start">
          <motion.div 
            {...fadeIn}
            className="lg:col-span-5 space-y-10"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
               <Fingerprint className="h-6 w-6 text-violet-500" />
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">The Experience <br/>Priority.</h2>
            <div className="space-y-8 text-zinc-500 font-medium leading-relaxed lowercase text-lg">
              <p>
                Lifestyle isn't about entry price; it's about the depth of the loop. We've moved past mass-market clubs into the era of the curated circle.
              </p>
              <div className="bg-zinc-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                <p className="text-white italic relative z-10 leading-relaxed">
                  "Every session is a protocol. Every jam is a loop. We bridge the gap between digital discovery and physical belonging."
                </p>
              </div>
            </div>
          </motion.div>

          {/* BENTO GRID */}
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <motion.div variants={fadeIn} className="p-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/10 backdrop-blur-2xl group hover:border-violet-500/30 transition-all shadow-3xl">
              <div className="h-14 w-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-8">
                <Mic2 className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="font-black italic uppercase text-2xl mb-4 tracking-tighter">Artist First</h3>
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] leading-relaxed">
                Creative freedom and loop-integrity over market noise.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="p-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/10 backdrop-blur-2xl group hover:border-rose-500/30 transition-all shadow-3xl">
              <div className="h-14 w-14 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center mb-8">
                <Users className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="font-black italic uppercase text-2xl mb-4 tracking-tighter">Verified Collective</h3>
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] leading-relaxed">
                A community shaped by the pulse of our verified members.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="p-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-zinc-900/40 to-black backdrop-blur-2xl group hover:border-violet-500/50 transition-all sm:col-span-2 shadow-3xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center mb-8">
                  <Activity className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="font-black italic uppercase text-3xl mb-4 tracking-tighter">Kinetic Lifestyle</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.3em] leading-loose max-w-md">
                  Curated for the high-fidelity generation. We bridge physical space with the digital identity.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* CTA PROTOCOL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[4rem] border border-white/5 bg-zinc-950 p-24 text-center overflow-hidden shadow-3xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)]" />
          <div className="relative z-10 space-y-12">
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
              JOIN THE <br/><span className="text-violet-500">CIRCLE</span>
            </h2>
            <Link href="/events" className="inline-block">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-violet-600 hover:text-white font-black px-16 h-20 text-xl transition-all active:scale-95 shadow-3xl uppercase tracking-[0.2em]">
                OPEN REGISTRY
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <footer className="py-24 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-3xl font-black italic tracking-tighter uppercase mb-4">
             VYBB <span className="text-violet-500 italic">LIVE</span>
          </div>
          <div className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">
             © 2026 Registry Protocol Secured.
          </div>
        </div>
      </footer>
    </main>
  )
}
