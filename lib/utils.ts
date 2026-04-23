import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Konversi UTC ke WIB (Asia/Jakarta) untuk TAMPILAN
export function toWIB(utcDate: string): string {
  const date = new Date(utcDate)
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Konversi WIB (input user dari datetime-local) ke UTC untuk disimpan ke database
export function wibToUTC(wibLocalString: string): string {
  // Input format: "2026-04-24T06:30" (ini adalah WIB)
  // Split untuk mendapatkan tanggal dan jam
  const [datePart, timePart] = wibLocalString.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  
  // Buat date di UTC dengan offset WIB (+7)
  // WIB = UTC + 7, jadi UTC = WIB - 7
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 7, minutes, 0))
  
  return utcDate.toISOString()
}

// Konversi UTC (dari database) ke WIB untuk ditampilkan di input datetime-local
export function utcToWIBForInput(utcDateString: string): string {
  const utcDate = new Date(utcDateString)
  // UTC ke WIB = +7 jam
  const wibDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000))
  return wibDate.toISOString().slice(0, 16)
}

// Cek apakah form sudah bisa dibuka (WIB)
export function isFormOpen(openTimeUTC: string): boolean {
  const now = new Date()
  const openTime = new Date(openTimeUTC)
  // Konversi open_time dari UTC ke WIB untuk perbandingan
  const openTimeWIB = new Date(openTime.getTime() + (7 * 60 * 60 * 1000))
  return now >= openTimeWIB
}

// Format datetime untuk display
export function formatDateTimeWIB(date: Date): string {
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}