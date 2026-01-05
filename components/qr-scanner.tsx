"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Camera, ScanLine } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
  isOpen: boolean
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setScanning(true)
        startScanning()
      }
    } catch (err) {
      console.error("Camera access error:", err)
      setError("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setScanning(false)
  }

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    const scan = () => {
      if (!scanning || !video.videoWidth) {
        requestAnimationFrame(scan)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Try to detect QR code using jsQR
      try {
        // @ts-ignore - jsQR will be loaded via CDN or npm
        if (window.jsQR) {
          // @ts-ignore
          const code = window.jsQR(imageData.data, imageData.width, imageData.height)
          
          if (code) {
            onScan(code.data)
            stopCamera()
            return
          }
        }
      } catch (err) {
        // Continue scanning
      }

      if (scanning) {
        requestAnimationFrame(scan)
      }
    }

    video.addEventListener('loadedmetadata', () => {
      scan()
    })
  }

  const handleManualEntry = () => {
    const bookingId = prompt("Enter Booking ID manually:")
    if (bookingId) {
      onScan(bookingId)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg"
        >
          <Card className="bg-zinc-900 border-violet-500/20 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-full">
                  <ScanLine className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Scan QR Code</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Video Preview */}
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning Overlay */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-violet-500 rounded-lg relative">
                    <motion.div
                      animate={{ y: [0, 240, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                    />
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-violet-400" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-violet-400" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-violet-400" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-violet-400" />
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center space-y-4 p-6">
                    <Camera className="h-12 w-12 text-red-400 mx-auto" />
                    <p className="text-red-400 font-bold">{error}</p>
                    <Button onClick={startCamera} variant="outline" className="border-red-500/30">
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Instructions */}
            <div className="text-center space-y-3">
              <p className="text-sm text-zinc-400 uppercase tracking-widest font-black">
                Position QR code within the frame
              </p>
              
              <Button
                onClick={handleManualEntry}
                variant="outline"
                className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-600 hover:text-white"
              >
                Enter Booking ID Manually
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
