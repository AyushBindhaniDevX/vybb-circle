// app/actions/razorpay.ts
"use server"

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay with live keys
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Server Action: Create Razorpay Order
export async function createRazorpayOrder(amount: number, eventTitle: string, userId: string) {
  try {
    console.log('🔄 Creating Razorpay order for amount:', amount, 'user:', userId);

    // Validate amount (minimum ₹1 = 100 paise)
    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      throw new Error("Amount must be at least ₹1");
    }

    // Create order with Razorpay API
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `vybb_${Date.now()}_${userId.substring(0, 8)}`,
      notes: {
        event: eventTitle,
        userId: userId,
        platform: "vybb-live",
      },
      payment_capture: 1, // Auto-capture payments
    });

    console.log('✅ Razorpay order created:', order.id);

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    };
  } catch (error: any) {
    console.error('❌ Razorpay order creation error:', error);
    
    // Handle specific Razorpay errors
    let errorMessage = "Failed to create payment order";
    if (error.error?.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Server Action: Verify Razorpay Payment
export async function verifyRazorpayPayment(orderId: string, paymentId: string, signature: string) {
  try {
    console.log('🔄 Verifying payment:', { orderId, paymentId });
    
    // Generate signature for verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    const isSignatureValid = generatedSignature === signature;

    if (!isSignatureValid) {
      console.error('❌ Invalid payment signature');
      return {
        success: false,
        verified: false,
        error: "Invalid payment signature",
      };
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    console.log('✅ Payment verified:', {
      paymentId,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
    });

    return {
      success: true,
      verified: true,
      paymentId,
      orderId,
      paymentDetails: {
        status: payment.status,
        amount: payment.amount / 100, // Convert back to rupees
        method: payment.method,
        bank: payment.bank,
        card_id: payment.card_id,
        wallet: payment.wallet,
      },
    };
  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return {
      success: false,
      verified: false,
      error: error.message || "Payment verification failed",
    };
  }
}

// Get Razorpay key for client-side
export async function getRazorpayKey() {
  return {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}