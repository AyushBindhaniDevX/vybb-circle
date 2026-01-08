"use client"

import { QRCodeSVG } from 'qrcode.react'
import { Calendar, MapPin, Users, Ticket, Zap, User } from 'lucide-react'
import { motion } from "framer-motion"

export function TicketView({ booking, event }: any) {
  // CRITICAL FIX: The Python Kiosk expects only the booking.id string
  // Do NOT use JSON.stringify here if your Python script uses the raw data as a doc ID.
  const qrData = booking.id

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl">
        
        {/* Background Reveal Logic */}
        <div className="absolute inset-0 z-0 opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000">
           <img src={event.imageUrl} className="h-full w-full object-cover" alt="" />
           <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10">
          {/* Header Section */}
          <div className="p-8 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Zap className="h-6 w-6 text-white fill-current" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black italic tracking-tighter uppercase">Vybb Access</h2>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Tier 01 // Digital Pass</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1">Pass Hash</span>
              <span className="font-mono text-[10px] text-violet-400">#{booking.id.substring(0, 8)}</span>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-10">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1 space-y-8 text-left w-full">
                <div>
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-3 group-hover:text-violet-400 transition-colors">
                    {event.title}
                  </h1>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User className="h-3 w-3 text-violet-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        Guest: {booking.attendeeDetails?.name || "Verified Attendee"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                   <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1.5"><Calendar className="h-3 w-3" /> DATE</span>
                      <p className="text-sm font-bold tracking-tight">{event.date}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1.5"><MapPin className="h-3 w-3" /> LOCATION</span>
                      <p className="text-sm font-bold tracking-tight line-clamp-1">{event.venue}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1.5"><Users className="h-3 w-3" /> SEATS</span>
                      <p className="text-sm font-bold tracking-tight">{booking.seatNumbers?.join(", ") || "General"}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-1.5"><Ticket className="h-3 w-3" /> ADMIT</span>
                      <p className="text-sm font-bold tracking-tight">{booking.seatNumbers?.length || 1} Guest(s)</p>
                   </div>
                </div>
              </div>

              {/* QR Code Container */}
              {/* Note: BG-White is essential for pyzbar (Python) to detect edges correctly */}
              <div className="p-4 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(124,58,237,0.2)] transition-transform group-hover:scale-105 duration-500">
                <QRCodeSVG 
                    value={qrData} 
                    size={160} 
                    level="H" 
                    bgColor="#ffffff" 
                    fgColor="#000000" 
                    marginSize={0}
                />
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="px-10 py-6 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Official Entry Pass</span>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">Powered by Vybb Circle</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
