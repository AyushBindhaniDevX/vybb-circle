# Quick Start: Admin Dashboard

## 🚀 Setup (One-time)

### Add Your First Admin

1. **Open your website** in a browser
2. **Press F12** to open Developer Console
3. **Copy and paste** the script from `scripts/add-admin-console.js`
4. **Enter your email** when prompted
5. **Refresh the page**
6. **Look for "Admin" link** in the navbar (with shield icon)

## 📊 Using the Dashboard

### Navigate to Admin
- Click **Admin** in the navbar (shield icon)
- Or go directly to: `yoursite.com/admin`

### Three Main Tabs

#### 1️⃣ All Bookings
- **Search** by name, email, or booking ID
- **Filter** by event or check-in status
- **Check in** guests with one click
- See all attendee details (name, email, phone, seats)

#### 2️⃣ By Event
- View guests **grouped by event**
- See event metrics (revenue, attendance)
- **Seat assignments** visible
- Quick check-in for each guest

#### 3️⃣ Analytics
- **Revenue** per event
- **Ticket sales** statistics
- **Check-in rates**
- **Available seats** tracking

## ✅ Check-in Process

1. Go to **All Bookings** or **By Event** tab
2. Find the guest (use search if needed)
3. Click **"Check In"** button
4. Status changes to ✓ Checked In (green badge)
5. Timestamp recorded automatically

## 🔍 Search & Filter

### Search Works On:
- Guest name
- Email address
- Booking ID

### Filter Options:
- **By Event**: See only specific event bookings
- **By Status**: 
  - All Status
  - Checked In (already checked in)
  - Pending (not checked in yet)

## 📈 Analytics Cards

Top of dashboard shows:
- 💰 **Total Revenue** - All completed payments
- 🎫 **Tickets Sold** - Total tickets across all events
- ✅ **Checked In** - Guests who arrived
- 📅 **Total Events** - Active events

## 🎯 Common Tasks

### Check in a guest at the door
1. Go to admin dashboard
2. Search guest name or email
3. Click "Check In" button
4. Done! ✓

### View event performance
1. Go to "Analytics" tab
2. See per-event breakdown
3. Check-in rates shown as percentage

### Export/Download (Future)
Currently shows in-browser. Future updates will add CSV export.

## 🔐 Security Notes

- Only approved admin emails can access `/admin`
- Non-admin users are redirected to homepage
- Check-in actions are logged with admin email
- All changes tracked with timestamps

## 💡 Tips

- **Use filters** to reduce clutter during busy events
- **Search by phone** if guest doesn't remember email
- **Check analytics** before events to verify sales
- **Monitor check-in rates** during events

## 🆘 Troubleshooting

**Admin link not showing?**
- Verify email is in Firestore `admins` collection
- Check `approved: true` is set
- Refresh the page

**Can't check in guests?**
- Verify you're logged in as admin
- Check Firebase rules allow updates
- Look for errors in browser console (F12)

**Data not loading?**
- Check internet connection
- Verify Firebase is configured correctly
- Look for errors in console

## 📱 Mobile Access

The admin dashboard works on mobile browsers:
- Use landscape mode for better table view
- Search works great on mobile
- One-tap check-in buttons

---

**Need Help?** Check the full guide in `ADMIN_SETUP.md`
