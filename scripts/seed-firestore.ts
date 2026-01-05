// scripts/seed-firestore.ts
import { initializeFirebaseAdmin } from './firebase-admin';

interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  price: number;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string;
  category: string;
  createdAt: any;
}

interface Booking {
  userId: string;
  eventId: string;
  attendeeDetails: {
    name: string;
    email: string;
  };
  seatNumbers: string[];
  paymentId: string;
  paymentStatus: string;
  amount: number;
  bookingDate: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  ticketCount: number;
  ticketPrice: number;
  createdAt: any;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: any;
}

const seedFirestore = async () => {
  try {
    const admin = initializeFirebaseAdmin();
    const db = admin.firestore();
    const auth = admin.auth();

    console.log('Starting Firestore seeding...');

    // Create test users
    const testUsers: User[] = [
      {
        uid: 'user_001',
        email: 'rahul.sharma@example.com',
        displayName: 'Rahul Sharma',
        phoneNumber: '+919876543210',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: 'user_002',
        email: 'priya.patel@example.com',
        displayName: 'Priya Patel',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        uid: 'user_003',
        email: 'amit.kumar@example.com',
        displayName: 'Amit Kumar',
        phoneNumber: '+919123456780',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    // Create auth users
    for (const user of testUsers) {
      try {
        await auth.createUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
        });
        console.log(`Created auth user: ${user.email}`);
      } catch (error: any) {
        if (error.code === 'auth/uid-already-exists') {
          console.log(`Auth user already exists: ${user.email}`);
        } else {
          console.error(`Error creating auth user ${user.email}:`, error.message);
        }
      }

      // Create user profile in Firestore
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber || '',
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=7c3aed&color=fff`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Created user profile: ${user.displayName}`);
    }

    // Create events
    const events: Event[] = [
      {
        title: "VYBB CIRCLE: OPEN MIC NIGHT",
        description: "Join us for an intimate night of music, poetry, and storytelling at Vybb Central South West. This edition features emerging indie talent from across Bhubaneswar. Whether you're a performer or just want to soak in the vybb, this is the place to be. Experience raw talent, heartfelt performances, and connect with the local arts community.",
        date: "Jan 10, 2026",
        time: "7:00 PM - 10:00 PM",
        venue: "Vybb Central South West @ Sapphire Smoke",
        address: "K-8/844, Ghatikia Main Rd, K8 Kalinga Nagar, Kalinganagar, Bhubaneswar, Odisha 751029",
        coordinates: {
          lat: 20.2769,
          lng: 85.8339
        },
        price: 299,
        totalSeats: 16,
        availableSeats: 12,
        imageUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnBveGMwNmVhZmcyZGl1cW5seGo4aXVzYmZzZ3NpcnFqaHZ5NDl2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f2EMxTj6cOR3RDtHwh/giphy.gif",
        category: "OPEN MIC",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "JAMMING SESSION: JAZZ & BLUES",
        description: "A collaborative session for jazz and blues enthusiasts. Bring your instruments or just your ears. We provide the backline, you provide the groove. Whether you're a seasoned musician or just starting out, this is your space to experiment, collaborate, and create beautiful music together. All skill levels welcome!",
        date: "Jan 15, 2026",
        time: "6:00 PM - 11:00 PM",
        venue: "Rhythm House",
        address: "MG Road, Central District, Bhubaneswar, India",
        coordinates: {
          lat: 20.2961,
          lng: 85.8245
        },
        price: 499,
        totalSeats: 30,
        availableSeats: 24,
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
        category: "JAM SESSION",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "INDIE ARTIST SHOWCASE",
        description: "Discover unique indie talent from across the city. This curated showcase features the best emerging artists in Bhubaneswar's indie scene. From folk singers to electronic producers, experience diverse sounds and styles in an intimate setting. Perfect for music lovers looking to discover something new.",
        date: "Jan 22, 2026",
        time: "8:00 PM - 11:00 PM",
        venue: "Vybb Garden",
        address: "Cultural District, Bhubaneswar, India",
        coordinates: {
          lat: 20.2919,
          lng: 85.8314
        },
        price: 799,
        totalSeats: 40,
        availableSeats: 32,
        imageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800",
        category: "LIVE MUSIC",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "ACOUSTIC SUNDAYS: UNPLUGGED EDITION",
        description: "Relaxed Sunday evening with acoustic performances. Leave your worries behind and unwind with soothing acoustic melodies. Perfect for a chill weekend evening with friends or a cozy date night. Featuring local acoustic artists in a candlelit setting.",
        date: "Jan 17, 2026",
        time: "5:00 PM - 8:00 PM",
        venue: "The Terrace Cafe",
        address: "Jaydev Vihar, Bhubaneswar",
        coordinates: {
          lat: 20.3012,
          lng: 85.8123
        },
        price: 399,
        totalSeats: 25,
        availableSeats: 20,
        imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800",
        category: "ACOUSTIC",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "BEATBOX & RAP BATTLE",
        description: "Witness epic beatbox battles and rap showdowns. The stage is set for the most talented beatboxers and rappers in the city to compete for glory. Cheer for your favorites or sign up to participate! High energy, creative flows, and unforgettable performances.",
        date: "Jan 29, 2026",
        time: "8:00 PM - 12:00 AM",
        venue: "Urban Beat Lounge",
        address: "Sahid Nagar, Bhubaneswar",
        coordinates: {
          lat: 20.2867,
          lng: 85.8278
        },
        price: 599,
        totalSeats: 50,
        availableSeats: 45,
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800",
        category: "HIP HOP",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    const eventIds: string[] = [];
    
    for (const event of events) {
      const eventRef = await db.collection('events').add(event);
      eventIds.push(eventRef.id);
      console.log(`Created event: ${event.title} (ID: ${eventRef.id})`);
    }

    // Create sample bookings
    const bookings: Booking[] = [
      {
        userId: 'user_001',
        eventId: eventIds[0], // Open Mic Night
        attendeeDetails: {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com'
        },
        seatNumbers: ['A1', 'A2'],
        paymentId: 'pay_mock_001',
        paymentStatus: 'completed',
        amount: 598, // 2 seats * 299
        bookingDate: '2026-01-05T10:30:00Z',
        eventTitle: "VYBB CIRCLE: OPEN MIC NIGHT",
        eventDate: "Jan 10, 2026",
        eventVenue: "Vybb Central South West @ Sapphire Smoke",
        ticketCount: 2,
        ticketPrice: 299,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        userId: 'user_002',
        eventId: eventIds[1], // Jazz & Blues
        attendeeDetails: {
          name: 'Priya Patel',
          email: 'priya.patel@example.com'
        },
        seatNumbers: ['B3', 'B4', 'B5'],
        paymentId: 'pay_mock_002',
        paymentStatus: 'completed',
        amount: 1497, // 3 seats * 499
        bookingDate: '2026-01-08T14:45:00Z',
        eventTitle: "JAMMING SESSION: JAZZ & BLUES",
        eventDate: "Jan 15, 2026",
        eventVenue: "Rhythm House",
        ticketCount: 3,
        ticketPrice: 499,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        userId: 'user_003',
        eventId: eventIds[2], // Indie Showcase
        attendeeDetails: {
          name: 'Amit Kumar',
          email: 'amit.kumar@example.com'
        },
        seatNumbers: ['C1'],
        paymentId: 'pay_mock_003',
        paymentStatus: 'completed',
        amount: 799, // 1 seat * 799
        bookingDate: '2026-01-10T09:15:00Z',
        eventTitle: "INDIE ARTIST SHOWCASE",
        eventDate: "Jan 22, 2026",
        eventVenue: "Vybb Garden",
        ticketCount: 1,
        ticketPrice: 799,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const booking of bookings) {
      const bookingRef = await db.collection('bookings').add(booking);
      console.log(`Created booking for ${booking.attendeeDetails.name} (ID: ${bookingRef.id})`);
    }

    // Update event available seats based on bookings
    const eventsCollection = db.collection('events');
    
    // Update Open Mic event (4 seats booked: A1, A2 pre-booked + 2 from booking)
    await eventsCollection.doc(eventIds[0]).update({
      availableSeats: 12 // 16 total - 4 booked
    });
    
    // Update Jazz event (6 seats booked: 3 pre-booked + 3 from booking)
    await eventsCollection.doc(eventIds[1]).update({
      availableSeats: 24 // 30 total - 6 booked
    });

    console.log('\n✅ Firestore seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${testUsers.length} users`);
    console.log(`- Created ${events.length} events`);
    console.log(`- Created ${bookings.length} bookings`);
    console.log('\n🔧 Test Credentials:');
    console.log('1. Email: rahul.sharma@example.com | Password: (set via Firebase Console)');
    console.log('2. Email: priya.patel@example.com | Password: (set via Firebase Console)');
    console.log('3. Email: amit.kumar@example.com | Password: (set via Firebase Console)');
    console.log('\n📝 Note: You need to set passwords for these users in Firebase Console > Authentication');
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
};

// Run the seed function
seedFirestore();