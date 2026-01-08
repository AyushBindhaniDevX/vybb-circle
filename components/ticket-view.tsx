"use client"

import { QRCodeSVG } from 'qrcode.react'
import { Calendar, MapPin, Users, Ticket, Zap, User, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

export function TicketView({ booking, event }: any) {
  const qrData = booking.id
  const isRedeemed = booking.checked_in === true

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      {/* REDEEMED WATERMARK OVERLAY */}
      <AnimatePresence>
        {isRedeemed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[4px] rounded-[2.5rem] pointer-events-none"
          >
            <div className="border-4 border-red-500 px-8 py-4 rounded-xl rotate-[-12deg] bg-black/90 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col items-center">
              <h2 className="text-5xl font-black text-red-500 italic uppercase tracking-tighter">REDEEMED</h2>
              <p className="text-white text-[10px] font-black mt-1 uppercase tracking-[0.2em]">Validated at Gate</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl transition-all duration-700 ${isRedeemed ? 'grayscale opacity-50' : ''}`}>
        
        {/* Event Background Image */}
        <div className="absolute inset-0 z-0 opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000">
           <img src={event.imageUrl} className="h-full w-full object-cover" alt="" />
           <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-black italic uppercase">Vybb Access</h2>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Tier 01 // Digital Pass</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black uppercase text-zinc-600 tracking-widest">Pass Hash</span>
              <span className="font-mono text-[10px] text-violet-400">#{booking.id.substring(0, 8)}</span>
            </div>
          </div>

          <div className="p-10">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1 space-y-8 text-left w-full">
                <div>
                  <h1 className="text-4xl font-black italic uppercase leading-none mb-3 group-hover:text-violet-400 transition-colors">
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
                      <span className="text-[8px] font-black text-zinc-500 tracking-widest uppercase">Date</span>
                      <p className="text-sm font-bold">{event.date}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-zinc-500 tracking-widest uppercase">Location</span>
                      <p className="text-sm font-bold line-clamp-1">{event.venue}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-zinc-500 tracking-widest uppercase">Seats</span>
                      <p className="text-sm font-bold">{booking.seatNumbers?.join(", ")}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-zinc-500 tracking-widest uppercase">Admit</span>
                      <p className="text-sm font-bold">{booking.seatNumbers?.length} Guest(s)</p>
                   </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-[2rem] shadow-2xl">
                <QRCodeSVG 
                    value={qrData} 
                    size={160} 
                    level="H" 
                    bgColor="#ffffff" 
                    fgColor="#000000" 
                />
              </div>
            </div>
          </div>

          {/* Footer Status */}
          <div className="px-10 py-6 border-t border-white/5 bg-zinc-900/40 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isRedeemed ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                  {isRedeemed ? 'REDEEMED' : 'Verified Admission'}
                </span>
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
