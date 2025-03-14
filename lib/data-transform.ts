import type { PriceData } from "@/types/price-data"

export function transformPriceData(rawData: any): PriceData[] {
  if (!rawData || !Array.isArray(rawData.time)) {
    return []
  }

  const { time, open, high, low, close, volume } = rawData
  const length = Math.min(time.length, open.length, high.length, low.length, close.length, volume.length)

  const result: PriceData[] = []

  for (let i = 0; i < length; i++) {
    // Convert the time value to a proper timestamp
    // The time values in the data appear to be in minutes from some epoch
    // We'll convert to milliseconds for JavaScript Date
    const timestamp = time[i] * 60 * 1000

    result.push({
      timestamp,
      open: open[i],
      high: high[i],
      low: low[i],
      close: close[i],
      volume: volume[i],
    })
  }

  return result
}

