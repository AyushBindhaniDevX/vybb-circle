// lib/db-utils.ts
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  address: string
  coordinates: { lat: number; lng: number }
  price: number
  totalSeats: number
  availableSeats: number
  imageUrl: string
  category: string
  createdAt?: any
}

export interface Booking {
  id: string
  userId: string
  eventId: string
  attendeeDetails: {
    name: string
    email: string
    phone: string
  }
  seatNumbers: string[]
  paymentId: string
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  amount: number
  bookingDate: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  ticketCount: number
  ticketPrice: number
  razorpayOrderId: string
  razorpaySignature: string
  paymentMethod?: string
  paymentDetails?: any
  createdAt?: any
  updatedAt?: any
}

// Get all events
export async function getEvents(): Promise<Event[]> {
  try {
    const eventsRef = collection(db, "events")
    const q = query(eventsRef, orderBy("date", "asc"))
    const snapshot = await getDocs(q)
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event))
    
    console.log(`✅ Loaded ${events.length} events from Firestore`)
    return events
  } catch (error) {
    console.error("❌ Error fetching events:", error)
    return []
  }
}

// Get event by ID
export async function getEventById(id: string): Promise<Event | null> {
  try {
    console.log(`🔄 Fetching event: ${id}`)
    
    const eventRef = doc(db, "events", id)
    const snapshot = await getDoc(eventRef)
    
    if (snapshot.exists()) {
      const eventData = {
        id: snapshot.id,
        ...snapshot.data()
      } as Event
      
      console.log(`✅ Found event: ${eventData.title}`)
      return eventData
    }
    
    console.log(`❌ Event not found: ${id}`)
    return null
  } catch (error) {
    console.error("❌ Error fetching event:", error)
    return null
  }
}

// lib/db-utils.ts - Update getBookingsByUserId function
export async function getBookingsByUserId(userId: string): Promise<Booking[]> {
  try {
    console.log(`🔄 Fetching bookings for user: ${userId}`)
    
    const bookingsRef = collection(db, "bookings")
    
    try {
      // Try with the indexed query first
      const q = query(
        bookingsRef, 
        where("userId", "==", userId),
        orderBy("bookingDate", "desc")
      )
      const snapshot = await getDocs(q)
      
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking))
      
      console.log(`✅ Found ${bookings.length} bookings for user`)
      return bookings
    } catch (error: any) {
      // If index error, fallback to simple query
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn('⚠️ Index not ready, using fallback query')
        
        // Fallback: Get all bookings and filter in memory
        const allBookingsSnapshot = await getDocs(bookingsRef)
        const allBookings = allBookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking))
        
        const userBookings = allBookings
          .filter(booking => booking.userId === userId)
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
        
        console.log(`✅ Found ${userBookings.length} bookings (fallback mode)`)
        return userBookings
      }
      throw error // Re-throw other errors
    }
  } catch (error) {
    console.error("❌ Error fetching bookings:", error)
    return []
  }
}
// Create booking with real payment data
export async function createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    console.log("🔄 Creating booking with data:", {
      userId: bookingData.userId,
      eventId: bookingData.eventId,
      paymentId: bookingData.paymentId,
      amount: bookingData.amount,
      seatCount: bookingData.seatNumbers.length
    })

    // Validate required fields
    if (!bookingData.userId || !bookingData.eventId || !bookingData.paymentId) {
      throw new Error("Missing required booking data")
    }

    // Check if event exists and has enough seats
    const eventRef = doc(db, "events", bookingData.eventId)
    const eventSnap = await getDoc(eventRef)
    
    if (!eventSnap.exists()) {
      throw new Error("Event not found")
    }
    
    const eventData = eventSnap.data() as Event
    if (eventData.availableSeats < bookingData.seatNumbers.length) {
      throw new Error("Not enough seats available")
    }

    // Create booking document
    const bookingDoc = {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const bookingRef = await addDoc(collection(db, "bookings"), bookingDoc)
    const bookingId = bookingRef.id

    console.log("✅ Booking created:", bookingId)

    // Update event available seats
    await updateDoc(eventRef, {
      availableSeats: increment(-bookingData.seatNumbers.length),
      updatedAt: serverTimestamp(),
    })

    console.log("✅ Event seats updated")

    // Update booking with ID if needed
    await updateDoc(doc(db, "bookings", bookingId), {
      id: bookingId,
    })

    return bookingId
  } catch (error: any) {
    console.error("❌ Error creating booking:", error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }
}

// Get featured events (for homepage)
export async function getFeaturedEvents(count: number = 3): Promise<Event[]> {
  try {
    const eventsRef = collection(db, "events")
    const q = query(
      eventsRef, 
      orderBy("date", "asc"),
      limit(count)
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event))
  } catch (error) {
    console.error("Error fetching featured events:", error)
    return []
  }
}

// Get booking by ID
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const bookingRef = doc(db, "bookings", bookingId)
    const snapshot = await getDoc(bookingRef)
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Booking
    }
    return null
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: Booking["paymentStatus"]): Promise<void> {
  try {
    const bookingRef = doc(db, "bookings", bookingId)
    await updateDoc(bookingRef, {
      paymentStatus: status,
      updatedAt: serverTimestamp(),
    })
    console.log(`✅ Booking ${bookingId} status updated to ${status}`)
  } catch (error) {
    console.error("Error updating booking status:", error)
    throw error
  }
}