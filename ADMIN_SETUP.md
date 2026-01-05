# Admin Dashboard Setup Guide

## Overview
The admin dashboard provides event management, guest check-in, and analytics functionality. Only approved admin users can access this dashboard.

## Features
✅ **Analytics Dashboard** - View revenue, ticket sales, and event metrics
✅ **Guest Management** - View all bookings with detailed information
✅ **Event-wise Tables** - See guests grouped by event
✅ **Check-in System** - Mark guests as checked in with timestamp
✅ **Search & Filters** - Find bookings by name, email, event, or status
✅ **Real-time Updates** - Live data from Firestore

## How to Add Admin Users

### Method 1: Browser Console (Recommended)

1. **Navigate to your site** (must be logged in)

2. **Open Browser Console**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

3. **Copy and paste this script**:

\`\`\`javascript
// Open the file: scripts/add-admin-console.js
// Copy ALL the code and paste it into the console
\`\`\`

4. **Enter the admin email** when prompted

5. **Refresh the page** - The Admin link will appear in the navbar

### Method 2: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database**
4. Create a collection named `admins` (if it doesn't exist)
5. Click **Add Document**
6. Enter these fields:
   - **email**: (string) `admin@example.com`
   - **approved**: (boolean) `true`
   - **role**: (string) `admin`
   - **createdAt**: (timestamp) Current time
7. Save the document
8. User can now access `/admin` page

## Admin Page Routes

- **Main Dashboard**: `/admin`
- **Analytics**: `/admin` → Analytics Tab
- **Guest Tables**: `/admin` → By Event Tab
- **All Bookings**: `/admin` → All Bookings Tab

## Dashboard Features

### 1. Analytics Overview
- Total Revenue
- Tickets Sold
- Checked-in Count
- Total Events

### 2. All Bookings Tab
- Search by name, email, or booking ID
- Filter by event
- Filter by check-in status
- Bulk view of all attendees
- Quick check-in button

### 3. By Event Tab
- Grouped by event
- Event-specific metrics (revenue, attendance)
- Table view of guests per event
- Seat assignments visible
- Check-in tracking

### 4. Analytics Tab
- Per-event statistics
- Check-in rates
- Available seats
- Revenue breakdown

## Security

### Firestore Rules
Add these security rules to your Firestore:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin collection - only admins can read
    match /admins/{adminId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
      allow write: if false; // Only via console or cloud functions
    }
    
    // Bookings - users can read their own, admins can read all
    match /bookings/{bookingId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email))
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    
    // Events - public read, admin write
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
  }
}
\`\`\`

## Admin Functions

The following functions are available in `lib/db-utils.ts`:

- `isAdminUser(email: string)` - Check if user is an approved admin
- `getAllBookings()` - Get all bookings for admin view
- `getBookingsByEvent(eventId: string)` - Get bookings for specific event
- `checkInBooking(bookingId: string, adminEmail: string)` - Mark booking as checked in
- `getAnalytics()` - Get comprehensive analytics data

## Troubleshooting

### Admin Link Not Showing
1. Verify email is added to Firestore `admins` collection
2. Check `approved` field is set to `true`
3. Refresh the page after adding admin
4. Check browser console for errors

### Can't Access Admin Page
1. Ensure you're logged in with the admin email
2. Verify Firestore rules allow admin access
3. Check Firebase Console for the admin document

### Check-in Not Working
1. Verify Firestore rules allow updates to bookings
2. Check that `checkedIn` field is being set
3. Look for errors in browser console

## Development

To run locally:

\`\`\`bash
npm run dev
\`\`\`

Navigate to:
- Homepage: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin`

## Admin User Management

### Add Admin
Use the console script: `scripts/add-admin-console.js`

### Remove Admin
1. Go to Firebase Console → Firestore
2. Find the admin document in `admins` collection
3. Set `approved` to `false` or delete the document

### Admin Roles
- `admin` - Full access to dashboard, check-ins, analytics
- `superadmin` - (Future) Additional permissions for user management

## Best Practices

1. **Use secure emails** - Only add trusted email addresses as admins
2. **Regular audits** - Periodically review admin user list
3. **Backup data** - Export Firestore data regularly
4. **Monitor access** - Check Firestore logs for admin activity
5. **Test thoroughly** - Test check-in functionality before events

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase configuration
3. Review Firestore rules
4. Check that all required fields are present in admin documents
