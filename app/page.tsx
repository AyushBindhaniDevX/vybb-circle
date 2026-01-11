"use client"

import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Music, Mic2, Users, ArrowRight, Calendar, MapPin, 
  Sparkles, Zap, ShieldCheck, Ticket, History, 
  ChevronRight, Play, Trophy, Activity, Drum,
  Heart, Share2, MessageCircle, TrendingUp,
  Users2, Star, Flame, Clock, MapPinned
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

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

  const liveEvents = useMemo(() => 
    events.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0)), 
  [events]);

  const trendingEvents = useMemo(() => 
    events.filter(e => e.price > 0).slice(0, 4), 
  [events]);

  const communityEvents = useMemo(() => 
    events.filter(e => e.category === "Workshop" || e.category === "Open Mic").slice(0, 3), 
  [events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  const getTimeFromDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#0a0a0a] text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION WITH COMMUNITY STATS --- */}
      <section className="relative min-h-[90vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-rose-900/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Column - Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <Flame className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-bold text-white/90">500+ LIVE EXPERIENCES THIS WEEK</span>
                <div className="h-1 w-1 rounded-full bg-white/30" />
                <span className="text-sm font-medium text-white/60">4.8★ Community Rating</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9]">
                FEEL THE <span className="bg-gradient-to-r from-violet-500 to-rose-500 bg-clip-text text-transparent">VYBB</span> PULSE
              </h1>
              
              <p className="text-xl text-white/70 leading-relaxed max-w-xl">
                Join thousands discovering authentic connections through music, art, and shared passions. Every ticket supports local creators.
              </p>

              {/* Community Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[120px]">
                  <div className="text-3xl font-black text-violet-400">2.5K+</div>
                  <div className="text-xs font-medium text-white/60 uppercase tracking-wider">Active Members</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[120px]">
                  <div className="text-3xl font-black text-rose-400">150+</div>
                  <div className="text-xs font-medium text-white/60 uppercase tracking-wider">Creators</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[120px]">
                  <div className="text-3xl font-black text-emerald-400">4.8★</div>
                  <div className="text-xs font-medium text-white/60 uppercase tracking-wider">Avg Rating</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                <Link href="/events">
                  <Button size="lg" className="rounded-full bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white font-black px-8 h-14 text-base transition-all hover:scale-105">
                    Explore Events <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 font-semibold px-8 h-14">
                  <Users2 className="mr-2 h-5 w-5" />
                  Join Community
                </Button>
              </div>
            </motion.div>

            {/* Right Column - Featured Event Card */}
            {liveEvents[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <div className="relative group cursor-pointer">
                  {/* Glow Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 to-rose-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={liveEvents[0].imageUrl} 
                        alt={liveEvents[0].title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Live Badge */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        LIVE NOW
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 mb-2">
                            FEATURED
                          </Badge>
                          <h3 className="text-xl font-bold text-white line-clamp-1">{liveEvents[0].title}</h3>
                          <p className="text-sm text-white/60 mt-1 line-clamp-2">{liveEvents[0].description}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/10">
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-white/40" />
                            <span className="text-sm font-medium">{formatDate(liveEvents[0].date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPinned className="h-4 w-4 text-white/40" />
                            <span className="text-sm font-medium">{liveEvents[0].venue}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-black text-white">₹{liveEvents[0].price}</div>
                            <div className="text-xs text-white/40">per person</div>
                          </div>
                          <Link href={`/events/${liveEvents[0].id}`}>
                            <Button className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-6">
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* --- COMMUNITY PILLARS --- */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Built by <span className="bg-gradient-to-r from-violet-500 to-rose-500 bg-clip-text text-transparent">Community</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Three pillars that make every experience unforgettable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users2,
                title: "Collective Energy",
                description: "Events curated and rated by our community. Your feedback shapes what happens next.",
                color: "from-violet-500/20 to-violet-600/20",
                iconColor: "text-violet-400"
              },
              {
                icon: Sparkles,
                title: "Creator-First",
                description: "80% of ticket revenue goes directly to artists and organizers. Support real talent.",
                color: "from-rose-500/20 to-rose-600/20",
                iconColor: "text-rose-400"
              },
              {
                icon: ShieldCheck,
                title: "Safe Spaces",
                description: "Verified attendees, zero-tolerance policy, and community guidelines for respectful interactions.",
                color: "from-emerald-500/20 to-emerald-600/20",
                iconColor: "text-emerald-400"
              }
            ].map((pillar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 backdrop-blur-sm h-full hover:border-white/20 transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-white/5 mb-6 ${pillar.iconColor}`}>
                      <pillar.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{pillar.title}</h3>
                    <p className="text-white/60">{pillar.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TRENDING EXPERIENCES --- */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-6 w-6 text-rose-500" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Trending Now</h2>
              </div>
              <p className="text-white/60">Events buzzing in the community this week</p>
            </div>
            <Link href="/events">
              <Button variant="ghost" className="text-white/60 hover:text-white">
                View All <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-10">
            {["all", "music", "workshop", "sports", "open-mic", "art"].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-6 capitalize transition-all ${
                  activeFilter === filter 
                    ? "bg-gradient-to-r from-violet-600 to-rose-600 border-0" 
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                {filter === "all" ? "All Events" : filter}
              </Button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-2xl bg-white/5" />
              ))
            ) : (
              trendingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <Link href={`/events/${event.id}`}>
                    <div className="relative bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 h-full">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-black/60 backdrop-blur-sm border-white/20">
                            {event.category}
                          </Badge>
                        </div>
                        
                        {/* Like Button */}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm hover:bg-black/80 rounded-full"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle like
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-violet-400 transition-colors">
                              {event.title}
                            </h3>
                            <p className="text-sm text-white/60 line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                        
                        {/* Event Details */}
                        <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-white/40" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-bold">4.8</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPinned className="h-4 w-4 text-white/40" />
                              <span className="text-sm text-white/60">{event.venue}</span>
                            </div>
                            <div className="text-lg font-black text-white">
                              ₹{event.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- COMMUNITY SPOTLIGHT --- */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-transparent to-rose-900/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 mb-6">
              <Users2 className="h-5 w-5 text-violet-400" />
              <span className="font-bold">Community Spotlight</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Meet Your <span className="bg-gradient-to-r from-violet-500 to-rose-500 bg-clip-text text-transparent">Tribe</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Real experiences from the VYBB community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {communityEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300">
                  {/* User Avatar & Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-500 to-rose-500 p-0.5">
                      <div className="h-full w-full rounded-full bg-zinc-900" />
                    </div>
                    <div>
                      <div className="font-bold">Community Member</div>
                      <div className="text-sm text-white/60">Attended {event.category}</div>
                    </div>
                  </div>
                  
                  {/* Review */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/80 italic">"This experience changed how I connect with local artists. Can't wait for the next one!"</p>
                  </div>
                  
                  {/* Event Preview */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden">
                        <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm line-clamp-1">{event.title}</div>
                        <div className="text-xs text-white/60">{formatDate(event.date)} • {event.venue}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA: JOIN THE COMMUNITY --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-rose-600/20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Badge className="bg-gradient-to-r from-violet-600 to-rose-600 text-white border-0 px-6 py-2 mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              LIMITED SPOTS AVAILABLE
            </Badge>
            
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 leading-[0.9]">
              Your <span className="bg-gradient-to-r from-violet-500 to-rose-500 bg-clip-text text-transparent">Vibe</span> Awaits
            </h2>
            
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Join 2,500+ creatives, music lovers, and community builders. First event is on us.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="rounded-full bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white font-black px-10 h-14 text-lg transition-all hover:scale-105">
                  <Users2 className="mr-3 h-5 w-5" />
                  Join Free Community
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full border-white/30 bg-white/5 hover:bg-white/10 px-10 h-14"
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                Talk to Community Manager
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { label: "No Spam", icon: ShieldCheck },
                { label: "Free Events", icon: Ticket },
                { label: "24/7 Support", icon: MessageCircle },
                { label: "Local Only", icon: MapPinned }
              ].map((feature, index) => (
                <div key={index} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <feature.icon className="h-6 w-6 mx-auto mb-2 text-violet-400" />
                  <div className="text-sm font-medium">{feature.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                VYBB<span className="text-violet-500">.</span>
              </div>
              <p className="text-sm text-white/40 max-w-md">
                Building India's most vibrant community of creators, music lovers, and experience seekers.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <Users2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-white/30 uppercase tracking-widest">
              Made with ❤️ for the community • © 2024 VYBB Collective
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
