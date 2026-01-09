"use client"

import { useState } from "react"
import { X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PaymentModal({ totalCost, onConfirm, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentClick = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
      <Card className="w-full rounded-t-3xl border-0 p-6 bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-900">Payment</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Amount:</span>
            <span className="text-3xl font-bold text-emerald-600">₹{totalCost.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>

          <div className="space-y-2">
            <label className="flex items-center p-3 border-2 border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
              <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
              <span className="ml-3 font-medium text-gray-900">Credit/Debit Card</span>
            </label>

            <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="radio" name="payment" className="w-4 h-4" />
              <span className="ml-3 font-medium text-gray-900">UPI</span>
            </label>

            <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="radio" name="payment" className="w-4 h-4" />
              <span className="ml-3 font-medium text-gray-900">Wallet</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-6">
          <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">Your payment is secure and encrypted</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handlePaymentClick}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl text-lg disabled:opacity-70"
          >
            {isProcessing ? "Processing..." : "Confirm & Pay"}
          </Button>

          <Button
            onClick={onCancel}
            disabled={isProcessing}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl disabled:opacity-70 bg-transparent"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          By confirming, you agree to our booking terms and conditions
        </p>
      </Card>
    </div>
  )
}
