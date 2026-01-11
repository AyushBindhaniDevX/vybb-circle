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
  Navigation as NavIcon, Ticket, Sparkles, Zap, Lock, Timer, Info, Utensils
} from "lucide-react"
import Link from "next/link"
import { getEventById, type Event } from "@/lib/db-utils"
import { useAuth } from "@/components/auth-provider"
import { SignInModal } from "@/components/signin-modal"
import { cn } from "@/lib/utils"

const DynamicMap = dynamic(() => import("@/components/event-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-[2.5rem] bg-zinc-900" />,
})

const EventCounter = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hrs: 0, mins: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hrs: 0, mins: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4">
      {[
        { label: 'days', value: timeLeft.days },
        { label: 'hrs', value: timeLeft.hrs },
        { label: 'mins', value: timeLeft.mins }
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <motion.span 
            key={item.value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-black italic text-violet-400 tabular-nums"
          >
            {String(item.value).padStart(2, '0')}
          </motion.span>
          <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)

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

  // DETERMINE IF EVENT IS PAST
  const isPastEvent = event ? new Date(event.date).getTime() < new Date().getTime() : false;

  if (loading || error || !event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
          <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">
            {error ? error : "Syncing Pulse"}
          </p>
        </motion.div>
      </div>
    )
  }

  const totalPrice = selectedSeats.length * (event.price || 0)
  const isFoodOfferEligible = (event.price || 0) > 149

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#c026d3]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-32 sm:px-6 lg:px-8 lg:pt-36">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <Link href="/events" className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-violet-400">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Experiences
          </Link>
        </motion.div>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-12 order-2 lg:order-1">
            <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={cn(
                    "px-3 py-1 font-black uppercase tracking-widest text-[10px]",
                    isPastEvent ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-violet-600/20 text-violet-400 border-violet-500/30"
                  )}>
                    {isPastEvent ? "ARCHIVED" : event.category}
                  </Badge>
                  {!isPastEvent && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                      <Users className="h-3.5 w-3.5" /> {event.availableSeats} LEFT
                    </div>
                  )}
                </div>
                
                {!isPastEvent && (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                     <Timer className="h-4 w-4 text-violet-500" />
                     <EventCounter targetDate={event.date} />
                  </div>
                )}
              </div>
              
              <h1 className={cn(
                "text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl bg-gradient-to-b bg-clip-text text-transparent italic text-left uppercase leading-[0.9]",
                isPastEvent ? "from-zinc-500 to-zinc-700" : "from-white to-zinc-500"
              )}>
                {event.title}
              </h1>

              {isFoodOfferEligible && !isPastEvent && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mt-6 inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-600/20 to-transparent border-l-4 border-violet-500 backdrop-blur-md">
                  <Utensils className="h-5 w-5 text-violet-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Vybb Circle Perk</p>
                    <p className="text-sm font-bold text-white uppercase italic">₹100 F&B Credit Included</p>
                  </div>
                </motion.div>
              )}

              <p className="mt-8 text-lg leading-relaxed text-zinc-400 max-w-2xl border-l-2 border-violet-500/50 pl-6 text-left lowercase font-medium">
                {event.description}
              </p>
            </motion.section>

            <motion.section 
              initial={{ y: 20, opacity: 0 }} 
              whileInView={{ y: 0, opacity: 1 }} 
              viewport={{ once: true }}
              className={cn(
                "space-y-8 rounded-[2.5rem] border p-10 backdrop-blur-xl shadow-2xl",
                isPastEvent ? "border-white/5 bg-zinc-950/40 grayscale" : "border-white/5 bg-zinc-900/20"
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic flex items-center gap-3 uppercase">
                  <Zap className={cn("h-6 w-6 fill-current", isPastEvent ? "text-zinc-700" : "text-violet-500")} /> 
                  {isPastEvent ? "Archive View" : "Seating Map"}
                </h2>
              </div>

              {isPastEvent ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                    <Lock className="h-8 w-8 text-zinc-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black italic uppercase text-zinc-500">Loop Concluded</h3>
                    <p className="text-zinc-700 text-xs mt-2 uppercase tracking-widest">This experience has ended</p>
                  </div>
                </div>
              ) : user ? (
                <SeatSelector
                  totalSeats={event.totalSeats}
                  availableSeats={event.availableSeats}
                  pricePerSeat={event.price}
                  onSelectionChange={setSelectedSeats}
                  category={event.category}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-black/40 rounded-[2rem] border border-dashed border-white/10 space-y-6">
                  <div className="h-16 w-16 rounded-full bg-violet-600/10 flex items-center justify-center border border-violet-500/20">
                    <Lock className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black italic uppercase">Restricted Access</h3>
                    <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">Sign in to unlock reservations</p>
                  </div>
                  <Button onClick={() => setShowSignIn(true)} className="rounded-full bg-white text-black hover:bg-violet-600 hover:text-white font-black px-10 h-12 transition-all">UNLOCK NOW</Button>
                </div>
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between text-left">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">The Arena</h2>
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mt-1">{event.venue}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="rounded-full border-white/10 bg-white/5 hover:bg-violet-600 transition-all gap-2 font-black text-[10px] tracking-widest" 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`, '_blank')}
                >
                  <NavIcon className="h-3.5 w-3.5" /> DIRECTIONS
                </Button>
              </div>
              <div className="h-[400px] w-full relative">
                <DynamicMap 
                  center={[event.coordinates.lat, event.coordinates.lng]} 
                  venue={event.venue} 
                  address={event.address} 
                />
              </div>
            </motion.section>
          </div>

          <aside className="w-full lg:w-[400px] order-1 lg:order-2 lg:sticky lg:top-32">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-2xl">
              <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-square">
                <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className={cn("h-full w-full object-cover transition-all duration-700", isPastEvent ? "grayscale brightness-50" : "grayscale-[0.3] hover:grayscale-0")} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                {isPastEvent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="border-2 border-white/20 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full font-black text-[10px] tracking-[0.3em] uppercase">Archive Entry</span>
                  </div>
                )}
              </div>
              <div className="p-8 space-y-6 text-left">
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: 'Date', icon: Calendar, value: event.date },
                    { label: 'Time', icon: Clock, value: event.time },
                    { label: 'Entry', icon: Ticket, value: `₹${event.price}` }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-colors",
                        isPastEvent ? "text-zinc-600" : "text-violet-400 group-hover:bg-violet-600 group-hover:text-white"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
                        <p className="text-sm font-bold tracking-tight text-zinc-300">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  {isPastEvent ? (
                    <Button disabled className="w-full h-14 bg-zinc-900 text-zinc-600 font-black rounded-2xl border border-white/5 cursor-not-allowed">EXPERIENCE CONCLUDED</Button>
                  ) : user ? (
                    <Link href={selectedSeats.length > 0 ? `/checkout?event=${id}&seats=${selectedSeats.join(",")}` : "#"}>
                      <Button disabled={selectedSeats.length === 0} className="w-full h-14 bg-white text-black hover:bg-violet-600 hover:text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl disabled:opacity-50">
                        {selectedSeats.length > 0 ? `BOOK ${selectedSeats.length} SEATS` : "SELECT SEATS"}
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={() => setShowSignIn(true)} className="w-full h-14 bg-violet-600 text-white font-black rounded-2xl transition-all">SIGN IN TO ACCESS</Button>
                  )}
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {selectedSeats.length > 0 && user && !isPastEvent && (
          <motion.div initial={{ y: 100, x: "-50%", opacity: 0 }} animate={{ y: 0, x: "-50%", opacity: 1 }} exit={{ y: 100, x: "-50%", opacity: 0 }} className="fixed bottom-10 left-1/2 z-50 w-[90%] max-w-[400px] lg:hidden">
            <Link href={`/checkout?event=${id}&seats=${selectedSeats.join(",")}`}>
              <div className="group relative overflow-hidden rounded-full bg-white p-1 shadow-2xl border border-white/20 active:scale-95 transition-transform">
                <div className="flex items-center justify-between pl-6 pr-2 py-2">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase text-zinc-500 leading-none mb-1">Subtotal</span>
                    <span className="text-xl font-black text-black leading-none">₹{totalPrice}</span>
                  </div>
                  <div className="bg-violet-600 text-white rounded-full px-6 py-3 font-black text-sm flex items-center gap-2 group-hover:bg-black transition-colors">
                    CONFIRM <Zap className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} onSuccess={() => setShowSignIn(false)} />
    </main>
  )
}
