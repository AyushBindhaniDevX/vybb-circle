// Test script for Resend email functionality
// Run this in your terminal: node scripts/test-email.js

const testTicketEmail = {
  to: "test@example.com", // CHANGE THIS to your email
  name: "John Doe",
  eventTitle: "Open Mic Night",
  eventDate: "March 15, 2026",
  eventTime: "7:00 PM IST",
  eventVenue: "UNDERPASS STUDIO",
  eventAddress: "123 Music Lane, Mumbai, India",
  ticketCount: 2,
  seatNumbers: ["A1", "A2"],
  bookingId: "test_booking_123",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=test_booking_123",
  totalAmount: 1000
}

const testCheckInEmail = {
  to: "test@example.com", // CHANGE THIS to your email
  name: "John Doe",
  eventTitle: "Open Mic Night",
  eventDate: "March 15, 2026",
  eventVenue: "UNDERPASS STUDIO",
  checkInTime: "6:45 PM IST - March 15, 2026",
  seatNumbers: ["A1", "A2"]
}

async function testEmails() {
  console.log('🧪 Testing Email Functionality\n')

  // Test Ticket Confirmation Email
  console.log('📧 Testing Ticket Confirmation Email...')
  try {
    const ticketResponse = await fetch('http://localhost:3000/api/send-ticket-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTicketEmail)
    })
    
    const ticketResult = await ticketResponse.json()
    
    if (ticketResult.success) {
      console.log('✅ Ticket email sent successfully!')
    } else {
      console.error('❌ Ticket email failed:', ticketResult.error)
    }
  } catch (error) {
    console.error('❌ Ticket email error:', error.message)
  }

  console.log('')

  // Test Check-In Confirmation Email
  console.log('📧 Testing Check-In Confirmation Email...')
  try {
    const checkinResponse = await fetch('http://localhost:3000/api/send-checkin-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCheckInEmail)
    })
    
    const checkinResult = await checkinResponse.json()
    
    if (checkinResult.success) {
      console.log('✅ Check-in email sent successfully!')
    } else {
      console.error('❌ Check-in email failed:', checkinResult.error)
    }
  } catch (error) {
    console.error('❌ Check-in email error:', error.message)
  }

  console.log('\n📝 Notes:')
  console.log('- Make sure your dev server is running (npm run dev)')
  console.log('- Check RESEND_API_KEY is set in .env.local')
  console.log('- Update email addresses in this script before running')
  console.log('- Check your inbox (and spam folder)')
}

// Run tests
testEmails()
