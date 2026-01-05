"use client"

import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Music, Mic2, Users, ArrowRight, Calendar, MapPin, Sparkles, Zap, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

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

      {/* Hero Section - Added pt-32 to fix the overlap issue from your image */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-32 text-center overflow-hidden">
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
          <p className="mt-8 max-w-xl mx-auto text-balance text-lg font-medium text-zinc-500 sm:text-xl lowercase border-l-2 border-violet-500/50 pl-6 text-left">
            Beyond music. Beyond borders. Vybb Live is the pulse of the generation. Jam, vibe, and belong.
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/events">
               <Button size="lg" className="rounded-full bg-white text-black hover:bg-violet-600 hover:text-white font-black px-8 h-14 transition-all active:scale-95 shadow-xl">
                 GET TICKETS <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Magic Bento - Latest Drops */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20 space-y-4"
        >
          <div className="flex items-center gap-4">
             <Zap className="text-violet-500 h-8 w-8" />
             <h2 className="text-4xl font-black italic uppercase tracking-tighter sm:text-6xl">Latest Drops</h2>
          </div>
          <div className="h-1 w-24 bg-violet-600 rounded-full" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[500px] w-full rounded-3xl bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <SpotlightCard>
                  <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/5">
                    <img
                      src={exp.imageUrl || "/placeholder.svg"}
                      alt={exp.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <Badge className="mb-4 w-fit bg-violet-600/20 text-violet-400 border-violet-500/30 backdrop-blur-md font-black italic tracking-wider uppercase text-[10px]">
                        {exp.category}
                      </Badge>
                      <h3 className="mb-2 text-3xl font-black italic uppercase tracking-tighter leading-none group-hover:text-violet-400 transition-colors">
                        {exp.title}
                      </h3>
                      
                      <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                            <Calendar className="h-3 w-3 text-violet-500" /> {formatDate(exp.date)}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                            <MapPin className="h-3 w-3 text-violet-500" /> {exp.venue}
                          </div>
                        </div>
                        <Link href={`/events/${exp.id}`}>
                          <Button
                            size="icon"
                            className="h-12 w-12 rounded-2xl bg-white text-black hover:bg-violet-600 hover:text-white transition-all active:scale-90"
                          >
                            <ArrowRight className="h-6 w-6" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Why Vybb? - Glass Surface Cards */}
      <section className="relative z-10 px-4 py-32 sm:px-6 lg:px-8 bg-zinc-950/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl">
          <div className="mb-24 text-center">
            <h2 className="text-4xl font-black italic tracking-tighter sm:text-6xl uppercase">The Culture</h2>
            <p className="mt-4 text-zinc-500 font-medium">We're more than just events; we're a movement.</p>
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
                className="rounded-3xl border border-white/5 bg-black/40 p-10 text-left backdrop-blur-xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <ShieldCheck className="h-24 w-24 text-violet-500" />
                </div>
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-2xl font-black italic uppercase tracking-tight">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
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
          <p className="text-zinc-500 mb-12 max-w-lg mx-auto font-medium">
            Join the circle. Don't just watch the show, be the show.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-white text-black hover:bg-violet-600 hover:text-white px-12 h-16 rounded-full font-black text-lg transition-all active:scale-95 shadow-2xl shadow-violet-500/10">
                JOIN THE CIRCLE
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-12 md:flex-row">
          <div className="text-2xl font-black italic tracking-tighter">
            VYBB <span className="text-violet-500">LIVE</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            <Link href="/about" className="hover:text-violet-400 transition-colors">Our Story</Link>
            <Link href="/events" className="hover:text-violet-400 transition-colors">Experiences</Link>
            <Link href="/profile" className="hover:text-violet-400 transition-colors">My Profile</Link>
          </div>
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">© 2026 Vybb Circle.</div>
        </div>
      </footer>
    </main>
  )
}