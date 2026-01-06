
"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Navigation as NavIcon } from "lucide-react"

// Ensure your token is valid
mapboxgl.accessToken = "pk.eyJ1IjoiYXl1c2hiaW5kaGFuaSIsImEiOiJjbWsyNTRjdWcwNGp6M2RzODdzdGx1a29mIn0.4224letLFTz7CTauwyOuwA" 

interface EventMapProps {
  center: [number, number] // [lat, lng]
  venue: string
  address: string
}

export default function EventMap({ center, venue, address }: EventMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // 1. INITIALIZE MAP
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const lngLat: [number, number] = [center[1], center[0]]

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: lngLat,
      zoom: 15,
      pitch: 60,
      bearing: -15,
      antialias: true,
    })

    mapRef.current = map

    map.on("load", () => {
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#27272a",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.8,
        },
      })
    })

    return () => {
        map.remove()
        mapRef.current = null
    }
  }, []) // Only run once on mount

  // 2. UPDATE POSITION WHEN COORDINATES CHANGE
  useEffect(() => {
    if (!mapRef.current) return

    const lngLat: [number, number] = [center[1], center[0]]

    // Move the camera to the specific event location
    mapRef.current.flyTo({
      center: lngLat,
      essential: true,
      zoom: 15,
      speed: 1.5
    })

    // Remove old marker if it exists
    if (markerRef.current) markerRef.current.remove()

    // Create New High-Visibility Marker
    const el = document.createElement("div")
    el.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; height: 50px; width: 50px; background: rgba(139, 92, 246, 0.4); border-radius: 50%; filter: blur(8px); animation: pulse-glow 2s infinite;"></div>
        <div style="position: absolute; height: 32px; width: 32px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(139, 92, 246, 1);"></div>
        <div style="height: 20px; width: 20px; background: #8b5cf6; border-radius: 50%; z-index: 10; border: 2px solid #fff;"></div>
      </div>
    `

    const newMarker = new mapboxgl.Marker(el)
      .setLngLat(lngLat)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<b style="color:black">${venue}</b>`))
      .addTo(mapRef.current)

    markerRef.current = newMarker

  }, [center, venue]) // Watch these values for changes

  return (
    <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      <style jsx global>{`
        @keyframes pulse-glow {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}