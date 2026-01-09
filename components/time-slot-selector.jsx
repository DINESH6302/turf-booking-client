"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TimeSlotSelector({ selectedDate, selectedTime, onTimeSelect, bookedSlots = [] }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  const formatTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hours12 = hours % 12 || 12
    return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`
  }

  const getHourFromTime = (timeString) => {
    return Number.parseInt(timeString.split(":")[0])
  }

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }

    setLoading(true)

    try {
      // Mark hours that fall within booked time ranges
      const bookedHours = new Set()

      bookedSlots.forEach((slot) => {
        const startHour = getHourFromTime(slot.startTime)
        const endHour = getHourFromTime(slot.endTime)

        // Mark all hours in the booked range as unavailable
        for (let h = startHour; h < endHour; h++) {
          bookedHours.add(h)
        }
      })

      console.log("[v0] Booked hours:", Array.from(bookedHours))

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const selectedDateNormalized = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      )

      const defaultSlots = []
      for (let hour = 0; hour < 24; hour++) {
        const slotTime = `${String(hour).padStart(2, "0")}:00`

        let isAvailable = true

        // Mark as unavailable if it's a past hour on today
        if (selectedDateNormalized.getTime() === today.getTime()) {
          if (hour <= now.getHours()) {
            isAvailable = false
          }
        }

        // Mark as unavailable if it's in the booked slots
        if (bookedHours.has(hour)) {
          isAvailable = false
        }

        defaultSlots.push({
          time: slotTime,
          available: isAvailable,
        })
      }

      setSlots(defaultSlots)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, bookedSlots])

  if (!selectedDate) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        <label className="font-semibold text-blue-900">Select Time</label>
      </div>

      {selectedTime && (
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-700">Selected: {formatTo12Hour(selectedTime)}</p>
        </div>
      )}

      {loading && (
        <div className="p-4 text-center text-blue-600">
          <p className="text-sm">Loading available slots...</p>
        </div>
      )}

      {!loading && slots.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <Button
              key={slot.time}
              onClick={() => onTimeSelect(slot.time)}
              disabled={!slot.available}
              variant={selectedTime === slot.time ? "default" : "outline"}
              className={`text-sm py-2 h-auto rounded-lg transition-colors ${
                !slot.available
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                  : selectedTime === slot.time
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-black"
              }`}
            >
              {formatTo12Hour(slot.time)}
            </Button>
          ))}
        </div>
      )}

      {!loading && slots.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No slots available for this date</p>
        </div>
      )}
    </div>
  )
}
