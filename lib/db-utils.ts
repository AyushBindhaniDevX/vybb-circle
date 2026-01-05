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
  checkedIn?: boolean
  checkedInAt?: any
  checkedInBy?: string
  createdAt?: any
  updatedAt?: any
}

export interface AdminUser {
  email: string
  approved: boolean
  role: "admin" | "superadmin"
  createdAt: any
  createdBy?: string
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

// Admin functions
export async function isAdminUser(email: string): Promise<boolean> {
  try {
    const adminRef = collection(db, "admins")
    const q = query(adminRef, where("email", "==", email), where("approved", "==", true))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, "bookings")
    const q = query(bookingsRef, orderBy("bookingDate", "desc"))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking))
  } catch (error) {
    console.error("Error fetching all bookings:", error)
    return []
  }
}

export async function getBookingsByEvent(eventId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, "bookings")
    const q = query(bookingsRef, where("eventId", "==", eventId))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking))
  } catch (error) {
    console.error("Error fetching bookings by event:", error)
    return []
  }
}

export async function checkInBooking(bookingId: string, adminEmail: string): Promise<void> {
  try {
    // Update booking in Firestore
    const bookingRef = doc(db, "bookings", bookingId)
    await updateDoc(bookingRef, {
      checkedIn: true,
      checkedInAt: serverTimestamp(),
      checkedInBy: adminEmail,
      updatedAt: serverTimestamp(),
    })
    console.log(`✅ Booking ${bookingId} checked in`)
  } catch (error) {
    console.error("Error checking in booking:", error)
    throw error
  }
}

export async function getAnalytics() {
  try {
    const [events, bookings] = await Promise.all([
      getEvents(),
      getAllBookings()
    ])

    const totalRevenue = bookings
      .filter(b => b.paymentStatus === "completed")
      .reduce((sum, b) => sum + b.amount, 0)

    const totalTicketsSold = bookings
      .filter(b => b.paymentStatus === "completed")
      .reduce((sum, b) => sum + b.ticketCount, 0)

    const checkedInCount = bookings.filter(b => b.checkedIn).length

    const eventStats = events.map(event => {
      const eventBookings = bookings.filter(b => b.eventId === event.id && b.paymentStatus === "completed")
      const ticketsSold = eventBookings.reduce((sum, b) => sum + b.ticketCount, 0)
      const revenue = eventBookings.reduce((sum, b) => sum + b.amount, 0)
      
      return {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        ticketsSold,
        totalSeats: event.totalSeats,
        availableSeats: event.availableSeats,
        revenue,
        checkInRate: eventBookings.length > 0 
          ? (eventBookings.filter(b => b.checkedIn).length / eventBookings.length) * 100 
          : 0
      }
    })

    return {
      totalRevenue,
      totalTicketsSold,
      totalEvents: events.length,
      checkedInCount,
      totalBookings: bookings.length,
      eventStats
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    return null
  }
}

// Event Management Functions

export async function createEvent(eventData: Omit<Event, "id">): Promise<string> {
  try {
    console.log("🔄 Creating event:", eventData.title)

    const eventDoc = {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const eventRef = await addDoc(collection(db, "events"), eventDoc)
    console.log("✅ Event created:", eventRef.id)
    return eventRef.id
  } catch (error: any) {
    console.error("❌ Error creating event:", error)
    throw new Error(`Failed to create event: ${error.message}`)
  }
}

export async function updateEvent(eventId: string, eventData: Partial<Event>): Promise<void> {
  try {
    console.log("🔄 Updating event:", eventId)

    const eventRef = doc(db, "events", eventId)
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp(),
    })

    console.log("✅ Event updated:", eventId)
  } catch (error: any) {
    console.error("❌ Error updating event:", error)
    throw new Error(`Failed to update event: ${error.message}`)
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    console.log("🔄 Deleting event:", eventId)

    // Check if there are any bookings for this event
    const bookings = await getBookingsByEvent(eventId)
    if (bookings.length > 0) {
      throw new Error("Cannot delete event with existing bookings")
    }

    const eventRef = doc(db, "events", eventId)
    await updateDoc(eventRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("✅ Event marked as deleted:", eventId)
  } catch (error: any) {
    console.error("❌ Error deleting event:", error)
    throw error
  }
}