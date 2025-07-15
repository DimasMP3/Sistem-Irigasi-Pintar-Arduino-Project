import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format waktu ke format Indonesia (WIB)
 * @param date Objek Date untuk diformat
 * @param options Opsi format tambahan
 * @returns String waktu dalam format Indonesia
 */
export function formatWIBTime(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
    ...options
  };
  
  return date.toLocaleString('id-ID', defaultOptions);
}

/**
 * Format tanggal lengkap ke format Indonesia (WIB)
 * @param date Objek Date untuk diformat
 * @returns String tanggal dan waktu dalam format Indonesia
 */
export function formatWIBDate(date: Date) {
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  }) + ' WIB';
}

/**
 * Mendapatkan objek Date dengan waktu Indonesia (WIB)
 * @returns Objek Date dengan waktu sekarang (WIB)
 */
export function getWIBTime() {
  // Di sini kita mengembalikan objek Date biasa
  // karena waktu timezone akan diatur saat memformat dengan toLocaleString
  return new Date();
}
