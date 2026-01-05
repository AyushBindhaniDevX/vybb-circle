import { NextRequest, NextResponse } from 'next/server'
import { sendCheckInConfirmationEmail, CheckInEmailData } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const emailData: CheckInEmailData = await request.json()

    const result = await sendCheckInConfirmationEmail(emailData)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Check-in email sent successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Check-in email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send check-in email' },
      { status: 500 }
    )
  }
}
