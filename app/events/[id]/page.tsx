"use client"

import { use, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { SeatSelector } from "@/components/seat-selector"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Calendar, MapPin, Clock, Users, ArrowLeft, 
  Navigation as NavIcon, Ticket, Sparkles, ShieldCheck, Zap 
} from "lucide-react"
import Link from "next/link"
import { getEventById, type Event } from "@/lib/db-utils"

const DynamicMap = dynamic(() => import("@/components/event-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-[2.5rem] bg-zinc-900" />,
})

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Helper function to format the date correctly
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
      })
    } catch { return dateString }
  }

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const data = await getEventById(id)
        if (data) setEvent(data)
        else setError("Event not found")
      } catch (err) {
        setError("Failed to load event details")
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  if (loading || error || !event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center gap-4"
        >
          <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
          <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Loading Experience</p>
        </motion.div>
      </div>
    )
  }

  const totalPrice = selectedSeats.length * event.price

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-32 sm:px-6 lg:px-8 lg:pt-32">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Link
            href="/events"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-violet-400"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Experiences
          </Link>
        </motion.div>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          {/* Main Content: Magic Bento Style */}
          <div className="flex-1 space-y-12 order-2 lg:order-1">
            <motion.section 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/30 px-3 py-1 font-semibold uppercase tracking-wider backdrop-blur-md">
                  {event.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-zinc-500">
                  <Users className="h-3.5 w-3.5" />
                  {event.availableSeats} spots available
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent italic">
                {event.title}
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-zinc-400 max-w-2xl border-l-2 border-violet-500/50 pl-6">
                {event.description}
              </p>
            </motion.section>

            {/* Seat Selector Section */}
            <motion.section 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/20 p-8 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3 italic">
                  <Zap className="h-5 w-5 text-violet-500" />
                  Select Seats
                </h2>
              </div>
              <SeatSelector
                totalSeats={event.totalSeats}
                availableSeats={event.availableSeats}
                pricePerSeat={event.price}
                onSelectionChange={setSelectedSeats}
              />
            </motion.section>

            {/* Venue Section */}
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold italic">The Location</h2>
                  <p className="text-zinc-500 text-sm font-medium">{event.venue}</p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-violet-600 hover:border-violet-500 transition-all gap-2"
                  onClick={() => window.open(`http://googleusercontent.com/maps.google.com/?q=${event.coordinates.lat},${event.coordinates.lng}`, '_blank')}
                >
                  <NavIcon className="h-4 w-4" />
                  Directions
                </Button>
              </div>
              
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 p-2 shadow-2xl">
                <div className="h-[350px] w-full rounded-[2rem] overflow-hidden grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0">
                  <DynamicMap
                    center={[event.coordinates.lat, event.coordinates.lng]}
                    venue={event.venue}
                    address={event.address}
                  />
                </div>
              </div>
            </motion.section>
          </div>

          {/* Sidebar: Reflective Card Style */}
          <aside className="w-full lg:w-[400px] order-1 lg:order-2 lg:sticky lg:top-32">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-2xl"
            >
              <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-square">
                <img 
                  src={event.imageUrl || "/placeholder.svg"} 
                  alt={event.title} 
                  className="h-full w-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <div className="absolute top-6 right-6">
                   <div className="bg-black/50 backdrop-blur-md border border-white/20 p-2 rounded-2xl">
                      <ShieldCheck className="h-5 w-5 text-violet-400" />
                   </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Date</p>
                      <p className="text-sm font-bold tracking-tight">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Time</p>
                      <p className="text-sm font-bold tracking-tight">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Entry</p>
                      <p className="text-sm font-bold tracking-tight">₹{event.price} <span className="text-zinc-500 text-[10px] font-normal">/ seat</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 hidden lg:block">
                  <Link href={selectedSeats.length > 0 ? `/checkout?event=${id}&seats=${selectedSeats.join(",")}` : "#"}>
                    <Button 
                      disabled={selectedSeats.length === 0} 
                      className="w-full h-14 bg-white text-black hover:bg-violet-600 hover:text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl disabled:opacity-30"
                    >
                      {selectedSeats.length > 0 ? `BOOK ${selectedSeats.length} SEATS` : "SELECT SEATS"}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* Floating Pill Nav (Mobile Booking) */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div 
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            className="fixed bottom-10 left-1/2 z-50 w-[90%] max-w-[400px] lg:hidden"
          >
            <Link href={`/checkout?event=${id}&seats=${selectedSeats.join(",")}`}>
              <div className="group relative overflow-hidden rounded-full bg-white p-1 shadow-2xl border border-white/20 active:scale-95 transition-transform">
                <div className="flex items-center justify-between pl-6 pr-2 py-2">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase text-zinc-500 leading-none mb-1">Subtotal</span>
                    <span className="text-xl font-black text-black leading-none">₹{totalPrice}</span>
                  </div>
                  <div className="bg-violet-600 text-white rounded-full px-6 py-3 font-black text-sm flex items-center gap-2 group-hover:bg-black transition-colors">
                    CONFIRM
                    <Zap className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}