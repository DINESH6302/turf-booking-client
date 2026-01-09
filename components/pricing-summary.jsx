"use client"

import { CreditCard } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function PricingSummary({ date, time, duration, totalCost, ratePerHour = 1 }) {
  const pricePerHour = ratePerHour

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hours12 = hours % 12 || 12
    return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`
  }

  const calculateEndTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalStartMinutes = hours * 60 + minutes
    const totalEndMinutes = totalStartMinutes + durationHours * 60

    const endHours = Math.floor(totalEndMinutes / 60) % 24
    const endMinutes = totalEndMinutes % 60
    
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
  }

  const endTime = calculateEndTime(time, duration)

  return (
    <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-blue-900">Booking Summary</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">{formatDate(date)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Start Time:</span>
            <span className="font-medium text-gray-900">{formatTo12Hour(time)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">End Time:</span>
            <span className="font-medium text-gray-900">{formatTo12Hour(endTime)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">
              {duration} {duration === 1 ? "Hour" : "Hours"}
            </span>
          </div>

          <div className="border-t border-blue-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Price per hour:</span>
              <span className="text-gray-900">₹{pricePerHour}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border-2 border-blue-600 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">₹{totalCost.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
