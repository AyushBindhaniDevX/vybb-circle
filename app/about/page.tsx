"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users, Music, Heart, Sparkles, Zap, ShieldCheck, Globe, Mic2 } from "lucide-react"

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center mb-24"
        >
          <motion.div variants={fadeIn}>
            <span className="inline-block px-4 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-6">
              <Sparkles className="inline-block h-3 w-3 mr-2" /> The Culture Movement
            </span>
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] mb-8">
            Our <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Story</span>
          </motion.h1>
          <motion.p variants={fadeIn} className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium lowercase border-l-2 border-violet-500/50 pl-6 text-left">
            Born from a passion for authentic music experiences, VYBB LIVE is the pulse of a generation that values connection over noise.
          </motion.p>
        </motion.div>

        {/* Vision & Lifestyle Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-32 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">The Experience Priority</h2>
            <div className="space-y-6 text-zinc-400 font-medium leading-relaxed">
              <p>
                For the modern young adult, lifestyle isn't about the cost of the entry; it's about the depth of the experience. We've transitioned from the era of mass-market clubs to the era of curated circles.
              </p>
              <p>
                VYBB LIVE recognizes that your time is your highest currency. We prioritize intimate settings where music isn't just heard, but felt, and where every attendee is part of the shared memory, not just a face in a crowd.
              </p>
              <p className="text-white italic bg-white/5 p-4 rounded-2xl border-l-4 border-violet-600">
                "Since our first open mic in 2024, we've grown into a community united by a simple idea: great music deserves an authentic environment".
              </p>
            </div>
          </motion.div>

          {/* Magic Bento Components */}
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <motion.div variants={fadeIn} className="p-8 rounded-[2rem] border border-white/10 bg-zinc-900/20 backdrop-blur-xl group hover:border-violet-500/50 transition-all">
              <Mic2 className="h-8 w-8 text-violet-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-black italic uppercase text-lg mb-2">Artist First</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-loose">Prioritizing creative freedom and artist comfort above all else.</p>
            </motion.div>

            <motion.div variants={fadeIn} className="p-8 rounded-[2rem] border border-white/10 bg-zinc-900/20 backdrop-blur-xl group hover:border-fuchsia-500/50 transition-all">
              <Users className="h-8 w-8 text-fuchsia-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-black italic uppercase text-lg mb-2">Community</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-loose">Every event is shaped by the feedback of our growing circle.</p>
            </motion.div>

            <motion.div variants={fadeIn} className="p-8 rounded-[2rem] border border-white/10 bg-zinc-900/20 backdrop-blur-xl group hover:border-violet-500/50 transition-all sm:col-span-2">
              <Globe className="h-8 w-8 text-violet-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-black italic uppercase text-lg mb-2">Young Adult Lifestyle</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-loose">
                Curated for those who seek authenticity. We bridge the gap between digital discovery and physical belonging.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center p-16 rounded-[3rem] border border-white/10 bg-zinc-900/10 backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-3xl -mr-16 -mt-16" />
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8">
            Ready to <span className="text-violet-500">Belong?</span>
          </h2>
          <Link href="/events">
            <Button size="lg" className="bg-white text-black hover:bg-violet-600 hover:text-white rounded-full font-black px-10 h-16 text-lg transition-all active:scale-95 shadow-xl shadow-violet-500/10">
              EXPLORE EXPERIENCES <Zap className="ml-2 h-5 w-5 fill-current" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <footer className="border-t border-white/5 bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-xl font-black italic tracking-tighter uppercase">
            VYBB <span className="text-violet-500">LIVE</span>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <Link href="/about" className="hover:text-white">Our Story</Link>
            <Link href="/events" className="hover:text-white">Experiences</Link>
          </div>
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">© 2026 Vybb Circle.</div>
        </div>
      </footer>
    </main>
  )
}