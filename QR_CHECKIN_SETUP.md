# QR Code Check-In & Email Notifications Setup

## 🎯 New Features

### 1. QR Code Generation
- Every ticket includes a unique QR code
- QR code contains booking ID and user ID
- High contrast design for reliable scanning
- Automatically displayed on ticket view

### 2. QR Code Scanner
- Works on admin dashboard
- Standalone kiosk mode for self-service
- Camera-based scanning
- Manual entry fallback option
- Real-time validation

### 3. Email Notifications
- Ticket confirmation emails on purchase
- Check-in confirmation emails
- Professional HTML templates
- Branded VYBB LIVE design

### 4. Kiosk Mode
- Self-service check-in interface
- Large touch-friendly buttons
- QR scanner integration
- Auto-reset after each guest

## 📦 Installation

### 1. Install Resend Package

```bash
npm install resend
# or
pnpm add resend
# or
yarn add resend
```

### 2. Install jsQR for QR Scanning

```bash
npm install jsqr
# or
pnpm add jsqr
```

Or add via CDN in your `app/layout.tsx`:

```tsx
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>
```

## 🔧 Configuration

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Your domain (for email from address)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up/Login
3. Navigate to API Keys
4. Create new API key
5. Copy and add to `.env.local`

### 3. Verify Domain (Optional but Recommended)

For production:
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., vybb.live)
3. Add DNS records provided by Resend
4. Update email addresses in `lib/resend.ts`:
   - Change `tickets@vybb.live` to your domain
   - Change `checkin@vybb.live` to your domain

## 🎫 QR Code Features

### QR Code Data Structure

Each QR code contains:
```json
{
  "bid": "booking_id",
  "uid": "user_id"
}
```

### Where QR Codes Appear

1. **Ticket View** (`/tickets/[id]`) - Displays QR code
2. **Email Confirmations** - Embedded QR image
3. **Profile Page** - On all user tickets

### Scanning QR Codes

**Admin Dashboard:**
- Click "Scan QR Code" button in header
- Camera opens automatically
- Point at QR code to scan
- Auto check-in on successful scan

**Kiosk Mode:**
- Navigate to `/kiosk`
- Tap "Scan QR Code"
- Guest self-scans their ticket
- Instant feedback on screen

## 📧 Email Templates

### Ticket Confirmation Email

Sent automatically when:
- Payment is completed
- Booking is created successfully

Contains:
- Event details (name, date, time, venue)
- Guest information
- Seat assignments
- QR code for entry
- Important instructions
- Booking ID

### Check-In Confirmation Email

Sent automatically when:
- Guest is checked in
- Either via admin dashboard or kiosk

Contains:
- Check-in timestamp
- Event details
- Seat information
- Welcome message

## 🖥️ Pages & Routes

### New Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/kiosk` | Self-service check-in terminal | Public (for venue) |
| `/admin` (updated) | Admin dashboard with QR scanner | Admin only |

### Kiosk Mode Features

- **Large UI** - Optimized for tablets/touchscreens
- **Auto-Reset** - Returns to idle after 5 seconds
- **Status Feedback** - Visual success/error states
- **Manual Entry** - Fallback if camera fails
- **Offline Ready** - Works with poor connectivity

## 🔍 How It Works

### Ticket Purchase Flow

```
User Books Ticket
    ↓
Payment Completed
    ↓
Booking Created in Firestore
    ↓
QR Code Generated (booking ID)
    ↓
Ticket Email Sent (with QR code)
    ↓
User Receives Confirmation
```

### Check-In Flow

```
Guest Arrives at Venue
    ↓
QR Code Scanned (Admin or Kiosk)
    ↓
Booking Validated
    ↓
Check-In Status Updated
    ↓
Check-In Email Sent
    ↓
Guest Enters Event
```

## 🎨 UI Components

### QR Scanner Component

Located: `components/qr-scanner.tsx`

Features:
- Camera access with permissions
- Live video preview
- Scanning animation
- Manual entry option
- Error handling

Usage:
```tsx
import { QRScanner } from '@/components/qr-scanner'

<QRScanner
  isOpen={scannerOpen}
  onScan={(data) => handleScan(data)}
  onClose={() => setScannerOpen(false)}
/>
```

## 🔐 Security

### QR Code Security

- Each QR code is unique per booking
- Contains encrypted booking ID
- Validated against Firestore
- Cannot be reused after check-in
- Timestamp tracked

### Email Security

- Sent via Resend (secure delivery)
- SPF/DKIM verification when domain verified
- Only sent to booking email address
- Contains no sensitive payment info

## 🚀 Deployment Checklist

### Before Going Live

- [ ] Install resend package
- [ ] Add RESEND_API_KEY to environment
- [ ] Test email sending (use test mode)
- [ ] Verify domain in Resend (optional)
- [ ] Test QR scanning with real devices
- [ ] Set up kiosk tablet at venue
- [ ] Train staff on admin QR scanner
- [ ] Test manual entry fallback
- [ ] Check email deliverability
- [ ] Review email templates

### Kiosk Setup (Venue)

1. **Hardware:**
   - iPad or Android tablet (10"+ recommended)
   - Stand or mount for self-service
   - Good lighting for QR scanning

2. **Software:**
   - Browser in kiosk mode
   - Navigate to `/kiosk`
   - Keep screen on (disable sleep)
   - Clear browser cache before event

3. **Location:**
   - Entry point with good lighting
   - Visible staff nearby for help
   - Stable internet connection

## 📊 Analytics

### Track Check-Ins

All check-ins are logged with:
- Timestamp (`checkedInAt`)
- Admin/kiosk identifier (`checkedInBy`)
- Booking details

View in:
- Admin Dashboard → Analytics tab
- Firestore console

### Email Deliverability

Monitor in Resend Dashboard:
- Email delivery status
- Open rates
- Bounce rates
- Spam reports

## 🆘 Troubleshooting

### QR Scanner Not Working

**Camera Permission Denied:**
- Check browser permissions
- Allow camera access
- Reload page
- Try different browser

**QR Code Not Scanning:**
- Improve lighting
- Hold phone steady
- Use manual entry
- Check QR code quality

### Emails Not Sending

**API Key Invalid:**
- Verify RESEND_API_KEY in .env
- Check key is active in Resend dashboard
- Restart dev server

**Emails Going to Spam:**
- Verify domain in Resend
- Add SPF/DKIM records
- Use verified sender address
- Ask users to whitelist

### Kiosk Issues

**Screen Timing Out:**
- Enable "Keep Awake" mode
- Use browser extension
- Adjust device settings

**Touch Not Responsive:**
- Calibrate touchscreen
- Clean screen
- Check browser compatibility

## 💡 Best Practices

### For Events

1. **Test Before Event:**
   - Scan test QR codes
   - Verify email delivery
   - Train staff on system

2. **Multiple Check-In Points:**
   - Use admin dashboard for express lane
   - Use kiosk for self-service
   - Keep manual entry available

3. **Lighting:**
   - Ensure good lighting at entry
   - QR codes need clear visibility

4. **Backup Plan:**
   - Manual entry always available
   - Staff with admin access
   - Printed guest list as fallback

### For Guests

1. **Bring QR Code:**
   - Save ticket email
   - Screenshot QR code
   - Have booking ID ready

2. **Arrive Early:**
   - Allow time for check-in
   - Especially for first use

3. **Brightness:**
   - Turn up screen brightness
   - Clean phone screen

## 📱 Mobile Optimization

All features work on mobile:
- Admin scanner uses rear camera
- Kiosk works on tablets
- Emails are mobile-responsive
- Touch-optimized interfaces

## 🔄 Updates & Maintenance

### Regular Tasks

- Monitor email deliverability
- Check QR scanning success rate
- Review check-in analytics
- Update email templates seasonally
- Clean up old bookings

### Future Enhancements

Potential additions:
- Offline QR scanning
- Batch check-in
- Guest photos on check-in
- SMS notifications
- Multi-language emails
- Check-in statistics export

---

**Questions?** Check main docs or contact support
