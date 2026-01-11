"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Music, 
  Mic2, 
  Users,
  X,
  Sparkles,
  Zap,
  Clock,
  History
} from "lucide-react"
import { getEvents, type Event } from "@/lib/db-utils"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", label: "All Experiences", icon: Sparkles },
  { id: "OPEN MIC", label: "Open Mic", icon: Mic2 },
  { id: "JAM SESSION", label: "Jam Sessions", icon: Users },
  { id: "CRICKET", label: "Sports Hub", icon: Zap },
  { id: "WORKSHOP", label: "Workshops", icon: Users },
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (error) {
        console.error("Fetch Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Optimized Filter Engine with Past Date Awareness
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    // Sort so live events appear before concluded ones
    .sort((a, b) => {
      const isAPast = new Date(a.date).getTime() < new Date().setHours(0,0,0,0)
      const isBPast = new Date(b.date).getTime() < new Date().setHours(0,0,0,0)
      if (isAPast === isBPast) return 0
      return isAPast ? 1 : -1
    })
  }, [events, searchQuery, selectedCategory])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      <Navbar />

      {/* Aurora Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-violet-600/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center">
          <Badge className="mb-6 border-violet-500/30 bg-violet-500/10 px-6 py-2 text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase">
            <Sparkles className="mr-2 h-3 w-3" /> Initialize Search Registry
          </Badge>
          <h1 className="text-5xl font-black italic tracking-tighter sm:text-7xl lg:text-8xl uppercase leading-none">
            Find Your <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent italic">Pulse</span>
          </h1>
          
          <div className="mx-auto mt-12 max-w-2xl relative group">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
            <Input
              type="search"
              placeholder="Search experiences, venues, or protocols..."
              className="h-16 rounded-2xl border-white/10 bg-white/5 pl-14 pr-16 text-lg placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-0 backdrop-blur-xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl h-10 px-4 transition-all uppercase font-black text-[10px] tracking-widest",
                showFilters ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-white'
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" /> {showFilters ? 'Hide' : 'Filter'}
            </Button>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-y border-white/5 bg-zinc-900/10 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black italic uppercase flex items-center gap-2 tracking-widest"><Zap className="h-4 w-4 text-violet-500" /> Filter Engine</h3>
                <Button variant="ghost" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest" onClick={clearFilters}><X className="h-4 w-4 mr-2" /> Reset Protocol</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    className={cn(
                      "rounded-full px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedCategory === cat.id ? "bg-violet-600 border-violet-600" : "border-white/5 hover:border-violet-500 bg-white/5"
                    )}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <cat.icon className="h-3 w-3 mr-2" /> {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 flex items-center justify-between border-b border-white/5 pb-8">
           <h2 className="text-3xl font-black italic uppercase tracking-tighter sm:text-5xl">Experiences</h2>
           <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em]">{filteredEvents.length} Logs Found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[500px] w-full rounded-[3rem] bg-zinc-900/50" />)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-40 text-center rounded-[3rem] border-2 border-dashed border-white/5 bg-zinc-950/50">
            <Search className="h-12 w-12 text-zinc-800 mx-auto mb-6" />
            <h3 className="text-xl font-black uppercase italic">No Active Loops Found</h3>
            <Button variant="outline" className="mt-8 rounded-2xl border-white/10 hover:bg-violet-600 transition-all font-black uppercase px-8" onClick={clearFilters}>Reset Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => {
              const isPast = new Date(event.date).getTime() < new Date().setHours(0,0,0,0)
              
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} viewport={{ once: true }}>
                  <Link href={`/events/${event.id}`}>
                    <SpotlightCard>
                      <div className={cn(
                        "group relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] border transition-all duration-500",
                        isPast ? "border-white/5 grayscale" : "border-white/10 hover:border-violet-500/50 bg-zinc-950"
                      )}>
                        <img src={event.imageUrl} alt={event.title} className={cn("h-full w-full object-cover transition-all duration-700 group-hover:scale-105", isPast && "opacity-30")} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        
                        <div className="absolute top-8 left-8 flex flex-col gap-2">
                          <Badge className={cn(
                            "w-fit px-4 py-1.5 font-black italic uppercase tracking-widest text-[9px]",
                            isPast ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-violet-600 text-white border-violet-400"
                          )}>
                            {isPast ? <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> Archive</span> : event.category}
                          </Badge>
                        </div>

                        <div className="absolute inset-0 flex flex-col justify-end p-10">
                          <h3 className={cn("mb-4 text-4xl font-black italic uppercase tracking-tighter leading-none transition-colors", !isPast && "group-hover:text-violet-400")}>
                            {event.title}
                          </h3>
                          <div className="space-y-2 mb-8 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <p className="flex items-center gap-2"><Calendar className="h-3 w-3 text-violet-500" /> {formatDate(event.date)}</p>
                            <p className="flex items-center gap-2"><MapPin className="h-3 w-3 text-violet-500" /> {event.venue.split('@')[0]}</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-6">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{isPast ? "Status" : "Entry"}</span>
                              <span className="font-black text-lg italic text-white uppercase">{isPast ? "Concluded" : `₹${event.price}`}</span>
                            </div>
                            <Button size="icon" className={cn("h-12 w-12 rounded-2xl transition-all", isPast ? "bg-zinc-800 text-zinc-600" : "bg-white text-black group-hover:bg-violet-600 group-hover:text-white")}>
                              <ArrowRight className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
      
      <footer className="py-20 border-t border-white/5 text-center">
         <div className="text-2xl font-black italic tracking-tighter uppercase mb-6">VYBB <span className="text-violet-500">CIRCLE</span></div>
         <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">Registry Protocol Secured © 2026</p>
      </footer>
    </main>
  )
}
