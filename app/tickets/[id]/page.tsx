"use client"

import { use, useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { TicketView } from "@/components/ticket-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" 
import { 
  ArrowLeft, TicketIcon, CreditCard, CheckCircle, 
  Download, Share2, Sparkles, Zap, MapPin, Calendar 
} from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getEventById, type Booking } from "@/lib/db-utils"
import { toast } from "sonner"
import html2canvas from "html2canvas"

function TicketContent({ id }: { id: string }) {
  const { user } = useAuth()
  const [data, setData] = useState<{ booking: Booking; event: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true)
        const bookingDoc = await getDoc(doc(db, "bookings", id))
        if (!bookingDoc.exists()) {
          setError("Ticket not found")
          return
        }
        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as Booking
        if (bookingData.userId !== user?.uid) {
          setError("Unauthorized access")
          return
        }
        const eventData = await getEventById(bookingData.eventId)
        if (!eventData) {
          setError("Event not found")
          return
        }
        setData({ booking: bookingData, event: eventData })
      } catch (error) {
        setError("Failed to load ticket")
      } finally {
        setLoading(false)
      }
    }
    if (user && id) fetchBooking()
  }, [id, user])

  const downloadImage = async () => {
    if (!ticketRef.current) return
    try {
      setIsDownloading(true)
      const loadingToast = toast.loading("Generating high-res ticket...")
      
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // High resolution for clear QR scanning
        useCORS: true,
        backgroundColor: "#000000",
        logging: false,
      })
      
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `Vybb-Ticket-${data?.event?.title.replace(/\s+/g, '-')}.png`
      link.click()
      
      toast.dismiss(loadingToast)
      toast.success("Saved to gallery!")
    } catch (err) {
      toast.error("Export failed. Please take a screenshot.")
    } finally {
      setIsDownloading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
      })
    } catch { return dateString }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      {/* Aurora - Using standard Hex codes for color compatibility */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c026d3]/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          {/* Success Ring - Standard RGBA Green */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent uppercase">
            Confirmed
          </h1>
        </motion.div>

        {/* Ticket Export Target */}
        <div ref={ticketRef} className="mb-12 bg-black rounded-[2rem] overflow-hidden">
          <TicketView booking={data!.booking} event={data!.event} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Button 
            onClick={downloadImage} 
            disabled={isDownloading}
            className="rounded-full h-14 px-10 bg-white text-black hover:bg-violet-600 hover:text-white font-black transition-all gap-2 shadow-xl active:scale-95"
          >
            <Download className="h-5 w-5" /> 
            {isDownloading ? "SAVING..." : "SAVE AS IMAGE"}
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full h-14 px-10 border-white/10 bg-white/5 font-black hover:bg-white/10"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied!");
            }}
          >
            <Share2 className="h-5 w-5" /> SHARE
          </Button>
        </div>

        {/* Bento Grid: Payment & Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border border-white/10 bg-zinc-950 p-8 shadow-2xl relative overflow-hidden text-left"
          >
            <h2 className="text-xl font-bold italic mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet-500" /> PAYMENT
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Status</span>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-black">SUCCESS</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Amount</span>
                <span className="text-xl font-black italic">₹{data!.booking.amount}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border border-white/10 bg-zinc-950 p-8 shadow-2xl relative overflow-hidden text-left"
          >
             <h2 className="text-xl font-bold italic mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-500" /> EVENT INFO
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold leading-tight">{data!.event.venue}</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-wider">{data!.event.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-violet-400" />
                <p className="text-sm font-bold uppercase tracking-tighter">{formatDate(data!.event.date)} @ {data!.event.time}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
           <Link href="/profile" className="flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
              <TicketIcon className="h-4 w-4" /> View History
           </Link>
           <Link href="/">
              <Button variant="ghost" className="text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
              </Button>
           </Link>
        </div>
      </div>
    </main>
  )
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <ProtectedRoute>
      <TicketContent id={id} />
    </ProtectedRoute>
  )
}