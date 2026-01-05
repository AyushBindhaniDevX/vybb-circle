import { NextRequest, NextResponse } from 'next/server'
import { sendTicketConfirmationEmail, TicketEmailData } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const emailData: TicketEmailData = await request.json()

    const result = await sendTicketConfirmationEmail(emailData)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
