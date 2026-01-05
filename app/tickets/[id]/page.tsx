// app/tickets/[id]/page.tsx
"use client"

import { use, useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { TicketView } from "@/components/ticket-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, TicketIcon, CreditCard, CheckCircle, Download, Share2 } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getEventById, type Booking } from "@/lib/db-utils"
import { toast } from "sonner"

function TicketContent({ id }: { id: string }) {
  const { user } = useAuth()
  const [data, setData] = useState<{ booking: Booking; event: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`🔄 Fetching ticket: ${id}`)
        
        // Fetch booking from Firestore
        const bookingDoc = await getDoc(doc(db, "bookings", id))
        
        if (!bookingDoc.exists()) {
          setError("Ticket not found")
          toast.error("Ticket not found")
          return
        }

        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as Booking
        
        // Check if this booking belongs to the current user
        if (bookingData.userId !== user?.uid) {
          setError("Unauthorized access")
          toast.error("You don't have permission to view this ticket")
          return
        }
        
        // Fetch event details
        const eventData = await getEventById(bookingData.eventId)
        
        if (!eventData) {
          setError("Event not found")
          toast.error("Event details not available")
          return
        }

        setData({ booking: bookingData, event: eventData })
        console.log(`✅ Ticket loaded: ${bookingData.paymentId}`)
        
      } catch (error) {
        console.error("❌ Error fetching ticket:", error)
        setError("Failed to load ticket")
        toast.error("Failed to load ticket details")
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      fetchBooking()
    }
  }, [id, user])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  const handleDownloadTicket = () => {
    toast.success("Ticket download started")
    // Implement PDF generation/download here
  }

  const handleShareTicket = () => {
    if (navigator.share && data) {
      navigator.share({
        title: `My Ticket for ${data.event.title}`,
        text: `I'm attending ${data.event.title} on ${formatDate(data.event.date)}!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Ticket link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <Skeleton className="h-[500px] w-full max-w-md rounded-3xl bg-zinc-900" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 pt-32">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">
              {error || "Ticket Not Found"}
            </h1>
            <p className="text-zinc-400 mb-8">
              {error ? error : "The ticket you're looking for doesn't exist."}
            </p>
            <Link href="/profile">
              <Button variant="outline" className="border-white/10 text-white bg-transparent">
                View My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Booking Confirmed!</h1>
          <p className="mt-2 text-zinc-400">Your ticket is ready. See you at the vybb circle.</p>
          
          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:border-violet-500/50 gap-2"
              onClick={handleDownloadTicket}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:border-violet-500/50 gap-2"
              onClick={handleShareTicket}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Ticket Display */}
        <div className="mb-12">
          <TicketView booking={data.booking} event={data.event} />
        </div>

        {/* Payment Details */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-violet-400" />
            Payment Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Payment ID</p>
                <p className="font-mono text-sm bg-zinc-900/50 px-3 py-2 rounded-lg border border-white/5">
                  {data.booking.paymentId}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-500 mb-1">Razorpay Order ID</p>
                <p className="font-mono text-sm bg-zinc-900/50 px-3 py-2 rounded-lg border border-white/5">
                  {data.booking.razorpayOrderId}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-500 mb-1">Payment Status</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">COMPLETED</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-green-400">₹{data.booking.amount}</p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-500 mb-1">Payment Date</p>
                <p className="text-sm font-medium">{formatDate(data.booking.bookingDate)}</p>
              </div>
              
              {data.booking.paymentMethod && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Payment Method</p>
                  <p className="text-sm font-medium capitalize">{data.booking.paymentMethod.replace('_', ' ')}</p>
                </div>
              )}
              
              {data.booking.paymentDetails && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Transaction Details</p>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {data.booking.paymentDetails.bank && (
                      <p>Bank: {data.booking.paymentDetails.bank}</p>
                    )}
                    {data.booking.paymentDetails.card_id && (
                      <p>Card: •••• {data.booking.paymentDetails.card_id.slice(-4)}</p>
                    )}
                    {data.booking.paymentDetails.wallet && (
                      <p>Wallet: {data.booking.paymentDetails.wallet}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-zinc-500">
              🔒 Your payment was securely processed by Razorpay. All transactions are encrypted and PCI DSS compliant.
              For any payment-related queries, contact support@vybblive.com
            </p>
          </div>
        </div>

        {/* Event Details Recap */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold mb-6">Event Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Event</p>
                <p className="text-lg font-bold">{data.event.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-500 mb-1">Date & Time</p>
                <p className="text-sm font-medium">
                  {formatDate(data.event.date)} • {data.event.time}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Venue</p>
                <p className="text-sm font-medium">{data.event.venue}</p>
                <p className="text-xs text-zinc-500 mt-1">{data.event.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-zinc-500 mb-1">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {data.booking.seatNumbers.map((seat) => (
                    <span 
                      key={seat} 
                      className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded text-xs font-medium border border-violet-500/20"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile">
            <Button variant="outline" className="border-white/10 text-white bg-transparent gap-2">
              <TicketIcon className="h-4 w-4" />
              View All Bookings
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <Link href={`/events/${data.event.id}`}>
            <Button className="bg-violet-600 hover:bg-violet-700 gap-2">
              View Event Details
            </Button>
          </Link>
        </div>

        {/* Support Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-500">
            Need help? Contact us at{" "}
            <a href="mailto:support@vybblive.com" className="text-violet-400 hover:underline">
              support@vybblive.com
            </a>
          </p>
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