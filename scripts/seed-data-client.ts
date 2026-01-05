// scripts/seed-data-client.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Your Firebase config from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const seedData = async () => {
  try {
    console.log('Starting data seeding...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Clear existing data (optional - be careful!)
    // await clearCollection(db, 'events');
    // await clearCollection(db, 'bookings');
    // await clearCollection(db, 'users');

    // Create events
    const events = [
      {
        title: "VYBB CIRCLE: OPEN MIC NIGHT",
        description: "Join us for an intimate night of music, poetry, and storytelling at Vybb Central South West. This edition features emerging indie talent from across Bhubaneswar.",
        date: "Jan 10, 2026",
        time: "7:00 PM - 10:00 PM",
        venue: "Vybb Central South West @ Sapphire Smoke",
        address: "K-8/844, Ghatikia Main Rd, K8 Kalinga Nagar, Kalinganagar, Bhubaneswar, Odisha 751029",
        coordinates: { lat: 20.2769, lng: 85.8339 },
        price: 299,
        totalSeats: 16,
        availableSeats: 12,
        imageUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnBveGMwNmVhZmcyZGl1cW5seGo4aXVzYmZzZ3NpcnFqaHZ5NDl2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f2EMxTj6cOR3RDtHwh/giphy.gif",
        category: "OPEN MIC",
        createdAt: new Date().toISOString(),
      },
      {
        title: "JAMMING SESSION: JAZZ & BLUES",
        description: "A collaborative session for jazz and blues enthusiasts. Bring your instruments or just your ears.",
        date: "Jan 15, 2026",
        time: "6:00 PM - 11:00 PM",
        venue: "Rhythm House",
        address: "MG Road, Central District, Bhubaneswar, India",
        coordinates: { lat: 20.2961, lng: 85.8245 },
        price: 499,
        totalSeats: 30,
        availableSeats: 24,
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
        category: "JAM SESSION",
        createdAt: new Date().toISOString(),
      },
      {
        title: "INDIE ARTIST SHOWCASE",
        description: "Discover unique indie talent from across the city.",
        date: "Jan 22, 2026",
        time: "8:00 PM - 11:00 PM",
        venue: "Vybb Garden",
        address: "Cultural District, Bhubaneswar, India",
        coordinates: { lat: 20.2919, lng: 85.8314 },
        price: 799,
        totalSeats: 40,
        availableSeats: 32,
        imageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800",
        category: "LIVE MUSIC",
        createdAt: new Date().toISOString(),
      },
    ];

    const eventIds: string[] = [];
    
    for (const event of events) {
      const docRef = await addDoc(collection(db, 'events'), event);
      eventIds.push(docRef.id);
      console.log(`Created event: ${event.title} (ID: ${docRef.id})`);
    }

    // Create sample bookings
    const bookings = [
      {
        userId: 'test_user_001',
        eventId: eventIds[0],
        attendeeDetails: {
          name: 'Test User',
          email: 'test@example.com'
        },
        seatNumbers: ['A1', 'A2'],
        paymentId: 'pay_test_001',
        paymentStatus: 'completed',
        amount: 598,
        bookingDate: new Date().toISOString(),
        eventTitle: "VYBB CIRCLE: OPEN MIC NIGHT",
        eventDate: "Jan 10, 2026",
        eventVenue: "Vybb Central South West @ Sapphire Smoke",
        ticketCount: 2,
        ticketPrice: 299,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const booking of bookings) {
      const docRef = await addDoc(collection(db, 'bookings'), booking);
      console.log(`Created booking (ID: ${docRef.id})`);
    }

    console.log('\n✅ Data seeding completed successfully!');
    console.log(`\n📊 Created ${events.length} events and ${bookings.length} bookings`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Helper function to clear collection (optional)
async function clearCollection(db: any, collectionName: string) {
  console.log(`⚠️ Clearing collection: ${collectionName}`);
  // Note: In production, you'd want to delete documents properly
}

// Run the script
seedData();