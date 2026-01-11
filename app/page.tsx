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
  Heart, Share2, TrendingUp, Users2, Star, Flame, Clock, MapPinned,
  Plus, Instagram, Navigation
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
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
    <main className="min-h-screen bg-[#080808] text-white selection:bg-violet-500/30 overflow-x-hidden font-sans">
      <Navbar />

      {/* --- 1. DISTRICT HERO (ZOMATO STYLE) --- */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
            alt="Hero Backdrop"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#080808]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-violet-600 text-white px-4 py-1.5 rounded-full font-black tracking-[0.2em] text-[10px] mb-8 uppercase italic shadow-lg shadow-violet-600/20">
              The District Protocol v1.0
            </Badge>
            <h1 className="text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.8] mb-8 drop-shadow-2xl">
              GO <br/> <span className="text-violet-500">OUT.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 max-w-xl mx-auto font-medium mb-12 lowercase">
              Discover the most high-fidelity events, secret acoustics, and elite sports in your district.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link href="/events">
                 <Button size="lg" className="rounded-2xl bg-white text-black hover:bg-violet-600 hover:text-white font-black px-10 h-16 text-base transition-all shadow-2xl">
                    EXPLORE DISTRICT <Navigation className="ml-2 h-5 w-5 fill-current" />
                 </Button>
               </Link>
               {!user && (
                 <Link href="/signup">
                   <Button size="lg" variant="outline" className="rounded-2xl border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/10 font-black px-10 h-16 text-base uppercase tracking-widest">
                      SYNC IDENTITY
                   </Button>
                 </Link>
               )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. THE STORIES BAR --- */}
      <section className="relative z-20 -mt-10 mb-20 px-4 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
         <div className="flex gap-6 pb-4">
            {[
              { label: "Live Drops", img: "https://i.pinimg.com/1200x/bc/6d/2c/bc6d2c49a37e1ca313936996f01a750b.jpg" },
              { label: "Elite Club", img: "https://i.pinimg.com/1200x/01/cc/03/01cc0332303c7379f61b7f043e06f86e.jpg" },
              { label: "Acoustics", img: "https://i.pinimg.com/1200x/a5/84/c4/a584c4786411956557871b637064d4b1.jpg" },
              { label: "Sports Hub", img: "https://i.pinimg.com/1200x/8f/d3/ea/8fd3ea0824d89e5d00ebb8d586ea4d53.jpg" },
              { label: "Workshops", img: "https://i.pinimg.com/1200x/87/02/76/8702766863116df73117496e6d7734f4.jpg" },
            ].map((story, i) => (
              <div key={i} className="flex-shrink-0 group cursor-pointer text-center">
                 <div className="h-20 w-20 rounded-full p-[3px] bg-gradient-to-tr from-violet-600 to-rose-500 mb-3">
                    <div className="h-full w-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                       <img src={story.img} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{story.label}</span>
              </div>
            ))}
         </div>
      </section>

      {/* --- 3. TRENDING DISTRICT DROPS --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter sm:text-6xl">Trending Drops</h2>
            <div className="h-1.5 w-24 bg-violet-600 rounded-full" />
          </div>
          <Link href="/events" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase text-violet-500 hover:text-white transition-all">
            VIEW REGISTRY <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 rounded-[2.5rem] bg-zinc-900" />) : 
            liveEvents.slice(0, 4).map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                <Link href={`/events/${event.id}`} className="group">
                  <div className="relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-2xl">
                    <img src={event.imageUrl} className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                    
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                       <Badge className="bg-white/10 backdrop-blur-md text-white border-white/10 text-[9px] font-black uppercase italic">{event.category}</Badge>
                       <Button size="icon" variant="ghost" className="rounded-full bg-black/40 backdrop-blur-md text-white h-10 w-10 border border-white/10"><Heart className="h-4 w-4" /></Button>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-8 text-left">
                       <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-4 line-clamp-2 leading-none group-hover:text-violet-400 transition-colors">{event.title}</h3>
                       <div className="flex items-center gap-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-6">
                          <Calendar className="h-3 w-3 text-violet-500" /> {formatDate(event.date)}
                          <MapPin className="h-3 w-3 text-violet-500 ml-2" /> {event.venue.split('@')[0]}
                       </div>
                       <div className="flex items-center justify-between border-t border-white/5 pt-6">
                          <span className="text-xl font-black italic text-white">₹{event.price}</span>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{event.availableSeats} LEFT</span>
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          }
        </div>
      </section>

      {/* --- 4. CATEGORY SPOTLIGHT --- */}
      <section className="py-32 bg-zinc-950/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 text-left space-y-8">
             <Badge className="bg-rose-600/10 text-rose-500 border-rose-500/20 px-4 py-1 uppercase font-black text-[10px] tracking-widest">District Highlight</Badge>
             <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">Find Your <br/><span className="text-violet-500 italic">District.</span></h2>
             <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-md border-l-2 border-violet-500/30 pl-6 lowercase">
                Whether it's an intimate jam session or a high-energy district match, we registry the best loops in town.
             </p>
             <Link href="/events" className="inline-block pt-4">
                <Button className="rounded-2xl bg-white text-black font-black px-12 h-16 hover:bg-violet-600 hover:text-white transition-all">VIEW ALL DISTRICTS</Button>
             </Link>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-6">
             <div className="space-y-6">
                <div className="h-64 rounded-[3rem] bg-zinc-900 border border-white/5 overflow-hidden group">
                   <img src="https://i.pinimg.com/1200x/bc/6d/2c/bc6d2c49a37e1ca313936996f01a750b.jpg" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                </div>
                <div className="h-44 rounded-[3rem] bg-violet-600 flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:rotate-2 transition-transform shadow-2xl shadow-violet-600/20">
                   <Music className="h-10 w-10 mb-4" />
                   <span className="font-black italic uppercase tracking-widest">Audio Protocol</span>
                </div>
             </div>
             <div className="space-y-6 pt-12">
                <div className="h-44 rounded-[3rem] bg-zinc-800 border border-white/10 flex items-center justify-center hover:-rotate-2 transition-transform cursor-pointer">
                   <Trophy className="h-12 w-12 text-zinc-600" />
                </div>
                <div className="h-80 rounded-[3rem] bg-zinc-900 border border-white/5 overflow-hidden group shadow-2xl">
                   <img src="https://i.pinimg.com/1200x/01/cc/03/01cc0332303c7379f61b7f043e06f86e.jpg" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- 5. CONDITIONAL CTA SECTION --- */}
      <section className="relative z-10 px-4 py-40 overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <div className="relative rounded-[4rem] border border-white/5 bg-zinc-950 p-20 text-center overflow-hidden shadow-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_70%)] opacity-50" />
            
            <div className="relative z-10 space-y-12">
               <h2 className="text-5xl md:text-[7rem] font-black italic uppercase tracking-tighter leading-[0.8]">
                 {user ? "STAY" : "JOIN THE"} <br/> 
                 <span className="text-violet-500 italic">{user ? "SYNCED" : "DISTRICT"}</span>
               </h2>
               
               <p className="text-lg text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed lowercase italic">
                 {user 
                   ? "You are part of the elite loop. View your reserved experiences and ticket vaults."
                   : "Initialize your identity to book experiences, unlock member-only drops, and feel the district vibe."
                 }
               </p>

               <div className="flex justify-center pt-6">
                 <Link href={user ? "/profile" : "/signup"}>
                   <Button size="lg" className={cn(
                     "rounded-full font-black px-16 h-24 text-xl transition-all active:scale-95 shadow-3xl uppercase tracking-[0.2em]",
                     user 
                      ? "bg-white text-black hover:bg-zinc-200" 
                      : "bg-violet-600 text-white hover:bg-white hover:text-black shadow-violet-600/30"
                   )}>
                     {user ? "VIEW MY REGISTRY" : "SYNC IDENTITY"}
                   </Button>
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Command Footer */}
      <footer className="py-24 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12 text-left">
          <div className="space-y-4">
             <div className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                VYBB <span className="text-violet-500 italic">LIVE</span>
             </div>
             <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.3em] max-w-xs leading-loose">The private district registry for high-fidelity loops.</p>
          </div>
          <div className="flex gap-20 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
             <div className="flex flex-col gap-4">
                <span className="text-white">REGISTRY</span>
                <Link href="/events" className="hover:text-violet-400 transition-colors">Drops</Link>
                <Link href="/about" className="hover:text-violet-400 transition-colors">District Log</Link>
             </div>
             <div className="flex flex-col gap-4">
                <span className="text-white">MEMBER</span>
                <Link href="/profile" className="hover:text-violet-400 transition-colors">Identity</Link>
                <Link href="/tickets" className="hover:text-violet-400 transition-colors">Vault</Link>
             </div>
          </div>
          <div className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest text-center md:text-right">
             Protocol Secured © 2026 District Registry v1.0
          </div>
        </div>
      </footer>
    </main>
  )
}
