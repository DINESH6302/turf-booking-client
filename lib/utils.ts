import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getISTDate() {
  const now = new Date();
  
  // Get UTC time in milliseconds
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  
  // Add IST offset (5 hours 30 minutes = 330 minutes)
  // 330 * 60 * 1000 = 19800000 ms
  const istTime = new Date(utcTime + (330 * 60000));
  
  return istTime;
}

export function getISTTimeInMinutes() {
  const istDate = getISTDate();
  return istDate.getHours() * 60 + istDate.getMinutes();
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://turfbooking-wdc7.onrender.com";
