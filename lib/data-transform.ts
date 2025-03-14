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

// Calculate various technical indicators
export function calculateIndicators(data: PriceData[]) {
  // Simple Moving Average (SMA)
  const calculateSMA = (period: number) => {
    const result = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null) // Not enough data yet
      } else {
        let sum = 0
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close
        }
        result.push(sum / period)
      }
    }
    return result
  }

  // Exponential Moving Average (EMA)
  const calculateEMA = (period: number) => {
    const result = []
    const multiplier = 2 / (period + 1)

    // Start with SMA
    let ema = 0
    let sum = 0
    for (let i = 0; i < period; i++) {
      sum += data[i].close
    }
    ema = sum / period
    result.push(...Array(period - 1).fill(null), ema)

    // Calculate EMA for remaining points
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema
      result.push(ema)
    }

    return result
  }

  // Relative Strength Index (RSI)
  const calculateRSI = (period = 14) => {
    const result = []
    const gains = []
    const losses = []

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        gains.push(0)
        losses.push(0)
        result.push(null)
        continue
      }

      const change = data[i].close - data[i - 1].close
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)

      if (i < period) {
        result.push(null)
        continue
      }

      // First RSI calculation
      if (i === period) {
        const avgGain = gains.slice(1).reduce((a, b) => a + b, 0) / period
        const avgLoss = losses.slice(1).reduce((a, b) => a + b, 0) / period

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
        const rsi = 100 - 100 / (1 + rs)
        result.push(rsi)
        gains[period] = avgGain
        losses[period] = avgLoss
        continue
      }

      // Rest of RSI calculations
      const avgGain: number = (gains[i - 1] * (period - 1) + gains[i]) / period
      const avgLoss: number = (losses[i - 1] * (period - 1) + losses[i]) / period

      gains[i] = avgGain
      losses[i] = avgLoss

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      const rsi = 100 - 100 / (1 + rs)
      result.push(rsi)
    }

    return result
  }

  return {
    sma20: calculateSMA(20),
    sma50: calculateSMA(50),
    sma200: calculateSMA(200),
    ema12: calculateEMA(12),
    ema26: calculateEMA(26),
    rsi14: calculateRSI(14),
  }
}

// Calculate support and resistance levels
export function calculateSupportResistance(data: PriceData[], lookback = 20) {
  if (data.length < lookback * 2) {
    return { support: [], resistance: [] }
  }

  const recentData = data.slice(-lookback * 2)
  const levels: { support: { price: number; timestamp: number; strength: number }[], resistance: { price: number; timestamp: number; strength: number }[] } = { support: [], resistance: [] }

  // Find local minima and maxima
  for (let i = lookback; i < recentData.length - lookback; i++) {
    let isMinimum = true
    let isMaximum = true

    // Check if point is a minimum
    for (let j = i - lookback; j < i; j++) {
      if (recentData[j].low <= recentData[i].low) {
        isMinimum = false
        break
      }
    }

    for (let j = i + 1; j < i + lookback; j++) {
      if (recentData[j].low <= recentData[i].low) {
        isMinimum = false
        break
      }
    }

    // Check if point is a maximum
    for (let j = i - lookback; j < i; j++) {
      if (recentData[j].high >= recentData[i].high) {
        isMaximum = false
        break
      }
    }

    for (let j = i + 1; j < i + lookback; j++) {
      if (recentData[j].high >= recentData[i].high) {
        isMaximum = false
        break
      }
    }

    if (isMinimum) {
      levels.support.push({
        price: recentData[i].low,
        timestamp: recentData[i].timestamp,
        strength: lookback, // Simple strength indicator
      })
    }

    if (isMaximum) {
      levels.resistance.push({
        price: recentData[i].high,
        timestamp: recentData[i].timestamp,
        strength: lookback, // Simple strength indicator
      })
    }
  }

  return levels
}

