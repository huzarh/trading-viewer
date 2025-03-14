"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { formatDate, formatPrice } from "@/lib/utils"
import { type Drawing, type DrawingToolType, type Point, createDrawing } from "@/lib/drawing-tools"

interface PriceData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CandlestickChartProps {
  data: PriceData[]
  width: number
  height: number
  isLogScale: boolean
  alerts: Array<{ price: number; id: string }>
  activeDrawingTool: DrawingToolType | null
  onAddAlert: (price: number) => void
  scale: number
  offset: number
  onPanStart: (x: number) => void
  onPanMove: (x: number) => void
  onPanEnd: () => void
  onScaleChange: (newScale: number) => void
  onAddDrawing?: (drawing: Drawing) => void
  drawings?: Drawing[]
}

export default function CandlestickChart({
  data,
  width,
  height,
  isLogScale,
  alerts,
  activeDrawingTool,
  onAddAlert,
  scale,
  offset,
  onPanStart,
  onPanMove,
  onPanEnd,
  onScaleChange,
  onAddDrawing = () => {},
  drawings = [],
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 })
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [hoverDrawingId, setHoverDrawingId] = useState<string | null>(null)

  // Calculate price range for scaling
  useEffect(() => {
    if (data.length === 0) return

    const minPrice = Math.min(...data.map((d) => d.low))
    const maxPrice = Math.max(...data.map((d) => d.high))

    // Add some padding
    const padding = (maxPrice - minPrice) * 0.1
    setPriceRange({
      min: minPrice - padding,
      max: maxPrice + padding,
    })
  }, [data])

  // Draw the chart
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

    // Draw grid
    drawGrid(ctx)

    // Draw price scale
    drawPriceScale(ctx)

    // Draw time scale
    drawTimeScale(ctx)

    // Draw candlesticks
    drawCandlesticks(ctx)

    // Draw alerts
    drawAlerts(ctx)

    // Draw all saved drawings
    drawAllDrawings(ctx, drawings)

    // Draw current drawing being created
    if (currentDrawing) {
      drawDrawing(ctx, currentDrawing, true)
    }

    // Draw crosshair if a drawing tool is active
    if (activeDrawingTool) {
      drawCrosshair(ctx)
    }
  }, [
    data,
    width,
    height,
    isLogScale,
    alerts,
    activeDrawingTool,
    mousePosition,
    drawings,
    currentDrawing,
    scale,
    offset,
    priceRange,
    hoverDrawingId,
  ])

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#232632"
    ctx.lineWidth = 1

    // Horizontal grid lines
    const priceStep = (priceRange.max - priceRange.min) / 5
    for (let i = 0; i <= 5; i++) {
      const price = priceRange.min + priceStep * i
      const y = priceToY(price)

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    const visibleCount = Math.floor(width / (10 * scale))
    const step = Math.max(1, Math.floor(data.length / visibleCount))

    for (let i = 0; i < data.length; i += step) {
      const x = indexToX(i)
      if (x >= 0 && x <= width) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
    }
  }

  const drawPriceScale = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px Arial"
    ctx.textAlign = "right"

    const priceStep = (priceRange.max - priceRange.min) / 5
    for (let i = 0; i <= 5; i++) {
      const price = priceRange.min + priceStep * i
      const y = priceToY(price)

      ctx.fillText(formatPrice(price), width - 5, y + 4)
    }
  }

  const drawTimeScale = (ctx: CanvasRenderingContext2D) => {
    if (data.length === 0) return

    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"

    const visibleCount = Math.floor(width / (50 * scale))
    const step = Math.max(1, Math.floor(data.length / visibleCount))

    for (let i = 0; i < data.length; i += step) {
      const x = indexToX(i)
      if (x >= 0 && x <= width) {
        const date = new Date(data[i].timestamp)
        const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
        ctx.fillText(timeStr, x, height - 5)
      }
    }
  }

  const drawCandlesticks = (ctx: CanvasRenderingContext2D) => {
    const candleWidth = Math.max(2, Math.min(20, width / (data.length / scale) - 1))

    data.forEach((candle, i) => {
      const x = indexToX(i)

      // Skip if outside visible area
      if (x < -candleWidth || x > width) return

      const open = priceToY(candle.open)
      const close = priceToY(candle.close)
      const high = priceToY(candle.high)
      const low = priceToY(candle.low)

      // Draw wick
      ctx.beginPath()
      ctx.strokeStyle = candle.close >= candle.open ? "#26a69a" : "#ef5350"
      ctx.lineWidth = 1
      ctx.moveTo(x, high)
      ctx.lineTo(x, low)
      ctx.stroke()

      // Draw body
      ctx.fillStyle = candle.close >= candle.open ? "#26a69a" : "#ef5350"
      const bodyHeight = Math.max(1, Math.abs(close - open))
      const bodyY = Math.min(open, close)
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)
    })
  }

  const drawAlerts = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#ff0000"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    alerts.forEach((alert) => {
      const y = priceToY(alert.price)

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()

      ctx.fillStyle = "#ff0000"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(formatPrice(alert.price), 5, y - 5)
    })

    ctx.setLineDash([])
  }

  const drawCrosshair = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 1

    // Horizontal line
    ctx.beginPath()
    ctx.moveTo(0, mousePosition.y)
    ctx.lineTo(width, mousePosition.y)
    ctx.stroke()

    // Vertical line
    ctx.beginPath()
    ctx.moveTo(mousePosition.x, 0)
    ctx.lineTo(mousePosition.x, height)
    ctx.stroke()

    // Price label
    const price = yToPrice(mousePosition.y)
    ctx.fillStyle = "#131722"
    ctx.fillRect(width - 60, mousePosition.y - 10, 55, 20)
    ctx.strokeStyle = "#9ca3af"
    ctx.strokeRect(width - 60, mousePosition.y - 10, 55, 20)
    ctx.fillStyle = "#ffffff"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(formatPrice(price), width - 32, mousePosition.y + 4)

    // Time label
    const dataIndex = xToIndex(mousePosition.x)
    if (dataIndex >= 0 && dataIndex < data.length) {
      const timestamp = data[dataIndex].timestamp
      const date = new Date(timestamp)
      const timeStr = formatDate(timestamp)

      ctx.fillStyle = "#131722"
      ctx.fillRect(mousePosition.x - 50, height - 25, 100, 20)
      ctx.strokeStyle = "#9ca3af"
      ctx.strokeRect(mousePosition.x - 50, height - 25, 100, 20)
      ctx.fillStyle = "#ffffff"
      ctx.fillText(timeStr, mousePosition.x, height - 12)
    }
  }

  const drawAllDrawings = (ctx: CanvasRenderingContext2D, drawings: Drawing[]) => {
    drawings.forEach((drawing) => {
      drawDrawing(ctx, drawing, drawing.id === hoverDrawingId)
    })
  }

  const drawDrawing = (ctx: CanvasRenderingContext2D, drawing: Drawing, isHighlighted = false) => {
    const lineWidth = isHighlighted ? 2 : 1

    switch (drawing.type) {
      case "trendline":
        drawTrendLine(ctx, drawing, lineWidth)
        break
      case "horizontalline":
        drawHorizontalLine(ctx, drawing, lineWidth)
        break
      case "verticalline":
        drawVerticalLine(ctx, drawing, lineWidth)
        break
      case "rectangle":
        drawRectangle(ctx, drawing, lineWidth)
        break
      case "fibonacci":
        drawFibonacci(ctx, drawing, lineWidth)
        break
      case "buyposition":
        drawBuyPosition(ctx, drawing)
        break
      case "sellposition":
        drawSellPosition(ctx, drawing)
        break
    }
  }

  const drawTrendLine = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    ctx.strokeStyle = drawing.color
    ctx.lineWidth = lineWidth

    if (currentDrawing === drawing) {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }

    ctx.beginPath()
    ctx.moveTo(drawing.start.x, drawing.start.y)
    ctx.lineTo(drawing.end.x, drawing.end.y)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const drawHorizontalLine = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    ctx.strokeStyle = drawing.color
    ctx.lineWidth = lineWidth

    if (currentDrawing === drawing) {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }

    const y = drawing.start.y

    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()

    // Add price label
    const price = yToPrice(y)
    ctx.fillStyle = drawing.color
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.fillText(formatPrice(price), 5, y - 5)

    ctx.setLineDash([])
  }

  const drawVerticalLine = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    ctx.strokeStyle = drawing.color
    ctx.lineWidth = lineWidth

    if (currentDrawing === drawing) {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }

    const x = drawing.start.x

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()

    // Add time label
    const dataIndex = xToIndex(x)
    if (dataIndex >= 0 && dataIndex < data.length) {
      const timestamp = data[dataIndex].timestamp
      const timeStr = formatDate(timestamp)

      ctx.fillStyle = drawing.color
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(timeStr, x, height - 5)
    }

    ctx.setLineDash([])
  }

  const drawRectangle = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    ctx.strokeStyle = drawing.color
    ctx.lineWidth = lineWidth

    if (currentDrawing === drawing) {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }

    const x = Math.min(drawing.start.x, drawing.end.x)
    const y = Math.min(drawing.start.y, drawing.end.y)
    const width = Math.abs(drawing.end.x - drawing.start.x)
    const height = Math.abs(drawing.end.y - drawing.start.y)

    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.stroke()

    // Add semi-transparent fill
    ctx.fillStyle = `${drawing.color}20`
    ctx.fill()

    ctx.setLineDash([])
  }

  const drawFibonacci = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    ctx.strokeStyle = drawing.color
    ctx.lineWidth = lineWidth

    if (currentDrawing === drawing) {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }

    const startPrice = yToPrice(drawing.start.y)
    const endPrice = yToPrice(drawing.end.y)
    const priceDiff = startPrice - endPrice

    // Draw the main trend line
    ctx.beginPath()
    ctx.moveTo(drawing.start.x, drawing.start.y)
    ctx.lineTo(drawing.end.x, drawing.end.y)
    ctx.stroke()

    // Draw fibonacci levels
    ctx.font = "10px Arial"
    ctx.textAlign = "right"

    drawing.levels.forEach((level) => {
      const levelPrice = startPrice - priceDiff * level
      const y = priceToY(levelPrice)

      ctx.beginPath()
      ctx.moveTo(drawing.start.x, y)
      ctx.lineTo(drawing.end.x, y)
      ctx.stroke()

      // Add level label
      ctx.fillStyle = drawing.color
      ctx.fillText(`${level * 100}%: ${formatPrice(levelPrice)}`, drawing.end.x - 5, y - 5)
    })

    ctx.setLineDash([])
  }

  const drawBuyPosition = (ctx: CanvasRenderingContext2D, drawing: any) => {
    const { point, price, size } = drawing
    const radius = 8 * Math.sqrt(size)

    // Draw triangle pointing up
    ctx.fillStyle = drawing.color
    ctx.beginPath()
    ctx.moveTo(point.x, point.y - radius)
    ctx.lineTo(point.x + radius, point.y + radius)
    ctx.lineTo(point.x - radius, point.y + radius)
    ctx.closePath()
    ctx.fill()

    // Add label
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("B", point.x, point.y + 2)

    // Add price label
    ctx.fillStyle = drawing.color
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.textBaseline = "bottom"
    ctx.fillText(`Buy @ ${formatPrice(price)}`, point.x + radius + 5, point.y)
  }

  const drawSellPosition = (ctx: CanvasRenderingContext2D, drawing: any) => {
    const { point, price, size } = drawing
    const radius = 8 * Math.sqrt(size)

    // Draw triangle pointing down
    ctx.fillStyle = drawing.color
    ctx.beginPath()
    ctx.moveTo(point.x, point.y + radius)
    ctx.lineTo(point.x + radius, point.y - radius)
    ctx.lineTo(point.x - radius, point.y - radius)
    ctx.closePath()
    ctx.fill()

    // Add label
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("S", point.x, point.y - 2)

    // Add price label
    ctx.fillStyle = drawing.color
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText(`Sell @ ${formatPrice(price)}`, point.x + radius + 5, point.y)
  }

  // Convert price to y coordinate
  const priceToY = (price: number) => {
    if (isLogScale) {
      const logMin = Math.log(priceRange.min)
      const logMax = Math.log(priceRange.max)
      const logPrice = Math.log(price)
      return height - ((logPrice - logMin) / (logMax - logMin)) * height
    } else {
      return height - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * height
    }
  }

  // Convert y coordinate to price
  const yToPrice = (y: number) => {
    if (isLogScale) {
      const logMin = Math.log(priceRange.min)
      const logMax = Math.log(priceRange.max)
      const logPrice = logMin + ((height - y) / height) * (logMax - logMin)
      return Math.exp(logPrice)
    } else {
      return priceRange.min + ((height - y) / height) * (priceRange.max - priceRange.min)
    }
  }

  // Convert data index to x coordinate
  const indexToX = (index: number) => {
    const visibleCount = width / (10 * scale)
    const startIndex = Math.max(0, data.length - visibleCount - offset * scale)
    return (index - startIndex) * (width / visibleCount)
  }

  // Convert x coordinate to data index
  const xToIndex = (x: number) => {
    const visibleCount = width / (10 * scale)
    const startIndex = Math.max(0, data.length - visibleCount - offset * scale)
    const index = Math.round(startIndex + x / (width / visibleCount))
    return Math.max(0, Math.min(data.length - 1, index))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePosition({ x, y })

    if (isDragging && activeDrawingTool) {
      updateCurrentDrawing(x, y)
    } else if (isPanning) {
      onPanMove(x)
    } else {
      // Check if hovering over any drawing
      checkHoverDrawings(x, y)
    }
  }

  const checkHoverDrawings = (x: number, y: number) => {
    // Simple hit testing for drawings
    const hitDrawing = drawings.find((drawing) => {
      switch (drawing.type) {
        case "trendline":
        case "horizontalline":
        case "verticalline":
          return isPointNearLine(x, y, drawing.start.x, drawing.start.y, drawing.end.x, drawing.end.y)
        case "rectangle":
          return isPointInRectangle(x, y, drawing.start.x, drawing.start.y, drawing.end.x, drawing.end.y)
        case "fibonacci":
          return isPointNearLine(x, y, drawing.start.x, drawing.start.y, drawing.end.x, drawing.end.y)
        case "buyposition":
        case "sellposition":
          return isPointNearPoint(x, y, drawing.point.x, drawing.point.y, 10)
        default:
          return false
      }
    })

    setHoverDrawingId(hitDrawing ? hitDrawing.id : null)
  }

  const isPointNearLine = (x: number, y: number, x1: number, y1: number, x2: number, y2: number, threshold = 5) => {
    const A = x - x1
    const B = y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = x - xx
    const dy = y - yy

    return Math.sqrt(dx * dx + dy * dy) < threshold
  }

  const isPointInRectangle = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)

    return x >= minX && x <= maxX && y >= minY && y <= maxY
  }

  const isPointNearPoint = (x: number, y: number, px: number, py: number, threshold = 5) => {
    const dx = x - px
    const dy = y - py
    return Math.sqrt(dx * dx + dy * dy) < threshold
  }

  const updateCurrentDrawing = (x: number, y: number) => {
    if (!currentDrawing) return

    switch (currentDrawing.type) {
      case "trendline":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x, y },
        })
        break
      case "horizontalline":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x, y: currentDrawing.start.y },
        })
        break
      case "verticalline":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x: currentDrawing.start.x, y },
        })
        break
      case "rectangle":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x, y },
        })
        break
      case "fibonacci":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x, y },
        })
        break
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeDrawingTool) {
      startDrawing(x, y)
    } else {
      setIsPanning(true)
      onPanStart(x)
    }
  }

  const startDrawing = (x: number, y: number) => {
    if (!activeDrawingTool) return

    const start = { x, y }
    const end = { x, y }

    switch (activeDrawingTool) {
      case "trendline":
      case "horizontalline":
      case "verticalline":
      case "rectangle":
      case "fibonacci":
        setCurrentDrawing(createDrawing(activeDrawingTool, { start, end }))
        break
      case "buyposition":
      case "sellposition":
        const price = yToPrice(y)
        const dataIndex = xToIndex(x)
        const timestamp = data[dataIndex]?.timestamp || Date.now()

        const drawing = createDrawing(activeDrawingTool, {
          point: { x, y },
          price,
          size: 1,
          timestamp,
        })

        onAddDrawing(drawing)
        break
    }

    setIsDragging(true)
    setDragStart({ x, y })
  }

  const handleMouseUp = () => {
    if (isDragging && currentDrawing) {
      // Only add the drawing if it has a minimum size/length
      const isValid = validateDrawing(currentDrawing)

      if (isValid) {
        onAddDrawing(currentDrawing)
      }

      setCurrentDrawing(null)
    }
    setIsDragging(false)

    if (isPanning) {
      setIsPanning(false)
      onPanEnd()
    }
  }

  const validateDrawing = (drawing: Drawing): boolean => {
    switch (drawing.type) {
      case "trendline":
      case "fibonacci": {
        const dx = drawing.end.x - drawing.start.x
        const dy = drawing.end.y - drawing.start.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance > 10 // Minimum 10px length
      }
      case "rectangle": {
        const width = Math.abs(drawing.end.x - drawing.start.x)
        const height = Math.abs(drawing.end.y - drawing.start.y)
        return width > 5 && height > 5 // Minimum 5x5px
      }
      case "horizontalline":
      case "verticalline":
        return true // Always valid
      default:
        return true
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    // Zoom in/out centered on mouse position
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const dataIndex = xToIndex(mouseX)

    if (e.deltaY < 0) {
      // Zoom in
      onScaleChange(Math.min(scale * 1.1, 5))
    } else {
      // Zoom out
      onScaleChange(Math.max(scale / 1.1, 0.5))
    }
  }

  const handleRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top

    const price = yToPrice(y)
    onAddAlert(Math.round(price * 100) / 100)
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleRightClick}
      className="cursor-crosshair"
    />
  )
}

