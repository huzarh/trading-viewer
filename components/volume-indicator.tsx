"use client"

import { useRef, useEffect } from "react"

interface VolumeIndicatorProps {
  data: Array<{
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  width: number
  height: number
}

export default function VolumeIndicator({ data, width, height }: VolumeIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set background
    ctx.fillStyle = "#131722"
    ctx.fillRect(0, 0, width, height)

    // Draw volume bars
    drawVolumeBars(ctx)

    // Draw volume average line
    drawVolumeAverage(ctx)

    // Draw labels
    drawLabels(ctx)
  }, [data, width, height])

  const drawVolumeBars = (ctx: CanvasRenderingContext2D) => {
    if (data.length === 0) return

    const maxVolume = Math.max(...data.map((d) => d.volume))
    const barWidth = Math.max(2, Math.min(20, width / data.length - 1))

    data.forEach((item, i) => {
      const x = (i / data.length) * width
      const barHeight = (item.volume / maxVolume) * height * 0.8
      const y = height - barHeight

      // Draw volume bar
      ctx.fillStyle = item.close >= item.open ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)"
      ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight)
    })
  }

  const drawVolumeAverage = (ctx: CanvasRenderingContext2D) => {
    if (data.length === 0) return

    const maxVolume = Math.max(...data.map((d) => d.volume))
    const avgPeriod = 20 // 20-period moving average

    // Calculate moving average
    const volumeMA = []
    for (let i = 0; i < data.length; i++) {
      if (i < avgPeriod - 1) {
        volumeMA.push(null)
      } else {
        let sum = 0
        for (let j = 0; j < avgPeriod; j++) {
          sum += data[i - j].volume
        }
        volumeMA.push(sum / avgPeriod)
      }
    }

    // Draw moving average line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 1
    ctx.beginPath()

    for (let i = 0; i < volumeMA.length; i++) {
      if (volumeMA[i] === null) continue

      const x = (i / data.length) * width
      const y = height - ((volumeMA[i] as number) / maxVolume) * height * 0.8

      if (i === 0 || volumeMA[i - 1] === null) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  const drawLabels = (ctx: CanvasRenderingContext2D) => {
    if (data.length === 0) return

    const maxVolume = Math.max(...data.map((d) => d.volume))

    // Draw max volume label
    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px Arial"
    ctx.textAlign = "right"
    ctx.fillText(maxVolume.toLocaleString(), width - 5, 15)

    // Draw "Volume" label
    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Volume", 5, 15)

    // Draw volume MA label
    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.fillText("MA(20)", 60, 15)

    // Draw MA indicator
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(110, 12)
    ctx.lineTo(130, 12)
    ctx.stroke()
  }

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />
}

