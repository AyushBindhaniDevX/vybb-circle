"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Navigation as NavIcon } from "lucide-react"

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

interface EventMapProps {
  center: [number, number]
  venue: string
  address: string
}

export default function EventMap({ center, venue, address }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
      tap: !L.Browser.mobile,
      zoomControl: false // Cleaner UI
    }).setView(center, 15)
    
    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(map)

    const customIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="h-10 w-10 rounded-full bg-violet-600 border-2 border-white shadow-[0_0_20px_rgba(124,58,237,0.5)] flex items-center justify-center animate-bounce">
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        </div>
      `,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })

    L.marker(center, { icon: customIcon }).addTo(map)
      .bindPopup(`<div class="p-1 text-black font-sans"><h3 class="font-bold">${venue}</h3><p class="text-xs">${address}</p></div>`)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, venue, address])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-2xl">
      <div ref={mapRef} className="h-full w-full z-0 grayscale contrast-125" />
      
      {/* Mobile-friendly controls - Positioned to avoid UI clash */}
      <div className="absolute bottom-6 right-6 z-[400]">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.setView(center, 15)}
          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white text-black shadow-2xl hover:bg-violet-600 hover:text-white transition-all active:scale-90"
          aria-label="Recenter map"
        >
          <NavIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}