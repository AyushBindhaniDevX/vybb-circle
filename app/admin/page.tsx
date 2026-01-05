"use client"

import { useEffect, useState, useMemo } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
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
  Users, Calendar, DollarSign, CheckCircle2, Search, Scan, Shield, Clock, Ticket, Zap, 
  Plus, Edit, Trash2, X, MapPin, Sparkles, Download, BarChart3, TrendingUp, Filter
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QRScanner } from "@/components/qr-scanner"
import { toast } from "sonner"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // State Management
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  
  // Feature States
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [scannerOpen, setScannerOpen] = useState(false)
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  // Access Protocol
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
      toast.error("Failed to sync registry")
    } finally { setLoading(false) }
  }

  useEffect(() => { if (isAdmin) fetchData() }, [isAdmin])

  // --- Verification Protocols ---
  const handleCheckIn = async (bookingId: string) => {
    if (!user?.email) return
    try {
      await checkInBooking(bookingId, user.email)
      toast.success("Identity Verified")
      fetchData()
    } catch { toast.error("Protocol Breach") }
  }

  const handleBatchCheckIn = async () => {
    if (selectedGuests.length === 0) return
    const promise = Promise.all(selectedGuests.map(id => checkInBooking(id, user?.email || "")))
    toast.promise(promise, {
      loading: 'Verifying Batch...',
      success: () => {
        setSelectedGuests([])
        fetchData()
        return `${selectedGuests.length} Guests Admitted`
      },
      error: 'Batch verification failed'
    })
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

  // --- Export Protocols ---
  const exportRegistry = () => {
    const headers = ["Booking ID", "Guest Name", "Email", "Event", "Seats", "Status"]
    const rows = filteredBookings.map(b => [
      b.id, b.attendeeDetails.name, b.attendeeDetails.email, b.eventTitle, b.seatNumbers.join(", "), b.checkedIn ? "VERIFIED" : "AWAITING"
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Vybb-Registry-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  // --- Filtering Logic ---
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.attendeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEvent = selectedEventId === "all" || b.eventId === selectedEventId
      return matchesSearch && matchesEvent
    })
  }, [bookings, searchQuery, selectedEventId])

  if (authLoading || checkingAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Zap className="h-10 w-10 text-[#7c3aed] animate-pulse" />
    </div>
  )

  if (!isAdmin) return null

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#7c3aed]/30 overflow-x-hidden">
      {/* Aurora Atmospheric Blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c026d3]/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Navbar />

      <div className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Admin Header */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left">
              <Badge className="mb-4 bg-[#7c3aed]/20 text-[#a78bfa] border-[#7c3aed]/30 font-black uppercase text-[8px] tracking-[0.3em] px-4 py-1">
                <Shield className="h-3 w-3 mr-2 text-[#7c3aed]" /> Protocol Level 01 Access
              </Badge>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">
                VYBB <span className="text-[#7c3aed] italic">COMMAND</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
               <Button onClick={exportRegistry} variant="outline" className="h-14 rounded-xl border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest px-6">
                 <Download className="h-4 w-4 mr-2" /> Export CSV
               </Button>
               <Button onClick={() => setScannerOpen(true)} className="h-14 rounded-xl bg-white text-black hover:bg-[#7c3aed] hover:text-white font-black uppercase tracking-widest px-8 transition-all shadow-2xl">
                 <Scan className="h-5 w-5 mr-3" /> Initialize Scanner
               </Button>
            </div>
          </motion.div>

          {/* Analytics Pulse - The Bento Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[2.5rem] bg-white/5" />) : (
              <>
                {[
                  { label: 'GROSS YIELD', val: `₹${analytics?.totalRevenue?.toLocaleString()}`, icon: DollarSign, trend: '+12.5%' },
                  { label: 'GATE ENTRIES', val: analytics?.checkedInCount, icon: CheckCircle2, trend: `${((analytics?.checkedInCount / analytics?.totalTicketsSold) * 100 || 0).toFixed(1)}%` },
                  { label: 'ACTIVE LOOPS', val: analytics?.totalEvents, icon: Zap, trend: 'STABLE' },
                  { label: 'POOL SIZE', val: analytics?.totalTicketsSold, icon: Ticket, trend: 'VERIFIED' }
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><item.icon className="h-20 w-20 text-[#7c3aed]" /></div>
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">{item.label}</p>
                       <span className="text-[8px] font-black text-[#7c3aed]">{item.trend}</span>
                    </div>
                    <div className="text-3xl font-black italic tracking-tight uppercase">{item.val}</div>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          <Tabs defaultValue="manage-events" className="space-y-10">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 w-full md:w-auto justify-start overflow-x-auto">
              <TabsTrigger value="manage-events" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed] transition-all">Engine</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed] transition-all">Registry</TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed] transition-all">Intelligence</TabsTrigger>
            </TabsList>

            {/* Experience Engine CRUD */}
            <TabsContent value="manage-events">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <motion.div whileHover={{ y: -5 }} onClick={() => { setEditingEvent(null); setEventFormOpen(true); }} className="cursor-pointer min-h-[300px] rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 hover:border-[#7c3aed]/50 transition-all flex flex-col items-center justify-center p-12 text-center group">
                  <div className="h-16 w-16 rounded-full bg-[#7c3aed]/10 flex items-center justify-center border border-[#7c3aed]/20 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8 text-[#7c3aed]" />
                  </div>
                  <h3 className="mt-6 text-xl font-black italic uppercase tracking-tighter">Spawn New Loop</h3>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 mt-2">Initialize registry entry</p>
                </motion.div>

                {events.map((e, idx) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className="bg-zinc-950 border-white/5 group rounded-[2.5rem] overflow-hidden hover:border-[#7c3aed]/30 transition-all shadow-2xl">
                      <div className="relative h-44 overflow-hidden">
                        <img src={e.imageUrl} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <Badge className="absolute top-4 right-4 bg-[#7c3aed] border-0 font-black italic tracking-widest text-[9px]">{e.category}</Badge>
                      </div>
                      <div className="p-8 text-left space-y-4">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter line-clamp-1">{e.title}</h3>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase">
                             <Calendar className="h-3 w-3 text-[#7c3aed]" /> {e.date}
                           </div>
                           <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase">
                             <Users className="h-3 w-3 text-[#7c3aed]" /> {e.availableSeats}/{e.totalSeats}
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                           <span className="font-bold text-sm italic text-[#a78bfa]">₹{e.price} TICK</span>
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

            {/* Registry Protocol - Mobile Optimized */}
            <TabsContent value="bookings">
               <Card className="bg-zinc-950 border-white/5 p-4 sm:p-10 rounded-[2.5rem] shadow-2xl">
                  <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-[#7c3aed] transition-colors" />
                      <Input placeholder="SEARCH GUEST IDENTITY OR PAYMENT ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase tracking-tight" />
                    </div>
                    <div className="flex gap-3">
                       <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                          <SelectTrigger className="h-14 w-[200px] bg-white/5 border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="All Loops" /></SelectTrigger>
                          <SelectContent className="bg-zinc-950 border-white/10 text-white font-bold">
                            <SelectItem value="all">ALL LOOPS</SelectItem>
                            {events.map(ev => <SelectItem key={ev.id} value={ev.id}>{ev.title.toUpperCase()}</SelectItem>)}
                          </SelectContent>
                       </Select>
                       <AnimatePresence>
                         {selectedGuests.length > 0 && (
                           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                             <Button onClick={handleBatchCheckIn} className="h-14 bg-[#7c3aed] hover:bg-white hover:text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl shadow-xl">ADMIT BATCH ({selectedGuests.length})</Button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  </div>

                  {/* Responsive Table/Card View */}
                  <div className="rounded-2xl border border-white/5 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5">
                          <TableHead className="w-12 py-6 pl-6"><Checkbox checked={selectedGuests.length === filteredBookings.length && filteredBookings.length > 0} onCheckedChange={(checked) => checked ? setSelectedGuests(filteredBookings.map(b => b.id)) : setSelectedGuests([])} /></TableHead>
                          <TableHead className="font-black uppercase text-[8px] tracking-[0.3em] text-zinc-600">ID // Identity</TableHead>
                          <TableHead className="hidden md:table-cell font-black uppercase text-[8px] tracking-[0.3em] text-zinc-600">Experience</TableHead>
                          <TableHead className="font-black uppercase text-[8px] tracking-[0.3em] text-zinc-600">Protocol</TableHead>
                          <TableHead className="text-right pr-8 font-black text-[8px] tracking-[0.3em] text-zinc-600">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((b) => (
                          <TableRow key={b.id} className="border-white/5 hover:bg-white/5 transition-colors">
                            <TableCell className="pl-6"><Checkbox checked={selectedGuests.includes(b.id)} onCheckedChange={(checked) => checked ? setSelectedGuests([...selectedGuests, b.id]) : setSelectedGuests(selectedGuests.filter(id => id !== b.id))} disabled={b.checkedIn} /></TableCell>
                            <TableCell className="py-6 text-left">
                               <div className="font-bold text-white uppercase italic text-sm">{b.attendeeDetails.name}</div>
                               <div className="text-[8px] font-black text-zinc-600 mt-1 uppercase">PAYMENT: ...{b.id.substring(b.id.length - 8)}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-[10px] font-bold text-zinc-400 uppercase italic">{b.eventTitle}</TableCell>
                            <TableCell>
                              {b.checkedIn ? (
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-black text-[8px] px-3">VERIFIED</Badge>
                              ) : (
                                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-black text-[8px] px-3">AWAITING</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-8">
                               {!b.checkedIn && <Button size="sm" onClick={() => handleCheckIn(b.id)} className="rounded-full bg-[#7c3aed] hover:bg-white hover:text-black font-black text-[8px] px-6 transition-all">VERIFY</Button>}
                               {b.checkedIn && <div className="text-[8px] font-black text-zinc-700 uppercase">{new Date(b.checkedInAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
               </Card>
            </TabsContent>

            {/* Intelligence/Analytics Tab */}
            <TabsContent value="analytics">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-zinc-950 border-white/5 p-10 rounded-[3rem] shadow-2xl">
                     <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-[#7c3aed]" /> Growth Protocol
                     </h3>
                     <div className="space-y-12">
                        {events.slice(0, 3).map((ev, i) => (
                          <div key={ev.id} className="space-y-4">
                            <div className="flex justify-between items-end">
                               <span className="font-bold text-sm uppercase italic">{ev.title}</span>
                               <span className="text-[10px] font-black text-[#7c3aed]">{((ev.totalSeats - ev.availableSeats) / ev.totalSeats * 100).toFixed(0)}% FULL</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${((ev.totalSeats - ev.availableSeats) / ev.totalSeats * 100)}%` }} transition={{ delay: i * 0.2 }} className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c026d3] shadow-[0_0_10px_#7c3aed]" />
                            </div>
                          </div>
                        ))}
                     </div>
                  </Card>
                  <Card className="bg-zinc-950 border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center items-center text-center">
                     <div className="h-24 w-24 rounded-full border-4 border-[#7c3aed]/20 border-t-[#7c3aed] animate-spin mb-8" />
                     <h3 className="text-2xl font-black italic uppercase">Syncing Intel...</h3>
                     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-4">Real-time gate metrics active</p>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <EventFormModal 
        isOpen={eventFormOpen} 
        onClose={() => { setEventFormOpen(false); setEditingEvent(null); }} 
        onSubmit={(data) => editingEvent ? handleUpdateEvent(editingEvent.id, data) : handleCreateEvent(data)} 
        initialData={editingEvent} 
      />
      <DeleteConfirmDialog 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        onConfirm={() => eventToDelete && handleDeleteEvent(eventToDelete.id)} 
        eventTitle={eventToDelete?.title} 
      />
      <QRScanner isOpen={scannerOpen} onScan={handleQRScan} onClose={() => setScannerOpen(false)} />
    </main>
  )
}

// --- Internal Helper Components ---

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
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-1">Identity Tag</span>
            <Input required placeholder="EXPERIENCE TITLE" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase tracking-tight" />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-1">Gate Pricing</span>
                <Input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" />
             </div>
             <div className="space-y-2">
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-1">Loop Date</span>
                <Input required value={formData.date} placeholder="Jan 10, 2026" onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase" />
             </div>
          </div>
          <div className="space-y-2">
             <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-1">Asset Protocol (URL)</span>
             <Input required placeholder="https://..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" />
          </div>
          <div className="flex gap-4 pt-6">
             <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-16 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">Abort</Button>
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
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-loose">Terminating <span className=\"text-white\">\"{eventTitle}\"</span> will wipe all associated registry entries. This is permanent.</p>
        </div>
        <div className=\"flex gap-4\">
          <Button variant=\"ghost\" onClick={onClose} className=\"flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest\">Negate</Button>
          <Button onClick={onConfirm} className=\"flex-1 bg-red-600 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest\">Purge</Button>
        </div>
      </motion.div>
    </div>
  )
}
