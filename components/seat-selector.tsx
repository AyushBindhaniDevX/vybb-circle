// components/seat-selector.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, Ticket, AlertCircle, X, Armchair } from "lucide-react"
import { cn } from "@/lib/utils"

interface SeatSelectorProps {
  totalSeats: number
  availableSeats: number
  pricePerSeat: number
  onSelectionChange: (selectedSeats: string[]) => void
  maxSelection?: number
}

interface Seat {
  id: string
  tableId: number
  position: "north" | "south" | "east" | "west"
  isAvailable: boolean
  isSelected: boolean
  label: string
}

export function SeatSelector({
  totalSeats,
  availableSeats,
  pricePerSeat,
  onSelectionChange,
  maxSelection = 4
}: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  // Create 4 tables with 4 seats each (total 16 seats)
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = []
    const positions: Array<"north" | "south" | "east" | "west"> = ["north", "south", "east", "west"]
    
    for (let tableId = 1; tableId <= 4; tableId++) {
      positions.forEach((position, index) => {
        const seatId = `T${tableId}-${position.charAt(0).toUpperCase()}`
        const seatNumber = (tableId - 1) * 4 + index + 1
        // Simulation of availability based on provided availableSeats prop
        const isAvailable = seatNumber <= availableSeats
        
        seats.push({
          id: seatId,
          tableId,
          position,
          isAvailable,
          isSelected: selectedSeats.includes(seatId),
          label: seatId
        })
      })
    }
    
    return seats
  }

  const seats = generateSeats()

  const handleSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      } else if (prev.length < maxSelection) {
        return [...prev, seatId]
      } else {
        return prev
      }
    })
  }

  useEffect(() => {
    onSelectionChange(selectedSeats)
  }, [selectedSeats, onSelectionChange])

  const clearSelection = () => {
    setSelectedSeats([])
  }

  const getSeatPositionStyle = (position: string) => {
    switch (position) {
      case "north":
        return "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-0"
      case "south":
        return "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-180"
      case "east":
        return "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-90"
      case "west":
        return "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 -rotate-90"
      default:
        return ""
    }
  }

  const renderTable = (tableId: number) => {
    const tableSeats = seats.filter(seat => seat.tableId === tableId)

    return (
      <div key={tableId} className="relative h-40 w-40 sm:h-48 sm:w-48 mx-auto">
        {/* Table Top */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 rounded-2xl bg-zinc-800/30 border border-white/5 shadow-xl" />
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center">
             <span className="text-zinc-500 font-bold text-[10px] tracking-widest">TABLE {tableId}</span>
          </div>
        </div>

        {/* Seats around the table */}
        {tableSeats.map((seat) => (
          <div key={seat.id} className={`absolute ${getSeatPositionStyle(seat.position)}`}>
            <button
              type="button"
              onClick={() => handleSeatClick(seat.id, seat.isAvailable)}
              disabled={!seat.isAvailable}
              className={cn(
                "relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all active:scale-75",
                seat.isSelected 
                  ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border-violet-400" 
                  : seat.isAvailable 
                    ? "bg-zinc-900 border border-white/10 text-zinc-400 hover:border-violet-500/50" 
                    : "bg-zinc-950 text-zinc-700 border-transparent opacity-40 cursor-not-allowed"
              )}
            >
              <Armchair className={cn("h-5 w-5", seat.isSelected ? "animate-pulse" : "")} />
              <span className="absolute -bottom-1 right-0 text-[8px] font-bold bg-black/50 px-1 rounded">
                {seat.label.split('-')[1]}
              </span>
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Venue Layout Container */}
      <div className="rounded-3xl border border-white/5 bg-zinc-950/50 p-6 sm:p-10">
        {/* Stage Area */}
        <div className="mb-12 text-center">
          <div className="h-1.5 w-32 mx-auto bg-gradient-to-r from-transparent via-violet-500/50 to-transparent rounded-full mb-3" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">Stage Area</span>
        </div>

        {/* Tables Grid - 1 column on mobile, 2 on desktop */}
        <div className="grid grid-cols-1 gap-y-20 gap-x-8 sm:grid-cols-2 lg:gap-x-12">
          {renderTable(1)}
          {renderTable(2)}
          {renderTable(3)}
          {renderTable(4)}
        </div>
      </div>

      {/* Selection Summary Card */}
      <div className="rounded-2xl bg-zinc-900/40 border border-white/10 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                <Ticket className="h-4 w-4" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white">Selected Seats</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{selectedSeats.length} of {maxSelection} Max</p>
            </div>
          </div>
          {selectedSeats.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5"
              onClick={clearSelection}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {selectedSeats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 border border-dashed border-white/5 rounded-xl bg-black/20">
            <AlertCircle className="h-6 w-6 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-500">Tap a seat above to select</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map(id => (
                <div 
                    key={id} 
                    className="group bg-violet-500/10 border border-violet-500/20 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-semibold text-violet-300 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  {id}
                  <button 
                    onClick={() => handleSeatClick(id, true)}
                    className="h-5 w-5 rounded-full bg-violet-500/20 flex items-center justify-center hover:bg-violet-500/40 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Users className="h-3 w-3" />
                    <span>{availableSeats} seats total available</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block uppercase">Subtotal</span>
                    <span className="text-lg font-bold text-white">₹{pricePerSeat * selectedSeats.length}</span>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}