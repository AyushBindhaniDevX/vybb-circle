"use client"

import { useEffect, useState, useMemo, useRef } from "react"
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
  Plus, Edit, Trash2, X, MapPin, Sparkles, Globe, ImageIcon, AlignLeft,
  Download, Filter, User, Mail, BarChart3, TrendingUp,
  QrCode, Eye, EyeOff, RefreshCw, AlertCircle, Home, Music, Goal, Gamepad2, 
  Crown, Package, Tag
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QRScanner } from "@/components/qr-scanner"
import { toast } from "sonner"

// Simple CSV export function
const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    toast.error("No data to export")
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma or quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(",")
    )
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  toast.success("Export completed successfully")
}

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
  const [bulkCheckInModal, setBulkCheckInModal] = useState(false)
  const [filter, setFilter] = useState("all") // all, checked-in, pending
  const [activeTab, setActiveTab] = useState("manage-events")
  const [eventStats, setEventStats] = useState<Record<string, any>>({})

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
      
      // Calculate event stats
      const stats: Record<string, any> = {}
      eventsData.forEach(event => {
        const eventBookings = bookingsData.filter(b => b.eventId === event.id)
        stats[event.id] = {
          totalTickets: eventBookings.length,
          checkedIn: eventBookings.filter(b => b.checkedIn).length,
          revenue: eventBookings.reduce((sum, b) => sum + b.amount, 0)
        }
      })
      setEventStats(stats)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch data")
    } finally { setLoading(false) }
  }

  useEffect(() => { if (isAdmin) fetchData() }, [isAdmin])

  const handleBatchCheckIn = async () => {
    if (selectedGuests.length === 0) return
    const toastId = toast.loading(`Checking in ${selectedGuests.length} guests...`)
    try {
      // Check in each guest individually
      for (const guestId of selectedGuests) {
        await checkInBooking(guestId, user?.email || "admin")
      }
      toast.success(`Successfully checked in ${selectedGuests.length} guests`, { id: toastId })
      setSelectedGuests([])
      setBulkCheckInModal(false)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error("Failed to check in guests", { id: toastId })
    }
  }

  const handleQRScan = async (data: string) => {
    setScannerOpen(false)
    const toastId = toast.loading("Scanning ticket...")
    try {
      const booking = await getBookingById(data)
      if (!booking) { 
        toast.error("Ticket not found", { id: toastId })
        return 
      }
      
      if (booking.checkedIn) { 
        toast.warning("Ticket already checked in", { id: toastId })
        return 
      }
      
      await checkInBooking(booking.id, user?.email || "admin")
      toast.success("Ticket verified successfully", { 
        id: toastId,
        description: `Guest: ${booking.attendeeDetails.name}`
      })
      fetchData()
    } catch (error) { 
      console.error(error)
      toast.error("Failed to scan ticket", { id: toastId }) 
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
      console.error(error)
      toast.error("Failed to delete event", { id: toastId })
    }
  }

  const handleEventSubmit = async (data: any) => {
    const toastId = toast.loading(editingEvent ? "Updating event..." : "Creating event...")
    try {
      const eventData = {
        ...data,
        price: Number(data.price),
        totalSeats: Number(data.totalSeats),
        availableSeats: Number(data.availableSeats),
        coordinates: {
          lat: Number(data.coordinates.lat),
          lng: Number(data.coordinates.lng)
        }
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

  const handleExport = () => {
    const exportData = filteredBookings.map(booking => ({
      'Booking ID': booking.id,
      'Guest Name': booking.attendeeDetails.name,
      'Email': booking.attendeeDetails.email,
      'Phone': booking.attendeeDetails.phone,
      'Event': booking.eventTitle,
      'Event Date': booking.eventDate,
      'Venue': booking.eventVenue,
      'Tickets': booking.ticketCount,
      'Seat Numbers': booking.seatNumbers?.join(', ') || 'N/A',
      'Amount Paid': `₹${booking.amount}`,
      'Payment Status': booking.paymentStatus,
      'Checked In': booking.checkedIn ? 'Yes' : 'No',
      'Booking Date': new Date(booking.createdAt).toLocaleString(),
      'Last Updated': new Date(booking.updatedAt).toLocaleString()
    }))
    
    exportToCSV(exportData, 'bookings-export')
  }

  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter(b => 
      b.attendeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.attendeeDetails.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filter === "checked-in") {
      filtered = filtered.filter(b => b.checkedIn)
    } else if (filter === "pending") {
      filtered = filtered.filter(b => !b.checkedIn)
    }

    return filtered
  }, [bookings, searchQuery, filter])

  const getEventIcon = (category: string) => {
    const cat = category.toUpperCase()
    switch (cat) {
      case "CRICKET": return <Goal className="h-4 w-4" />
      case "FOOTBALL": return <Goal className="h-4 w-4" />
      case "MUSIC": return <Music className="h-4 w-4" />
      case "OPEN MIC": return <Music className="h-4 w-4" />
      case "SPORTS": return <Gamepad2 className="h-4 w-4" />
      default: return <Home className="h-4 w-4" />
    }
  }

  if (authLoading || checkingAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <Zap className="h-12 w-12 text-[#7c3aed] animate-pulse mx-auto" />
        <p className="text-[#7c3aed] font-black uppercase tracking-widest text-sm">LOADING ADMIN PANEL</p>
        <p className="text-zinc-500 text-xs">Verifying credentials...</p>
      </div>
    </div>
  )

  if (!isAdmin) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <Shield className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-black text-white">ACCESS DENIED</h1>
        <p className="text-zinc-500">You don't have permission to access this page</p>
        <Button onClick={() => router.push("/")} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
          Return to Home
        </Button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#7c3aed]/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7c3aed]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c026d3]/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <Navbar />

      <div className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left">
              <Badge className="mb-4 bg-[#7c3aed]/20 text-[#a78bfa] border-[#7c3aed]/30 font-black uppercase text-[8px] tracking-[0.3em] px-4 py-1">
                <Shield className="h-3 w-3 mr-2" /> Admin Dashboard
              </Badge>
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">
                  VYBB <span className="text-[#7c3aed] italic">COMMAND</span>
                </h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={fetchData} 
                  className="rounded-full hover:bg-white/10"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-zinc-500 text-sm mt-2">Welcome back, {user?.email}</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setScannerOpen(true)} 
                className="h-16 rounded-[1.5rem] bg-gradient-to-r from-white to-zinc-200 text-black hover:from-[#7c3aed] hover:to-[#6d28d9] hover:text-white font-black uppercase tracking-widest px-8 transition-all active:scale-95 shadow-2xl"
              >
                <Scan className="h-5 w-5 mr-3" /> Gate Scanner
              </Button>
              {selectedGuests.length > 0 && (
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setBulkCheckInModal(true)} 
                    className="h-16 rounded-[1.5rem] bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-black uppercase px-8 shadow-2xl"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" /> Check In ({selectedGuests.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedGuests([])} 
                    className="h-16 rounded-[1.5rem] border-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: 'TOTAL REVENUE', 
                value: `₹${analytics?.totalRevenue?.toLocaleString() || '0'}`, 
                icon: DollarSign,
              },
              { 
                label: 'CHECKED IN', 
                value: analytics?.checkedInCount || 0, 
                icon: CheckCircle2,
              },
              { 
                label: 'ACTIVE EVENTS', 
                value: analytics?.totalEvents || 0, 
                icon: Zap,
              },
              { 
                label: 'TOTAL TICKETS', 
                value: analytics?.totalTicketsSold || 0, 
                icon: Ticket,
              }
            ].map((item, i) => (
              <Card key={i} className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-zinc-950/80 to-black/80 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-[#7c3aed]/30 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <item.icon className="h-20 w-20 text-[#7c3aed]" />
                </div>
                <div className="relative">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">{item.label}</p>
                  <div className="text-3xl font-black italic tracking-tight uppercase mb-2">{item.value}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="manage-events" className="space-y-10" onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              <TabsTrigger value="manage-events" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed]">
                <Calendar className="h-3 w-3 mr-2" /> Events
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#7c3aed]">
                <Users className="h-3 w-3 mr-2" /> Bookings
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="manage-events">
              <div className="flex justify-between items-center mb-8">
                <div className="text-left">
                  <h2 className="text-2xl font-black italic uppercase">Event Management</h2>
                  <p className="text-zinc-500 text-sm">Create and manage your events</p>
                </div>
                <Button 
                  onClick={() => { setEditingEvent(null); setEventFormOpen(true); }} 
                  className="rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-8 h-12 font-black uppercase text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Event
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950">
                      <Skeleton className="h-48 w-full rounded-2xl mb-6" />
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-1/2" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                  <div 
                    onClick={() => { setEditingEvent(null); setEventFormOpen(true); }} 
                    className="cursor-pointer aspect-video md:aspect-auto rounded-[2.5rem] border-2 border-dashed border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-[#7c3aed]/50 transition-all flex flex-col items-center justify-center p-12 text-center group min-h-[300px] hover:scale-[1.02]"
                  >
                    <div className="relative">
                      <Plus className="h-10 w-10 text-[#7c3aed] group-hover:scale-110 transition-transform" />
                      <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-[#7c3aed] animate-pulse" />
                    </div>
                    <h3 className="mt-4 text-xl font-black italic uppercase">Create New Event</h3>
                    <p className="text-zinc-500 text-sm mt-2">Click to launch new experience</p>
                  </div>
                  
                  {events.map((e) => (
                    <Card key={e.id} className="bg-gradient-to-br from-zinc-950/80 to-black/80 border-white/5 group rounded-[2.5rem] overflow-hidden hover:border-[#7c3aed]/30 transition-all shadow-2xl hover:shadow-[#7c3aed]/20">
                      <div className="relative h-48">
                        <img 
                          src={e.imageUrl} 
                          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" 
                          alt={e.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <Badge className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm border-white/10">
                          {getEventIcon(e.category)}
                          <span className="ml-2 text-xs">{e.category}</span>
                        </Badge>
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none">
                          <Ticket className="h-3 w-3 mr-1" />
                          {eventStats[e.id]?.checkedIn || 0}/{eventStats[e.id]?.totalTickets || 0}
                        </Badge>
                      </div>
                      <div className="p-8 space-y-4">
                        <h3 className="text-xl font-black italic uppercase line-clamp-1">{e.title}</h3>
                        <p className="text-zinc-500 text-sm line-clamp-2">{e.description}</p>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                            <MapPin className="h-3 w-3 text-[#7c3aed]" /> 
                            <span className="truncate">{e.venue}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                            <Calendar className="h-3 w-3 text-[#7c3aed]" /> {e.date} • {e.time}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                              <Users className="h-3 w-3 text-[#7c3aed]" /> {e.availableSeats}/{e.totalSeats} seats
                            </div>
                            <span className="font-bold text-sm italic text-[#a78bfa]">₹{e.price}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="text-xs text-zinc-600">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            ₹{eventStats[e.id]?.revenue?.toLocaleString() || 0}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="icon" 
                              onClick={() => { setEditingEvent(e); setEventFormOpen(true); }} 
                              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-[#7c3aed] transition-all"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              onClick={() => { setEventToDelete(e); setDeleteConfirmOpen(true); }} 
                              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-red-600 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="bg-gradient-to-br from-zinc-950/80 to-black/80 border-white/5 p-4 sm:p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="text-left">
                    <h2 className="text-2xl font-black italic uppercase">Guest Registry</h2>
                    <p className="text-zinc-500 text-sm">Manage and verify guest entries</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                        className={`rounded-xl ${filter === "all" ? 'bg-[#7c3aed]' : ''}`}
                      >
                        All
                      </Button>
                      <Button
                        variant={filter === "pending" ? "default" : "outline"}
                        onClick={() => setFilter("pending")}
                        className={`rounded-xl ${filter === "pending" ? 'bg-[#7c3aed]' : ''}`}
                      >
                        <Clock className="h-3 w-3 mr-2" /> Pending
                      </Button>
                      <Button
                        variant={filter === "checked-in" ? "default" : "outline"}
                        onClick={() => setFilter("checked-in")}
                        className={`rounded-xl ${filter === "checked-in" ? 'bg-[#7c3aed]' : ''}`}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-2" /> Checked In
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleExport}
                      className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>

                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH GUEST NAME, EMAIL, OR BOOKING ID..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl font-bold uppercase text-sm"
                  />
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-20">
                    <Search className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-zinc-600 mb-2">No bookings found</h3>
                    <p className="text-zinc-500">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/5">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left p-4 text-xs font-black uppercase tracking-widest text-zinc-500">
                            <input 
                              type="checkbox" 
                              className="rounded border-white/10 bg-white/5"
                              checked={selectedGuests.length === filteredBookings.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGuests(filteredBookings.map(b => b.id))
                                } else {
                                  setSelectedGuests([])
                                }
                              }}
                            />
                          </th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-widest text-zinc-500">Guest</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-widest text-zinc-500">Event</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-widest text-zinc-500">Details</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-widest text-zinc-500">Amount</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-widest text-zinc-500">Status</th>
                          <th className="text-left p-4 text-xs font-black uppercase tracking-widest text-zinc-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((guest) => (
                          <tr 
                            key={guest.id} 
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="p-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-white/10 bg-white/5"
                                checked={selectedGuests.includes(guest.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGuests([...selectedGuests, guest.id])
                                  } else {
                                    setSelectedGuests(selectedGuests.filter(id => id !== guest.id))
                                  }
                                }}
                                disabled={guest.checkedIn}
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7c3aed]/20 to-[#6d28d9]/20 flex items-center justify-center">
                                  <User className="h-5 w-5 text-[#a78bfa]" />
                                </div>
                                <div>
                                  <div className="font-bold text-white">{guest.attendeeDetails.name}</div>
                                  <div className="text-xs text-zinc-500">{guest.attendeeDetails.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-white">{guest.eventTitle}</div>
                              <div className="text-xs text-zinc-500">{guest.eventDate}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-white">
                                {guest.ticketCount} ticket{guest.ticketCount > 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-zinc-500">
                                Seats: {guest.seatNumbers?.join(', ') || 'N/A'}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-white">₹{guest.amount}</div>
                              <Badge className={`text-xs mt-1 ${guest.paymentStatus === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {guest.paymentStatus}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={`${guest.checkedIn ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} border-none`}>
                                {guest.checkedIn ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Checked In
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" /> Pending
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {!guest.checkedIn && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const toastId = toast.loading("Checking in guest...")
                                      checkInBooking(guest.id, user?.email || "admin")
                                        .then(() => {
                                          toast.success("Guest checked in successfully", { id: toastId })
                                          fetchData()
                                        })
                                        .catch(() => {
                                          toast.error("Failed to check in guest", { id: toastId })
                                        })
                                    }}
                                    className="rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-xs h-8 px-3"
                                  >
                                    Check In
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(guest.id)
                                    toast.success("Booking ID copied to clipboard")
                                  }}
                                  className="rounded-lg border-white/10 text-xs h-8 px-3"
                                >
                                  Copy ID
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/5">
                  <div className="text-sm text-zinc-500">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                  </div>
                  <div className="text-sm font-medium text-white">
                    Selected: {selectedGuests.length} guest{selectedGuests.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
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
      
      <BulkCheckInModal
        isOpen={bulkCheckInModal}
        onClose={() => setBulkCheckInModal(false)}
        onConfirm={handleBatchCheckIn}
        count={selectedGuests.length}
      />
      
      <QRScanner isOpen={scannerOpen} onScan={handleQRScan} onClose={() => setScannerOpen(false)} />
    </main>
  )
}

// Event Form Modal
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
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-4xl bg-gradient-to-br from-zinc-950 to-black border border-white/10 rounded-[3rem] p-8 sm:p-12 shadow-2xl my-8"
      >
        <div className="flex justify-between items-start mb-10 text-left">
          <div>
            <h2 className="text-4xl font-black italic uppercase leading-none mb-2">
              {initialData ? "Edit Event" : "Create Event"}
            </h2>
            <p className="text-[10px] font-black uppercase text-zinc-500 italic">
              {initialData ? "Update event details" : "Create a new experience"}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full hover:bg-white/5">
            <X />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#7c3aed]" /> Event Title *
                </label>
                <Input 
                  required 
                  value={formData.title || ""} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-[#7c3aed]" /> Description *
                </label>
                <textarea 
                  required 
                  value={formData.description || ""} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[#7c3aed] focus:outline-none resize-none" 
                  placeholder="Describe your event..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#7c3aed]" /> Image URL *
                </label>
                <Input 
                  required
                  value={formData.imageUrl || ""} 
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Date *</label>
                  <Input 
                    required 
                    type="date" 
                    value={formData.date || ""} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Time *</label>
                  <Input 
                    required 
                    value={formData.time || ""} 
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                    placeholder="7:00 PM - 10:00 PM"
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#7c3aed]" /> Venue Name *
                </label>
                <Input 
                  required 
                  value={formData.venue || ""} 
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })} 
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-medium uppercase" 
                  placeholder="Venue name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#7c3aed]" /> Address *
                </label>
                <textarea 
                  required 
                  value={formData.address || ""} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[#7c3aed] focus:outline-none resize-none" 
                  placeholder="Full address..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Latitude *</label>
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
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Longitude *</label>
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
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Category *</label>
                  <select 
                    value={formData.category || ""} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-[#7c3aed] focus:outline-none"
                  >
                    <option value="OPEN MIC">OPEN MIC</option>
                    <option value="CRICKET">CRICKET</option>
                    <option value="FOOTBALL">FOOTBALL</option>
                    <option value="MUSIC">MUSIC</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="COMEDY">COMEDY</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Price (₹) *</label>
                  <Input 
                    required 
                    type="number" 
                    min="0"
                    value={isNaN(formData.price) ? "" : formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} 
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Total Seats *</label>
                  <Input 
                    required 
                    type="number" 
                    min="1"
                    value={isNaN(formData.totalSeats) ? "" : formData.totalSeats} 
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      totalSeats: parseInt(e.target.value) || 0,
                      availableSeats: parseInt(e.target.value) || 0 
                    })} 
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Available Seats</label>
                  <Input 
                    type="number" 
                    min="0"
                    max={formData.totalSeats}
                    value={isNaN(formData.availableSeats) ? "" : formData.availableSeats} 
                    onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) || 0 })} 
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 rounded-2xl h-14 font-black uppercase text-sm border border-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-2xl h-14 font-black uppercase text-sm shadow-xl hover:shadow-[#7c3aed]/30"
            >
              {initialData ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({ isOpen, onClose, onConfirm, eventTitle }: any) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="max-w-md bg-gradient-to-br from-zinc-950 to-black border border-red-500/20 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl"
      >
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <Trash2 className="h-8 w-8 text-red-500 animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black italic uppercase text-white">Delete Event?</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Are you sure you want to delete <span className="text-white font-bold">"{eventTitle}"</span>?
            This action cannot be undone and will remove all associated bookings.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-1 h-14 rounded-2xl font-black text-sm border border-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 h-14 rounded-2xl font-black text-sm hover:from-red-700 hover:to-red-800"
          >
            Delete Event
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Bulk Check-in Modal
function BulkCheckInModal({ isOpen, onClose, onConfirm, count }: any) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="max-w-md bg-gradient-to-br from-zinc-950 to-black border border-[#7c3aed]/20 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl"
      >
        <div className="mx-auto w-16 h-16 bg-[#7c3aed]/10 rounded-full flex items-center justify-center border border-[#7c3aed]/20">
          <CheckCircle2 className="h-8 w-8 text-[#7c3aed] animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black italic uppercase text-white">Bulk Check-in</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            You are about to check in <span className="text-white font-bold">{count}</span> guest{count !== 1 ? 's' : ''}.
            This will mark all selected tickets as checked in.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-1 h-14 rounded-2xl font-black text-sm border border-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] h-14 rounded-2xl font-black text-sm hover:from-[#6d28d9] hover:to-[#5b21b6]"
          >
            Check In {count} Guest{count !== 1 ? 's' : ''}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}