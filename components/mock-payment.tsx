// components/mock-payment.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Smartphone, Wallet, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface MockPaymentProps {
  amount: number
  eventTitle: string
  onSuccess: (paymentId: string) => Promise<void>
  onCancel: () => void
}

export function MockPayment({ amount, eventTitle, onSuccess, onCancel }: MockPaymentProps) {
  const [processing, setProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, color: "text-blue-400" },
    { id: "upi", name: "UPI", icon: Smartphone, color: "text-purple-400" },
    { id: "wallet", name: "Wallet", icon: Wallet, color: "text-green-400" },
  ]

  const handleMockPayment = async (method: string) => {
    if (processing) return
    
    setProcessing(true)
    setSelectedMethod(method)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock payment ID
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    
    // Simulate successful payment
    toast.success(`Payment successful via ${method.toUpperCase()}!`)
    
    try {
      await onSuccess(mockPaymentId)
    } catch (error) {
      console.error("Error after mock payment:", error)
      toast.error("Failed to complete booking")
      setProcessing(false)
      setSelectedMethod(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Mock Payment Gateway</h3>
        <p className="text-zinc-400 text-sm">
          Development mode: Simulating payment of ₹{amount} for {eventTitle}
        </p>
        <p className="text-xs text-yellow-500 mt-2">
          In production, this would be replaced with Razorpay checkout
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-zinc-300">Select Payment Method</h4>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMockPayment(method.id)}
              disabled={processing}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                selectedMethod === method.id
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              } ${processing && selectedMethod !== method.id ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <method.icon className={`h-8 w-8 mb-2 ${method.color}`} />
              <span className="text-sm font-medium">{method.name}</span>
            </button>
          ))}
        </div>
      </div>

      {processing && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
            <span className="text-zinc-300">Processing {selectedMethod?.toUpperCase()} payment...</span>
          </div>
          
          <div className="space-y-2 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span>Verifying payment details</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <span>Processing transaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              <span>Confirming booking</span>
            </div>
          </div>
        </div>
      )}

      {!processing && (
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 border-white/10 hover:border-zinc-500"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white/10 hover:border-violet-500"
            onClick={() => handleMockPayment("card")}
          >
            Test Success Payment
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-white/10">
        <div className="text-xs text-zinc-600 space-y-1">
          <p>Note: This is a development-only mock payment system.</p>
          <p>In production, real Razorpay integration will handle payments.</p>
        </div>
      </div>
    </div>
  )
}