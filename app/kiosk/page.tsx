"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { QRScanner } from "@/components/qr-scanner"
import {
  getBookingById,
  checkInBooking,
  type Booking
} from "@/lib/db-utils"
import {
  Scan,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  User,
  Calendar,
  MapPin,
  Ticket,
  Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function KioskPage() {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error" | "already-checked">("idle")
  const [message, setMessage] = useState("")

  const handleScan = async (data: string) => {
    setScannerOpen(false)
    await processCheckIn(data)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    await processCheckIn(searchQuery)
  }

  const processCheckIn = async (bookingId: string) => {
    setLoading(true)
    setStatus("idle")
    setMessage("")
    setBooking(null)

    try {
      // Fetch booking
      const bookingData = await getBookingById(bookingId)

      if (!bookingData) {
        setStatus("error")
        setMessage("Booking not found")
        setLoading(false)
        return
      }

      setBooking(bookingData)

      // Check if already checked in
      if (bookingData.checkedIn) {
        setStatus("already-checked")
        setMessage("Already checked in")
        setLoading(false)
        return
      }

      // Check if payment is completed
      if (bookingData.paymentStatus !== "completed") {
        setStatus("error")
        setMessage("Payment not completed")
        setLoading(false)
        return
      }

      // Perform check-in
      await checkInBooking(bookingId, "kiosk-checkin")
      
      setStatus("success")
      setMessage("Check-in successful!")
      
      // Auto-reset after 5 seconds
      setTimeout(reset, 5000)

    } catch (error) {
      console.error("Check-in error:", error)
      setStatus("error")
      setMessage("Check-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setBooking(null)
    setStatus("idle")
    setMessage("")
    setSearchQuery("")
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-12 w-12 text-violet-500" />
              <h1 className="text-6xl font-black uppercase tracking-tighter">
                VYBB <span className="text-violet-500">KIOSK</span>
              </h1>
            </div>
            <p className="text-zinc-400 text-sm uppercase tracking-[0.3em] font-black">
              Self Check-In Terminal
            </p>
          </motion.div>

          {/* Status Display */}
          <AnimatePresence mode="wait">
            {status !== "idle" && booking && (
              <motion.div
                key={status}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center"
              >
                <Card className={`p-8 space-y-6 ${
                  status === "success" 
                    ? "bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30"
                    : status === "already-checked"
                    ? "bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30"
                    : "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30"
                }`}>
                  {/* Icon */}
                  <div className="flex justify-center">
                    {status === "success" ? (
                      <div className="p-6 bg-green-500/20 rounded-full">
                        <CheckCircle2 className="h-16 w-16 text-green-400" />
                      </div>
                    ) : status === "already-checked" ? (
                      <div className="p-6 bg-orange-500/20 rounded-full">
                        <Clock className="h-16 w-16 text-orange-400" />
                      </div>
                    ) : (
                      <div className="p-6 bg-red-500/20 rounded-full">
                        <XCircle className="h-16 w-16 text-red-400" />
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <h2 className={`text-4xl font-black uppercase tracking-tight ${
                      status === "success" 
                        ? "text-green-400"
                        : status === "already-checked"
                        ? "text-orange-400"
                        : "text-red-400"
                    }`}>
                      {message}
                    </h2>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-1">Guest</p>
                        <p className="text-lg font-bold">{booking.attendeeDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-1">Event</p>
                        <p className="text-lg font-bold">{booking.eventTitle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-1">Seats</p>
                        <div className="flex gap-1 flex-wrap">
                          {booking.seatNumbers.map(seat => (
                            <Badge key={seat} variant="outline" className="text-xs">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-1">Tickets</p>
                        <p className="text-lg font-bold">{booking.ticketCount}</p>
                      </div>
                    </div>

                    {status === "already-checked" && booking.checkedInAt && (
                      <div className="text-sm text-orange-300 bg-orange-500/10 p-3 rounded-lg">
                        Checked in at: {new Date(booking.checkedInAt.toDate()).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={reset}
                    size="lg"
                    className="w-full bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest"
                  >
                    Next Guest
                  </Button>
                </Card>
              </motion.div>
            )}

            {status === "error" && !booking && (
              <motion.div
                key="error-no-booking"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30 p-8 space-y-6">
                  <div className="p-6 bg-red-500/20 rounded-full inline-block">
                    <XCircle className="h-16 w-16 text-red-400" />
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tight text-red-400">
                    {message}
                  </h2>
                  <Button
                    onClick={reset}
                    size="lg"
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest"
                  >
                    Try Again
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Methods */}
          {status === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Scan Button */}
              <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all cursor-pointer" onClick={() => setScannerOpen(true)}>
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-violet-500/20 rounded-full">
                    <Scan className="h-12 w-12 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Scan QR Code</h3>
                    <p className="text-sm text-zinc-400 uppercase tracking-widest font-black">
                      Quick & Easy Check-In
                    </p>
                  </div>
                </div>
              </Card>

              {/* Manual Entry */}
              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <Input
                      placeholder="Enter Booking ID"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-12 h-14 bg-black/50 border-white/10 text-lg font-bold"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    size="lg"
                    className="h-14 px-8 bg-violet-600 hover:bg-violet-700 font-black uppercase tracking-widest"
                  >
                    {loading ? "Processing..." : "Check In"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-2"
          >
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-black">
              Need Help? Contact staff member
            </p>
          </motion.div>

        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={scannerOpen}
        onScan={handleScan}
        onClose={() => setScannerOpen(false)}
      />
    </main>
  )
}
