"use client"

import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Music, Mic2, Users, ArrowRight, Calendar, MapPin, Sparkles, Zap, ShieldCheck, Ticket, History } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// --- React Bits Components ---

// 1. Counter Bit (Scalable Registry Counter)
const RollingCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="tabular-nums font-black italic">{count.toLocaleString()}+</span>;
};

// 2. Bounce Card Bit (Experience Visuals)
const BounceCard = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-15, 15, -15] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
    className={cn("rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl p-6 shadow-2xl transition-all duration-700", className)}
  >
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-2xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
        <Ticket className="h-5 w-5 text-violet-400" />
      </div>
      <div className="space-y-2">
        <div className="h-2 w-20 bg-white/10 rounded-full" />
        <div className="h-1.5 w-12 bg-white/5 rounded-full" />
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getFeaturedEvents(10) // Fetch larger pool to filter
        setEvents(data)
      } catch (error) {
        console.error("Pulse Sync Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Protocol: Filter and Sort to prioritize upcoming "Drops"
  const featuredEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0))
      .slice(0, 4);
  }, [events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      {/* Aurora Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-10%] w-[70%] h-[70%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/5 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      {/* Hero Protocol */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-32 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl pointer-events-none">
          <BounceCard className="absolute top-[-250px] left-[5%] rotate-[-15deg] opacity-40 scale-75" delay={0} />
          <BounceCard className="absolute top-[50px] right-[2%] rotate-[12deg]" delay={1.5} />
          <BounceCard className="absolute bottom-[-180px] left-[12%] rotate-[8deg] opacity-60" delay={2.5} />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="relative z-10">
          <Badge className="mb-8 border-violet-500/30 bg-violet-500/10 px-8 py-3 text-[10px] font-black tracking-[0.4em] text-violet-400 uppercase backdrop-blur-xl">
            <Sparkles className="mr-3 h-3 w-3 animate-ping" /> Experience the Loop
          </Badge>
          <h1 className="max-w-6xl text-balance text-7xl font-black italic tracking-tighter sm:text-[10rem] uppercase leading-[0.8] mb-12">
            Live the <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent animate-gradient">
              Pulse
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16">
            <Link href="/events">
               <Button size="lg" className="rounded-full bg-white text-black hover:bg-violet-600 hover:text-white font-black px-12 h-20 transition-all active:scale-95 shadow-2xl shadow-violet-500/30 text-lg uppercase tracking-widest">
                  ACCESS HUB <ArrowRight className="ml-3 h-6 w-6" />
               </Button>
            </Link>
            <div className="flex flex-col items-start gap-1">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Circle Registry</p>
              <div className="text-2xl font-black italic text-white"><RollingCounter value={2400} /> Active</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Latest Drops Section (Experience Loop Protection Active) */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-40 sm:px-6 lg:px-8">
        <div className="mb-24 flex items-end justify-between border-b border-white/5 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <Zap className="text-violet-500 h-10 w-10 fill-current" />
               <h2 className="text-5xl font-black italic uppercase tracking-tighter sm:text-7xl">Latest Drops</h2>
            </div>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Curated experiences synced with your pulse</p>
          </div>
          <Link href="/events" className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 hover:text-white transition-all mb-4">
            ALL EXPERIENCES —&gt;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:grid-rows-2">
            <Skeleton className="md:col-span-2 md:row-span-2 h-[600px] rounded-[3rem] bg-zinc-900/50" />
            <Skeleton className="md:col-span-2 h-[290px] rounded-[3rem] bg-zinc-900/50" />
            <Skeleton className="md:col-span-1 h-[290px] rounded-[3rem] bg-zinc-900/50" />
            <Skeleton className="md:col-span-1 h-[290px] rounded-[3rem] bg-zinc-900/50" />
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="py-40 text-center rounded-[3rem] border-2 border-dashed border-white/5 bg-zinc-950/40">
             <History className="h-12 w-12 text-zinc-800 mx-auto mb-6" />
             <h3 className="text-xl font-black uppercase italic text-zinc-600">No Live Drops // Protocol Refreshing</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:grid-rows-2">
            {/* Primary Drop */}
            {featuredEvents[0] && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[3rem] border border-white/10 bg-zinc-950 shadow-2xl">
                <img src={featuredEvents[0].imageUrl} className="h-full w-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-0 p-12 flex flex-col justify-end">
                  <Badge className="bg-violet-600/90 text-white w-fit px-4 py-1.5 mb-6 font-black italic uppercase tracking-widest">{featuredEvents[0].category}</Badge>
                  <h3 className="text-5xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none mb-8 group-hover:text-violet-400 transition-colors">{featuredEvents[0].title}</h3>
                  <Link href={`/events/${featuredEvents[0].id}`}>
                    <Button className="h-16 rounded-2xl bg-white text-black font-black uppercase px-10 hover:bg-violet-600 hover:text-white transition-all shadow-xl">RESERVE SLOT</Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Secondary Drops */}
            {featuredEvents.slice(1, 4).map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={cn(i === 0 ? "md:col-span-2" : "md:col-span-1", "group relative overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-900/40")}>
                <img src={exp.imageUrl} className="h-full w-full object-cover opacity-40 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-all duration-500" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                   <h3 className="text-xl font-black italic uppercase text-white leading-tight mb-2 group-hover:text-violet-400 transition-colors">{exp.title}</h3>
                   <p className="text-[9px] font-black text-zinc-500 tracking-[0.2em] uppercase">{formatDate(exp.date)}</p>
                </div>
                <Link href={`/events/${exp.id}`} className="absolute inset-0 z-10" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Registry Section */}
      <section className="relative z-10 px-4 py-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-violet-600/5 blur-[120px] rounded-full" />
        <div className="mx-auto max-w-5xl text-center rounded-[4rem] border border-white/5 bg-gradient-to-br from-zinc-900/40 to-black p-24 backdrop-blur-2xl shadow-3xl">
          <h2 className="text-6xl font-black italic mb-10 uppercase tracking-tighter sm:text-8xl leading-[0.8]">Ready to <br/><span className="text-violet-500 italic">Sync?</span></h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/events">
              <Button size="lg" className="bg-white text-black hover:bg-violet-600 hover:text-white px-16 h-20 rounded-[1.5rem] font-black text-xl transition-all active:scale-95 shadow-2xl">
                JOIN THE CIRCLE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Command Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black px-4 py-24">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-16 md:flex-row">
          <div className="text-3xl font-black italic tracking-tighter uppercase">VYBB <span className="text-violet-500">CIRCLE</span></div>
          <div className="flex flex-wrap justify-center gap-16 text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase">
            <Link href="/about" className="hover:text-violet-400 transition-colors">Our Origin</Link>
            <Link href="/events" className="hover:text-violet-400 transition-colors">Registry</Link>
          </div>
          <div className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">© 2026 Registry Protocol Secured.</div>
        </div>
      </footer>
    </main>
  )
}
