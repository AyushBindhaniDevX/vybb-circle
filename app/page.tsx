"use client"

import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Music, Mic2, Users, ArrowRight, Calendar, MapPin, Sparkles, Zap, ShieldCheck, Ticket } from "lucide-react"
import { useEffect, useState } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

// --- React Bits Components ---

// 1. Counter Bit
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
  return <span className="tabular-nums">{count.toLocaleString()}+</span>;
};

// 2. Bounce Card Bit (Hero Visuals)
const BounceCard = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-10, 10, -10] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    className={`rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md p-4 shadow-2xl ${className}`}
  >
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center">
        <Ticket className="h-4 w-4 text-violet-400" />
      </div>
      <div className="h-2 w-16 bg-white/10 rounded" />
    </div>
  </motion.div>
);

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getFeaturedEvents(3)
        setFeaturedEvents(events)
      } catch (error) {
        console.error("Error fetching featured events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans overflow-x-hidden">
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      {/* Hero Section with Bounce Cards */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-32 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl pointer-events-none">
          <BounceCard className="absolute top-[-200px] left-[10%] rotate-[-12deg]" delay={0} />
          <BounceCard className="absolute top-[100px] right-[5%] rotate-[8deg]" delay={1} />
          <BounceCard className="absolute bottom-[-150px] left-[15%] rotate-[5deg]" delay={2} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <Badge className="mb-8 border-violet-500/30 bg-violet-500/10 px-6 py-2 text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase backdrop-blur-md">
            <Sparkles className="mr-2 h-3 w-3" /> Experience the Unfiltered
          </Badge>
          <h1 className="max-w-5xl text-balance text-6xl font-black italic tracking-tighter sm:text-9xl uppercase leading-[0.8] mb-8">
            Live the <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-violet-400 bg-clip-text text-transparent animate-gradient">
              Experience
            </span>
          </h1>
        

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/events">
               <Button size="lg" className="rounded-full bg-white text-black hover:bg-violet-600 hover:text-white font-black px-12 h-16 transition-all active:scale-95 shadow-xl shadow-violet-500/20">
                  GET TICKETS <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Magic Bento - Grid Layout */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="mb-20 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <Zap className="text-violet-500 h-8 w-8" />
               <h2 className="text-4xl font-black italic uppercase tracking-tighter sm:text-6xl">Latest Drops</h2>
            </div>
            <div className="h-1 w-24 bg-violet-600 rounded-full" />
          </div>
          <Link href="/events" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            View All Events —&gt;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2">
            <Skeleton className="md:col-span-2 md:row-span-2 h-[600px] rounded-[2.5rem] bg-zinc-900" />
            <Skeleton className="md:col-span-2 h-[290px] rounded-[2.5rem] bg-zinc-900" />
            <Skeleton className="md:col-span-1 h-[290px] rounded-[2.5rem] bg-zinc-900" />
            <Skeleton className="md:col-span-1 h-[290px] rounded-[2.5rem] bg-zinc-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2">
            {/* Bento Primary Item */}
            {featuredEvents[0] && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }}
                className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border border-white/5"
              >
                <img src={featuredEvents[0].imageUrl} className="h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-10">
                  <Badge className="bg-violet-600 mb-4">{featuredEvents[0].category}</Badge>
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">{featuredEvents[0].title}</h3>
                  <Link href={`/events/${featuredEvents[0].id}`}>
                    <Button className="rounded-full bg-white text-black font-black">RESERVE NOW</Button>
                  </Link>
                </div>
              </motion.div>
            )}
            {/* Bento Secondary Items */}
            {featuredEvents.slice(1, 4).map((exp, i) => (
              <motion.div 
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${i === 0 ? 'md:col-span-2' : 'md:col-span-1'} group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/50`}
              >
                <img src={exp.imageUrl} className="h-full w-full object-cover opacity-50 group-hover:opacity-100 transition-all grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                   <h3 className="text-xl font-black italic uppercase leading-tight">{exp.title}</h3>
                   <p className="text-[10px] font-black text-zinc-400 tracking-widest mt-2">{formatDate(exp.date)}</p>
                </div>
                <Link href={`/events/${exp.id}`} className="absolute inset-0 z-10" />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Pixel Card Section (The Culture) */}
      <section className="relative z-10 px-4 py-32 sm:px-6 lg:px-8 bg-zinc-950/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl">
          <div className="mb-24 text-center">
            <h2 className="text-4xl font-black italic tracking-tighter sm:text-6xl uppercase">The Culture</h2>
            <p className="mt-4 text-zinc-500 font-medium lowercase tracking-widest">We&apos;re more than just events; we&apos;re a movement.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: <Mic2 />, title: "Artist First", desc: "We provide a platform for emerging talent in intimate settings." },
              { icon: <Music />, title: "High Fidelity", desc: "Meticulously planned sound systems for an immersive vybb." },
              { icon: <Users />, title: "Community", desc: "Join our circle and discover a tribe that shares your pulse." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="relative p-1 group overflow-hidden rounded-[2rem]"
              >
                {/* Pixel/Spotlight Card Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative rounded-[1.9rem] bg-black border border-white/5 p-10 h-full">
                  <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="mb-4 text-2xl font-black italic uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-violet-600/5 blur-[120px] rounded-full" />
        <div className="mx-auto max-w-4xl text-center rounded-[3rem] border border-white/5 bg-zinc-900/20 p-20 backdrop-blur-xl">
          <h2 className="text-5xl font-black italic mb-8 uppercase tracking-tighter sm:text-7xl leading-none">Ready to <br/><span className="text-violet-500">Vybb?</span></h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-white text-black hover:bg-violet-600 hover:text-white px-12 h-16 rounded-full font-black text-lg transition-all active:scale-95 shadow-2xl shadow-violet-500/10">
                JOIN THE CIRCLE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-12 md:flex-row">
          <div className="text-2xl font-black italic tracking-tighter">
            VYBB <span className="text-violet-500">LIVE</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            <Link href="/about" className="hover:text-violet-400 transition-colors">Our Story</Link>
            <Link href="/events" className="hover:text-violet-400 transition-colors">Experiences</Link>
          </div>
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">© 2026 Vybb Circle.</div>
        </div>
      </footer>
    </main>
  )
}
