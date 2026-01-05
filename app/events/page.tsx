"use client"

import { useState, useEffect } from "react"
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
  Zap
} from "lucide-react"
import { getEvents, type Event } from "@/lib/db-utils"

const categories = [
  { id: "all", label: "All Experiences", icon: Music },
  { id: "open-mic", label: "Open Mic", icon: Mic2 },
  { id: "jam-session", label: "Jam Sessions", icon: Users },
  { id: "live-music", label: "Live Music", icon: Music },
  { id: "workshop", label: "Workshops", icon: Users },
]

const locations = [
  "All Venues",
  "UNDERPASS STUDIO",
  "RHYTHM HOUSE",
  "VYBB GARDEN",
  "ACOUSTIC LOUNGE",
  "THE BASEMENT",
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("All Venues")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data = await getEvents()
        setEvents(data)
        setFilteredEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    let filtered = events
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => 
        event.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      )
    }
    if (selectedLocation !== "All Venues") {
      filtered = filtered.filter(event => 
        event.venue.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }
    setFilteredEvents(filtered)
  }, [events, searchQuery, selectedCategory, selectedLocation])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedLocation("All Venues")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <Badge className="mb-6 border-violet-500/30 bg-violet-500/10 px-6 py-2 text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase backdrop-blur-md">
            <Sparkles className="mr-2 h-3 w-3" /> Discover Upcoming Vybb
          </Badge>
          <h1 className="text-5xl font-black italic tracking-tighter sm:text-7xl lg:text-8xl uppercase leading-none italic">
            Find Your <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent italic">Pulse</span>
          </h1>
          
          {/* Search Bar */}
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
              <Input
                type="search"
                placeholder="Search events, genres, or artists..."
                className="h-16 rounded-full border-white/10 bg-white/5 pl-14 pr-6 text-lg placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-violet-500/20 backdrop-blur-xl transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 transition-all ${showFilters ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Filters Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-y border-white/5 bg-zinc-900/20 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold italic uppercase flex items-center gap-2">
                  <Zap className="h-4 w-4 text-violet-500" /> Filter
                </h3>
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" /> Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedCategory === category.id ? "bg-violet-600 border-violet-600" : "border-white/10 hover:border-violet-500"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Venue</h4>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <Button
                        key={location}
                        variant={selectedLocation === location ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedLocation === location ? "bg-violet-600 border-violet-600" : "border-white/10 hover:border-violet-500"
                        }`}
                        onClick={() => setSelectedLocation(location)}
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events Grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-8">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter sm:text-5xl">
              {selectedCategory === 'all' ? 'All Experiences' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-zinc-500 font-medium text-sm mt-2">{filteredEvents.length} Experiences Found</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[500px] w-full rounded-[2.5rem] bg-zinc-900" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 rounded-[3rem] border border-dashed border-white/10 bg-zinc-950/50">
            <Search className="h-12 w-12 text-zinc-800 mb-6" />
            <h3 className="text-xl font-black italic uppercase">No Experiences Found</h3>
            <Button variant="outline" className="mt-8 rounded-full border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase px-8" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <SpotlightCard>
                  <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-950">
                    <img
                      src={event.imageUrl || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <Badge className="w-fit bg-violet-600/20 text-violet-400 border-violet-500/30 backdrop-blur-md px-3 py-1 font-black italic uppercase tracking-wider text-[10px]">
                        {event.category}
                      </Badge>
                    </div>
                    
                    <div className="absolute top-6 right-6">
                      <Badge variant="outline" className="border-white/20 bg-black/50 backdrop-blur-md px-3 py-1 font-black text-white">
                        ₹{event.price}
                      </Badge>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <h3 className="mb-4 text-3xl font-black italic uppercase tracking-tighter leading-none group-hover:text-violet-400 transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 mb-8">
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                          <Calendar className="h-3 w-3 text-violet-500" /> {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                          <MapPin className="h-3 w-3 text-violet-500" /> {event.venue}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Available</span>
                          <span className="font-bold text-sm tracking-tighter">
                            {event.availableSeats} / {event.totalSeats}
                          </span>
                        </div>
                        <Link href={`/events/${event.id}`}>
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

      

      <footer className="relative z-10 border-t border-white/5 bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-12 md:flex-row">
          <div className="text-2xl font-black italic tracking-tighter">
            VYBB <span className="text-violet-500">LIVE</span>
          </div>
          <div className="flex gap-12 text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
            <Link href="/about" className="hover:text-white transition-colors">Our Story</Link>
            <Link href="/events" className="hover:text-white transition-colors">Experiences</Link>
            <Link href="/profile" className="hover:text-white transition-colors">My Profile</Link>
          </div>
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">© 2026 Vybb Circle.</div>
        </div>
      </footer>
    </main>
  )
}