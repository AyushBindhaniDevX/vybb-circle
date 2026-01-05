// app/page.tsx (updated)
"use client"

import { Navbar } from "@/components/navbar"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Music, Mic2, Users, ArrowRight, Calendar, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { getFeaturedEvents, type Event } from "@/lib/db-utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getFeaturedEvents(3)
        setFeaturedEvents(events)
      } catch (error) {
        console.error("Error fetching featured events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase()
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="mb-8 border-violet-500/30 bg-violet-500/10 px-6 py-2 text-xs font-black tracking-[0.2em] text-violet-400 uppercase">
            Experience the Unfiltered
          </Badge>
          <h1 className="max-w-5xl text-balance text-6xl font-black italic tracking-tighter sm:text-9xl uppercase leading-[0.85]">
            Live the <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-violet-400 bg-clip-text text-transparent animate-gradient">
              Experience
            </span>
          </h1>
          <p className="mt-12 max-w-xl mx-auto text-balance text-lg font-medium text-zinc-500 sm:text-xl lowercase">
            Beyond music. Beyond borders. Vybb Live is the pulse of the generation. Jam, vibe, and belong.
          </p>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="mb-20 space-y-4">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter sm:text-6xl">Latest Drops</h2>
          <div className="h-1 w-20 bg-violet-600" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[500px] w-full rounded-2xl bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((exp) => (
              <SpotlightCard key={exp.id}>
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={exp.imageUrl || "/placeholder.svg"}
                    alt={exp.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <Badge className="mb-4 w-fit bg-violet-600 font-black italic tracking-wider">
                      {exp.category}
                    </Badge>
                    <h3 className="mb-2 text-3xl font-black italic uppercase tracking-tighter leading-none">
                      {exp.title}
                    </h3>
                    <p className="mb-6 text-sm font-bold text-violet-400 tracking-wide">
                      {exp.description.substring(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                          <Calendar className="h-3 w-3" /> {formatDate(exp.date)}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                          <MapPin className="h-3 w-3" /> {exp.venue}
                        </div>
                      </div>
                      <Link href={`/events/${exp.id}`}>
                        <Button
                          size="icon"
                          className="h-12 w-12 rounded-full bg-white text-black hover:bg-violet-600 hover:text-white transition-all"
                        >
                          <ArrowRight className="h-6 w-6" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {!loading && featuredEvents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No upcoming events found</p>
            <Link href="/events" className="mt-4 inline-block text-violet-400 hover:underline">
              Check all events
            </Link>
          </div>
        )}
      </section>

      {/* Why Vybb? */}
      <section className="bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Vybb Circle?</h2>
            <p className="mt-4 text-zinc-400">We're more than just events; we're a movement.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-black/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <Mic2 className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Artist First</h3>
              <p className="text-zinc-400">
                We provide a platform for emerging talent to showcase their work in an intimate setting.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <Music className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Curation</h3>
              <p className="text-zinc-400">
                Every experience is meticulously planned to ensure high-quality sound and an immersive vybb.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/40 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Community</h3>
              <p className="text-zinc-400">
                Meet fellow music lovers, discover new genres, and become part of a growing circle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Vybb?</h2>
          <p className="text-zinc-400 mb-10">
            Join our community of music lovers and experience live performances like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 px-8">
                Browse Experiences
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white/10 hover:border-violet-500">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-xl font-bold">
            VYBB <span className="text-violet-500">LIVE</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="/about" className="hover:text-white">
              Our Story
            </Link>
            <Link href="/events" className="hover:text-white">
              Experiences
            </Link>
            <Link href="/profile" className="hover:text-white">
              My Profile
            </Link>
            <Link href="#" className="hover:text-white">
              Contact
            </Link>
          </div>
          <div className="text-sm text-zinc-600">© 2026 Vybb Circle. All rights reserved.</div>
        </div>
      </footer>
    </main>
  )
}