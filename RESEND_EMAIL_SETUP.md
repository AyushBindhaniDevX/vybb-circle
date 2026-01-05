# Resend Email Integration - Setup Guide

## 🎯 Overview

Automated email notifications are now integrated using **Resend API** for:
1. **Ticket Confirmation** - Sent after successful booking
2. **Check-in Alert** - Sent when guest checks in at event

## 📧 Email Triggers

### 1. Ticket Confirmation Email
**When:** After successful payment and booking creation  
**Where:** `/app/checkout/page.tsx`  
**Recipient:** Customer email from booking form  
**Contains:**
- Event details (title, date, time, venue)
- Booking ID and QR code
- Seat numbers
- Total amount paid
- Check-in instructions

### 2. Check-in Confirmation Email
**When:** After admin checks in a guest  
**Where:** `/app/admin/page.tsx`  
**Recipient:** Customer email from booking  
**Contains:**
- Event details
- Check-in timestamp
- Admin who checked them in
- Seat numbers
- Welcome message

## 🚀 Setup Instructions

### Step 1: Install Resend Package

```powershell
npm install resend
```

Or if using pnpm:
```powershell
pnpm install resend
```

### Step 2: Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for free account (100 emails/day free tier)
3. Navigate to **API Keys** in dashboard
4. Click **"Create API Key"**
5. Copy the key (starts with `re_...`)

### Step 3: Add Environment Variable

Create or update `.env.local` file:

```env
RESEND_API_KEY=re_your_api_key_here
```

**Important:** Never commit `.env.local` to git!

### Step 4: Verify Domain (Optional but Recommended)

For production emails:
1. Add your domain in Resend dashboard
2. Add DNS records they provide
3. Wait for verification (usually instant)

For testing, use your verified email address.

## 📁 File Structure

```
lib/
  resend.ts              # Resend client & email templates

app/
  api/
    send-ticket-email/
      route.ts           # Ticket email API endpoint
    send-checkin-email/
      route.ts           # Check-in email API endpoint
  
  checkout/
    page.tsx             # Calls ticket email after booking
  
  admin/
    page.tsx             # Calls check-in email after check-in
```

## 🎨 Email Templates

Both emails feature:
- **VYBB LIVE Branding** - Purple/violet theme
- **Responsive HTML** - Works on all devices
- **QR Codes** - For ticket verification
- **Event Details** - Date, time, venue, seats
- **Professional Design** - Clean, modern layout

### Customizing Templates

Edit in [lib/resend.ts](lib/resend.ts):

```typescript
// Ticket confirmation template
generateTicketEmailHTML(data: TicketEmailData)

// Check-in confirmation template
generateCheckInEmailHTML(data: CheckInEmailData)
```

## 🔧 API Endpoints

### Send Ticket Email

**Endpoint:** `POST /api/send-ticket-email`

**Request Body:**
```json
{
  "to": "customer@example.com",
  "customerName": "John Doe",
  "eventTitle": "Open Mic Night",
  "eventDate": "2026-03-15",
  "eventTime": "19:00",
  "eventVenue": "UNDERPASS STUDIO",
  "eventAddress": "123 Music St, Mumbai",
  "seatNumbers": ["A1", "A2"],
  "bookingId": "abc123",
  "qrCodeData": "abc123",
  "totalAmount": 1000,
  "ticketCount": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### Send Check-in Email

**Endpoint:** `POST /api/send-checkin-email`

**Request Body:**
```json
{
  "to": "customer@example.com",
  "customerName": "John Doe",
  "eventTitle": "Open Mic Night",
  "eventDate": "2026-03-15",
  "eventVenue": "UNDERPASS STUDIO",
  "seatNumbers": ["A1", "A2"],
  "checkedInAt": "2026-03-15T19:00:00.000Z",
  "checkedInBy": "admin@vybb.live"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in email sent successfully"
}
```

## 🧪 Testing

### Test Ticket Email

1. Complete a booking on `/checkout`
2. Check terminal/console for email logs
3. Check your email inbox
4. Verify QR code is displayed

### Test Check-in Email

1. Go to `/admin` dashboard
2. Check in a guest (QR scan or manual)
3. Check guest's email inbox
4. Verify check-in details

### Debug Mode

Check console logs for:
```
✓ Email sent successfully
✗ Failed to send email: [error]
```

## 🔐 Security

- API key stored in `.env.local` (not committed)
- Server-side API routes only
- Email sending doesn't block booking/check-in
- Graceful error handling (fails silently)

## 💡 Best Practices

### Email Deliverability

1. **Verify Domain** - Much higher delivery rate
2. **Use Real From Address** - noreply@yourdomain.com
3. **Add SPF/DKIM** - Resend provides these
4. **Test Regularly** - Check spam folders

### Error Handling

Emails are non-blocking:
- If email fails, booking still succeeds
- Errors logged to console
- No user-facing errors for email issues

### Rate Limits

**Free Tier:** 100 emails/day  
**Pro Tier:** 50,000 emails/month ($20)

Monitor usage in Resend dashboard.

## 🎯 Email Flow Diagram

```
Booking Flow:
1. User fills form → 2. Payment success → 3. Create booking → 4. Send ticket email → 5. Redirect to ticket

Check-in Flow:
1. Admin scans QR → 2. Verify booking → 3. Mark checked in → 4. Send check-in email → 5. Show success
```

## 📊 Monitoring

### Resend Dashboard

Track:
- Emails sent
- Delivery rate
- Bounce rate
- Click tracking (if enabled)

### Application Logs

Check for:
```typescript
console.error('Failed to send confirmation email:', emailError)
console.error('Failed to send check-in email:', emailError)
```

## 🐛 Troubleshooting

### Email Not Sending

**Check:**
- ✓ RESEND_API_KEY in .env.local
- ✓ Resend package installed
- ✓ API route responding (check Network tab)
- ✓ Email address valid
- ✓ Not exceeding rate limits

**Solutions:**
```powershell
# Verify env variable
Write-Host $env:RESEND_API_KEY

# Check Resend package
npm list resend

# Test API route
Invoke-WebRequest -Uri http://localhost:3000/api/send-ticket-email -Method POST -ContentType "application/json" -Body '{"to":"test@example.com"}'
```

### Email in Spam

**Fix:**
- Verify domain in Resend
- Add SPF/DKIM records
- Use professional from address
- Avoid spam trigger words

### QR Code Not Showing

**Check:**
- QR code data is passed correctly
- Image encoding is valid base64
- Email client supports images

## 🚀 Production Checklist

Before going live:

- [ ] Install resend package
- [ ] Add RESEND_API_KEY to production env
- [ ] Verify sending domain
- [ ] Add DNS records (SPF, DKIM)
- [ ] Test with real email addresses
- [ ] Check spam folders
- [ ] Monitor delivery rate
- [ ] Set up email logs/alerts
- [ ] Document team access to Resend

## 📚 Resources

- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **React Email:** https://react.email (for advanced templates)
- **Pricing:** https://resend.com/pricing

## 🔄 Future Enhancements

Potential improvements:
- [ ] HTML templates using React Email
- [ ] Email preferences (opt-in/opt-out)
- [ ] Event reminders (24 hours before)
- [ ] Post-event feedback emails
- [ ] Booking modification emails
- [ ] Refund confirmation emails
- [ ] Admin digest emails (daily summary)
- [ ] Email analytics dashboard

---

**Resend integration complete! 📧**

Your customers will now receive professional email confirmations automatically!
