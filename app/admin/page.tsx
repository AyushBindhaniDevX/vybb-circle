"use client"



import { useEffect, useState } from "react"

import { useAuth } from "@/components/auth-provider"

import { useRouter } from "next/navigation"

import { Navbar } from "@/components/navbar"

import { motion, AnimatePresence } from "framer-motion"

import { 

  isAdminUser, 

  getAllBookings, 

  getEvents, 

  checkInBooking,

  getAnalytics,

  getBookingById,

  type Booking,

  type Event

} from "@/lib/db-utils"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"

import { Card } from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {

  Users, Calendar, DollarSign, CheckCircle2, Search, Scan, Shield, Clock, Ticket, Zap, Plus, Edit, Trash2, Sparkles, MapPin

} from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

import { QRScanner } from "@/components/qr-scanner"

import { toast } from "sonner"



export default function AdminPage() {

  const { user, loading: authLoading } = useAuth()

  const router = useRouter()

  const [isAdmin, setIsAdmin] = useState(false)

  const [checkingAdmin, setCheckingAdmin] = useState(true)

  const [bookings, setBookings] = useState<Booking[]>([])

  const [events, setEvents] = useState<Event[]>([])

  const [analytics, setAnalytics] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")

  const [selectedGuests, setSelectedGuests] = useState<string[]>([])

  const [scannerOpen, setScannerOpen] = useState(false)



  useEffect(() => {

    const checkAdmin = async () => {

      if (!user) { setCheckingAdmin(false); return }

      try {

        const adminStatus = await isAdminUser(user.email || "")

        setIsAdmin(adminStatus)

        if (!adminStatus) router.push("/")

      } catch { setIsAdmin(false); router.push("/") }

      finally { setCheckingAdmin(false) }

    }

    if (!authLoading) checkAdmin()

  }, [user, authLoading, router])



  const fetchData = async () => {

    try {

      setLoading(true)

      const [bookingsData, eventsData, analyticsData] = await Promise.all([

        getAllBookings(),

        getEvents(),

        getAnalytics()

      ])

      // Ensure bookings are unique by their ID (Payment ID)

      setBookings(bookingsData)

      setEvents(eventsData)

      setAnalytics(analyticsData)

    } finally { setLoading(false) }

  }



  useEffect(() => { if (isAdmin) fetchData() }, [isAdmin])



  const toggleGuest = (id: string) => {

    setSelectedGuests(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])

  }



  const handleBatchCheckIn = async () => {

    if (selectedGuests.length === 0) return

    const loadingToast = toast.loading(`Verifying ${selectedGuests.length} tickets...`)

    try {

      await Promise.all(selectedGuests.map(id => checkInBooking(id, user?.email || "admin")))

      toast.success(`${selectedGuests.length} tickets verified.`, { id: loadingToast })

      setSelectedGuests([])

      fetchData()

    } catch { toast.error("Batch verification failed.", { id: loadingToast }) }

  }



  const handleQRScan = async (data: string) => {

    setScannerOpen(false)

    try {

      const booking = await getBookingById(data)

      if (!booking) { toast.error("Registry not found."); return }

      if (booking.checkedIn) { toast.warning("Ticket already used."); return }

      await checkInBooking(booking.id, user?.email || "admin")

      toast.success("Gate access granted.")

      fetchData()

    } catch { toast.error("Scan processing error.") }

  }



  if (authLoading || checkingAdmin) return (

    <div className="min-h-screen bg-black flex items-center justify-center">

      <Zap className="h-8 w-8 text-[#7c3aed] animate-pulse" />

    </div>

  )



  return (

    <main className="min-h-screen bg-black text-white selection:bg-[#7c3aed]/30 overflow-x-hidden">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/10 blur-[120px] rounded-full" />

        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c026d3]/10 blur-[120px] rounded-full animate-pulse" />

      </div>



      <Navbar />



      <div className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">

          <div className="text-left">

            <Badge className="mb-4 bg-[#7c3aed]/20 text-[#a78bfa] border-[#7c3aed]/30 font-black uppercase text-[8px] tracking-[0.3em] px-4 py-1">

              <Shield className="h-3 w-3 mr-2" /> Protocol Level 01 Access

            </Badge>

            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">

              VYBB <span className="text-[#7c3aed] italic">COMMAND</span>

            </h1>

          </div>

          <div className="flex gap-4">

            <Button onClick={() => setScannerOpen(true)} className="h-16 rounded-[1.5rem] bg-white text-black hover:bg-[#7c3aed] font-black uppercase tracking-widest px-8 shadow-2xl">

              <Scan className="h-5 w-5 mr-3" /> Gate Scanner

            </Button>

            <AnimatePresence>

              {selectedGuests.length > 0 && (

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>

                  <Button onClick={handleBatchCheckIn} className="h-16 rounded-[1.5rem] bg-[#7c3aed] text-white font-black uppercase px-8 shadow-2xl">

                    VERIFY BATCH ({selectedGuests.length})

                  </Button>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

        </motion.div>



        <Tabs defaultValue="bookings" className="space-y-10">

          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar">

            <TabsTrigger value="bookings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed]">Guest Registry</TabsTrigger>

          </TabsList>



          <TabsContent value="bookings">

            <Card className="bg-zinc-950 border-white/5 p-4 sm:p-10 rounded-[3rem] shadow-2xl">

              <div className="relative mb-10 group">

                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-[#7c3aed] transition-colors" />

                <Input placeholder="SEARCH GUEST OR PAYMENT ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-16 h-16 bg-white/5 border-white/10 rounded-2xl font-bold uppercase" />

              </div>



              <Tabs defaultValue={events[0]?.id} className="space-y-6">

                <TabsList className="bg-white/5 p-1 rounded-xl h-12">

                  {events.map(ev => (

                    <TabsTrigger key={ev.id} value={ev.id} className="rounded-lg px-6 font-black uppercase text-[8px] tracking-widest data-[state=active]:bg-[#7c3aed]">{ev.title.split(":")[0]}</TabsTrigger>

                  ))}

                </TabsList>



                {events.map(ev => {

                  const evBookings = bookings.filter(b => b.eventId === ev.id && (b.attendeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.includes(searchQuery)))

                  return (

                    <TabsContent key={ev.id} value={ev.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                      {evBookings.map(guest => (

                        <motion.div 

                          key={guest.id} // Essential: Use unique Payment ID as key

                          onClick={() => !guest.checkedIn && toggleGuest(guest.id)}

                          className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group ${

                            guest.checkedIn ? "bg-green-500/5 border-green-500/20 opacity-40 grayscale" :

                            selectedGuests.includes(guest.id) ? "bg-[#7c3aed]/10 border-[#7c3aed]" : "bg-white/5 border-white/10 hover:border-zinc-700"

                          }`}

                        >

                          <div className="flex items-center gap-4 text-left">

                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center border bg-black/40 border-white/10">

                              {guest.checkedIn ? <CheckCircle2 className="h-6 w-6 text-green-400" /> : <Users className="h-6 w-6 text-zinc-600 group-hover:text-[#7c3aed]" />}

                            </div>

                            <div>

                              <p className="font-bold text-base uppercase italic tracking-tight">{guest.attendeeDetails.name}</p>

                              <p className="text-[9px] font-black text-[#7c3aed] uppercase tracking-widest mt-1">ID: ...{guest.id.slice(-8)}</p>

                            </div>

                          </div>

                          {!guest.checkedIn && (

                            <div className={`h-8 w-8 rounded-xl border-2 transition-all flex items-center justify-center ${selectedGuests.includes(guest.id) ? "bg-[#7c3aed] border-[#7c3aed]" : "border-white/10 bg-transparent"}`}>

                              {selectedGuests.includes(guest.id) && <Zap className="h-4 w-4 text-white fill-current" />}

                            </div>

                          )}

                        </motion.div>

                      ))}

                    </TabsContent>

                  )

                })}

              </Tabs>

            </Card>

          </TabsContent>

        </Tabs>

      </div>



      <QRScanner isOpen={scannerOpen} onScan={handleQRScan} onClose={() => setScannerOpen(false)} />

    </main>

  )

}
