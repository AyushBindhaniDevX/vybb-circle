// Resend Email Configuration
import { Resend } from 'resend'

// Initialize Resend with API key from environment variables
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

    console.log('✅ Ticket confirmation email sent:', emailData)
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

    console.log('✅ Check-in confirmation email sent:', emailData)
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(217, 70, 239, 0.05) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: rgba(0, 0, 0, 0.4);">
              <h1 style="margin: 0; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                VYBB <span style="color: #8b5cf6;">LIVE</span>
              </h1>
              <p style="margin: 10px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; color: #a855f7; font-weight: 700;">
                Your Experience Awaits
              </p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <div style="display: inline-block; background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">
                ✓
              </div>
              <h2 style="margin: 20px 0 10px; font-size: 28px; font-weight: 900; text-transform: uppercase;">
                Ticket Confirmed!
              </h2>
              <p style="margin: 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
                Booking ID: ${data.bookingId}
              </p>
            </td>
          </tr>

          <!-- Event Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="15" cellspacing="0" style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px; font-size: 24px; font-weight: 900; text-transform: uppercase; color: #a855f7;">
                      ${data.eventTitle}
                    </h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          📅 Date
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.eventDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          🕐 Time
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.eventTime}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          📍 Venue
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.eventVenue}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          🎫 Tickets
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.ticketCount} ${data.ticketCount === 1 ? 'ticket' : 'tickets'}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          💺 Seats
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.seatNumbers.join(', ')}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          💰 Total
                        </td>
                        <td style="text-align: right; font-weight: 900; font-size: 18px; color: #22c55e;">
                          ₹${data.totalAmount}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <div style="background: #ffffff; padding: 20px; border-radius: 12px; display: inline-block;">
                <img src="${data.qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
              </div>
              <p style="margin: 15px 0 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                Show this QR code at the venue
              </p>
            </td>
          </tr>

          <!-- Important Info -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 20px;">
                <h4 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; font-weight: 900;">
                  ⚡ Important
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 13px; line-height: 1.8;">
                  <li>Please arrive 30 minutes before the event</li>
                  <li>Carry a valid ID for verification</li>
                  <li>QR code must be shown for entry</li>
                  <li>No refunds after check-in</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Address -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                Venue Address
              </p>
              <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                ${data.eventAddress}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(139, 92, 246, 0.2);">
              <p style="margin: 0 0 10px; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                Need Help?
              </p>
              <p style="margin: 0; color: #a855f7; font-size: 13px; font-weight: 700;">
                support@vybb.live
              </p>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-In Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: rgba(0, 0, 0, 0.4);">
              <h1 style="margin: 0; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                VYBB <span style="color: #22c55e;">LIVE</span>
              </h1>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <div style="display: inline-block; background: rgba(34, 197, 94, 0.2); border: 3px solid #22c55e; border-radius: 50%; width: 100px; height: 100px; line-height: 100px; font-size: 50px;">
                ✓
              </div>
              <h2 style="margin: 20px 0 10px; font-size: 32px; font-weight: 900; text-transform: uppercase; color: #22c55e;">
                Checked In!
              </h2>
              <p style="margin: 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
                Welcome to the Experience
              </p>
            </td>
          </tr>

          <!-- Event Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="15" cellspacing="0" style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px; font-size: 24px; font-weight: 900; text-transform: uppercase; color: #22c55e;">
                      ${data.eventTitle}
                    </h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          ✅ Check-In Time
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.checkInTime}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          📍 Venue
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.eventVenue}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          💺 Your Seats
                        </td>
                        <td style="text-align: right; font-weight: 700; font-size: 14px;">
                          ${data.seatNumbers.join(', ')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 25px; text-align: center;">
                <h4 style="margin: 0 0 15px; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; color: #22c55e; font-weight: 900;">
                  🎉 Enjoy the Show!
                </h4>
                <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                  You're all set! Find your seats and get ready for an unforgettable experience. Thanks for being part of VYBB LIVE!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(34, 197, 94, 0.2);">
              <p style="margin: 0 0 10px; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                Questions?
              </p>
              <p style="margin: 0; color: #22c55e; font-size: 13px; font-weight: 700;">
                support@vybb.live
              </p>
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
