// app/events/[id]/page.tsx
"use client"

import { use, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { SeatSelector } from "@/components/seat-selector"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Info, Navigation } from "lucide-react"
import Link from "next/link"
import { getEventById, type Event } from "@/lib/db-utils"
import { toast } from "sonner"

// Dynamic import for Map to avoid SSR issues with Leaflet
const DynamicMap = dynamic(() => import("@/components/event-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl bg-zinc-900" />,
})

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`🔄 Fetching event with ID: ${id}`)
        const data = await getEventById(id)
        
        if (data) {
          setEvent(data)
          console.log(`✅ Event loaded: ${data.title}`)
        } else {
          setError("Event not found")
          toast.error("Event not found or has been removed")
        }
      } catch (error) {
        console.error("❌ Error fetching event:", error)
        setError("Failed to load event details")
        toast.error("Failed to load event details")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-6 w-48 bg-zinc-900" />
            <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="aspect-video w-full rounded-2xl bg-zinc-900" />
                <Skeleton className="h-64 w-full rounded-2xl bg-zinc-900" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-2xl bg-zinc-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">
              {error || "Event Not Found"}
            </h1>
            <p className="text-zinc-400 mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/events">
              <Button variant="outline" className="border-white/10 hover:border-violet-500">
                Browse All Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <Link
          href="/events"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-violet-400"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Experiences
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left Column: Details & Selection */}
          <div className="space-y-12 lg:col-span-2">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge className="bg-violet-600 font-medium">{event.category}</Badge>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Users className="h-4 w-4" />
                  {event.availableSeats} of {event.totalSeats} seats available
                </div>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{event.title}</h1>
              <p className="mt-6 text-lg leading-relaxed text-zinc-400">{event.description}</p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Select Your Spot</h2>
              <SeatSelector
                totalSeats={event.totalSeats}
                availableSeats={event.availableSeats}
                pricePerSeat={event.price}
                onSelectionChange={setSelectedSeats}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Find the Venue</h2>
                <Badge variant="outline" className="border-white/10 text-zinc-400">
                  {event.venue}
                </Badge>
              </div>
              
              {/* Address Card */}
              <div className="rounded-xl border border-white/10 bg-zinc-950 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{event.venue}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {event.address}
                    </p>
                  </div>
                </div>
                
                {/* Map Container */}
                <div className="h-[300px] w-full rounded-lg overflow-hidden border border-white/5">
                  <DynamicMap
                    center={[event.coordinates.lat, event.coordinates.lng]}
                    venue={event.venue}
                    address={event.address}
                  />
                </div>
                
                {/* Directions Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:border-violet-500/50 hover:bg-violet-500/10 gap-2"
                    onClick={() => {
                      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}&destination_place_id=${encodeURIComponent(event.address)}`
                      window.open(mapsUrl, '_blank')
                    }}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Get Directions
                  </Button>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-violet-900/10 to-violet-800/5 p-4 border border-violet-500/20">
                <Info className="mt-0.5 h-5 w-5 text-violet-400 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-white mb-2">Entry Instructions</p>
                  <ul className="space-y-1 text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span>Please arrive 15 minutes before the start time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span>Bring your digital ticket for scanning at entrance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span>Valid government ID proof required for entry</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span>No outside food or drinks allowed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.title}
                className="mb-6 aspect-video w-full rounded-xl object-cover border border-white/5"
              />

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shrink-0">
                    <Calendar className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Date & Time</p>
                    <p className="text-sm font-medium">
                      {formatDate(event.date)} • {event.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shrink-0">
                    <MapPin className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Venue</p>
                    <p className="text-sm font-medium line-clamp-1">{event.venue}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{event.address.split(',')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shrink-0">
                    <Clock className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Duration</p>
                    <p className="text-sm font-medium">3 hours</p>
                  </div>
                </div>
              </div>

              <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Price Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Base Price</span>
                  <span>₹{event.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Platform Fee</span>
                  <span className="text-green-400">FREE</span>
                </div>
                
                {selectedSeats.length > 0 && (
                  <>
                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Selected Seats</span>
                        <span className="text-sm font-medium">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
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
                    <div className="flex items-center justify-between text-lg font-bold pt-2">
                      <span>Total Amount</span>
                      <span className="text-violet-500">₹{selectedSeats.length * event.price}</span>
                    </div>
                  </>
                )}
              </div>

              {/* CTA Button */}
              <Link 
                href={selectedSeats.length > 0 ? `/checkout?event=${id}&seats=${selectedSeats.join(",")}` : "#"}
                className="block"
              >
                <Button
                  size="lg"
                  className={`mt-6 w-full h-12 font-bold transition-all ${
                    selectedSeats.length > 0
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                  disabled={selectedSeats.length === 0 || event.availableSeats === 0}
                >
                  {event.availableSeats === 0 ? (
                    <span className="flex items-center gap-2">
                      <span>Sold Out</span>
                    </span>
                  ) : selectedSeats.length > 0 ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>Continue to Booking</span>
                      <span className="text-sm opacity-90">(₹{selectedSeats.length * event.price})</span>
                    </span>
                  ) : (
                    "Select a Spot"
                  )}
                </Button>
              </Link>

              {/* Share Button */}
              <Button 
                variant="ghost" 
                className="mt-4 w-full text-zinc-500 hover:text-white hover:bg-white/5 gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: event.title,
                      text: `Join me at ${event.title} on ${formatDate(event.date)} at ${event.venue}!`,
                      url: window.location.href,
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success("Link copied to clipboard!")
                  }
                }}
              >
                <Share2 className="h-4 w-4" /> Share with Friends
              </Button>

              {/* Additional Info */}
              <div className="mt-6 space-y-3 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span>Instant e-ticket delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span>Easy refund within 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span>Secure payment with Razorpay</span>
                </div>
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
      </div>
    </main>
  )
}