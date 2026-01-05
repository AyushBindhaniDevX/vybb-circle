// components/seat-selector.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Ticket, AlertCircle, Table, X, Chair } from "lucide-react"
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
        alert(`Maximum ${maxSelection} seats per booking. Please deselect a seat first.`)
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
      <div key={tableId} className="relative h-48 w-48">
        {/* Table Top */}
        <div className="absolute inset-0">
          {/* Table shadow */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-zinc-800 to-black shadow-lg" />
          
          {/* Table top surface */}
          <div className="absolute inset-2 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600/50 shadow-inner" />
          
          {/* Table edge (3D effect) */}
          <div className="absolute -inset-0.5 rounded-xl border border-zinc-500/20" />
          
          {/* Table number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {tableId}
            </div>
          </div>
        </div>

        {/* Seats around the table */}
        {tableSeats.map((seat) => (
          <div
            key={seat.id}
            className={`absolute ${getSeatPositionStyle(seat.position)}`}
          >
            <button
              onClick={() => handleSeatClick(seat.id, seat.isAvailable)}
              disabled={!seat.isAvailable}
              className={cn(
                "relative group transition-all duration-200",
                !seat.isAvailable && "opacity-50 cursor-not-allowed",
                seat.isSelected && "scale-105"
              )}
            >
              {/* Seat base */}
              <div className={cn(
                "relative h-12 w-12 rounded-full flex items-center justify-center transform transition-all duration-200",
                "border shadow-md",
                seat.isSelected
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 border-violet-400 scale-105 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  : seat.isAvailable
                    ? "bg-gradient-to-br from-zinc-700 to-zinc-800 border-zinc-600 hover:border-violet-500 hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    : "bg-gradient-to-br from-zinc-800 to-black border-zinc-700"
              )}>
                {/* Seat back */}
                <div className={cn(
                  "absolute h-6 w-4 rounded-sm transform rotate-90 transition-all",
                  "border border-t-0",
                  seat.isSelected
                    ? "bg-violet-700 border-violet-600 -translate-y-3"
                    : seat.isAvailable
                      ? "bg-zinc-600 border-zinc-500 -translate-y-2.5 group-hover:-translate-y-3"
                      : "bg-zinc-700 border-zinc-600 -translate-y-2.5"
                )} />
                
                {/* Seat label */}
                <span className={cn(
                  "text-xs font-bold z-10",
                  seat.isSelected
                    ? "text-white"
                    : seat.isAvailable
                      ? "text-zinc-300 group-hover:text-white"
                      : "text-zinc-500"
                )}>
                  {seat.label.split('-')[1]}
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Venue Layout Container */}
      <div className="relative rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-4 overflow-hidden">
        {/* Stage Area */}
        <div className="relative mb-8">
          <div className="h-2 w-full max-w-md mx-auto rounded-full bg-gradient-to-r from-violet-500/30 to-purple-500/30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full">
            <span className="text-xs font-bold text-white tracking-widest">STAGE</span>
          </div>
          <div className="mt-1 text-center">
            <span className="text-xs text-zinc-500 font-medium">Performance Area</span>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-6 p-4">
          <div className="space-y-8">
            {renderTable(1)}
            {renderTable(2)}
          </div>
          <div className="space-y-8">
            {renderTable(3)}
            {renderTable(4)}
          </div>
        </div>

        {/* Entry/Exit markers */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs text-zinc-500">
          <div className="h-2 w-4 bg-gradient-to-r from-green-500/40 to-green-400/50 rounded-sm" />
          <span>Entry</span>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-zinc-500">
          <span>Exit</span>
          <div className="h-2 w-4 bg-gradient-to-r from-red-500/40 to-red-400/50 rounded-sm" />
        </div>
      </div>

      {/* Compact Seat Legend */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center p-2 rounded-lg border border-white/5 bg-white/5">
          <div className="relative mb-1">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600" />
            <div className="absolute h-3 w-2 -top-0.5 left-1/2 -translate-x-1/2 rounded-sm bg-zinc-600 border border-zinc-500" />
          </div>
          <span className="text-xs">Available</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg border border-white/5 bg-white/5">
          <div className="relative mb-1">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 border border-violet-400" />
            <div className="absolute h-3 w-2 -top-1 left-1/2 -translate-x-1/2 rounded-sm bg-violet-700 border border-violet-600" />
          </div>
          <span className="text-xs">Selected</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg border border-white/5 bg-white/5">
          <div className="relative mb-1">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 opacity-50" />
            <div className="absolute h-3 w-2 -top-0.5 left-1/2 -translate-x-1/2 rounded-sm bg-zinc-700 border border-zinc-600 opacity-50" />
          </div>
          <span className="text-xs">Booked</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg border border-white/5 bg-white/5">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center mb-1">
            <span className="text-xs font-bold text-white">T</span>
          </div>
          <span className="text-xs">Table</span>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Your Selection</h3>
              <p className="text-xs text-zinc-500">
                {selectedSeats.length} of {maxSelection} seats
              </p>
            </div>
          </div>
          
          {selectedSeats.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-zinc-500 hover:text-white hover:bg-white/5"
              onClick={clearSelection}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {selectedSeats.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-white/10 rounded-lg">
            <AlertCircle className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">Select seats from the layout</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected seats display */}
            <div className="grid grid-cols-4 gap-2">
              {selectedSeats.map(seatId => {
                const seat = seats.find(s => s.id === seatId)
                return (
                  <div
                    key={seatId}
                    className="relative p-2 rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-violet-800/10"
                  >
                    <div className="absolute top-1 right-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full bg-white/10 hover:bg-white/20"
                        onClick={() => handleSeatClick(seatId, true)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs font-medium">{seat?.label}</div>
                      <div className="text-[10px] text-violet-300">Table {seat?.tableId}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Price breakdown */}
            <div className="rounded-lg border border-white/5 bg-black/50 p-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Seat Price</span>
                  <span>₹{pricePerSeat}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Quantity</span>
                  <span>{selectedSeats.length} seats</span>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg text-violet-400">₹{pricePerSeat * selectedSeats.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{availableSeats} seats available</span>
            </div>
            <span>Max {maxSelection} per booking</span>
          </div>
        </div>
      </div>
    </div>
  )
}