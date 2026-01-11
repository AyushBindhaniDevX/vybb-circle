// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans', // Added for CSS variable support
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono', // Added for technical UI elements
})

export const metadata: Metadata = {
  title: "Vybb Live | The District Registry",
  description: "Bhubaneswar's high-fidelity loop registry. Beyond music. Beyond borders.",
  // ... rest of your icons metadata
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} ${geistMono.variable} antialiased bg-[#080808] text-white selection:bg-violet-500/30`}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            richColors // Added for better visual feedback on protocol status
            toastOptions={{
              className: "bg-zinc-950 text-white border border-white/10 rounded-2xl font-sans",
            }}
          />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
