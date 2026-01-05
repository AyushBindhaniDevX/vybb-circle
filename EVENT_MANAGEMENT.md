# Event Management - Admin Dashboard

## 🎯 New Features

### Event Management Tab
Complete CRUD (Create, Read, Update, Delete) functionality for managing events directly from the admin dashboard.

## 📋 Features

### 1. **View All Events**
- Beautiful card-based grid layout
- Event images with hover effects
- Key information at a glance:
  - Title & category
  - Date & time
  - Venue & price
  - Available seats
- Quick access to edit/delete actions

### 2. **Create New Events**
Full event creation form with all fields:
- **Basic Info:**
  - Event title
  - Description
  - Category (Open Mic, Jam Session, Live Music, Workshop)
  
- **Schedule:**
  - Date picker
  - Time selector
  - Venue name
  - Full address
  
- **Ticketing:**
  - Price (₹)
  - Total seats
  - Auto-calculated available seats
  
- **Media:**
  - Image URL with live preview
  - High-quality event images

### 3. **Edit Existing Events**
- Click edit button on any event card
- Pre-filled form with current data
- Update any field
- Save changes instantly
- Events refresh automatically

### 4. **Delete Events**
- Click delete button on event card
- Confirmation dialog prevents accidents
- Safety check: Cannot delete events with bookings
- Soft delete (marked as deleted, not removed)

## 🎨 UI/UX Highlights

### Event Cards
- **Image Hover Effect** - Zoom on hover
- **Gradient Overlay** - Better text readability
- **Category Badge** - Color-coded tags
- **Seat Counter** - Violet highlight for available seats
- **Action Buttons** - Edit (violet) and Delete (red)

### Event Form Modal
- **Full-screen Overlay** - Focus on form
- **Two-column Layout** - Efficient space usage
- **Live Image Preview** - See your image before saving
- **Validation** - Required fields marked
- **Responsive** - Works on all screen sizes

### Delete Confirmation
- **Red Warning Theme** - Clear danger indicator
- **Event Name Display** - Confirm correct event
- **Two-button Choice** - Clear cancel/confirm options
- **Safety First** - Prevents accidental deletions

## 🚀 Usage Guide

### Access Event Management

1. Navigate to `/admin`
2. Click **"Manage Events"** tab
3. See all your events in grid view

### Create a New Event

1. Click **"Create Event"** button (top right)
2. Fill in all required fields:
   ```
   ✓ Event Title
   ✓ Category  
   ✓ Description
   ✓ Date & Time
   ✓ Venue & Address
   ✓ Price & Seats
   ✓ Image URL
   ```
3. Click **"Create Event"**
4. Event appears immediately in grid

### Edit an Event

1. Find event card in grid
2. Click **Edit button** (pencil icon)
3. Form opens with current data
4. Modify any fields
5. Click **"Update Event"**
6. Changes saved instantly

### Delete an Event

1. Find event card in grid
2. Click **Delete button** (trash icon)
3. Confirmation dialog appears
4. Verify event name is correct
5. Click **"Delete Event"** to confirm
6. Event removed from display

**Note:** Cannot delete events with existing bookings!

## 📱 Responsive Design

### Desktop (1280px+)
- 3 events per row
- Full-width form modal
- All details visible

### Tablet (768px - 1279px)
- 2 events per row
- Optimized form layout
- Touch-friendly buttons

### Mobile (< 768px)
- 1 event per row
- Stacked form fields
- Large tap targets

## 🔐 Security & Validation

### Form Validation
- All required fields enforced
- Number inputs validated (price, seats)
- Date/time in correct format
- Image URL must be valid

### Database Safety
- Events with bookings cannot be deleted
- Soft delete preserves history
- Timestamps track all changes
- Admin email logged for updates

### Firestore Structure
```typescript
events/{eventId} {
  title: string
  description: string
  date: string
  time: string
  venue: string
  address: string
  coordinates: { lat: number, lng: number }
  price: number
  totalSeats: number
  availableSeats: number
  imageUrl: string
  category: string
  createdAt: timestamp
  updatedAt: timestamp
  deleted?: boolean  // For soft deletes
  deletedAt?: timestamp
}
```

## 🎯 API Functions

### In `lib/db-utils.ts`

#### Create Event
```typescript
await createEvent({
  title: "Open Mic Night",
  description: "...",
  date: "2026-03-15",
  time: "19:00",
  venue: "UNDERPASS STUDIO",
  address: "123 Music St",
  coordinates: { lat: 19.0760, lng: 72.8777 },
  price: 500,
  totalSeats: 100,
  availableSeats: 100,
  imageUrl: "https://...",
  category: "open-mic"
})
```

#### Update Event
```typescript
await updateEvent(eventId, {
  price: 600,
  totalSeats: 120
})
```

#### Delete Event
```typescript
await deleteEvent(eventId)
// Throws error if event has bookings
```

## 🎨 Styling & Theme

### Color Scheme
- **Violet/Purple** (#8b5cf6) - Edit actions, primary CTA
- **Red** (#ef4444) - Delete actions, warnings
- **Green** (#22c55e) - Success states
- **Zinc/Gray** - Neutral backgrounds

### Animations
- **Card Hover** - Scale image 110%
- **Modal Entry** - Scale + fade in
- **Button Hover** - Color transitions
- **Form Focus** - Border highlights

## 💡 Tips & Best Practices

### Image URLs
- Use high-quality images (1920x1080 recommended)
- Unsplash is great for free images
- Ensure HTTPS URLs
- Test image loads before saving

### Event Descriptions
- Keep concise (2-3 sentences)
- Highlight key features
- Mention performers if applicable
- Include special notes

### Pricing Strategy
- Consider early bird discounts
- Round numbers work best (₹500 vs ₹499)
- Factor in platform fees
- Test price points

### Seat Management
- Always set realistic total seats
- Consider venue capacity
- Leave buffer for staff/VIP
- Monitor sales in analytics

## 🐛 Troubleshooting

### Event Not Appearing
- Check if marked as deleted
- Verify all required fields filled
- Check Firestore console
- Clear browser cache

### Cannot Delete Event
- Event has existing bookings
- Must cancel/refund bookings first
- Or mark as deleted manually in Firestore

### Image Not Loading
- Verify URL is accessible
- Check HTTPS protocol
- Test URL in new tab
- Use different image host

### Form Not Submitting
- Check all required fields (marked with *)
- Verify date format (YYYY-MM-DD)
- Ensure price > 0
- Check seats > 0

## 📊 Analytics Integration

Event management integrates with:
- **Booking Analytics** - Track per-event sales
- **Check-in Rates** - Monitor attendance
- **Revenue Reports** - Calculate earnings
- **Seat Utilization** - Optimize capacity

## 🔄 Workflow Examples

### Launch New Event Series
1. Create base event (e.g., "Open Mic - March")
2. Set competitive price
3. Promote via email/social
4. Monitor bookings in dashboard
5. Adjust seats if needed
6. Clone for future dates

### Update Sold-Out Event
1. Navigate to Manage Events
2. Find event card
3. Click Edit
4. Increase totalSeats
5. availableSeats auto-calculates
6. Save changes
7. More tickets available!

### Archive Old Events
1. Find past event
2. Click Delete
3. Confirm deletion
4. Marked as deleted
5. Hidden from public view
6. Data preserved for reports

## 🚀 Future Enhancements

Potential additions:
- Bulk event upload (CSV)
- Event templates
- Recurring events
- Custom fields
- Image upload (vs URL)
- Event cloning
- Draft events
- Scheduled publishing
- Email blast to attendees
- Export event data

## 📖 Related Documentation

- **Admin Setup:** `ADMIN_SETUP.md`
- **Admin Quick Start:** `ADMIN_QUICKSTART.md`
- **QR Check-In:** `QR_CHECKIN_SETUP.md`
- **Installation:** `INSTALLATION_GUIDE.md`

---

**Event Management is now complete! 🎉**

Create, edit, and manage your events with ease!
