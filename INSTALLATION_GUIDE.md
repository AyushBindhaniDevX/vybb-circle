# 🚀 Quick Setup Guide - QR Check-In & Email System

## Installation Steps

### 1. Install Required Packages

```bash
# Install Resend for email notifications
npm install resend

# Install jsQR for QR code scanning
npm install jsqr

# Or use pnpm
pnpm add resend jsqr
```

### 2. Environment Variables

Add to your `.env.local` file:

```bash
# Resend API Key (get from resend.com)
RESEND_API_KEY=re_your_api_key_here

# Optional: Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Resend API Key

1. Visit [resend.com](https://resend.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key and add to `.env.local`

### 4. Test Email Functionality

```bash
# Start your dev server
npm run dev

# In another terminal, run the test script
node scripts/test-email.js
```

**Before running the test:**
- Update email addresses in `scripts/test-email.js`
- Make sure dev server is running
- Check your inbox (and spam folder)

## ✅ What's Been Added

### New Files Created

1. **`lib/resend.ts`** - Email configuration and templates
2. **`components/qr-scanner.tsx`** - QR code scanner component
3. **`app/kiosk/page.tsx`** - Self-service check-in kiosk
4. **`app/api/send-ticket-email/route.ts`** - API for ticket emails
5. **`app/api/send-checkin-email/route.ts`** - API for check-in emails
6. **`scripts/test-email.js`** - Email testing script
7. **`QR_CHECKIN_SETUP.md`** - Comprehensive documentation

### Modified Files

1. **`app/admin/page.tsx`**
   - Added QR scanner button
   - Added scan functionality
   - Toast notifications

2. **`lib/db-utils.ts`**
   - Updated `checkInBooking()` to send emails
   - Added check-in email trigger

3. **`components/ticket-view.tsx`**
   - Already had QR code generation (no changes needed)

## 🎯 Features Ready to Use

### 1. Admin QR Scanner
- Navigate to `/admin`
- Click **"Scan QR Code"** button in header
- Point camera at guest's QR code
- Auto check-in on scan

### 2. Kiosk Mode
- Navigate to `/kiosk`
- Full-screen self-service interface
- Guests can self-check-in
- Auto-resets after each guest

### 3. Email Notifications

**Ticket Confirmation Email:**
- Sent on ticket purchase
- Includes QR code
- Event details
- Seat assignments

**Check-In Confirmation Email:**
- Sent when guest checks in
- Timestamp recorded
- Welcome message

## 🔧 Configuration Options

### Update Email Sender

Edit `lib/resend.ts`:

```typescript
// Change these to your verified domain
from: 'VYBB LIVE <tickets@yourdomain.com>'
from: 'VYBB LIVE <checkin@yourdomain.com>'
```

### Customize Email Templates

Edit functions in `lib/resend.ts`:
- `generateTicketEmailHTML()` - Ticket confirmation template
- `generateCheckInEmailHTML()` - Check-in template

### QR Code Styling

Edit `components/ticket-view.tsx`:

```tsx
<QRCodeSVG 
  value={qrData} 
  size={160}  // Change size
  level="H"   // Error correction level
  bgColor="#ffffff"  // Background color
  fgColor="#000000"  // Foreground color
/>
```

## 📱 Usage Guide

### For Admin Staff

1. **Check-In via QR Scanner:**
   - Open admin dashboard
   - Click "Scan QR Code"
   - Scan guest ticket
   - Confirm check-in

2. **Manual Check-In:**
   - Search guest name/email
   - Click "Check In" button
   - Guest receives confirmation email

### For Venue Setup (Kiosk)

1. **Hardware:**
   - iPad or Android tablet
   - Tablet stand
   - Good lighting

2. **Setup:**
   - Navigate to `/kiosk`
   - Keep browser open
   - Disable screen sleep
   - Test QR scanning

3. **Guest Flow:**
   - Guest taps "Scan QR Code"
   - Shows their ticket
   - Auto check-in
   - Success screen displays

## 🧪 Testing Checklist

- [ ] Install `resend` and `jsqr` packages
- [ ] Add `RESEND_API_KEY` to `.env.local`
- [ ] Run `npm run dev`
- [ ] Test email script: `node scripts/test-email.js`
- [ ] Check emails received (inbox/spam)
- [ ] Test QR scanner on `/admin`
- [ ] Test kiosk mode on `/kiosk`
- [ ] Scan test QR code
- [ ] Verify check-in email sent
- [ ] Test manual entry fallback

## 🐛 Troubleshooting

### "Cannot find module 'resend'" Error

```bash
# Install the package
npm install resend

# Restart dev server
npm run dev
```

### Emails Not Sending

1. Check `.env.local` has `RESEND_API_KEY`
2. Verify API key is correct in Resend dashboard
3. Check API key is active (not revoked)
4. Restart dev server after adding env variable

### QR Scanner Not Working

1. Allow camera permissions in browser
2. Use HTTPS (or localhost)
3. Check lighting conditions
4. Use manual entry as fallback

### Camera Permission Denied

- Clear browser permissions
- Reload page
- Try different browser
- Check device camera works

## 🎨 Customization

### Brand Colors

Update email templates in `lib/resend.ts`:

```typescript
// Find and replace color hex codes
#8b5cf6  // Violet/Purple
#a855f7  // Light purple
#22c55e  // Green (success)
#f59e0b  // Orange (warning)
```

### Email Content

Edit the HTML in:
- `generateTicketEmailHTML()`
- `generateCheckInEmailHTML()`

All inline styles for email compatibility.

## 📊 Monitoring

### Check Email Status

1. Go to [Resend Dashboard](https://resend.com/emails)
2. View sent emails
3. Check delivery status
4. Monitor bounce rates

### Check-In Analytics

Admin Dashboard shows:
- Total check-ins
- Check-in rates per event
- Timestamps
- Admin who checked in

## 🚀 Production Deployment

### Before Going Live

1. **Verify Domain** (optional but recommended):
   - Add domain in Resend
   - Configure DNS records
   - Update sender addresses

2. **Test Everything:**
   - Send test emails
   - Scan QR codes
   - Check kiosk mode
   - Verify all routes work

3. **Environment Variables:**
   - Add `RESEND_API_KEY` to production
   - Update `NEXT_PUBLIC_APP_URL`

4. **Kiosk Setup:**
   - Dedicated tablet
   - Reliable WiFi
   - Staff training

## 📖 Documentation

- **Full Setup:** See `QR_CHECKIN_SETUP.md`
- **Admin Guide:** See `ADMIN_SETUP.md`
- **Quick Start:** See `ADMIN_QUICKSTART.md`

## 💡 Tips

- Keep QR codes high contrast (black/white)
- Test with various phones/cameras
- Have manual entry as backup
- Monitor email deliverability
- Train staff before events

---

**Ready to go! 🎉**

Run `npm run dev` and test the features!
