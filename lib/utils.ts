import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString); // Waktu UTC dari database
  // Konversi ke WIB (UTC+7)
  const wibHours = (date.getUTCHours() + 7) % 24;
  const wibMinutes = date.getUTCMinutes();
  return `${wibHours.toString().padStart(2, '0')}.${wibMinutes.toString().padStart(2, '0')}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}