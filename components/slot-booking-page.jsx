"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DateSelector from "./date-selector"
import UserInfoForm from "./user-info-form"
import PricingSummary from "./pricing-summary"
import PaymentModal from "./payment-modal"
import TimeSelection from "./time-selection"
import { API_BASE_URL } from "@/lib/utils"

export default function SlotBookingPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(1)
  const [userName, setUserName] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [ratePerHour, setRatePerHour] = useState(0)
  const [loadingRate, setLoadingRate] = useState(true)
  const [bookedSlots, setBookedSlots] = useState([])
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingSlots, setIsFetchingSlots] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [currentEventId, setCurrentEventId] = useState(null)

  useEffect(() => {
    const price = Number(process.env.NEXT_PUBLIC_PRICE_PER_HOUR) || 500
    setRatePerHour(price)
    setLoadingRate(false)
  }, [])

  const totalCost = selectedDuration * ratePerHour

  const validateInputs = () => {
    const errors = {}
    if (!userName.trim()) {
      errors.name = "Fill name"
    }
    if (!userPhone.trim() || userPhone.length !== 10) {
      errors.phone = "Fill number"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isAllDetailsFilled = selectedDate && selectedTime && selectedDuration >= 1 && userName.trim() && userPhone.length === 10

  const toLocalISOString = (date) => {
    const tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
        return (num < 10 ? '0' : '') + num;
      };

    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      '.' + String((date.getMilliseconds() / 1000).toFixed(3)).slice(2, 5) +
      dif + pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' + pad(Math.abs(tzo) % 60);
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleContinue = async () => {
    if (!validateInputs()) return

    setIsLoading(true)
    
    // Prepare dates
    const [h, m] = selectedTime.split(":").map(Number)
    const startDate = new Date(selectedDate)
    startDate.setHours(h, m, 0, 0)
    
    const endDate = new Date(startDate.getTime() + selectedDuration * 60 * 60 * 1000)

    const payload = {
      name: userName,
      phoneNumber: userPhone,
      startDateTime: toLocalISOString(startDate),
      endDateTime: toLocalISOString(endDate)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/turf/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      // The user says "if the success is true and status code is 200"
      // data.success might be string "true" based on user example: success: "true"
      if (response.status === 200 && (data.success === "true" || data.success === true)) {
        setCurrentEventId(data.eventId)
        setIsSummaryModalOpen(true)
      } else {
        setApiError(data.message || "An error occurred while checking availability.")
      }
    } catch (error) {
      console.error("API Error:", error)
      setApiError("Failed to connect to the server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    const isScriptLoaded = await loadRazorpayScript()

    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?")
      return
    }

    try {
      // 1. Create Order
      const response = await fetch(`${API_BASE_URL}/v1/turf/payment/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: totalCost }),
      })

      const orderData = await response.json()

      if (!response.ok) {
        alert("Failed to create order. Please try again.")
        return
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: "INR",
        name: "ProTurf",
        description: "Turf Booking Transaction",
        // image: "https://example.com/your_logo", 
        order_id: orderData.id, 

        handler: async function (response) {
          // 3. Verify Payment
          try {
             // Verification payload
             const verificationData = {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
             }

             const verifyRes = await fetch(`${API_BASE_URL}/v1/turf/payment/verify-payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(verificationData)
             })

            //  const verifyJson = await verifyRes.json()
             
             if (verifyRes.ok) { 
                handleConfirmPayment()
             } else {
                alert("Payment verification failed! Please contact support.")
                handleCancelBooking()
             }

          } catch (err) {
             console.error("Verification Error", err)
             alert("Payment verification failed due to network error.")
             handleCancelBooking()
          }
        },
        modal: {
          ondismiss: function() {
            handleCancelBooking()
          }
        },
        prefill: {
          name: userName,
          contact: userPhone,
        },
        notes: {
          address: "ProTurf Office",
        },
        theme: {
          color: "#2563eb",
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on("payment.failed", function (response) {
         alert(`Payment Failed: ${response.error.description}`)
         handleCancelBooking()
      })
      paymentObject.open()

    } catch (error) {
       console.error("Payment Error:", error)
       alert("Something went wrong while initiating payment.")
    }
  }

  const handleConfirmPayment = () => {
    console.log("[v0] Payment successful with user data:", { userName, userPhone })
    setIsPaymentOpen(false)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedDuration(1)
    setUserName("")
    setUserPhone("")
    setValidationErrors({})
    setIsSummaryModalOpen(false)
    alert("Booking confirmed! Your slot has been reserved.")
  }

  const handleClearSelection = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedDuration(1)
    setUserName("")
    setUserPhone("")
    setValidationErrors({})
    setIsSummaryModalOpen(false)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setIsFetchingSlots(true)
  }

  const handleBookedSlotsReceived = (slots) => {
    setBookedSlots(slots)
    setIsFetchingSlots(false)
  }

  const handleCancelBooking = async () => {
    if (currentEventId) {
      try {
        await fetch(`${API_BASE_URL}/v1/turf/events?eventId=${currentEventId}`, {
          method: "DELETE",
        })
      } catch (error) {
        console.error("Failed to cancel booking:", error)
      }
      setCurrentEventId(null)
    }
    setIsSummaryModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-blue-900">ProTurf</h1>
            <a
              target="_blank"
              href="https://maps.app.goo.gl/AVS8rXHinu4kkbyt6"
              className="pr-3 flex flex-col items-center gap-0 text-blue-600 hover:text-blue-700 transition font-semibold translate-y-2"
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/535/535239.png" 
                alt="Location" 
                className="w-8 h-8 object-contain" 
              />
              <span className="translate-y-0.5 text-sm">Map</span>
            </a>
          </div>
          <p className="text-blue-700 font-semibold">Rate per hour: ₹{loadingRate ? "..." : ratePerHour}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-2xl">
            Book Your Slot
          </h2>
        </div>

        <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <div className="p-6 space-y-6">
            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onBookedSlotsReceived={handleBookedSlotsReceived}
            />


            {/* Time Slot Selection */}
            {selectedDate && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-800">Select Time Slot</label>
                  {selectedTime && selectedDuration > 0 && !isFetchingSlots && (
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                      {(() => {
                        const [h, m] = selectedTime.split(":").map(Number)
                        const startMins = h * 60 + m
                        const endMins = startMins + selectedDuration * 60
                        
                        const format = (mins) => {
                          const hours = Math.floor(mins / 60)
                          const minutes = mins % 60
                          const period = (hours % 24) >= 12 ? "PM" : "AM"
                          const h12 = hours % 12 || 12
                          return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`
                        }
                        
                        return `${format(startMins)} - ${format(endMins)} (${selectedDuration === 0.5 ? "30 mins" : selectedDuration + " hrs"})`
                      })()}
                    </span>
                  )}
                </div>
                {isFetchingSlots ? (
                  <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-sm font-medium text-blue-800">Fetching Time Slots...</p>
                    </div>
                  </div>
                ) : (
                  <TimeSelection
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                    bookedSlots={bookedSlots}
                    selectedDate={selectedDate}
                    selectedDuration={selectedDuration}
                    onDurationChange={setSelectedDuration}
                  />
                )}
              </div>
            )}

            {/* User Info */}
            {selectedTime && (
              <>
                <label className="block text-sm font-semibold text-blue-900 mb-2">Your Details</label>
                <UserInfoForm
                  name={userName}
                  phone={userPhone}
                  onNameChange={setUserName}
                  onPhoneChange={setUserPhone}
                  nameError={validationErrors.name}
                  phoneError={validationErrors.phone}
                />
              </>
            )}

            {/* Continue Button - Only enabled when all details filled */}
            {selectedDate && (
              <div className="space-y-3">
                <Button
                  onClick={handleContinue}
                  disabled={!isAllDetailsFilled || isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearSelection}
                  disabled={isLoading}
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-black bg-transparent"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-900">Booking Summary</h2>
              <button onClick={handleCancelBooking} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <PricingSummary
                date={selectedDate}
                time={selectedTime}
                duration={selectedDuration}
                totalCost={totalCost}
                ratePerHour={ratePerHour}
              />

              <div className="space-y-3">
                <Button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl text-lg"
                >
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelBooking}
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-black bg-transparent"
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {isPaymentOpen && (
        <PaymentModal totalCost={totalCost} onConfirm={handleConfirmPayment} onCancel={() => setIsPaymentOpen(false)} />
      )} */}

      {apiError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Booking unavailable</h3>
              <p className="text-gray-600">{apiError}</p>
              <Button 
                onClick={() => {
                  setApiError(null)
                  router.push("/")
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
