"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Music, Mic2, Users, ArrowRight, Calendar, MapPin, 
  Sparkles, Zap, Trophy, Activity, Heart, Navigation,
  ChevronRight, History
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function Home() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getFeaturedEvents(20)
        setEvents(data)
      } catch (error) {
        console.error("Registry Sync Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const liveEvents = useMemo(() => 
    events.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0)), 
  [events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 overflow-x-hidden font-sans">
      <Navbar />

      {/* Spacer to prevent Navbar overlapping Hero content */}
      <div className="relative pt-20">
        
        {/* --- HERO SECTION: VYBB CIRCLE PROTOCOL --- */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-30 grayscale"
              alt="Hero Backdrop"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#050505]" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge className="bg-violet-600/90 text-white px-5 py-1.5 rounded-full font-black tracking-[0.3em] text-[10px] mb-8 uppercase italic shadow-2xl border-none">
                Vybb Circle Registry v1.1
              </Badge>
              <h1 className="text-7xl md:text-[11rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-8 drop-shadow-2xl">
                GO <br/> <span className="text-violet-500">LIVE.</span>
              </h1>
              <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium mb-12 lowercase leading-relaxed">
                discover high-fidelity acoustics, secret jams, and <br/>
                elite community loops in the circle.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link href="/events">
                   <Button size="lg" className="rounded-2xl bg-white text-black hover:bg-violet-600 hover:text-white font-black px-12 h-16 text-lg transition-all shadow-glow active:scale-95 border-none">
                      OPEN REGISTRY <ArrowRight className="ml-3 h-5 w-5" />
                   </Button>
                 </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- FEATURED GRID: CIRCLE HIGHLIGHT --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 text-left space-y-8">
               <Badge className="bg-violet-600/10 text-violet-500 border-violet-500/20 px-4 py-1 uppercase font-black text-[10px] tracking-[0.2em] border">Circle Highlight</Badge>
               <h2 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85]">SYNC YOUR <br/><span className="text-violet-500 italic">VYBB.</span></h2>
               <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-md border-l-2 border-violet-500/30 pl-6 lowercase italic">
                  Whether it's an intimate jam session or a high-energy sport protocol, we registry the best loops in the circle.
               </p>
               <Button className="rounded-2xl bg-white text-black font-black px-12 h-16 hover:bg-violet-600 hover:text-white transition-all uppercase tracking-widest text-xs border-none">Access Full Registry</Button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-6">
               <div className="space-y-6">
                  <div className="h-80 rounded-[3rem] bg-zinc-900 border border-white/10 overflow-hidden group shadow-2xl">
                     <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110" alt="Music" />
                  </div>
                  <div className="h-56 rounded-[3rem] bg-violet-600 flex flex-col items-center justify-center p-8 text-center shadow-glow-violet transition-transform hover:-rotate-1">
                     <Music className="h-12 w-12 mb-4 text-white" />
                     <span className="font-black italic uppercase tracking-widest text-lg text-white">Audio Protocol</span>
                  </div>
               </div>
               <div className="space-y-6 pt-12">
                  <div className="h-56 rounded-[3rem] bg-zinc-800 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group transition-transform hover:rotate-1">
                     <Trophy className="h-16 w-16 text-zinc-600 group-hover:text-yellow-500 transition-colors" />
                  </div>
                  <div className="h-80 rounded-[3rem] bg-zinc-900 border border-white/10 overflow-hidden group shadow-2xl">
                     <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-110" alt="Sports" />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- DYNAMIC AUTH CTA --- */}
        <section className="relative z-10 px-4 py-40">
          <div className="mx-auto max-w-5xl relative rounded-[4rem] border border-white/5 bg-zinc-950 p-20 text-center overflow-hidden shadow-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.15),transparent_70%)] opacity-50" />
            <div className="relative z-10 space-y-12">
               <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
                 {user ? "STAY" : "JOIN THE"} <br/> 
                 <span className="text-violet-500 italic">{user ? "SYNCED" : "CIRCLE"}</span>
               </h2>
               <p className="text-lg text-zinc-500 max-w-xl mx-auto font-medium lowercase italic leading-relaxed">
                 {user 
                   ? "You are part of the elite loop. view your reserved experiences and ticket vaults below."
                   : "Initialize your identity to book experiences, unlock member-only drops, and feel the circle vibe."
                 }
               </p>
               <div className="flex justify-center pt-6">
                 <Link href={user ? "/profile" : "/signup"}>
                   <Button size="lg" className={cn(
                     "rounded-full font-black px-16 h-24 text-xl transition-all active:scale-95 shadow-2xl uppercase tracking-[0.2em] border-none",
                     user ? "bg-white text-black hover:bg-zinc-200" : "bg-violet-600 text-white shadow-violet-600/40"
                   )}>
                     {user ? "View My Registry" : "Sync Identity"}
                   </Button>
                 </Link>
               </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-8">
          <div className="text-3xl font-black italic uppercase tracking-tighter">VYBB <span className="text-violet-500 italic">CIRCLE</span></div>
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.4em]">Registry Protocol Secured © 2026</p>
        </div>
      </footer>
    </main>
  )
}
