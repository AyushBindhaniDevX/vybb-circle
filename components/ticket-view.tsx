// components/ticket-view.tsx
"use client"

import { QRCodeSVG } from 'qrcode.react'
import { Calendar, MapPin, Users, Ticket } from 'lucide-react'

interface TicketViewProps {
  booking: any
  event: any
}

export function TicketView({ booking, event }: TicketViewProps) {
  const qrData = JSON.stringify({
    bookingId: booking.id,
    userId: booking.userId,
    eventId: booking.eventId,
    paymentId: booking.paymentId,
    timestamp: new Date().toISOString(),
  })

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Ticket Design */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-950 to-black">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-600/5" />
        
        {/* Perforated Edge Effect */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-64 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Header */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Vybb Live Ticket</h2>
                <p className="text-sm text-zinc-400">Digital Admission Pass</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Booking ID</div>
              <div className="font-mono text-sm">{booking.id.substring(0, 12)}...</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-zinc-400">{event.description.substring(0, 100)}...</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Date & Time</p>
                    <p className="font-medium">{formatDate(event.date)} • {event.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Venue</p>
                    <p className="font-medium">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Seats</p>
                    <p className="font-medium">{booking.seatNumbers.length} seat(s)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Ticket Price</p>
                    <p className="font-medium">₹{booking.ticketPrice} each</p>
                  </div>
                </div>
              </div>

              {/* Seat Details */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-zinc-500 mb-2">Selected Seats</p>
                <div className="flex flex-wrap gap-2">
                  {booking.seatNumbers.map((seat: string, index: number) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20"
                    >
                      <span className="font-medium">{seat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendee Info */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-zinc-500 mb-2">Attendee Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Name</p>
                    <p className="font-medium">{booking.attendeeDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="font-medium">{booking.attendeeDetails.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-zinc-500">Phone</p>
                    <p className="font-medium">{booking.attendeeDetails.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-2xl shadow-2xl">
                  <QRCodeSVG
                    value={qrData}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                
                {/* Scan Label */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-zinc-400 mb-1">Scan at entry</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs text-zinc-500">Valid for admission</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-500">
              <p>Present this digital ticket at the venue for entry</p>
              <p className="text-xs mt-1">Valid only for {formatDate(event.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">Total Amount</p>
              <p className="text-xl font-bold text-green-400">₹{booking.amount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 rounded-2xl border border-white/10 bg-zinc-950/50">
        <h3 className="font-bold text-lg mb-3">Entry Instructions</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            <span>Arrive 15 minutes before the event starts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            <span>Show this digital ticket QR code at the entrance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            <span>Carry a valid government-issued photo ID</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            <span>No outside food or drinks allowed</span>
          </li>
        </ul>
      </div>
    </div>
  )
}