// "use client"

// import { Users, Plus, Minus } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export default function DurationSelector({ selectedDuration, onDurationSelect }) {
//   const handleIncrement = () => {
//     if (selectedDuration < 24) {
//       onDurationSelect(selectedDuration + 1)
//     }
//   }

//   const handleDecrement = () => {
//     if (selectedDuration > 1) {
//       onDurationSelect(selectedDuration - 1)
//     }
//   }

//   return (
//     <div className="space-y-3">
//       <div className="flex items-center gap-2">
//         <Users className="w-5 h-5 text-blue-600" />
//         <label className="font-semibold text-blue-900">Duration (Hours)</label>
//       </div>

//       <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
//         <p className="text-sm font-medium text-blue-700">
//           {selectedDuration} {selectedDuration === 1 ? "Hour" : "Hours"} Selected
//         </p>
//       </div>

//       <div className="flex items-center justify-center gap-4">
//         <Button
//           onClick={handleDecrement}
//           disabled={selectedDuration === 1}
//           className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg p-2"
//         >
//           <Minus className="w-5 h-5" />
//         </Button>

//         <div className="text-3xl font-bold text-blue-900 min-w-12 text-center">{selectedDuration}</div>

//         <Button
//           onClick={handleIncrement}
//           disabled={selectedDuration === 24}
//           className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg p-2"
//         >
//           <Plus className="w-5 h-5" />
//         </Button>
//       </div>
//     </div>
//   )
// }
