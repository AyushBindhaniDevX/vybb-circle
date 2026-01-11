"use client"

import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Music, Mic2, Users, ArrowRight, Calendar, MapPin, 
  Sparkles, Zap, ShieldCheck, Ticket, History, 
  ChevronRight, Trophy, Activity, Drum,
  Heart, Share2, TrendingUp, Users2, Star, Flame, Clock, MapPinned
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function Home() {
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

  // Protocol: Filter and prioritize Live Loops
  const liveEvents = useMemo(() => 
    events.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0)), 
  [events]);

  const trendingEvents = useMemo(() => liveEvents.slice(0, 4), [liveEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 overflow-x-hidden font-sans">
      <Navbar />

      {/* --- 1. THE KINETIC HERO --- */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-20 overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(124,58,237,0.1),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(244,63,94,0.05),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-2 pr-5 py-1.5 backdrop-blur-2xl">
              <div className="bg-violet-500 h-6 px-3 rounded-full flex items-center justify-center">
                 <Zap className="h-3 w-3 text-white fill-current" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Active Protocol: Bhubaneswar v1.0</span>
            </div>

            <h1 className="text-7xl md:text-[11rem] font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
              SYNC <br />
              <span className="bg-gradient-to-r from-violet-500 via-rose-400 to-amber-400 bg-clip-text text-transparent italic">
                YOUR SOUL
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl font-medium lowercase tracking-tight leading-relaxed border-l-2 border-violet-500/30 pl-8">
              A private registry of the most high-fidelity gatherings. Artist-first spaces, community loops, and unfiltered kinetic experiences.
            </p>

            <div className="flex flex-wrap gap-6 pt-6">
              <Link href="/events">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-violet-600 hover:text-white font-black px-12 h-20 text-lg transition-all shadow-2xl shadow-violet-500/20 uppercase tracking-widest">
                  ACCESS REGISTRY <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>)}
                 </div>
                 <div>
                    <p className="text-xl font-black italic tabular-nums leading-none">2,500+</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">Synced Members</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Kinetic Element */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-10%] top-[20%] hidden lg:block opacity-20"
        >
          <div className="h-96 w-96 border border-white/10 rounded-full flex items-center justify-center">
             <div className="h-64 w-64 border border-white/5 rounded-full flex items-center justify-center animate-pulse">
                <div className="h-32 w-32 bg-violet-600/30 blur-[60px] rounded-full" />
             </div>
          </div>
        </motion.div>
      </section>

      {/* --- 2. BENTO CATEGORY HUB --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-full rounded-[3rem] bg-gradient-to-br from-violet-600 to-purple-800 p-12 flex flex-col justify-between group cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/01/cc/03/01cc0332303c7379f61b7f043e06f86e.jpg')] opacity-20 mix-blend-overlay grayscale group-hover:scale-110 transition-all duration-1000" />
              <div className="relative z-10">
                <Music className="h-12 w-12 text-white mb-6" />
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Live <br/> Acoustics</h3>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest">Active Loops: 12</span>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white transition-colors">
                  <ArrowRight className="h-6 w-6 text-white group-hover:text-black" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="aspect-square rounded-[3rem] bg-zinc-900 border border-white/5 p-10 flex flex-col justify-between hover:border-rose-500/50 transition-all cursor-pointer">
              <Mic2 className="h-8 w-8 text-rose-500" />
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Open Mic</h3>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">Unfiltered Talent</p>
              </div>
            </div>
            <div className="aspect-square rounded-[3rem] bg-zinc-900 border border-white/5 p-10 flex flex-col justify-between hover:border-emerald-500/50 transition-all cursor-pointer">
              <Users className="h-8 w-8 text-emerald-500" />
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Workshops</h3>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">Co-Creation Hub</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-full rounded-[3rem] border border-white/10 bg-gradient-to-b from-amber-500/20 to-zinc-950 p-10 flex flex-col justify-between hover:border-amber-500/50 transition-all cursor-pointer group">
              <Activity className="h-8 w-8 text-amber-500" />
              <div className="space-y-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">Sports <br/> Protocol</h3>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-zinc-800" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. THE PULSE GRID (TRENDING) --- */}
      <section className="py-32 relative bg-[#080808]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-end justify-between mb-20">
            <div className="space-y-4 text-left">
               <div className="flex items-center gap-3">
                 <Flame className="h-8 w-8 text-rose-500 fill-current" />
                 <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter">Live Registry</h2>
               </div>
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] pl-11">Experiences syncing in the city this week</p>
            </div>
            <Link href="/events" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all pb-2 border-b border-white/10">
               VIEW FULL ARCHIVE —&gt;
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[450px] rounded-[3rem] bg-zinc-900/50" />) : 
              trendingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/events/${event.id}`} className="group">
                    <div className="relative aspect-[3/4.5] bg-zinc-900 rounded-[3rem] overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all duration-500 shadow-2xl">
                      <img src={event.imageUrl} className="h-full w-full object-cover grayscale-[0.6] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                      
                      <div className="absolute top-8 left-8 flex flex-col gap-2">
                        <Badge className="w-fit bg-violet-600/90 text-white border-0 font-black italic tracking-widest text-[8px] px-3">
                          {event.category}
                        </Badge>
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-end p-10 text-left">
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-6 group-hover:text-violet-400 transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-3 mb-8 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                           <div className="flex items-center gap-2"><MapPinned className="h-3 w-3 text-violet-500" /> {event.venue}</div>
                           <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-violet-500" /> {formatDate(event.date)}</div>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-6">
                           <span className="text-2xl font-black italic text-white tracking-tighter">₹{event.price}</span>
                           <Button size="icon" className="h-12 w-12 rounded-2xl bg-white text-black hover:bg-violet-600 hover:text-white transition-all">
                              <ChevronRight className="h-6 w-6" />
                           </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            }
          </div>
        </div>
      </section>

      {/* --- 4. CALL TO ACTION LOOP --- */}
      <section className="relative z-10 px-4 py-40 overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <div className="relative rounded-[4rem] border border-white/5 bg-zinc-950 p-24 text-center overflow-hidden shadow-3xl">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)]" />
            
            <div className="relative z-10 space-y-12">
               <h2 className="text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.8]">
                 FEEL <br/> THE <span className="text-violet-500">VYBB</span>
               </h2>
               <p className="text-xl text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed">
                 Join the most high-fidelity community registry in the city. First experience protocol is on us.
               </p>
               <div className="flex justify-center">
                 <Link href="/signup">
                   <Button size="lg" className="rounded-full bg-violet-600 text-white hover:bg-white hover:text-black font-black px-16 h-24 text-xl transition-all active:scale-95 shadow-3xl shadow-violet-600/20 uppercase tracking-[0.2em]">
                     SYNC IDENTITY
                   </Button>
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-3xl font-black italic tracking-tighter uppercase">
             VYBB <span className="text-violet-500">CIRCLE</span>
          </div>
          <div className="flex gap-16 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
             <Link href="/events" className="hover:text-violet-400 transition-colors">Experiences</Link>
             <Link href="/about" className="hover:text-violet-400 transition-colors">Origin Log</Link>
             <Link href="/profile" className="hover:text-violet-400 transition-colors">Identity</Link>
          </div>
          <div className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest tracking-widest">
             © 2026 Registry Protocol Secured.
          </div>
        </div>
      </footer>
    </main>
  )
}
