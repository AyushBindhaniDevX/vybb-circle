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
  createEvent,
  updateEvent,
  deleteEvent,
  type Booking,
  type Event,
  getBookingById
} from "@/lib/db-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Users, Calendar, DollarSign, CheckCircle2, Search, Scan, Shield, Clock, Ticket, Zap, Plus, Edit, Trash2, MapPin, Sparkles
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
  const [scannerOpen, setScannerOpen] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) { setCheckingAdmin(false); return }
      try {
        const adminStatus = await isAdminUser(user.email || "")
        setIsAdmin(adminStatus)
        if (!adminStatus) router.push("/")
      } catch { setIsAdmin(false); router.push("/") }
      finally { setCheckingAdmin(false) }
    }
    if (!authLoading) checkAdminAccess()
  }, [user, authLoading, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookingsData, eventsData, analyticsData] = await Promise.all([
        getAllBookings(),
        getEvents(),
        getAnalytics()
      ])
      setBookings(bookingsData)
      setEvents(eventsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally { setLoading(false) }
  }

  useEffect(() => { if (isAdmin) fetchData() }, [isAdmin])

  const handleCheckIn = async (bookingId: string) => {
    if (!user?.email) return
    try {
      await checkInBooking(bookingId, user.email)
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, checkedIn: true, checkedInAt: new Date() }
          : b
      ))
      toast.success("Guest protocol verified.")
      fetchData()
    } catch { toast.error("Verification failed.") }
  }

  const handleQRScan = async (data: string) => {
    setScannerOpen(false)
    try {
      const booking = await getBookingById(data)
      if (!booking) { toast.error("Registry not found."); return }
      if (booking.checkedIn) { toast.warning("Guest already admitted."); return }
      await handleCheckIn(booking.id)
    } catch { toast.error("Scan processing error.") }
  }

  const filteredBookings = bookings.filter(b => 
    b.attendeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || checkingAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Sparkles className="h-8 w-8 text-[#7c3aed] animate-pulse" />
    </div>
  )

  if (!isAdmin) return null

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#7c3aed]/30 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c026d3]/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Navbar />

      <div className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left">
              <Badge className="mb-4 bg-[#7c3aed]/20 text-[#a78bfa] border-[#7c3aed]/30 font-black uppercase text-[8px] tracking-[0.3em] px-4 py-1">
                <Shield className="h-3 w-3 mr-2 text-[#7c3aed]" /> Protocol Level 01 Access
              </Badge>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">
                VYBB <span className="text-[#7c3aed] italic">COMMAND</span>
              </h1>
            </div>
            <Button onClick={() => setScannerOpen(true)} className="h-16 rounded-[1.5rem] bg-white text-black hover:bg-[#7c3aed] hover:text-white font-black uppercase tracking-widest px-8 transition-all active:scale-95 shadow-2xl">
              <Scan className="h-5 w-5 mr-3" /> Launch Gate Scanner
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[2.5rem] bg-white/5" />) : (
              <>
                {[
                  { label: 'GROSS YIELD', val: `₹${analytics?.totalRevenue?.toLocaleString()}`, icon: DollarSign },
                  { label: 'GATE ENTRIES', val: analytics?.checkedInCount, icon: CheckCircle2 },
                  { label: 'ACTIVE LOOPS', val: analytics?.totalEvents, icon: Zap },
                  { label: 'POOL SIZE', val: analytics?.totalTicketsSold, icon: Ticket }
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><item.icon className="h-20 w-20 text-[#7c3aed]" /></div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">{item.label}</p>
                    <div className="text-3xl font-black italic tracking-tight uppercase">{item.val}</div>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          <Tabs defaultValue="bookings" className="space-y-10">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              <TabsTrigger value="manage-events" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed] transition-all">Engine</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed] transition-all">Guest Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
               <Card className="bg-zinc-950 border-white/5 p-4 sm:p-8 rounded-[2.5rem] shadow-2xl">
                  <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-[#7c3aed] transition-colors" />
                    <Input placeholder="SEARCH GUEST IDENTITY..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase tracking-tight" />
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-2xl border border-white/5 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5">
                          <TableHead className="font-black uppercase text-[8px] tracking-[0.3em] text-zinc-600 py-6">Guest // Order Hash</TableHead>
                          <TableHead className="font-black uppercase text-[8px] tracking-[0.3em] text-zinc-600">Status</TableHead>
                          <TableHead className="text-right pr-8 font-black text-[8px] tracking-[0.3em] text-zinc-600">Gate Access</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((b) => (
                          <TableRow key={b.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="py-6 text-left font-bold uppercase tracking-tighter italic text-white">
                               {b.attendeeDetails.name} 
                               <span className="block text-[8px] font-black text-zinc-600 not-italic tracking-widest mt-1 uppercase">ID: {b.id.substring(0, 10)}</span>
                            </TableCell>
                            <TableCell className="text-left">
                              {b.checkedIn ? <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-black text-[8px]">VERIFIED</Badge> : <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-black text-[8px]">AWAITING</Badge>}
                            </TableCell>
                            <TableCell className="text-right pr-8">
                               {!b.checkedIn && <Button size="sm" onClick={() => handleCheckIn(b.id)} className="rounded-full bg-[#7c3aed] hover:bg-white hover:text-black font-black text-[8px] px-6">VERIFY ENTRY</Button>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredBookings.map((b) => (
                      <div key={b.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-black text-sm text-white uppercase italic">{b.attendeeDetails.name}</div>
                            <div className="text-[9px] text-zinc-500 tracking-widest mt-1 uppercase">ORDER #{b.id.substring(0, 8)}</div>
                          </div>
                          {b.checkedIn ? 
                            <Badge className="bg-green-500/10 text-green-400 border-0 font-black text-[8px]">VERIFIED</Badge> : 
                            <Badge className="bg-orange-500/10 text-orange-400 border-0 font-black text-[8px]">AWAITING</Badge>
                          }
                        </div>
                        {!b.checkedIn && (
                          <Button onClick={() => handleCheckIn(b.id)} className="w-full h-12 rounded-xl bg-[#7c3aed] text-white font-black text-[10px] uppercase tracking-widest shadow-lg">
                            VERIFY ENTRY
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <QRScanner isOpen={scannerOpen} onScan={handleQRScan} onClose={() => setScannerOpen(false)} />
    </main>
  )
}
