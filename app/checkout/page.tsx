// app/checkout/page.tsx
"use client"

import { useState, useEffect, Suspense, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { getEventById, createBooking } from "@/lib/db-utils"
import { openRazorpayCheckout, checkPaymentStatus, closeRazorpayModal } from "@/lib/razorpay"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/razorpay"
import { User, Mail, ShieldCheck, Ticket, CreditCard, Calendar, MapPin, Phone, ArrowLeft, AlertCircle } from "lucide-react"
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: ""
  })

  // Refs to store payment data that won't change with closures
  const paymentDataRef = useRef<{
    event: Event | null
    user: any
    formData: any
    selectedSeats: string[]
    eventId: string | null
  }>({
    event: null,
    user: null,
    formData: null,
    selectedSeats: [],
    eventId: null
  })

  // Update ref when data changes
  useEffect(() => {
    paymentDataRef.current = {
      event,
      user,
      formData,
      selectedSeats,
      eventId
    }
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
      console.error("Error fetching event:", error)
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
            setFormData({
              name: user.displayName || "",
              email: user.email || "",
              phone: ""
            })
          }
        }
      })
    }
  }, [eventId, seatsStr, selectedSeats, user, event, fetchEvent])

  useEffect(() => {
    if (!eventId || !seatsStr || selectedSeats.length === 0) {
      toast.error("Invalid booking parameters")
      router.push("/events")
    }
  }, [eventId, seatsStr, selectedSeats.length, router])

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      phone: ""
    }
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = "Name is required"
      isValid = false
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address"
      isValid = false
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
      isValid = false
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        errors.phone = "Enter a valid 10-digit phone number"
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    let formattedValue = value
    if (name === "phone") {
      const digits = value.replace(/\D/g, '')
      const limitedDigits = digits.slice(0, 10)
      
      if (limitedDigits.length > 3 && limitedDigits.length <= 6) {
        formattedValue = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
      } else if (limitedDigits.length > 6) {
        formattedValue = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`
      } else {
        formattedValue = limitedDigits
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }))
    
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  // Payment processing function - doesn't rely on React state
  const processSuccessfulPayment = async (paymentResponse: any) => {
    try {
      console.log('🔄 Processing successful payment:', paymentResponse)
      
      // Get current data from refs (not from React state due to closure)
      const currentData = paymentDataRef.current
      
      if (!currentData.event || !currentData.user) {
        console.error('❌ Missing data in payment processing:', {
          hasEvent: !!currentData.event,
          hasUser: !!currentData.user
        })
        throw new Error('Unable to process payment - session expired. Please try again.')
      }

      const event = currentData.event
      const user = currentData.user
      const formData = currentData.formData
      const selectedSeats = currentData.selectedSeats
      const eventId = currentData.eventId

      toast.dismiss()
      toast.loading("Verifying payment...", { id: "payment-verification" })

      const phoneDigits = formData.phone.replace(/\D/g, '')
      const amount = selectedSeats.length * event.price

      // Verify payment with server
      const verificationResult = await verifyRazorpayPayment(
        paymentResponse.razorpay_order_id,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_signature
      )

      if (!verificationResult.verified) {
        toast.dismiss("payment-verification")
        toast.error(verificationResult.error || "Payment verification failed")
        setProcessing(false)
        setPaymentInProgress(false)
        return
      }

      toast.dismiss("payment-verification")
      toast.loading("Creating your booking...", { id: "booking-creation" })

      // Create booking in Firestore
      const bookingData = {
        userId: user.uid,
        eventId: event.id,
        attendeeDetails: {
          name: formData.name,
          email: formData.email,
          phone: phoneDigits,
        },
        seatNumbers: selectedSeats,
        paymentId: paymentResponse.razorpay_payment_id,
        paymentStatus: "completed" as const,
        amount: amount,
        bookingDate: new Date().toISOString(),
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        ticketCount: selectedSeats.length,
        ticketPrice: event.price,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpaySignature: paymentResponse.razorpay_signature,
        paymentMethod: verificationResult.paymentDetails?.method,
        paymentDetails: verificationResult.paymentDetails,
      }

      const bookingId = await createBooking(bookingData)
      
      toast.dismiss("booking-creation")
      toast.success("🎉 Payment Successful! Redirecting to your ticket...")
      
      // Redirect to ticket page after a short delay
      setTimeout(() => {
        router.push(`/tickets/${bookingId}`)
      }, 1500)
      
    } catch (error: any) {
      console.error('❌ Error processing payment:', error)
      toast.dismiss()
      toast.error(error.message || "Failed to process payment")
      setProcessing(false)
      setPaymentInProgress(false)
    }
  }

  // Payment event listeners - use a stable reference
  useEffect(() => {
    const handlePaymentSuccess = async (event: CustomEvent) => {
      console.log('🎯 Payment success event received:', event.detail)
      
      try {
        await processSuccessfulPayment(event.detail)
      } catch (error) {
        console.error('Error in payment success handler:', error)
        toast.error('Failed to process payment')
        setProcessing(false)
        setPaymentInProgress(false)
      }
    }

    const handlePaymentFailed = (event: CustomEvent) => {
      console.error('❌ Payment failed event:', event.detail)
      toast.dismiss()
      toast.error('Payment failed. Please try again.')
      setProcessing(false)
      setPaymentInProgress(false)
    }

    const handlePaymentCancel = () => {
      console.log('⚠️ Payment cancelled event')
      toast.dismiss()
      toast.info('Payment cancelled')
      setProcessing(false)
      setPaymentInProgress(false)
    }

    // Add event listeners
    window.addEventListener('razorpay-payment-success', handlePaymentSuccess as EventListener)
    window.addEventListener('razorpay-payment-failed', handlePaymentFailed as EventListener)
    window.addEventListener('razorpay-payment-cancel', handlePaymentCancel)

    // Cleanup
    return () => {
      window.removeEventListener('razorpay-payment-success', handlePaymentSuccess as EventListener)
      window.removeEventListener('razorpay-payment-failed', handlePaymentFailed as EventListener)
      window.removeEventListener('razorpay-payment-cancel', handlePaymentCancel)
    }
  }, []) // Empty dependency array - handlers use refs, not state

  const handlePayment = async () => {
    if (!event || !user) {
      toast.error("Please sign in to continue")
      return
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    if (selectedSeats.length === 0) {
      toast.error("Please select seats first")
      router.push(`/events/${eventId}`)
      return
    }

    setProcessing(true)
    setPaymentInProgress(true)

    toast.loading("Creating payment order...", { id: "order-creation" })

    try {
      const amount = selectedSeats.length * event.price
      const phoneDigits = formData.phone.replace(/\D/g, '')
      
      // Create Razorpay order
      const orderResult = await createRazorpayOrder(amount, event.title, user.uid)

      if (!orderResult.success) {
        toast.dismiss("order-creation")
        toast.error(orderResult.error || "Failed to create payment order")
        setProcessing(false)
        setPaymentInProgress(false)
        return
      }

      toast.dismiss("order-creation")
      toast.loading("Opening payment gateway...", { id: "gateway-opening" })

      const options = {
        key: orderResult.keyId!,
        amount: orderResult.amount!,
        currency: orderResult.currency!,
        name: "Vybb Live",
        description: `Booking for ${event.title} - ${selectedSeats.length} seat(s)`,
        order_id: orderResult.orderId!,
        handler: (response: any) => {
          console.log('🎯 Razorpay handler called directly', response)
          // This will be handled by the event listener
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: phoneDigits,
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: () => {
            console.log('Modal dismissed callback')
            // This will be handled by the event listener
          },
        },
        notes: {
          event: event.title,
          seats: selectedSeats.join(", "),
          userId: user.uid,
          venue: event.venue,
          date: event.date,
          time: event.time,
        },
      }

      // Small delay to ensure loading toast is seen
      setTimeout(() => {
        toast.dismiss("gateway-opening")
      }, 500)

      // Open Razorpay checkout - this will trigger the modal
      await openRazorpayCheckout(options)
      
    } catch (error: any) {
      console.error('❌ Payment initialization error:', error)
      toast.dismiss()
      
      if (error.message?.includes("Payment cancelled")) {
        toast.info("Payment cancelled")
      } else if (error.message?.includes("Failed to load")) {
        toast.error("Payment gateway not available")
      } else {
        toast.error(error.message || "Payment failed to initialize")
      }
      
      setProcessing(false)
      setPaymentInProgress(false)
    }
  }

  // Handle browser back button
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (paymentInProgress) {
        const message = "Payment is in progress. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up any open Razorpay modal
      closeRazorpayModal();
    };
  }, [paymentInProgress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!event || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-4">
          <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-zinc-950 text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Booking Session</h2>
            <p className="text-zinc-400 mb-6">
              Your booking session has expired or is invalid.
            </p>
            <Button 
              onClick={() => router.push(`/events/${eventId || ""}`)}
              className="bg-violet-600 hover:bg-violet-700 w-full"
            >
              Select Seats Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href={`/events/${eventId}`}
              className="group inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-400 mb-6"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1" />
              Back to Event
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Complete Your Booking</h1>
                <p className="text-zinc-400 mt-2">Secure your spot with payment</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-violet-400" />
                </div>
                <span className="text-zinc-300">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Indicator */}
          {paymentInProgress && (
            <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                <div>
                  <p className="font-medium text-yellow-300">Payment in progress...</p>
                  <p className="text-sm text-yellow-400/70">Please complete the payment in the popup window</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Column: Form */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <h2 className="text-xl font-bold mb-6">Attendee Details</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 bg-white/5 border-white/10 focus:border-violet-500"
                        disabled={paymentInProgress}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-sm text-red-400">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-white/5 border-white/10 focus:border-violet-500"
                        disabled={paymentInProgress}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-sm text-red-400">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="123-456-7890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={12}
                        className="pl-10 bg-white/5 border-white/10 focus:border-violet-500"
                        disabled={paymentInProgress}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-sm text-red-400">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <div className="flex gap-3">
                    <ShieldCheck className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-violet-300">Secure Payment</p>
                      <p className="text-xs text-violet-200/70 mt-1">
                        Powered by Razorpay • 256-bit SSL encryption • PCI DSS compliant
                      </p>
                    </div>
                  </div>
                </div>

                {/* Popup Blocker Warning */}
                <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-300">Enable Popups</p>
                      <p className="text-xs text-yellow-400/70 mt-1">
                        Please allow popups for this site. The payment window will open in a popup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sticky top-32">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="flex gap-4 mb-6">
                  <img
                    src={event.imageUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="h-24 w-24 rounded-xl object-cover border border-white/5"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.date)} • {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Ticket className="h-4 w-4" />
                      {selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''}
                    </span>
                    <span>₹{selectedSeats.length * event.price}</span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-zinc-400 mb-1">Selected Seats:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span 
                          key={seat} 
                          className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded text-xs font-medium border border-violet-500/20"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Service Fee</span>
                    <span className="text-violet-400">FREE</span>
                  </div>

                  <div className="h-px bg-white/10 my-4" />

                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-violet-500">₹{selectedSeats.length * event.price}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="mt-8 w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePayment}
                  disabled={processing || paymentInProgress}
                >
                  {processing || paymentInProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {paymentInProgress ? "Processing Payment..." : "Preparing Payment..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay Now
                    </>
                  )}
                </Button>

                <p className="mt-4 text-center text-xs text-zinc-600 uppercase tracking-widest font-medium">
                  Secure Checkout • Instant Confirmation
                </p>

                <div className="mt-6 space-y-3 text-xs text-zinc-500">
                  <p>✓ 256-bit SSL Encryption</p>
                  <p>✓ Instant E-Ticket Delivery</p>
                  <p>✓ Easy Refund Policy</p>
                </div>


                {/* Live Payment Notice */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs text-center text-green-400">
                    🔒 Live Payment Gateway • Powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              Payment Not Working?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-300">Enable Popups</p>
                <p className="text-xs text-zinc-400">Allow popups for this site in your browser settings</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-300">Disable Ad Blockers</p>
                <p className="text-xs text-zinc-400">Some ad blockers prevent payment windows from opening</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-300">Check Network</p>
                <p className="text-xs text-zinc-400">Ensure you have a stable internet connection</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}