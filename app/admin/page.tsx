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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users, Calendar, DollarSign, CheckCircle2, Search, Scan, Shield, Clock, Ticket, Zap, 
  Plus, Edit, Trash2, X, MapPin, Sparkles, Globe, ImageIcon, AlignLeft
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
      console.error(error)
    } finally { setLoading(false) }
  }

  useEffect(() => { if (isAdmin) fetchData() }, [isAdmin])

  const handleBatchCheckIn = async () => {
    if (selectedGuests.length === 0) return
    const toastId = toast.loading(`Verifying ${selectedGuests.length} tickets...`)
    try {
      await Promise.all(selectedGuests.map(id => checkInBooking(id, user?.email || "admin")))
      toast.success("Batch verified", { id: toastId })
      setSelectedGuests([])
      fetchData()
    } catch {
      toast.error("Batch failure", { id: toastId })
    }
  }

  const handleQRScan = async (data: string) => {
    setScannerOpen(false)
    try {
      const booking = await getBookingById(data)
      if (!booking) { toast.error("Not found"); return }
      if (booking.checkedIn) { toast.warning("Used"); return }
      await checkInBooking(booking.id, user?.email || "admin")
      toast.success("Verified")
      fetchData()
    } catch { toast.error("Error") }
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.attendeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [bookings, searchQuery])

  const handleEventSubmit = async (data: any) => {
    const toastId = toast.loading(editingEvent ? "Updating event..." : "Creating event...")
    try {
      // Prepare the event data with proper structure
      const eventData = {
        ...data,
        // Ensure numeric fields are numbers
        price: Number(data.price),
        totalSeats: Number(data.totalSeats),
        availableSeats: Number(data.availableSeats || data.totalSeats),
        // Ensure coordinates is an object with lat/lng
        coordinates: {
          lat: Number(data.coordinates.lat),
          lng: Number(data.coordinates.lng)
        },
        // Add missing fields with default values
        date: data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: data.time || "7:00 PM - 10:00 PM",
        address: data.address || "",
        category: data.category || "OPEN MIC",
        imageUrl: data.imageUrl || "https://i.pinimg.com/1200x/8f/d3/ea/8fd3ea0824d89e5d00ebb8d586ea4d53.jpg",
        venue: data.venue || "",
        title: data.title || "",
        description: data.description || ""
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
        toast.success("Event updated successfully", { id: toastId })
      } else {
        await createEvent(eventData)
        toast.success("Event created successfully", { id: toastId })
      }
      
      setEventFormOpen(false)
      setEditingEvent(null)
      fetchData()
    } catch (error) {
      console.error("Event submission error:", error)
      toast.error(editingEvent ? "Failed to update event" : "Failed to create event", { id: toastId })
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return
    const toastId = toast.loading("Deleting event...")
    try {
      await deleteEvent(eventToDelete.id)
      toast.success("Event deleted successfully", { id: toastId })
      setDeleteConfirmOpen(false)
      setEventToDelete(null)
      fetchData()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete event", { id: toastId })
    }
  }

  if (authLoading || checkingAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Zap className="h-8 w-8 text-[#7c3aed] animate-pulse" />
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
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left">
              <Badge className="mb-4 bg-[#7c3aed]/20 text-[#a78bfa] border-[#7c3aed]/30 font-black uppercase text-[8px] tracking-[0.3em] px-4 py-1">
                <Shield className="h-3 w-3 mr-2" /> Protocol Level 01 Access
              </Badge>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">
                VYBB <span className="text-[#7c3aed] italic">COMMAND</span>
              </h1>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setScannerOpen(true)} className="h-16 rounded-[1.5rem] bg-white text-black hover:bg-[#7c3aed] hover:text-white font-black uppercase tracking-widest px-8 transition-all active:scale-95 shadow-2xl">
                <Scan className="h-5 w-5 mr-3" /> Gate Scanner
              </Button>
              {selectedGuests.length > 0 && (
                <Button onClick={handleBatchCheckIn} className="h-16 rounded-[1.5rem] bg-[#7c3aed] text-white font-black uppercase px-8 shadow-2xl">
                  Verify ({selectedGuests.length})
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'GROSS YIELD', val: `₹${analytics?.totalRevenue?.toLocaleString() || '0'}`, icon: DollarSign },
              { label: 'GATE ENTRIES', val: analytics?.checkedInCount || 0, icon: CheckCircle2 },
              { label: 'ACTIVE LOOPS', val: analytics?.totalEvents || 0, icon: Zap },
              { label: 'POOL SIZE', val: analytics?.totalTicketsSold || 0, icon: Ticket }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><item.icon className="h-20 w-20 text-[#7c3aed]" /></div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">{item.label}</p>
                <div className="text-3xl font-black italic tracking-tight uppercase">{item.val}</div>
              </div>
            ))}
          </div>

          <Tabs defaultValue="manage-events" className="space-y-10">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              <TabsTrigger value="manage-events" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed]">Engine</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed]">Registry</TabsTrigger>
            </TabsList>

            <TabsContent value="manage-events">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                <div onClick={() => { setEditingEvent(null); setEventFormOpen(true); }} className="cursor-pointer aspect-video md:aspect-auto rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 hover:border-[#7c3aed]/50 transition-all flex flex-col items-center justify-center p-12 text-center group min-h-[300px]">
                  <Plus className="h-10 w-10 text-[#7c3aed] group-hover:scale-110" />
                  <h3 className="mt-4 text-xl font-black italic uppercase">Spawn Loop</h3>
                </div>
                {events.map((e) => (
                  <Card key={e.id} className="bg-zinc-950 border-white/5 group rounded-[2.5rem] overflow-hidden hover:border-[#7c3aed]/30 transition-all shadow-2xl">
                    <div className="relative h-44"><img src={e.imageUrl} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0" alt="" /></div>
                    <div className="p-8 space-y-4">
                      <h3 className="text-xl font-black italic uppercase line-clamp-1">{e.title}</h3>
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                           <MapPin className="h-3 w-3 text-[#7c3aed]" /> {e.venue}
                         </div>
                         <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                           <Users className="h-3 w-3 text-[#7c3aed]" /> {e.availableSeats}/{e.totalSeats}
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <span className="font-bold text-sm italic text-[#a78bfa]">₹{e.price}</span>
                         <div className="flex gap-2">
                           <Button size="icon" onClick={() => { setEditingEvent(e); setEventFormOpen(true); }} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-[#7c3aed]"><Edit className="h-4 w-4" /></Button>
                           <Button size="icon" onClick={() => { setEventToDelete(e); setDeleteConfirmOpen(true); }} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-red-600"><Trash2 className="h-4 w-4" /></Button>
                         </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings">
               <Card className="bg-zinc-950 border-white/5 p-4 sm:p-10 rounded-[2.5rem] shadow-2xl">
                  <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input placeholder="SEARCH GUEST..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookings.map(guest => (
                      <div 
                        key={guest.id}
                        onClick={() => !guest.checkedIn && setSelectedGuests(prev => prev.includes(guest.id) ? prev.filter(i => i !== guest.id) : [...prev, guest.id])}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between ${
                          guest.checkedIn ? "bg-green-500/5 opacity-40 grayscale" :
                          selectedGuests.includes(guest.id) ? "bg-[#7c3aed]/10 border-[#7c3aed]" : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-bold text-base uppercase italic">{guest.attendeeDetails.name}</p>
                          <p className="text-[9px] font-black text-zinc-600 uppercase mt-1">ID: ...{guest.id.slice(-8)}</p>
                        </div>
                        {guest.checkedIn ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : selectedGuests.includes(guest.id) && <Zap className="h-4 w-4 text-[#7c3aed] fill-current" />}
                      </div>
                    ))}
                  </div>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EventFormModal 
        isOpen={eventFormOpen} 
        onClose={() => { setEventFormOpen(false); setEditingEvent(null); }} 
        onSubmit={handleEventSubmit}
        initialData={editingEvent} 
      />
      
      <DeleteConfirmDialog 
        isOpen={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        onConfirm={handleDeleteEvent} 
        eventTitle={eventToDelete?.title} 
      />
      
      <QRScanner isOpen={scannerOpen} onScan={handleQRScan} onClose={() => setScannerOpen(false)} />
    </main>
  )
}

function EventFormModal({ isOpen, onClose, onSubmit, initialData }: any) {
  const [formData, setFormData] = useState<any>({ 
    title: "", 
    description: "", 
    date: "", 
    time: "7:00 PM - 10:00 PM", 
    venue: "", 
    address: "Sapphire Smoke The Rooftop Cafe, K-8/844, Ghatikia Main Rd, K8 Kalinga Nagar, Kalinganagar, Bhubaneswar, Odisha 751029", 
    price: 150, 
    totalSeats: 16, 
    availableSeats: 10,
    imageUrl: "https://i.pinimg.com/1200x/8f/d3/ea/8fd3ea0824d89e5d00ebb8d586ea4d53.jpg", 
    category: "OPEN MIC", 
    coordinates: { lat: 20.2806, lng: 85.7716 } 
  })

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  }

  useEffect(() => { 
    if (initialData) {
      setFormData({ 
        ...initialData, 
        coordinates: initialData.coordinates || { lat: 20.2806, lng: 85.7716 },
        date: formatDateForInput(initialData.date) || "",
        availableSeats: initialData.availableSeats || initialData.totalSeats || 10
      }); 
    } else {
      // Set default date to 3 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      const formattedDate = defaultDate.toISOString().split('T')[0];
      
      setFormData({ 
        title: "", 
        description: "", 
        date: formattedDate, 
        time: "7:00 PM - 10:00 PM", 
        venue: "", 
        address: "Sapphire Smoke The Rooftop Cafe, K-8/844, Ghatikia Main Rd, K8 Kalinga Nagar, Kalinganagar, Bhubaneswar, Odisha 751029", 
        price: 150, 
        totalSeats: 16, 
        availableSeats: 16,
        imageUrl: "https://i.pinimg.com/1200x/8f/d3/ea/8fd3ea0824d89e5d00ebb8d586ea4d53.jpg", 
        category: "OPEN MIC", 
        coordinates: { lat: 20.2806, lng: 85.7716 } 
      });
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the date properly
    const formattedData = {
      ...formData,
      date: formData.date ? new Date(formData.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };
    
    onSubmit(formattedData);
  }

  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl my-8">
        <div className="flex justify-between items-start mb-10 text-left">
          <div>
            <h2 className="text-4xl font-black italic uppercase leading-none mb-2">{initialData ? "Refine Loop" : "Spawn Loop"}</h2>
            <p className="text-[10px] font-black uppercase text-zinc-500 italic">Initialization Protocol</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-white/5"><X /></Button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 flex items-center gap-2"><Zap className="h-3 w-3" /> Identity</label>
              <Input 
                required 
                value={formData.title || ""} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase" 
                placeholder="Event Title"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 flex items-center gap-2"><AlignLeft className="h-3 w-3" /> Description</label>
              <textarea 
                required 
                value={formData.description || ""} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-violet-500 focus:outline-none" 
                placeholder="Event description..."
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Image URL</label>
              <Input 
                value={formData.imageUrl || ""} 
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" 
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Date</label>
                <Input 
                  required 
                  type="date" 
                  value={formData.date || ""} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                  className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Time</label>
                <Input 
                  required 
                  value={formData.time || ""} 
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                  className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" 
                  placeholder="7:00 PM - 10:00 PM"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Price (₹)</label>
                <Input 
                  required 
                  type="number" 
                  min="0"
                  value={isNaN(formData.price) ? "" : formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} 
                  className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Total Seats</label>
                <Input 
                  required 
                  type="number" 
                  min="1"
                  value={isNaN(formData.totalSeats) ? "" : formData.totalSeats} 
                  onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) || 0, availableSeats: parseInt(e.target.value) || 0 })} 
                  className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 flex items-center gap-2"><MapPin className="h-3 w-3" /> Venue Name</label>
              <Input 
                required 
                value={formData.venue || ""} 
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })} 
                className="h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase" 
                placeholder="Venue Name"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 flex items-center gap-2"><Globe className="h-3 w-3" /> Address</label>
              <textarea 
                required 
                value={formData.address || ""} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-violet-500 focus:outline-none" 
                placeholder="Full address..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Latitude</label>
                <Input 
                  required 
                  type="number" 
                  step="any" 
                  value={formData.coordinates?.lat || 20.2806} 
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { 
                      ...formData.coordinates, 
                      lat: parseFloat(e.target.value) || 0 
                    } 
                  })} 
                  className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Longitude</label>
                <Input 
                  required 
                  type="number" 
                  step="any" 
                  value={formData.coordinates?.lng || 85.7716} 
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { 
                      ...formData.coordinates, 
                      lng: parseFloat(e.target.value) || 0 
                    } 
                  })} 
                  className="h-14 bg-white/5 border-white/10 rounded-xl font-bold" 
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Category</label>
              <Input 
                required 
                value={formData.category || ""} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value.toUpperCase() })} 
                className="h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase" 
                placeholder="OPEN MIC, CRICKET, WORKSHOP"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-16 font-black uppercase text-[10px]">Abort</Button>
              <Button type="submit" className="flex-1 bg-[#7c3aed] rounded-2xl h-16 font-black uppercase text-[10px] shadow-xl hover:bg-[#6d28d9]">
                {initialData ? "Update Loop" : "Initialize Loop"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function DeleteConfirmDialog({ isOpen, onClose, onConfirm, eventTitle }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md bg-zinc-950 border border-red-500/20 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20"><Trash2 className="h-8 w-8 text-red-500 animate-pulse" /></div>
        <div className="space-y-3">
           <h2 className="text-3xl font-black italic uppercase text-white">Purge Loop?</h2>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-loose">Terminating <span className="text-white">"{eventTitle}"</span> will wipe all associated registry entries.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl font-black text-[10px]">Negate</Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-600 h-14 rounded-2xl font-black text-[10px] hover:bg-red-700">Purge</Button>
        </div>
      </motion.div>
    </div>
  );
}