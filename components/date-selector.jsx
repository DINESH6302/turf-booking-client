"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { getISTDate } from "@/lib/utils"

export default function DateSelector({ selectedDate, onDateSelect, onBookedSlotsReceived }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = getISTDate()
    return new Date(today.getFullYear(), today.getMonth())
  })

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const today = getISTDate()
  today.setHours(0, 0, 0, 0)

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const daysArray = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDayClick = async (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    if (date >= today) {
      onDateSelect(date)

      // Fetch booked slots for this date
      try {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const dateDay = String(date.getDate()).padStart(2, "0")
        const dateString = `${year}-${month}-${dateDay}`

        console.log("[v0] Fetching booked slots for date:", dateString)

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        const response = await fetch(`${baseUrl}/v1/turf/slots?date=${dateString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] Booked slots API Response:", data)

        // Extract booked slots from the new response format
        const bookedSlots = data.bookedSlots || []
        console.log("[v0] Booked slots extracted:", bookedSlots)

        // Pass booked slots to parent component
        if (onBookedSlotsReceived) {
          onBookedSlotsReceived(bookedSlots)
        }
      } catch (err) {
        console.error("[v0] Error fetching booked slots:", err)
        if (onBookedSlotsReceived) {
          onBookedSlotsReceived([])
        }
      }
    }
  }

  const formatDateLabel = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <label className="font-semibold text-blue-900">Select Date</label>
      </div>

      {selectedDate && (
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-700">Selected: {formatDateLabel(selectedDate)}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />
            }

            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            date.setHours(0, 0, 0, 0)
            const isSelected =
              selectedDate &&
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth.getMonth() &&
              selectedDate.getFullYear() === currentMonth.getFullYear()
            const isDisabled = date < today
            const isToday =
              today.getDate() === day &&
              today.getMonth() === currentMonth.getMonth() &&
              today.getFullYear() === currentMonth.getFullYear()

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={isDisabled}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isToday
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-blue-100"
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
