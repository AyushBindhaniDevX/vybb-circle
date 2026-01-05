"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Ticket, Armchair, Trophy, Shirt, X, AlertCircle, 
  Music, Mic, Goal, Gamepad2, Drum, Guitar, Activity, Sparkles, Zap,
  Crown, Star, Target, Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SeatSelectorProps {
  category: string
  totalSeats: number
  availableSeats: number
  pricePerSeat: number
  onSelectionChange: (selectedSeats: string[]) => void
  maxSelection?: number
}

// 3D Chair Component with Animation
const AnimatedChair = ({ isSelected = false, isAvailable = true, delay = 0 }) => {
  return (
    <div className="relative">
      {/* Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl transition-all duration-500",
        isSelected 
          ? "bg-violet-500/30 blur-xl scale-110" 
          : isAvailable 
            ? "group-hover:bg-violet-500/10 group-hover:blur-md group-hover:scale-105" 
            : "opacity-0"
      )} />
      
      {/* Chair Body */}
      <div className={cn(
        "relative h-12 w-12 rounded-xl border-2 transition-all duration-500 transform-gpu",
        isSelected 
          ? "bg-gradient-to-br from-violet-600 to-purple-700 border-violet-400 shadow-2xl shadow-violet-500/50 rotate-[-5deg] scale-110" 
          : isAvailable 
            ? "bg-gradient-to-br from-zinc-900 to-black border-white/20 group-hover:border-violet-400 group-hover:scale-105 group-hover:rotate-[2deg] group-hover:shadow-lg" 
            : "bg-gradient-to-br from-zinc-950 to-black border-white/10 opacity-40"
      )} 
      style={{ animationDelay: `${delay}ms` }}
      >
        {/* Chair Back */}
        <div className={cn(
          "absolute -top-1 left-1/2 -translate-x-1/2 h-3 w-6 rounded-t-lg border-2 transition-all duration-500",
          isSelected 
            ? "bg-gradient-to-b from-violet-500 to-violet-600 border-violet-400" 
            : isAvailable 
              ? "bg-gradient-to-b from-zinc-800 to-black border-white/20" 
              : "bg-gradient-to-b from-zinc-900 to-black border-white/10"
        )} />
        
        {/* Seat Cushion */}
        <div className={cn(
          "absolute top-2 left-1/2 -translate-x-1/2 h-3 w-8 rounded-sm transition-all duration-500",
          isSelected 
            ? "bg-gradient-to-r from-violet-400 to-purple-500" 
            : isAvailable 
              ? "bg-gradient-to-r from-zinc-700 to-zinc-800" 
              : "bg-gradient-to-r from-zinc-800 to-zinc-900"
        )} />
        
        {/* Legs */}
        <div className="absolute -bottom-1 left-2 h-1 w-1.5 rounded-b bg-gradient-to-t from-zinc-800 to-zinc-900" />
        <div className="absolute -bottom-1 right-2 h-1 w-1.5 rounded-b bg-gradient-to-t from-zinc-800 to-zinc-900" />
        
        {/* Sparkle Effect */}
        {isSelected && (
          <>
            <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-violet-300 animate-ping" />
            <Sparkles className="absolute -bottom-2 -left-2 h-2 w-2 text-violet-400 animate-pulse delay-300" />
          </>
        )}
      </div>
    </div>
  )
}

// Animated Jersey Component
const AnimatedJersey = ({ number, isSelected = false, isAvailable = true }) => {
  return (
    <div className="relative">
      {/* Jersey Glow */}
      <div className={cn(
        "absolute inset-0 rounded-xl transition-all duration-500",
        isSelected 
          ? "bg-yellow-500/30 blur-xl scale-110" 
          : isAvailable 
            ? "group-hover:bg-yellow-500/10 group-hover:blur-md" 
            : "opacity-0"
      )} />
      
      {/* Jersey Body */}
      <div className={cn(
        "relative h-14 w-14 rounded-xl border-2 transition-all duration-500 transform-gpu overflow-hidden group",
        isSelected 
          ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border-yellow-400 shadow-2xl shadow-yellow-500/40 scale-110" 
          : isAvailable 
            ? "bg-gradient-to-br from-zinc-900 to-black border-white/20 group-hover:border-yellow-400 group-hover:scale-105" 
            : "bg-gradient-to-br from-zinc-950 to-black border-white/10 opacity-40"
      )}>
        {/* Jersey Stripe */}
        <div className={cn(
          "absolute top-1/2 left-0 right-0 h-1.5 transition-all duration-500",
          isSelected 
            ? "bg-gradient-to-r from-yellow-400 to-amber-500" 
            : isAvailable 
              ? "bg-gradient-to-r from-zinc-700 to-zinc-800" 
              : "bg-gradient-to-r from-zinc-800 to-zinc-900"
        )} />
        
        {/* Jersey Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-black text-lg transition-all duration-500",
            isSelected 
              ? "text-white drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" 
              : isAvailable 
                ? "text-zinc-400 group-hover:text-yellow-300" 
                : "text-zinc-700"
          )}>
            {number}
          </span>
        </div>
        
        {/* Jersey Details */}
        <div className={cn(
          "absolute top-2 left-1/2 -translate-x-1/2 h-2 w-4 rounded-sm transition-all duration-500",
          isSelected 
            ? "bg-gradient-to-r from-yellow-400 to-amber-500" 
            : isAvailable 
              ? "bg-gradient-to-r from-zinc-700 to-zinc-800" 
              : "bg-gradient-to-r from-zinc-800 to-zinc-900"
        )} />
        
        {/* Sparkle Effects */}
        {isSelected && (
          <>
            <div className="absolute top-0 left-0 h-4 w-4">
              <Star className="h-4 w-4 text-yellow-300 animate-spin duration-2000" />
            </div>
            <div className="absolute bottom-0 right-0 h-3 w-3">
              <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse delay-200" />
            </div>
          </>
        )}
      </div>
      
      {/* Hover Effect Rings */}
      {isAvailable && !isSelected && (
        <div className="absolute inset-[-4px] rounded-xl border border-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  )
}

// Animated Football Position
const AnimatedFootballPosition = ({ position, isSelected = false, isAvailable = true }) => {
  const positionIcons: Record<string, any> = {
    "GK": Shield,
    "DEF": Shield,
    "MID": Target,
    "FWD": Zap,
    "ALL": Star
  }
  
  const PositionIcon = positionIcons[position] || Trophy
  
  return (
    <div className="relative">
      {/* Pulse Effect */}
      <div className={cn(
        "absolute inset-[-2px] rounded-full transition-all duration-500",
        isSelected 
          ? "bg-green-500/40 blur-lg animate-pulse" 
          : "opacity-0"
      )} />
      
      {/* Position Circle */}
      <div className={cn(
        "relative h-16 w-16 rounded-full border-2 transition-all duration-500 transform-gpu flex items-center justify-center group",
        isSelected 
          ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 shadow-2xl shadow-green-500/50 scale-110 rotate-[5deg]" 
          : isAvailable 
            ? "bg-gradient-to-br from-zinc-900 to-black border-white/20 group-hover:border-green-400 group-hover:scale-105" 
            : "bg-gradient-to-br from-zinc-950 to-black border-white/10 opacity-40"
      )}>
        {/* Position Icon */}
        <PositionIcon className={cn(
          "h-7 w-7 transition-all duration-500",
          isSelected 
            ? "text-white" 
            : isAvailable 
              ? "text-zinc-500 group-hover:text-green-400" 
              : "text-zinc-700"
        )} />
        
        {/* Position Text */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-all duration-500",
            isSelected 
              ? "text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.8)]" 
              : isAvailable 
                ? "text-zinc-600 group-hover:text-green-500" 
                : "text-zinc-700"
          )}>
            {position}
          </span>
        </div>
        
        {/* Selection Glow */}
        {isSelected && (
          <div className="absolute inset-0 rounded-full border-2 border-green-400/50 animate-ping duration-1000" />
        )}
      </div>
    </div>
  )
}

// Floating Particles Background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="absolute h-[1px] w-[1px] bg-violet-500/30 rounded-full"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
  </div>
)

export function SeatSelector({
  category,
  totalSeats,
  availableSeats,
  pricePerSeat,
  onSelectionChange,
  maxSelection = 4
}: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)
  const [pulseEffect, setPulseEffect] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return
    const limit = category.toUpperCase() === "CRICKET" ? 1 : maxSelection

    // Trigger pulse effect
    setPulseEffect(true)
    setTimeout(() => setPulseEffect(false), 300)

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      } else if (prev.length < limit) {
        return [...prev, seatId]
      } else {
        return prev
      }
    })
  }

  useEffect(() => {
    onSelectionChange(selectedSeats)
  }, [selectedSeats, onSelectionChange])

  const getEventIcon = () => {
    const categoryUpper = category.toUpperCase()
    switch (categoryUpper) {
      case "CRICKET": return Trophy
      case "FOOTBALL": return Goal
      case "TENNIS": return Activity
      case "SPORTS": return Gamepad2
      case "MUSIC": return Music
      case "CONCERT": return Drum
      case "OPEN MIC": return Mic
      case "WORKSHOP": return Guitar
      default: return Armchair
    }
  }

  const EventIcon = getEventIcon()

  const getCategoryColors = () => {
    const categoryUpper = category.toUpperCase()
    switch (categoryUpper) {
      case "CRICKET":
        return {
          primary: "from-yellow-500 to-amber-600",
          light: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          hover: "hover:border-yellow-500",
          selected: "bg-yellow-600",
          icon: "text-yellow-500",
          glow: "shadow-yellow-500/50",
          ring: "ring-yellow-500"
        }
      case "FOOTBALL":
        return {
          primary: "from-green-500 to-emerald-600",
          light: "bg-green-500/10",
          border: "border-green-500/30",
          hover: "hover:border-green-500",
          selected: "bg-green-600",
          icon: "text-green-500",
          glow: "shadow-green-500/50",
          ring: "ring-green-500"
        }
      case "TENNIS":
        return {
          primary: "from-lime-500 to-green-500",
          light: "bg-lime-500/10",
          border: "border-lime-500/30",
          hover: "hover:border-lime-500",
          selected: "bg-lime-600",
          icon: "text-lime-500",
          glow: "shadow-lime-500/50",
          ring: "ring-lime-500"
        }
      default:
        return {
          primary: "from-violet-500 to-purple-600",
          light: "bg-violet-500/10",
          border: "border-violet-500/30",
          hover: "hover:border-violet-500",
          selected: "bg-violet-600",
          icon: "text-violet-500",
          glow: "shadow-violet-500/50",
          ring: "ring-violet-500"
        }
    }
  }

  const colors = getCategoryColors()

  const renderSummary = () => {
    const isSports = ["CRICKET", "FOOTBALL", "TENNIS", "SPORTS"].includes(category.toUpperCase())
    const selectionType = isSports ? "Tickets" : "Seats"
    
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/60 to-black/60 border border-white/10 backdrop-blur-xl p-6">
        {/* Animated Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Ticket className="h-5 w-5 text-violet-400 animate-bounce delay-200" />
              <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-violet-300 animate-ping" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase italic tracking-tight">Selected {selectionType}</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                {selectedSeats.length} of {category.toUpperCase() === "CRICKET" ? 1 : maxSelection} Max
              </p>
            </div>
          </div>
          {selectedSeats.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedSeats([])
                setPulseEffect(true)
                setTimeout(() => setPulseEffect(false), 300)
              }}
              className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
            >
              <X className="h-3 w-3 mr-1 group-hover:rotate-90 transition-transform" /> Clear
            </Button>
          )}
        </div>
        
        {selectedSeats.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/10 rounded-xl bg-gradient-to-b from-transparent to-black/20 overflow-hidden group">
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <AlertCircle className="h-8 w-8 mb-3 text-zinc-600 group-hover:text-violet-500 transition-colors" />
            <p className="text-sm text-zinc-500 group-hover:text-violet-400 transition-colors">
              Tap to select {selectionType.toLowerCase()}
            </p>
            <Sparkles className="absolute top-4 right-4 h-3 w-3 text-violet-400/50 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((id, index) => (
                <Badge 
                  key={id}
                  className={cn(
                    "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 rounded-full text-xs font-bold px-4 py-1.5",
                    "hover:scale-105 transition-transform duration-200",
                    pulseEffect && index === selectedSeats.length - 1 && "animate-pulse"
                  )}
                >
                  <Sparkles className="h-2 w-2 mr-1.5 inline" />
                  {id}
                </Badge>
              ))}
            </div>
            
            <div className="relative pt-4 border-t border-white/10">
              {/* Animated Divider */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{availableSeats} available</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-500 mb-1">Total</div>
                  <div className="text-2xl font-black text-white bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                    ₹{pricePerSeat * selectedSeats.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- SPORTS LAYOUT ---
  const isSportsEvent = ["CRICKET", "FOOTBALL", "TENNIS", "SPORTS"].includes(category.toUpperCase())
  if (isSportsEvent) {
    const isCricket = category.toUpperCase() === "CRICKET"
    const isFootball = category.toUpperCase() === "FOOTBALL"
    
    return (
      <div className="space-y-8 relative" ref={containerRef}>
        <FloatingParticles />
        
        {/* Header with Glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent blur-xl" />
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950/80 to-black/80 backdrop-blur-xl p-8 text-center">
            <div className="relative inline-block mb-4">
              <EventIcon className={`h-12 w-12 ${colors.icon} mx-auto mb-2 animate-bounce delay-100`} />
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-violet-300 animate-ping" />
            </div>
            
            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {isCricket ? "Jersey Selection" : isFootball ? "Position Selection" : "Spot Selection"}
            </h3>
            
            <p className="text-sm text-zinc-500 lowercase tracking-widest">
              {isCricket ? "Choose your squad number for the match" : 
               isFootball ? "Pick your playing position on the field" : 
               "Select your preferred spot for the game"}
            </p>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950/80 to-black/80 backdrop-blur-xl p-6 sm:p-8">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
            {Array.from({ length: totalSeats }).map((_, i) => {
              const seatNumber = i + 1
              const seatId = `SEAT-${seatNumber}`
              const isAvailable = seatNumber <= availableSeats
              const isSelected = selectedSeats.includes(seatId)
              const isHovered = hoveredSeat === seatId
              
              return (
                <div 
                  key={i}
                  className="relative group"
                  onMouseEnter={() => setHoveredSeat(seatId)}
                  onMouseLeave={() => setHoveredSeat(null)}
                >
                  {/* Selection Ring Effect */}
                  {isSelected && (
                    <div className="absolute inset-[-4px] rounded-xl border-2 border-violet-400/50 animate-pulse" />
                  )}
                  
                  {/* Hover Tooltip */}
                  {isHovered && isAvailable && !isSelected && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-zinc-900 to-black border border-white/10 rounded-lg px-3 py-1.5 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-white">Click to select</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSeatClick(seatId, isAvailable)}
                    className={cn(
                      "relative w-full transition-all duration-300 transform-gpu",
                      isSelected 
                        ? "scale-110 z-10" 
                        : isAvailable 
                          ? "hover:scale-105 hover:z-10" 
                          : "opacity-40"
                    )}
                  >
                    {isCricket ? (
                      <AnimatedJersey 
                        number={seatNumber} 
                        isSelected={isSelected}
                        isAvailable={isAvailable}
                      />
                    ) : isFootball ? (
                      <AnimatedFootballPosition 
                        position={["GK", "DEF", "MID", "FWD", "ALL"][seatNumber % 5]}
                        isSelected={isSelected}
                        isAvailable={isAvailable}
                      />
                    ) : (
                      <div className={cn(
                        "relative h-14 w-14 rounded-xl border-2 transition-all duration-500 transform-gpu flex items-center justify-center group",
                        isSelected 
                          ? `bg-gradient-to-br ${colors.primary} border-violet-400 shadow-2xl ${colors.glow} scale-110 rotate-[5deg]` 
                          : isAvailable 
                            ? "bg-gradient-to-br from-zinc-900 to-black border-white/20 group-hover:border-violet-400 group-hover:scale-105" 
                            : "bg-gradient-to-br from-zinc-950 to-black border-white/10"
                      )}>
                        <span className={cn(
                          "font-black text-lg transition-all duration-500",
                          isSelected 
                            ? "text-white drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" 
                            : isAvailable 
                              ? "text-zinc-400 group-hover:text-violet-300" 
                              : "text-zinc-700"
                        )}>
                          {seatNumber}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        
        {renderSummary()}
      </div>
    )
  }

  // --- LARGE VENUE LAYOUT ---
  if (totalSeats > 30) {
    const rows = ["A", "B", "C", "D", "E", "F"].slice(0, Math.ceil(totalSeats / 10))
    const seatsPerRow = Math.ceil(totalSeats / rows.length)
    
    return (
      <div className="space-y-8 relative">
        <FloatingParticles />
        
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950/80 to-black/80 backdrop-blur-xl p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Stage with Glow */}
            <div className="relative mb-12 text-center">
              <div className="absolute inset-x-0 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent blur-sm" />
              <div className="relative w-full h-3 bg-gradient-to-r from-violet-500/30 via-violet-500/60 to-violet-500/30 rounded-lg mb-2 shadow-[0_0_30px_rgba(139,92,246,0.4)]" />
              <span className="relative inline-block text-[10px] font-black uppercase tracking-widest text-violet-400 bg-gradient-to-r from-violet-500/20 to-purple-500/20 px-4 py-1.5 rounded-full border border-violet-500/30">
                <Sparkles className="h-2 w-2 inline mr-1.5" />
                STAGE AREA
              </span>
            </div>

            {/* Auditorium Seating */}
            <div className="flex flex-col gap-4">
              {rows.map((row, rowIndex) => (
                <div key={row} className="flex items-center gap-6">
                  <span className="w-6 text-[10px] text-zinc-600 font-black text-right tracking-widest">
                    {row}
                  </span>
                  <div className="flex gap-3">
                    {Array.from({ length: seatsPerRow }).map((_, i) => {
                      const seatId = `${row}${i + 1}`
                      const seatIndex = rowIndex * seatsPerRow + i
                      const isAvailable = seatIndex < availableSeats
                      const isSelected = selectedSeats.includes(seatId)
                      
                      // Add aisle spacing
                      const isAisle = (i + 1) === Math.ceil(seatsPerRow / 2)
                      
                      return (
                        <div 
                          key={seatId}
                          className={cn("relative", isAisle && "mr-6")}
                          onMouseEnter={() => setHoveredSeat(seatId)}
                          onMouseLeave={() => setHoveredSeat(null)}
                        >
                          {/* Row Connection Line */}
                          {i > 0 && (
                            <div className="absolute left-[-10px] top-1/2 w-[10px] h-[1px] bg-gradient-to-r from-zinc-800 to-transparent" />
                          )}
                          
                          <button
                            onClick={() => handleSeatClick(seatId, isAvailable)}
                            disabled={!isAvailable}
                            className={cn(
                              "relative h-10 w-10 rounded-lg border-2 transition-all duration-300 transform-gpu group",
                              isSelected 
                                ? "bg-gradient-to-br from-violet-600 to-purple-700 border-violet-400 shadow-2xl shadow-violet-500/50 scale-110 z-10" 
                                : isAvailable 
                                  ? "bg-gradient-to-br from-zinc-900 to-black border-white/20 hover:border-violet-400 hover:scale-105 hover:z-10" 
                                  : "bg-gradient-to-br from-zinc-950 to-black border-white/10 opacity-40"
                            )}
                          >
                            {/* Seat Number */}
                            <span className={cn(
                              "text-xs font-black transition-all duration-300",
                              isSelected 
                                ? "text-white drop-shadow-[0_0_4px_rgba(139,92,246,0.8)]" 
                                : isAvailable 
                                  ? "text-zinc-500 group-hover:text-violet-300" 
                                  : "text-zinc-700"
                            )}>
                              {i + 1}
                            </span>
                            
                            {/* VIP Badge */}
                            {row === "A" && i < 4 && (
                              <Crown className="absolute -top-2 -right-2 h-3 w-3 text-yellow-500 animate-pulse" />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
              {[
                { color: "bg-violet-600", label: "Selected", icon: Sparkles },
                { color: "bg-zinc-900 border border-white/10", label: "Available", icon: Ticket },
                { color: "bg-zinc-950 opacity-40", label: "Unavailable", icon: X },
                { color: "bg-yellow-500", label: "VIP", icon: Crown }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-sm", item.color)} />
                  <span className="text-zinc-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {renderSummary()}
      </div>
    )
  }

  // --- SMALL INTIMATE LAYOUT ---
  return (
    <div className="space-y-8 relative">
      <FloatingParticles />
      
      {/* Table Layout Header */}
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950/80 to-black/80 backdrop-blur-xl p-8">
        <div className="text-center mb-10">
          <div className="inline-block relative">
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-violet-500/30 via-violet-500 to-violet-500/30 rounded-full mb-3 shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
            <Sparkles className="absolute -top-2 left-1/4 h-3 w-3 text-violet-400 animate-pulse" />
            <Sparkles className="absolute -top-2 right-1/4 h-3 w-3 text-violet-400 animate-pulse delay-300" />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] text-violet-400 uppercase">
            Intimate Seating
          </span>
        </div>
        
        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          {Array.from({ length: Math.ceil(totalSeats / 4) }).map((_, tableIdx) => {
            const tableNum = tableIdx + 1
            
            return (
              <div key={tableIdx} className="relative h-48 w-48 mx-auto">
                {/* Table Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-3xl blur-xl opacity-50" />
                
                {/* Table Surface */}
                <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border-2 border-white/10 flex items-center justify-center group">
                  {/* Table Texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.1),transparent_50%)]" />
                  
                  <div className="relative text-center">
                    <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Table {tableNum}</span>
                    <div className="text-[8px] text-zinc-700 mt-1 font-bold">
                      {Math.min(4, availableSeats - (tableIdx * 4))} of 4 seats
                    </div>
                  </div>
                </div>
                
                {/* Chairs */}
                {["N", "S", "E", "W"].map((pos, i) => {
                  const seatId = `T${tableNum}-${pos}`
                  const seatIdx = tableIdx * 4 + i
                  const isAvailable = seatIdx < availableSeats
                  const isSelected = selectedSeats.includes(seatId)
                  const isHovered = hoveredSeat === seatId
                  
                  const posStyles = {
                    "N": "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    "S": "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                    "E": "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
                    "W": "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
                  }
                  
                  return (
                    <div 
                      key={seatId}
                      className={cn("absolute z-10", posStyles[pos as keyof typeof posStyles])}
                      onMouseEnter={() => setHoveredSeat(seatId)}
                      onMouseLeave={() => setHoveredSeat(null)}
                    >
                      <button
                        onClick={() => handleSeatClick(seatId, isAvailable)}
                        disabled={!isAvailable}
                        className="group transition-all duration-300"
                      >
                        <AnimatedChair 
                          isSelected={isSelected}
                          isAvailable={isAvailable}
                          delay={i * 100}
                        />
                        {/* Position Label */}
                        <div className={cn(
                          "absolute left-1/2 -translate-x-1/2 -bottom-6 text-[9px] font-bold transition-all duration-300",
                          isSelected 
                            ? "text-violet-400" 
                            : isHovered && isAvailable 
                              ? "text-violet-500" 
                              : "text-zinc-700"
                        )}>
                          {pos}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      
      {renderSummary()}
    </div>
  )
}

// Add these styles to your global CSS or Tailwind config
// @tailwind base; @tailwind components; @tailwind utilities;
// 
// @keyframes float {
//   0%, 100% { transform: translateY(0) rotate(0deg); }
//   50% { transform: translateY(-10px) rotate(180deg); }
// }
// 
// @keyframes shimmer {
//   0% { background-position: -1000px 0; }
//   100% { background-position: 1000px 0; }
// }
// 
// @keyframes gradient {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }
// 
// .animate-float { animation: float 6s ease-in-out infinite; }
// .animate-shimmer { animation: shimmer 2s infinite linear; }
// .animate-gradient { 
//   background-size: 200% 200%; 
//   animation: gradient 2s ease infinite; 
// }