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
  getBookingById,
  type Booking,
  type Event
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users, Calendar, DollarSign, CheckCircle2, Search, Scan, Shield, Clock, Ticket, Zap, Plus, Edit, Trash2, X, MapPin, Sparkles
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
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

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

  const handleCreateEvent = async (eventData: Omit<Event, "id">) => {
    try {
      await createEvent(eventData)
      toast.success("Experience spawned.")
      setEventFormOpen(false)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleUpdateEvent = async (eventId: string, eventData: Partial<Event>) => {
    try {
      await updateEvent(eventId, eventData)
      toast.success("Loop updated.")
      setEventFormOpen(false)
      setEditingEvent(null)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId)
      toast.success("Loop terminated.")
      setDeleteConfirmOpen(false)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
  }

  const filteredBookings = bookings.filter(b => 
    b.attendeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || checkingAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Zap className="h-8 w-8 text-[#7c3aed] animate-pulse" />
    </div>
  )

  if (!isAdmin) return null

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#7c3aed]/30 overflow-x-hidden">
      {/* Aurora Blurs */}
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
              <Scan className="h-5 w-5 mr-3" /> Gate Scanner
            </Button>
          </motion.div>

          {/* Analytics Pulse Grid */}
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

          <Tabs defaultValue="manage-events" className="space-y-10">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              <TabsTrigger value="manage-events" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed] transition-all">Engine</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed] transition-all">Guest Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="manage-events">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <motion.div whileHover={{ y: -5 }} onClick={() => { setEditingEvent(null); setEventFormOpen(true); }} className="cursor-pointer aspect-video md:aspect-auto rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 hover:border-[#7c3aed]/50 transition-all flex flex-col items-center justify-center p-12 text-center group">
                  <Plus className="h-10 w-10 text-[#7c3aed] group-hover:scale-110 transition-transform" />
                  <h3 className="mt-4 text-xl font-black italic uppercase tracking-tighter">New Experience</h3>
                </motion.div>
                {events.map((e, idx) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className="bg-zinc-950 border-white/5 group rounded-[2.5rem] overflow-hidden hover:border-[#7c3aed]/30 transition-all shadow-2xl">
                      <div className="relative h-44"><img src={e.imageUrl} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" alt="" /></div>
                      <div className="p-8 text-left space-y-4">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter line-clamp-1">{e.title}</h3>
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                             <MapPin className="h-3 w-3 text-[#7c3aed]" /> {e.venue.split('@')[0]}
                           </div>
                           <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                             <Users className="h-3 w-3 text-[#7c3aed]" /> {e.availableSeats}/{e.totalSeats} CAPACITY
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                           <span className="font-bold text-sm italic text-[#a78bfa]">₹{e.price} GATE</span>
                           <div className="flex gap-2">
                             <Button size="icon" onClick={() => { setEditingEvent(e); setEventFormOpen(true); }} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-[#7c3aed] transition-colors"><Edit className="h-4 w-4" /></Button>
                             <Button size="icon" onClick={() => { setEventToDelete(e); setDeleteConfirmOpen(true); }} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-red-600 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                           </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings">
               <Card className="bg-zinc-950 border-white/5 p-4 sm:p-10 rounded-[2.5rem] shadow-2xl">
                  <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-[#7c3aed] transition-colors" />
                    <Input placeholder="SEARCH GUEST IDENTITY..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase tracking-tight" />
                  </div>
                  <div className="rounded-2xl border border-white/5 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5">
                          <TableHead className="font-black uppercase text-[8px] tracking-[0.3em] text-zinc-600 py-6">ID // Guest</TableHead>
                          <TableHead className="font-black uppercase text-[8px] tracking-[0.3em] text-zinc-600">Protocol // Status</TableHead>
                          <TableHead className="text-right pr-8 font-black text-[8px] tracking-[0.3em] text-zinc-600">Gate Control</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((b) => (
                          <TableRow key={b.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="py-6 text-left font-bold uppercase tracking-tighter italic text-white">
                               {b.attendeeDetails.name} 
                               <span className="block text-[8px] font-black text-zinc-600 not-italic tracking-widest mt-1 uppercase">Order: {b.id.substring(0, 8)}</span>
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
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EventFormModal isOpen={eventFormOpen} onClose={() => { setEventFormOpen(false); setEditingEvent(null); }} onSubmit={(data) => editingEvent ? handleUpdateEvent(editingEvent.id, data) : handleCreateEvent(data)} initialData={editingEvent} />
      <DeleteConfirmDialog isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} onConfirm={() => eventToDelete && handleDeleteEvent(eventToDelete.id)} eventTitle={eventToDelete?.title} />
      <QRScanner isOpen={scannerOpen} onScan={handleQRScan} onClose={() => setScannerOpen(false)} />
    </main>
  )
}

function EventFormModal({ isOpen, onClose, onSubmit, initialData }: any) {
  const [formData, setFormData] = useState({ title: "", description: "", date: "", time: "", venue: "", address: "", price: 0, totalSeats: 16, imageUrl: "", category: "OPEN MIC", coordinates: { lat: 20.2806, lng: 85.7716 } })
  useEffect(() => { 
    if (initialData) setFormData({ ...initialData }); 
    else setFormData({ title: "", description: "", date: "", time: "", venue: "", address: "", price: 0, totalSeats: 16, imageUrl: "", category: "OPEN MIC", coordinates: { lat: 20.2806, lng: 85.7716 } }) 
  }, [initialData, isOpen])

  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[3rem] p-12 shadow-2xl">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-left">{initialData ? "Refine Experience" : "Spawn Experience"}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, availableSeats: formData.totalSeats }); }} className="space-y-6 text-left">
          <Input required placeholder="TITLE PROTOCOL" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase" />
          <textarea required placeholder="DESCRIPTION LOGS" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-violet-500 focus:outline-none" />
          <div className="grid grid-cols-2 gap-4">
             <Input required value={formData.date} placeholder="Jan 10, 2026" onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase" />
             <Input required type="number" placeholder="GATE PRICE" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" />
          </div>
          <Input required placeholder="IMAGE SOURCE URL" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" />
          <div className="flex gap-4 pt-6">
             <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-16 font-black uppercase text-[10px] tracking-widest">Abort</Button>
             <Button type="submit" className="flex-1 bg-[#7c3aed] rounded-2xl h-16 font-black uppercase text-[10px] tracking-widest shadow-xl">Initialize</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function DeleteConfirmDialog({ isOpen, onClose, onConfirm, eventTitle }: any) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md bg-zinc-950 border border-red-500/20 rounded-[3rem] p-12 text-center space-y-8">
        <Trash2 className="h-16 w-16 text-red-500 mx-auto animate-pulse" />
        <div className="space-y-3">
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Purge Loop?</h2>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-loose">
             Terminating <span className="text-white">"{eventTitle}"</span> will wipe all associated registry entries. This is permanent.
           </p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest">Negate</Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-600 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest">Purge</Button>
        </div>
      </motion.div>
    </div>
  )
}
