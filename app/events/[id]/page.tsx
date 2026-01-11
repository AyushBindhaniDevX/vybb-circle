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

  const isPastEvent = event ? new Date(event.date).getTime() < new Date().setHours(0,0,0,0) : false;

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
        <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
      </div>
    )
  }

  const totalPrice = selectedSeats.length * (event.price || 0)

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      <Navbar />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-32 sm:px-6 lg:px-8">
        <Link href="/events" className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-violet-400">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Hub
        </Link>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-12">
            <section className="text-left">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <Badge className={cn(
                  "px-3 py-1 font-black uppercase tracking-widest text-[10px]",
                  isPastEvent ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-violet-600/20 text-violet-400 border-violet-500/30"
                )}>
                  {isPastEvent ? "CONCLUDED" : event.category}
                </Badge>
                {!isPastEvent && (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                     <Timer className="h-4 w-4 text-violet-500" />
                     <EventCounter targetDate={event.date} />
                  </div>
                )}
              </div>
              <h1 className={cn(
                "text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl bg-gradient-to-b bg-clip-text text-transparent italic uppercase leading-[0.9]",
                isPastEvent ? "from-zinc-500 to-zinc-800" : "from-white to-zinc-500"
              )}>
                {event.title}
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-zinc-400 max-w-2xl border-l-2 border-violet-500/50 pl-6 font-medium">
                {event.description}
              </p>
            </section>

            <section className={cn(
              "space-y-8 rounded-[2.5rem] border p-10 backdrop-blur-xl shadow-2xl",
              isPastEvent ? "border-white/5 bg-zinc-950/50 grayscale" : "border-white/5 bg-zinc-900/20"
            )}>
              <h2 className="text-2xl font-black italic flex items-center gap-3 uppercase">
                <Zap className={cn("h-6 w-6 fill-current", isPastEvent ? "text-zinc-700" : "text-violet-500")} /> 
                {isPastEvent ? "Archive Registry" : "Seating Map"}
              </h2>

              {isPastEvent ? (
                <div className="flex flex-col items-center py-20 space-y-6">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                    <Clock className="h-8 w-8 text-zinc-500" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-zinc-400 text-center">Experience Concluded</h3>
                  <Button disabled className="rounded-full bg-zinc-800 text-zinc-500 font-black px-10 h-12">LOCKED</Button>
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
                <Button onClick={() => setShowSignIn(true)} className="w-full h-20 rounded-[2rem] bg-violet-600 text-white font-black">SIGN IN TO BOOK</Button>
              )}
            </section>
          </div>

          <aside className="w-full lg:w-[400px] lg:sticky lg:top-32">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-2xl">
              <div className="relative aspect-square">
                <img src={event.imageUrl} alt={event.title} className={cn("h-full w-full object-cover transition-all duration-700", isPastEvent ? "grayscale brightness-50" : "grayscale-[0.3] hover:grayscale-0")} />
                {isPastEvent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="border-2 border-white/20 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full font-black text-[10px] tracking-[0.3em] uppercase">Loop Expired</span>
                  </div>
                )}
              </div>
              <div className="p-8 text-left space-y-6">
                {!isPastEvent && (
                  <Link href={selectedSeats.length > 0 ? `/checkout?event=${id}&seats=${selectedSeats.join(",")}` : "#"}>
                    <Button disabled={selectedSeats.length === 0} className="w-full h-14 bg-white text-black hover:bg-violet-600 hover:text-white font-black rounded-2xl shadow-xl transition-all">
                      {selectedSeats.length > 0 ? `BOOK ${selectedSeats.length} SLOTS` : "SELECT SLOTS"}
                    </Button>
                  </Link>
                )}
                {isPastEvent && <Button disabled className="w-full h-14 bg-zinc-800 text-zinc-500 font-black rounded-2xl uppercase text-[10px]">Registry Closed</Button>}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} onSuccess={() => setShowSignIn(false)} />
    </main>
  )
}
