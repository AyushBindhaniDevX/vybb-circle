"use client"

import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Music, Mic2, Users, ArrowRight, Calendar, MapPin, 
  Sparkles, Zap, ShieldCheck, Ticket, History, 
  ChevronRight, Play, Trophy, Activity, Drum
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
        console.error("Pulse Sync Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Protocol: Separate Live Loops from Archives
  const liveEvents = useMemo(() => 
    events.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0)), 
  [events]);

  const archivedEvents = useMemo(() => 
    events.filter(e => new Date(e.date).getTime() < new Date().setHours(0,0,0,0)).slice(0, 4), 
  [events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      <Navbar />

      {/* --- 1. PREMIUM FEATURED HERO --- */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {liveEvents[0] ? (
          <div className="relative h-full w-full group">
            <img src={liveEvents[0].imageUrl} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-20 max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <Badge className="bg-violet-600 text-white mb-6 px-4 py-1 font-black italic uppercase tracking-widest">
                  <Zap className="h-3 w-3 mr-2 fill-current" /> FEATURED DROP
                </Badge>
                <h1 className="text-6xl sm:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
                  {liveEvents[0].title}
                </h1>
                <p className="text-zinc-400 text-lg max-w-xl mb-10 line-clamp-2 border-l-2 border-violet-500 pl-6">
                  {liveEvents[0].description}
                </p>
                <div className="flex gap-4">
                  <Link href={`/events/${liveEvents[0].id}`}>
                    <Button size="lg" className="rounded-xl bg-violet-600 hover:bg-white hover:text-black font-black px-10 h-14 transition-all">
                      BOOK NOW <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <Skeleton className="h-full w-full bg-zinc-900" />
        )}
      </section>

      {/* --- 2. CATEGORY QUICK-STRIP --- */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Open Mic", icon: Mic2, color: "bg-blue-500" },
            { label: "Music", icon: Music, color: "bg-violet-600" },
            { label: "Sports", icon: Activity, color: "bg-yellow-500" },
            { label: "Workshop", icon: Users, color: "bg-emerald-500" },
            { label: "Jamming", icon: Drum, color: "bg-rose-500" },
          ].map((cat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="cursor-pointer group relative h-24 rounded-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-2xl p-4 flex items-center gap-4 overflow-hidden">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white", cat.color)}>
                <cat.icon className="h-5 w-5" />
              </div>
              <span className="font-black italic uppercase text-xs tracking-widest">{cat.label}</span>
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-white transition-all group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- 3. LIVE EXPERIENCES (HORIZONTAL ROW) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter sm:text-5xl">Live Experiences</h2>
            <div className="h-1 w-20 bg-violet-600 mt-4 rounded-full" />
          </div>
          <Link href="/events" className="text-[10px] font-black uppercase text-zinc-500 hover:text-violet-400 transition-colors">
            SEE ALL DROPS <ChevronRight className="h-3 w-3 inline" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-3xl bg-zinc-900/50" />) : 
            liveEvents.slice(1, 5).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/5 bg-zinc-950">
                  <img src={event.imageUrl} className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-2">{event.category}</p>
                    <h3 className="text-xl font-black italic uppercase text-white truncate group-hover:text-violet-400 transition-colors">{event.title}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400">₹{event.price}</span>
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">{formatDate(event.date)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </section>

      {/* --- 4. THE CULTURE SPOTLIGHT --- */}
      <section className="bg-zinc-950/50 border-y border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-left">
            <Badge className="bg-violet-600/10 text-violet-400 border-violet-500/20 px-4 py-1">ELITE ACCESS</Badge>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">JOIN THE <br/><span className="text-violet-500">VYBB CIRCLE</span></h2>
            <p className="text-zinc-500 font-medium leading-relaxed max-w-md italic">
              A private registry of the most high-fidelity gatherings in the city. Artist-first spaces, community-driven loops, and unfiltered experiences.
            </p>
            <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white hover:text-black font-black h-14 px-8 uppercase text-xs tracking-widest">Explore Origin Story</Button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
             <div className="space-y-4">
                <div className="h-48 rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden"><img src="https://i.pinimg.com/1200x/01/cc/03/01cc0332303c7379f61b7f043e06f86e.jpg" className="h-full w-full object-cover grayscale" /></div>
                <div className="h-64 rounded-3xl bg-violet-600 flex flex-col items-center justify-center p-8 text-center"><Trophy className="h-10 w-10 mb-4" /><span className="font-black italic uppercase text-lg leading-none">Sports <br/> Protocol</span></div>
             </div>
             <div className="space-y-4 pt-12">
                <div className="h-64 rounded-3xl bg-zinc-800 border border-white/5 overflow-hidden"><img src="https://i.pinimg.com/1200x/8f/d3/ea/8fd3ea0824d89e5d00ebb8d586ea4d53.jpg" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all" /></div>
                <div className="h-48 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center"><Mic2 className="h-10 w-10 text-zinc-700" /></div>
             </div>
          </div>
        </div>
      </section>

      {/* --- 5. ARCHIVE LOGS (PAST EVENTS) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 opacity-60">
        <div className="flex items-center gap-4 mb-12">
           <History className="text-zinc-600 h-6 w-6" />
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-500">Archive Logs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
           {archivedEvents.map(exp => (
             <div key={exp.id} className="relative aspect-video rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden grayscale">
               <img src={exp.imageUrl} className="h-full w-full object-cover opacity-20" />
               <div className="absolute inset-0 p-6 flex flex-col justify-end">
                 <h3 className="text-sm font-black italic uppercase text-zinc-500 truncate">{exp.title}</h3>
                 <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-1">Registry Concluded // {exp.date}</p>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center">
         <div className="text-3xl font-black italic tracking-tighter uppercase mb-6">VYBB <span className="text-violet-500">LIVE</span></div>
         <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em]">Protocol Secured © 2026 Registry</p>
      </footer>
    </main>
  )
}
