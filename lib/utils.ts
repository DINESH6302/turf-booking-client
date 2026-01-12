import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getISTDate() {
  const now = new Date();
  
  // Use Intl.DateTimeFormat to get the accurate time components in IST (Asia/Kolkata)
  // This avoids issues with local system offsets or daylight savings logic
  const options = { 
    timeZone: "Asia/Kolkata", 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric',
    hour12: false 
  } as const;
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  
  const dateParts: {[key: string]: number} = {};
  parts.forEach(({ type, value }) => { 
    if (type !== 'literal') {
      dateParts[type] = parseInt(value, 10);
    }
  });

  // Reconstruct the date using the IST components
  // Note: We use the local Date constructor with these components so that 
  // getHours(), getDate() etc. return the IST values.
  // The actual timestamp will represent "IST time on Local Clock", which is what we need for comparison.
  return new Date(
    dateParts.year, 
    dateParts.month - 1, 
    dateParts.day, 
    dateParts.hour, 
    dateParts.minute, 
    dateParts.second
  );
}

export function getISTTimeInMinutes() {
  const istDate = getISTDate();
  return istDate.getHours() * 60 + istDate.getMinutes();
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://turfbooking-wdc7.onrender.com";
