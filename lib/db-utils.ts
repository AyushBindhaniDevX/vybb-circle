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
// lib/db-utils.ts

export async function getBookingsByUserId(userId: string): Promise<Booking[]> {
  try {
    console.log(`🔄 Fetching bookings for user: ${userId}`);
    
    const bookingsRef = collection(db, "bookings");
    
    // Step 1: Attempt the most efficient query
    try {
      const q = query(
        bookingsRef, 
        where("userId", "==", userId)
        // Note: Removed orderBy here to prevent "failed-precondition" errors 
        // if the manual index isn't created yet in Firebase Console.
      );
      
      const snapshot = await getDocs(q);
      
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));

      // Step 2: Sort manually in code to guarantee results show up
      const sortedBookings = bookings.sort((a, b) => {
        const dateA = new Date(a.bookingDate || a.createdAt?.toDate() || 0).getTime();
        const dateB = new Date(b.bookingDate || b.createdAt?.toDate() || 0).getTime();
        return dateB - dateA; // Newest first
      });
      
      console.log(`✅ Successfully loaded ${sortedBookings.length} tickets`);
      return sortedBookings;

    } catch (innerError: any) {
      console.warn("⚠️ Primary query failed, attempting global fallback:", innerError.message);
      
      // Step 3: Global Fallback - Get all and filter (Use only for small datasets)
      const allSnapshot = await getDocs(bookingsRef);
      return allSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Booking))
        .filter(b => b.userId === userId)
        .sort((a, b) => new Date(b.bookingDate || 0).getTime() - new Date(a.bookingDate || 0).getTime());
    }
  } catch (error) {
    console.error("❌ Critical error fetching bookings:", error);
    return [];
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