"use client"

import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getBookingsByUserId, getEventById } from "@/lib/db-utils"
import { Button } from "@/components/ui/button"
import { 
  Mail, Calendar, MapPin, LogOut, 
  Sparkles, Ticket, ArrowRight, CheckCircle2,
  ShieldCheck, Fingerprint, Zap
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function ProfileContent() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const userBookings = await getBookingsByUserId(user.uid);
        
        const enrichedBookings = await Promise.all(
          userBookings.map(async (b) => {
            const event = await getEventById(b.eventId);
            return { ...b, event };
          }),
        );
        
        // Sort Protocol: Live loops first, then Concluded logs
        const sortedBookings = enrichedBookings.sort((a, b) => {
          return (a.checked_in === b.checked_in) ? 0 : a.checked_in ? 1 : -1;
        });

        setBookings(sortedBookings);
      } catch (error) {
        console.error("Registry Sync Error:", error);
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
    <main className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 font-sans">
      {/* Cinematic Pulse Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Navbar />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          
          {/* IDENTITY PROTOCOL SIDEBAR */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="p-10 rounded-[3rem] border border-white/5 bg-zinc-950/50 backdrop-blur-3xl shadow-3xl text-center relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
              
              <div className="relative mb-8">
                <div className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-rose-600 mx-auto flex items-center justify-center text-4xl font-black border-4 border-[#050505] shadow-2xl transition-transform group-hover:rotate-3">
                  {user?.displayName?.[0] || user?.email?.[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl">
                   <ShieldCheck className="h-5 w-5 text-violet-500" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{user?.displayName || "Member"}</h2>
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] flex items-center justify-center gap-2">
                  <Fingerprint className="h-3 w-3" /> ID: {user?.uid.substring(0, 8)}
                </p>
              </div>

              <div className="my-10 h-px bg-white/5 w-full" />

              <div className="grid grid-cols-1 gap-3 mb-10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Registry Logs</span>
                  <span className="text-xl font-black italic">{bookings.length}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Protocol Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black italic">ACTIVE</Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full h-14 rounded-[1.5rem] border border-white/5 bg-black/40 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
                onClick={() => auth.signOut()}
              >
                <LogOut className="h-4 w-4" /> TERMINATE SESSION
              </Button>
            </div>
          </motion.div>

          {/* TICKET VAULT REGISTRY */}
          <div className="lg:col-span-3 space-y-10">
            <div className="flex items-end justify-between">
               <div>
                  <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Experience Vault</h1>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Authorized Registry Entries Only</p>
               </div>
               <Zap className="h-8 w-8 text-violet-500 fill-current opacity-20" />
            </div>

            {bookings.length === 0 ? (
              <div className="py-32 rounded-[3.5rem] border-2 border-dashed border-white/5 bg-zinc-950/20 text-center flex flex-col items-center">
                <Ticket className="h-16 w-16 text-zinc-800 mb-6" />
                <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">Registry is currently empty</p>
                <Link href="/events" className="mt-10">
                  <Button className="bg-white text-black hover:bg-violet-600 hover:text-white rounded-full px-12 h-14 font-black transition-all shadow-2xl uppercase tracking-widest text-xs">
                    Initialize Discovery
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {bookings.map((booking, index) => {
                    const isRedeemed = booking.checked_in === true;
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "group relative flex flex-col md:flex-row gap-8 p-8 rounded-[3rem] border transition-all duration-500 shadow-2xl backdrop-blur-md overflow-hidden",
                          isRedeemed 
                          ? 'bg-zinc-950/20 border-white/5 grayscale opacity-40' 
                          : 'bg-zinc-950/40 border-white/5 hover:border-violet-500/30'
                        )}
                      >
                        {/* Event Metadata Image */}
                        <div className="h-40 w-full md:w-40 shrink-0 overflow-hidden rounded-[2rem] border border-white/5 relative shadow-inner">
                          <img
                            src={booking.event?.imageUrl || "/placeholder.svg"}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            alt=""
                          />
                          {isRedeemed && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                               <CheckCircle2 className="h-8 w-8 text-white/40" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="text-left space-y-4">
                              <Badge className={cn("px-3 py-0.5 rounded-lg font-black uppercase text-[8px] italic tracking-widest", isRedeemed ? "bg-zinc-800" : "bg-violet-600/20 text-violet-400 border-violet-500/20")}>
                                {isRedeemed ? "PROTOCOL LOG" : `${booking.event?.category} DROP`}
                              </Badge>
                              <h3 className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none transition-colors", !isRedeemed && 'group-hover:text-violet-400')}>
                                {booking.event?.title || "Registry Item"}
                              </h3>
                              <div className="flex flex-wrap gap-6 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-violet-500" /> {booking.event?.date}</span>
                                <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-violet-500" /> {booking.event?.venue}</span>
                              </div>
                            </div>
                            
                            {isRedeemed && (
                              <div className="border border-zinc-800 bg-black/40 px-4 py-1.5 rounded-xl font-black italic text-[9px] text-zinc-600 uppercase tracking-widest">
                                ARCHIVED
                              </div>
                            )}
                          </div>

                          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex flex-col text-left">
                              <span className="text-[8px] font-black uppercase text-zinc-700 tracking-[0.3em]">Registry Slots</span>
                              <span className="text-base font-bold italic tracking-tighter text-white/80">{booking.seatNumbers?.join(", ")}</span>
                            </div>
                            
                            <Link href={`/tickets/${booking.id}`}>
                              <Button 
                                variant={isRedeemed ? "outline" : "default"}
                                className={cn(
                                  "rounded-[1.2rem] font-black text-[10px] tracking-widest h-12 px-8 transition-all active:scale-95 uppercase",
                                  isRedeemed 
                                  ? 'border-white/5 bg-transparent text-zinc-600 hover:bg-white/5' 
                                  : 'bg-white text-black hover:bg-violet-600 hover:text-white shadow-xl'
                                )}
                              >
                                {isRedeemed ? "Protocol Receipt" : "Initialize Ticket"} <ArrowRight className="h-3 w-3 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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
