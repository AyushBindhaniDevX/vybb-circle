// app/events/page.tsx
"use client"

import { useState, useEffect } from "react"
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
  X
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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => 
        event.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      )
    }

    // Apply location filter
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 via-transparent to-black" />
        <div className="relative mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 border-violet-500/30 bg-violet-500/10 px-6 py-2 text-xs font-black tracking-[0.2em] text-violet-400 uppercase">
              Upcoming Experiences
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Find Your <span className="text-violet-500">Vybb</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              Discover intimate music experiences, open mics, jam sessions, and exclusive live performances.
              Your next unforgettable night awaits.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search events, genres, or artists..."
                className="h-14 rounded-2xl border-white/10 bg-white/5 pl-12 pr-4 text-lg placeholder:text-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <div className="border-b border-white/5 bg-black/50 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-zinc-300">Filter Experiences</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-500 hover:text-white"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full gap-2 ${
                          selectedCategory === category.id
                            ? "bg-violet-600 hover:bg-violet-700 border-violet-600"
                            : "border-white/10 hover:border-violet-500/50"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Venue</h4>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <Button
                      key={location}
                      variant={selectedLocation === location ? "default" : "outline"}
                      size="sm"
                      className={`rounded-full ${
                        selectedLocation === location
                          ? "bg-violet-600 hover:bg-violet-700 border-violet-600"
                          : "border-white/10 hover:border-violet-500/50"
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
        </div>
      )}

      {/* Events Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold">
              {selectedCategory === 'all' ? 'All Experiences' : 
               categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-zinc-500 mt-2">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-zinc-500">Sort by:</span>
            <select className="bg-transparent border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500">
              <option value="date">Date</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[500px] w-full rounded-2xl bg-zinc-900" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10 bg-zinc-950/50">
            <Search className="h-12 w-12 text-zinc-700 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-zinc-500 mb-6">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              className="border-white/10 hover:border-violet-500/50"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <SpotlightCard key={event.id}>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                  <img
                    src={event.imageUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-violet-600 font-black italic tracking-wider">
                      {event.category}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="border-white/20 bg-black/50 backdrop-blur-sm">
                      ₹{event.price}
                    </Badge>
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="mb-2 text-2xl font-black italic uppercase tracking-tighter leading-none line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-400 uppercase">
                        <Calendar className="h-3 w-3" /> 
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
                        <MapPin className="h-3 w-3" /> 
                        {event.venue}
                      </div>
                    </div>
                    
                    <p className="text-sm text-zinc-300 mb-6 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="text-xs">
                        <div className="text-zinc-500">Seats Available</div>
                        <div className="font-bold">
                          {event.availableSeats}/{event.totalSeats}
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white text-black hover:bg-violet-600 hover:text-white transition-all group"
                        >
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/20 to-black p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Never Miss a Vybb</h3>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8">
              Subscribe to our newsletter and be the first to know about new experiences, 
              exclusive presales, and artist announcements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/5 border-white/10 focus:border-violet-500/50"
              />
              <Button className="bg-violet-600 hover:bg-violet-700">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-zinc-600 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-xl font-bold">
            VYBB <span className="text-violet-500">LIVE</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="/about" className="hover:text-white">
              Our Story
            </Link>
            <Link href="/events" className="hover:text-white">
              Experiences
            </Link>
            <Link href="#" className="hover:text-white">
              Contact
            </Link>
            <Link href="#" className="hover:text-white">
              FAQ
            </Link>
          </div>
          <div className="text-sm text-zinc-600">© 2026 Vybb Circle. All rights reserved.</div>
        </div>
      </footer>
    </main>
  )
}