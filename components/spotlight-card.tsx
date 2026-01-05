"use client"

import React, { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl group transition-all duration-500 hover:border-violet-500/30 shadow-2xl",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.1), transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}