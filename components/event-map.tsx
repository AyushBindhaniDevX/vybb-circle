// components/event-map.tsx
"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
  iconUrl: "/leaflet/images/marker-icon.png",
  shadowUrl: "/leaflet/images/marker-shadow.png",
})

interface EventMapProps {
  center: [number, number]
  venue: string
  address: string
}

export default function EventMap({ center, venue, address }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView(center, 15)
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Custom icon
    const customIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="h-12 w-12 rounded-full bg-violet-600 border-4 border-white shadow-2xl flex items-center justify-center">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-violet-600"></div>
        </div>
      `,
      className: "custom-marker",
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    })

    // Add marker
    const marker = L.marker(center, { icon: customIcon }).addTo(map)
    
    // Add popup
    marker.bindPopup(`
      <div class="p-2">
        <h3 class="font-bold text-lg">${venue}</h3>
        <p class="text-sm text-gray-600">${address}</p>
        <div class="mt-2">
          <a href="https://maps.google.com/?q=${center[0]},${center[1]}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="text-violet-600 hover:text-violet-800 text-sm font-medium">
            Open in Google Maps →
          </a>
        </div>
      </div>
    `)

    // Add circle for venue area
    L.circle(center, {
      color: "#7c3aed",
      fillColor: "#7c3aed",
      fillOpacity: 0.1,
      radius: 100,
    }).addTo(map)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, venue, address])

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Map controls overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => mapInstanceRef.current?.setView(center, 15)}
          className="p-3 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 hover:bg-black text-white transition-colors"
          title="Reset view"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>

      {/* Venue info overlay */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 max-w-xs">
        <h3 className="font-bold text-white mb-1">{venue}</h3>
        <p className="text-sm text-zinc-300">{address}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-violet-400">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>Bhubaneswar, Odisha</span>
        </div>
      </div>
    </div>
  )
}