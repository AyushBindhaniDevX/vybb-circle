"use client"

import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getBookingsByUserId, getEventById } from "@/lib/db-utils"
import { Button } from "@/components/ui/button"
import { 
  Mail, Calendar, MapPin, LogOut, 
  Sparkles, User, Ticket, ArrowRight 
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"

function ProfileContent() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Inside your profile/page.tsx useEffect

useEffect(() => {
  if (!user) return;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // This calls our updated, more resilient function
      const userBookings = await getBookingsByUserId(user.uid);
      
      const enrichedBookings = await Promise.all(
        userBookings.map(async (b) => {
          // Fetch the event details for each booking to get images/titles
          const event = await getEventById(b.eventId);
          return { ...b, event };
        }),
      );
      
      setBookings(enrichedBookings);
    } catch (error) {
      console.error("Profile page load error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          
          {/* User Sidebar - Cleaned version without levels */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="p-8 rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-2xl text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 mx-auto flex items-center justify-center text-3xl font-black mb-6 border-4 border-black shadow-xl">
                {user?.displayName?.[0] || user?.email?.[0].toUpperCase()}
              </div>
              
              <h2 className="text-2xl font-black italic tracking-tight">{user?.displayName || "Member"}</h2>
              <p className="text-xs text-zinc-500 flex items-center justify-center gap-2 mt-2">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>

              <div className="my-8 h-px bg-white/5" />

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-8">
                <span className="block text-2xl font-black">{bookings.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Tickets</span>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => auth.signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" /> SIGN OUT
              </Button>
            </div>
          </motion.div>

          {/* Main Tickets Area */}
          <div className="lg:col-span-3">
            <h1 className="text-4xl font-black italic mb-8 tracking-tighter uppercase">My Tickets</h1>

            {bookings.length === 0 ? (
              <div className="py-24 rounded-[2.5rem] border border-dashed border-white/10 bg-zinc-950/50 text-center">
                <Ticket className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No active tickets found</p>
                <Link href="/events">
                  <Button className="mt-6 bg-white text-black hover:bg-violet-600 rounded-full px-8 font-black">
                    EXPLORE EVENTS
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] border border-white/5 bg-zinc-950/40 hover:border-violet-500/30 transition-all shadow-xl backdrop-blur-sm"
                    >
                      <div className="h-32 w-full md:w-32 shrink-0 overflow-hidden rounded-2xl border border-white/5">
                        <img
                          src={booking.event?.imageUrl || "/placeholder.svg"}
                          className="h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                          alt=""
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-black italic tracking-tight group-hover:text-violet-400 transition-colors">
                            {booking.event?.title || "Event Name"}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-violet-500" /> {booking.event?.date}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-violet-500" /> {booking.event?.venue}</span>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Seats</span>
                            <span className="text-sm font-bold">{booking.seatNumbers?.join(", ")}</span>
                          </div>
                          <Link href={`/tickets/${booking.id}`}>
                            <Button className="rounded-full bg-violet-600 hover:bg-white hover:text-black font-black text-[10px] tracking-widest h-9 px-6">
                              VIEW TICKET <ArrowRight className="h-3 w-3 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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