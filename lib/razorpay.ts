// lib/razorpay.ts
"use client"

declare global {
  interface Window {
    Razorpay: any;
    RazorpayPayment: any;
  }
}

let razorpayLoaded = false;
let razorpayInstance: any = null;

export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (razorpayLoaded || (typeof window !== 'undefined' && window.Razorpay)) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      razorpayLoaded = true;
      console.log('✅ Razorpay script loaded');
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      reject(new Error('Failed to load payment gateway'));
    };

    document.head.appendChild(script);
  });
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
  notes?: Record<string, string>;
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<any> {
  try {
    // Load Razorpay script
    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error('Payment gateway not available');
    }

    return new Promise((resolve, reject) => {
      console.log('🔄 Creating Razorpay instance with order:', options.order_id);
      
      const razorpayOptions = {
        key: options.key,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name || 'Vybb Live',
        description: options.description,
        order_id: options.order_id,
        prefill: options.prefill,
        theme: {
          color: options.theme?.color || '#7c3aed',
          backdrop_color: '#00000080',
        },
        notes: options.notes,
        handler: (response: any) => {
  console.log('✅ Razorpay payment handler triggered!', response);
  
  // Store response globally for debugging
  window.RazorpayPayment = response;
  
  // Dispatch custom event for external listeners
  const paymentSuccessEvent = new CustomEvent('razorpay-payment-success', {
    detail: response
  });
  window.dispatchEvent(paymentSuccessEvent);
  
  // IMPORTANT: Call the original handler too
  if (options.handler) {
    try {
      options.handler(response);
    } catch (error) {
      console.error('Error in original handler:', error);
    }
  }
  
  resolve(response);
},

        modal: {
          ondismiss: () => {
            console.log('❌ Razorpay modal dismissed');
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
            
            // Dispatch cancellation event
            const paymentCancelEvent = new CustomEvent('razorpay-payment-cancel');
            window.dispatchEvent(paymentCancelEvent);
            
            reject(new Error('Payment cancelled by user'));
          },
          escape: false,
          backdrop_close: false,
        },
        retry: {
          enabled: false,
        },
      };

      try {
        // Create new Razorpay instance
        razorpayInstance = new window.Razorpay(razorpayOptions);
        
        // Set up event listeners
        razorpayInstance.on('payment.failed', (response: any) => {
          console.error('❌ Razorpay payment failed:', response.error);
          
          // Dispatch failure event
          const paymentFailedEvent = new CustomEvent('razorpay-payment-failed', {
            detail: response.error
          });
          window.dispatchEvent(paymentFailedEvent);
          
          reject(new Error(response.error.description || 'Payment failed'));
        });

        razorpayInstance.on('payment.authorized', (response: any) => {
          console.log('🔐 Payment authorized:', response);
        });

        console.log('🚀 Opening Razorpay checkout modal...');
        razorpayInstance.open();
        
        // Store instance globally for debugging
        window.Razorpay = window.Razorpay || {};
        window.Razorpay.currentInstance = razorpayInstance;
        
      } catch (error: any) {
        console.error('❌ Error creating Razorpay instance:', error);
        reject(new Error('Failed to initialize payment'));
      }
    });
  } catch (error: any) {
    console.error('❌ Error opening Razorpay:', error);
    throw error;
  }
}

// Helper to check if payment was successful
export function checkPaymentStatus(): any {
  return window.RazorpayPayment || null;
}

// Close any open Razorpay modal
export function closeRazorpayModal() {
  if (razorpayInstance) {
    try {
      razorpayInstance.close();
    } catch (error) {
      console.log('No active Razorpay modal to close');
    }
  }
}