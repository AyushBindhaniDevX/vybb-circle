"use client"

import { useState, useEffect, Suspense, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { getEventById, createBooking } from "@/lib/db-utils"
import { openRazorpayCheckout, closeRazorpayModal } from "@/lib/razorpay"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/razorpay"
import { 
  User, Mail, ShieldCheck, Ticket, CreditCard, 
  Calendar, MapPin, Phone, ArrowLeft, 
  Sparkles, Zap, Lock, Info
} from "lucide-react"
import type { Event } from "@/lib/db-utils"
import Link from "next/link"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const eventId = searchParams.get("event")
  const seatsStr = searchParams.get("seats")
  const selectedSeats = seatsStr ? seatsStr.split(",").filter(s => s.trim() !== "") : []

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentInProgress, setPaymentInProgress] = useState(false)

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })
  const [formErrors, setFormErrors] = useState({ name: "", email: "", phone: "" })

  const paymentDataRef = useRef<{
    event: Event | null
    user: any
    formData: any
    selectedSeats: string[]
    eventId: string | null
  }>({ event: null, user: null, formData: null, selectedSeats: [], eventId: null })

  useEffect(() => {
    paymentDataRef.current = { event, user, formData, selectedSeats, eventId }
  }, [event, user, formData, selectedSeats, eventId])

  const fetchEvent = useCallback(async () => {
    if (!eventId || !seatsStr || selectedSeats.length === 0) {
      toast.error("Invalid booking parameters")
      router.push("/events")
      return null
    }
    setLoading(true)
    try {
      const eventData = await getEventById(eventId)
      if (!eventData) {
        toast.error("Event not found")
        router.push("/events")
        return null
      }
      return eventData
    } catch (error) {
      toast.error("Failed to load event details")
      return null
    } finally {
      setLoading(false)
    }
  }, [eventId, seatsStr, selectedSeats, router])

  useEffect(() => {
    if (eventId && seatsStr && selectedSeats.length > 0 && !event) {
      fetchEvent().then((eventData) => {
        if (eventData) {
          setEvent(eventData)
          if (user) {
            setFormData({ name: user.displayName || "", email: user.email || "", phone: "" })
          }
        }
      })
    }
  }, [eventId, seatsStr, selectedSeats, user, event, fetchEvent])

  const validateForm = () => {
    const errors = { name: "", email: "", phone: "" }
    let isValid = true
    if (!formData.name.trim()) { errors.name = "Name is required"; isValid = false }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Valid email is required"; isValid = false
    }
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length !== 10) { errors.phone = "10-digit number required"; isValid = false }
    setFormErrors(errors)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value
    if (name === "phone") {
      const digits = value.replace(/\D/g, '').slice(0, 10)
      formattedValue = digits.length > 6 ? `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}` :
                       digits.length > 3 ? `${digits.slice(0,3)}-${digits.slice(3)}` : digits
    }
    setFormData(prev => ({ ...prev, [name]: formattedValue }))
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
      })
    } catch { return dateString }
  }

  const processSuccessfulPayment = async (paymentResponse: any) => {
    try {
      const currentData = paymentDataRef.current
      if (!currentData.event || !currentData.user) throw new Error('Session expired')

      toast.loading("Verifying security protocols...", { id: "p-verify" })
      const verificationResult = await verifyRazorpayPayment(
        paymentResponse.razorpay_order_id, paymentResponse.razorpay_payment_id, paymentResponse.razorpay_signature
      )

      if (!verificationResult.verified) {
        toast.error("Security verification failed", { id: "p-verify" })
        setProcessing(false); setPaymentInProgress(false); return
      }

      toast.loading("Finalizing your tickets...", { id: "p-verify" })
      const bookingId = await createBooking({
        userId: currentData.user.uid,
        eventId: currentData.event.id,
        attendeeDetails: { name: currentData.formData.name, email: currentData.formData.email, phone: currentData.formData.phone.replace(/\D/g, '') },
        seatNumbers: currentData.selectedSeats,
        paymentId: paymentResponse.razorpay_payment_id,
        paymentStatus: "completed",
        amount: currentData.selectedSeats.length * currentData.event.price,
        eventTitle: currentData.event.title,
        eventDate: currentData.event.date,
        eventVenue: currentData.event.venue,
        ticketCount: currentData.selectedSeats.length,
        ticketPrice: currentData.event.price,
      })
      
      toast.success("Experience Confirmed!", { id: "p-verify" })
      setTimeout(() => router.push(`/tickets/${bookingId}`), 1000)
    } catch (error: any) {
      toast.error("Processing error. Please contact support.", { id: "p-verify" })
      setProcessing(false); setPaymentInProgress(false)
    }
  }

  useEffect(() => {
    const onSuccess = (e: any) => processSuccessfulPayment(e.detail)
    window.addEventListener('razorpay-payment-success', onSuccess)
    window.addEventListener('razorpay-payment-cancel', () => { setProcessing(false); setPaymentInProgress(false); toast.info("Payment Stopped") })
    return () => window.removeEventListener('razorpay-payment-success', onSuccess)
  }, [])

  const handlePayment = async () => {
    if (!validateForm()) return toast.error("Check form details")
    setProcessing(true); setPaymentInProgress(true)
    
    try {
      const orderResult = await createRazorpayOrder(selectedSeats.length * event!.price, event!.title, user!.uid)
      if (!orderResult.success) throw new Error(orderResult.error)

      await openRazorpayCheckout({
        key: orderResult.keyId!,
        amount: orderResult.amount!,
        currency: orderResult.currency!,
        name: "Vybb Live",
        order_id: orderResult.orderId!,
        prefill: { name: formData.name, email: formData.email, contact: formData.phone.replace(/\D/g, '') },
        theme: { color: "#7c3aed" }
      })
    } catch (e: any) {
      toast.error(e.message || "Gateway error")
      setProcessing(false); setPaymentInProgress(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
    </div>
  )

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[25%] -right-[10%] w-[70%] h-[70%] bg-violet-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[0%] -left-[10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[120px] rounded-full animate-pulse" />
        </div>

        <Navbar />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 lg:px-8">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <Link href={`/events/${eventId}`} className="group inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-violet-400 mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to Layout
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-8">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-2 text-left">
                <h1 className="text-4xl font-black italic tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Secure Checkout</h1>
                <p className="text-zinc-500 font-medium">Complete your reservation for <span className="text-violet-400">{event?.title}</span></p>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-[2.5rem] border border-white/5 bg-zinc-900/20 p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-violet-600/20 rounded-xl border border-violet-500/30">
                    <User className="h-5 w-5 text-violet-400" />
                  </div>
                  <h2 className="text-xl font-bold italic">Guest Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Name</Label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-violet-500 text-lg transition-all" />
                      {formErrors.name && <p className="text-xs text-red-400 font-medium ml-1">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Mobile Contact</Label>
                      <Input name="phone" placeholder="000-000-0000" value={formData.phone} onChange={handleInputChange} className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-violet-500 text-lg transition-all" />
                      {formErrors.phone && <p className="text-xs text-red-400 font-medium ml-1">{formErrors.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Email for E-Tickets</Label>
                    <Input name="email" type="email" value={formData.email} onChange={handleInputChange} className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-violet-500 text-lg transition-all" />
                    {formErrors.email && <p className="text-xs text-red-400 font-medium ml-1">{formErrors.email}</p>}
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-zinc-400 text-left leading-relaxed uppercase tracking-widest">SSL Encrypted Gateway <br/><span className="text-zinc-600">Secure Razorpay Integration</span></p>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-zinc-400 text-left leading-relaxed uppercase tracking-widest">No Hidden Fees <br/><span className="text-zinc-600">Transparent Pricing Policy</span></p>
                  </div>
                </div>
              </motion.div>
            </div>

            <aside className="w-full lg:w-[420px]">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="sticky top-28 space-y-6">
                <div className="rounded-[2.5rem] border border-white/10 bg-zinc-950 p-8 shadow-2xl overflow-hidden relative text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-3xl -mr-10 -mt-10" />
                  
                  <h3 className="text-xl font-bold italic mb-8 flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-violet-500" />
                    Your Reservation
                  </h3>

                  <div className="flex gap-5 mb-8">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                      <img src={event?.imageUrl || "/placeholder.svg"} className="h-full w-full object-cover" alt="event" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white line-clamp-1">{event?.title}</h4>
                      <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 uppercase tracking-tighter">
                        <Calendar className="h-3 w-3" /> {formatDate(event?.date || "")}
                      </p>
                      <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 uppercase tracking-tighter">
                        <MapPin className="h-3 w-3" /> {event?.venue}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">Selected Seats ({selectedSeats.length})</span>
                      <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                        {selectedSeats.map(s => <span key={s} className="px-2 py-0.5 rounded-md bg-violet-600/10 border border-violet-500/20 text-[10px] font-bold text-violet-400">{s}</span>)}
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-zinc-500 uppercase tracking-tighter">Seat Total</span>
                      <span>₹{selectedSeats.length * (event?.price || 0)}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] block">Total Payable</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black italic">₹{selectedSeats.length * (event?.price || 0)}</span>
                      <span className="text-xs text-zinc-500 font-bold uppercase">Incl. Taxes</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    disabled={processing || paymentInProgress} 
                    className="w-full h-16 mt-8 rounded-[1.5rem] bg-white text-black hover:bg-violet-600 hover:text-white font-black text-lg shadow-xl shadow-violet-500/10 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {processing ? "SECURING..." : <div className="flex items-center gap-2 italic">AUTHORIZE PAYMENT <Zap className="h-5 w-5 fill-current" /></div>}
                  </Button>
                </div>

                <div className="rounded-[1.5rem] bg-yellow-500/5 border border-yellow-500/20 p-5 flex gap-4 text-left">
                  <Info className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-yellow-500/70 leading-relaxed uppercase tracking-widest">
                    Popup window will open for payment. Please disable any ad-blockers to prevent interruptions.
                  </p>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Sparkles className="h-8 w-8 text-violet-500 animate-pulse" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}