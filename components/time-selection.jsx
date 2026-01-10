"use client"

import { useState, useEffect } from "react"
import { getISTDate, getISTTimeInMinutes } from "@/lib/utils"

export default function TimeSelection({
  selectedTime,
  onTimeSelect,
  bookedSlots = [],
  selectedDate = null,
  selectedDuration,
  onDurationChange,
}) {
  // Removed local temp state to rely purely on controlled selectedTime prop
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const timeToMinutes = (timeString) => {
    if (!timeString) return -1
    const [h, m] = timeString.split(":").map(Number)
    return h * 60 + m
  }

  const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  }

  const isSlotBooked = (h, m) => {
    const slotStart = h * 60 + m
    const slotEnd = slotStart + 30

    return bookedSlots.some((slot) => {
      const [startH, startMin] = slot.startTime.split(":").map(Number)
      const [endH, endMin] = slot.endTime.split(":").map(Number)
      const bookStart = startH * 60 + startMin
      let bookEnd = endH * 60 + endMin

      // Handle crossing midnight or ending exactly at midnight (00:00)
      if (bookEnd <= bookStart) {
        bookEnd += 24 * 60 // Treat as next day (e.g., 00:00 becomes 24:00)
      }

      // Check for overlap
      return Math.max(slotStart, bookStart) < Math.min(slotEnd, bookEnd)
    })
  }

  const isPastTime = (h, m) => {
    if (!selectedDate) return false
    
    // Use IST based "now" for comparison
    const nowIST = getISTDate()
    const todayIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate())
    const selectedDateNormalized = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())

    if (selectedDateNormalized.getTime() < todayIST.getTime()) return true
    if (selectedDateNormalized.getTime() > todayIST.getTime()) return false

    const currentMinutes = getISTTimeInMinutes()
    const slotStart = h * 60 + m
    // Allow selecting slots that haven't ended yet (30 min buffer)
    return slotStart + 30 <= currentMinutes
  }

  // Check if any slot in the range [start, end) is booked or past
  // Range end is exclusive for check, so [10:00, 11:30) checks 10:00, 10:30, 11:00 slots.
  const isRangeValid = (startMin, endMin) => {
    for (let m = startMin; m < endMin; m += 30) {
      if (isSlotBooked(Math.floor(m / 60), m % 60) || isPastTime(Math.floor(m / 60), m % 60)) {
        return false
      }
    }
    return true
  }

  const handleTimeClick = (h, m) => {
    // If disabled, do nothing (extra safety)
    if (isSlotBooked(h, m) || isPastTime(h, m)) return

    const clickedMinutes = h * 60 + m
    const clickedTime = minutesToTime(clickedMinutes)

    // First click (or restart)
    if (!selectedTime) {
      onTimeSelect(clickedTime)
      if (onDurationChange) onDurationChange(0.5) // Default to min duration
      return
    }

    const startMinutes = timeToMinutes(selectedTime)

    // Toggle off if clicking the start time again
    if (clickedMinutes === startMinutes) {
      onTimeSelect(null)
      if (onDurationChange) onDurationChange(1) // Reset default
      return
    }

    // If clicked before start -> Reset and make this the new start
    if (clickedMinutes < startMinutes) {
      onTimeSelect(clickedTime)
      if (onDurationChange) onDurationChange(0.5)
      return
    }

    // Attempt to define range
    // Range covers from startMinutes (inclusive) to clickedMinutes + 30 (end of clicked slot)
    const endMinutes = clickedMinutes + 30
    
    // Validate range for blocks
    if (isRangeValid(startMinutes, endMinutes)) {
      const durationHours = (endMinutes - startMinutes) / 60
      // Keep start time, update duration
      onTimeSelect(selectedTime) 
      if (onDurationChange) onDurationChange(durationHours)
    } else {
      // Invalid range (blocked in between), reset to new start
      onTimeSelect(clickedTime)
      if (onDurationChange) onDurationChange(0.5)
    }
  }

  const formatHourLabel = (h) => {
    const period = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12} ${period}`
  }

  // Determine if a slot is currently selected
  const isSelected = (h, m) => {
    if (!selectedTime || !selectedDuration) return false
    const slotStart = h * 60 + m
    const selStart = timeToMinutes(selectedTime)
    const selEnd = selStart + selectedDuration * 60
    return slotStart >= selStart && slotStart < selEnd
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {hours.map((hour) => {
          const is00Booked = isSlotBooked(hour, 0)
          const is00Past = isPastTime(hour, 0)
          const is00Disabled = is00Booked || is00Past
          const is00Selected = isSelected(hour, 0)

          const is30Booked = isSlotBooked(hour, 30)
          const is30Past = isPastTime(hour, 30)
          const is30Disabled = is30Booked || is30Past
          const is30Selected = isSelected(hour, 30)

          return (
            <div key={hour} className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 py-1 text-center">
                <span className="text-xs font-bold text-slate-500">{formatHourLabel(hour)}</span>
              </div>
              <div className="flex h-10 divide-x divide-slate-100">
                {/* :00 Button */}
                <button
                  onClick={() => handleTimeClick(hour, 0)}
                  disabled={is00Disabled}
                  className={`flex-1 flex items-center justify-center text-xs font-medium transition-colors ${
                    is00Selected
                      ? "bg-blue-600 text-white"
                      : is00Disabled
                        ? "bg-red-50 text-red-300 cursor-not-allowed line-through relative decoration-red-300/50"
                        : "bg-green-50 hover:bg-green-100 text-green-700"
                  }`}
                >
                  :00
                </button>

                {/* :30 Button */}
                <button
                  onClick={() => handleTimeClick(hour, 30)}
                  disabled={is30Disabled}
                  className={`flex-1 flex items-center justify-center text-xs font-medium transition-colors ${
                    is30Selected
                      ? "bg-blue-600 text-white"
                      : is30Disabled
                        ? "bg-red-50 text-red-300 cursor-not-allowed line-through relative decoration-red-300/50"
                        : "bg-green-50 hover:bg-green-100 text-green-700"
                  }`}
                >
                  :30
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 pl-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-50 border border-green-200"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-50 border border-red-200 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full border-t border-red-300 transform -rotate-45"></div>
            </div>
          </div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  )
}
