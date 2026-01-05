// app/about/page.tsx
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Music, Heart, Star } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Born from a passion for authentic music experiences, VYBB LIVE is more than just events – it's a movement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">The VYBB Vision</h2>
            <p className="text-zinc-300 mb-6">
              We believe in creating spaces where music isn't just heard, but felt. Where artists and audiences connect 
              on a deeper level, and every performance becomes a shared memory.
            </p>
            <p className="text-zinc-300">
              Since our first open mic night in 2024, we've grown into a community of thousands of music lovers, 
              all united by a simple idea: great music deserves a great experience.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-zinc-900 rounded-xl">
              <Music className="h-8 w-8 text-violet-500 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Artist-First Approach</h3>
                <p className="text-zinc-400">We prioritize artist comfort and creative freedom above all.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-zinc-900 rounded-xl">
              <Users className="h-8 w-8 text-violet-500 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Community Driven</h3>
                <p className="text-zinc-400">Every event is shaped by feedback from our growing circle.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/events">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-8">
              Explore Experiences
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}