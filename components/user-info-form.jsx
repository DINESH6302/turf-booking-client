"use client"

import { User, Phone } from "lucide-react"

export default function UserInfoForm({ name, phone, onNameChange, onPhoneChange, nameError, phoneError }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-blue-900 mb-1">Full Name</label>
        <div
          className="flex items-center gap-2 border-2 rounded-lg overflow-hidden"
          style={{ borderColor: nameError ? "#dc2626" : "#93c5fd" }}
        >
          <User className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your full name"
            className="flex-1 px-2 py-2 outline-none bg-white text-blue-900 text-sm"
          />
        </div>
        {nameError && <p className="text-red-600 text-xs mt-1">{nameError}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-blue-900 mb-1">Phone Number</label>
        <div
          className="flex items-center gap-2 border-2 rounded-lg overflow-hidden"
          style={{ borderColor: phoneError ? "#dc2626" : "#93c5fd" }}
        >
          <Phone className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Enter your 10-digit phone"
            className="flex-1 px-2 py-2 outline-none bg-white text-blue-900 text-sm"
          />
        </div>
        {phoneError && <p className="text-red-600 text-xs mt-1">{phoneError}</p>}
      </div>
    </div>
  )
}
