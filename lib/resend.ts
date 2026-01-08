// Resend Email Configuration
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface TicketEmailData {
  to: string
  name: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  eventAddress: string
  ticketCount: number
  seatNumbers: string[]
  bookingId: string
  qrCodeUrl: string
  totalAmount: number
}

export interface CheckInEmailData {
  to: string
  name: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  checkInTime: string
  seatNumbers: string[]
}

// Send ticket confirmation email
export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'VYBB LIVE <tickets@vybb.live>',
      to: [data.to],
      subject: `🎫 Your Ticket for ${data.eventTitle}`,
      html: generateTicketEmailHTML(data),
    })

    if (error) {
      console.error('Error sending ticket email:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Failed to send ticket email:', error)
    return { success: false, error }
  }
}

// Send check-in confirmation email
export async function sendCheckInConfirmationEmail(data: CheckInEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'VYBB LIVE <checkin@vybb.live>',
      to: [data.to],
      subject: `✅ Checked In - ${data.eventTitle}`,
      html: generateCheckInEmailHTML(data),
    })

    if (error) {
      console.error('Error sending check-in email:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Failed to send check-in email:', error)
    return { success: false, error }
  }
}

// Generate ticket confirmation email HTML
function generateTicketEmailHTML(data: TicketEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    body { font-family: 'Inter', -apple-system, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width: 600px; background: #09090b; border: 1px solid #1e1e1e; border-radius: 32px; overflow: hidden; border-spacing: 0;">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: left;">
              <div style="background: #7c3aed; width: 40px; height: 40px; border-radius: 12px; display: inline-block; vertical-align: middle; text-align: center; line-height: 40px; font-weight: 900; font-size: 20px;">⚡</div>
              <span style="font-size: 24px; font-weight: 900; font-style: italic; letter-spacing: -1px; margin-left: 10px; text-transform: uppercase;">VYBB <span style="color: #7c3aed;">CIRCLE</span></span>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 30px; text-align: left;">
              <h1 style="font-size: 48px; font-weight: 900; font-style: italic; text-transform: uppercase; margin: 0; line-height: 0.9;">TICKET<br><span style="color: #7c3aed;">CONFIRMED</span></h1>
              <p style="color: #52525b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-top: 20px;">PASS HASH: #${data.bookingId.substring(0, 8)}</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <div style="background: #ffffff; padding: 24px; border-radius: 24px; display: inline-block; box-shadow: 0 0 40px rgba(124, 58, 237, 0.3);">
                <img src="${data.qrCodeUrl}" alt="Ticket QR" style="width: 200px; height: 200px; display: block;" />
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" style="background: #18181b; border-radius: 24px; border: 1px solid #27272a; border-spacing: 0;">
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="font-size: 20px; font-weight: 900; font-style: italic; color: #ffffff; margin: 0 0 20px; text-transform: uppercase;">${data.eventTitle}</h2>
                    
                    <table width="100%" style="border-spacing: 0;">
                      <tr>
                        <td style="padding: 8px 0; color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase;">Date & Time</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 700; text-align: right;">${data.eventDate} @ ${data.eventTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase;">Venue</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 700; text-align: right;">${data.eventVenue}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase;">Seats</td>
                        <td style="padding: 8px 0; color: #7c3aed; font-size: 14px; font-weight: 900; text-align: right;">${data.seatNumbers.join(', ')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; background: #000000; text-align: center; border-top: 1px solid #1e1e1e;">
              <p style="color: #52525b; font-size: 10px; font-weight: 700; text-transform: uppercase; margin: 0;">Verified Experience Pass</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Generate check-in confirmation email HTML
function generateCheckInEmailHTML(data: CheckInEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; color: #ffffff; font-family: sans-serif;">
  <table width="100%" style="background-color: #000000; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" style="background: #09090b; border: 1px solid #1e1e1e; border-radius: 32px; overflow: hidden; border-spacing: 0;">
          <tr>
            <td style="padding: 60px 40px; text-align: center;">
              <div style="color: #22c55e; font-size: 60px; margin-bottom: 20px;">✓</div>
              <h1 style="font-size: 40px; font-weight: 900; font-style: italic; text-transform: uppercase; margin: 0;">CHECKED <span style="color: #22c55e;">IN</span></h1>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 10px; font-weight: 700; text-transform: uppercase;">Welcome to the Experience</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background: #111111; border: 1px solid #22c55e; padding: 25px; border-radius: 24px; text-align: center;">
                <p style="color: #22c55e; font-size: 12px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px;">Event</p>
                <p style="font-size: 18px; font-weight: 900; margin: 0;">${data.eventTitle}</p>
                <p style="color: #71717a; font-size: 12px; margin-top: 15px;">Verified at ${data.checkInTime}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export default resend
