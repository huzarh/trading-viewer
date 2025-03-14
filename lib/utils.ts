import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
}

export function formatPrice(price: number): string {
  // Determine the number of decimal places based on the price value
  const decimalPlaces = price < 10 ? 5 : price < 100 ? 4 : 2

  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })
}

