// app/profile/page.tsx (Updated)
"use client"

import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { getBookingsByUserId, getEventById } from "@/lib/db-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, MapPin, ExternalLink, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"

function ProfileContent() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchHistory = async () => {
      try {
        const userBookings = await getBookingsByUserId(user.uid)
        const enrichedBookings = await Promise.all(
          userBookings.map(async (b) => {
            const event = await getEventById(b.eventId)
            return { ...b, event }
          }),
        )
        setBookings(enrichedBookings)
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-white/10 bg-zinc-950">
              <div className="h-24 w-24 rounded-full bg-violet-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                {user?.displayName?.[0] || user?.email?.[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold">{user?.displayName || "Vybb Member"}</h2>
              <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>

              <Button
                variant="outline"
                className="mt-8 w-full border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                onClick={() => auth.signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content: Booking History */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-extrabold tracking-tight mb-8">Experience History</h1>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10 bg-zinc-950/50">
                <Calendar className="h-12 w-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500">No experiences booked yet.</p>
                <Link href="/events" className="mt-4 text-violet-400 hover:underline">
                  Discover Events
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-white/10 bg-zinc-950 hover:border-violet-500/30 transition-all"
                  >
                    <div className="h-32 w-full md:w-32 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                      {booking.event?.imageUrl && (
                        <img
                          src={booking.event.imageUrl || "/placeholder.svg"}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-violet-600/10 text-violet-400 border border-violet-500/20">
                            {booking.event?.category || "Event"}
                          </Badge>
                          <span className="text-xs text-zinc-500">#{booking.id?.substring(0, 8)}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-violet-400 transition-colors">
                          {booking.event?.title || "Unknown Event"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" /> {booking.event?.date}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> {booking.event?.venue}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-sm">
                          <span className="text-zinc-500">Seats: </span>
                          <span className="text-white font-medium">{booking.seatNumbers?.join(", ") || "N/A"}</span>
                        </div>
                        <Link href={`/tickets/${booking.id}`}>
                          <Button size="sm" variant="ghost" className="text-violet-400 hover:text-violet-300 gap-2">
                            View Ticket <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}