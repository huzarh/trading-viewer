import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }

  return date.toLocaleDateString("en-US", options)
}

export function formatPrice(price: number): string {
  // For forex pairs, typically show 5 decimal places for pairs like EUR/USD
  // that trade in the 0.0001 pip size
  if (price < 10) {
    return price.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    })
  }
  // For most other pairs and commodities, 2-4 decimal places
  else if (price < 1000) {
    return price.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }
  // For stock prices and indices
  else {
    return price.toLocaleString("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}

// Professional formatting for price changes
export function formatPriceChange(current: number, previous: number): string {
  const change = current - previous
  const percentChange = (change / previous) * 100

  const changeStr = change >= 0 ? `+${change.toFixed(5)}` : change.toFixed(5)

  const percentStr = percentChange >= 0 ? `+${percentChange.toFixed(2)}%` : `${percentChange.toFixed(2)}%`

  return `${changeStr} (${percentStr})`
}

// Format volume with appropriate suffixes (K, M, B)
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`
  } else {
    return volume.toString()
  }
}

