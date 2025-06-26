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
  setDrawings?: React.Dispatch<React.SetStateAction<Drawing[]>>
  onRemoveDrawing?: (id: string) => void
  onOffsetChange?: (newOffset: number) => void
  onDrawingFinished?: () => void
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
  setDrawings,
  onRemoveDrawing,
  onOffsetChange = () => {},
  onDrawingFinished,
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 })
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [hoverDrawingId, setHoverDrawingId] = useState<string | null>(null)
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null)
  const [draggingHandle, setDraggingHandle] = useState<{drawingId: string, handle: 'start' | 'end'} | null>(null)
  const [draggingLine, setDraggingLine] = useState<{drawingId: string, last: {x:number, y:number}} | null>(null)
  const [panStartX, setPanStartX] = useState<number | null>(null)
  const [panStartOffset, setPanStartOffset] = useState<number>(0)

  const candleGap = 4; // Mumlar arası boşluk (px)
  const minCandleWidth = 4;
  const maxCandleWidth = 30;
  const realCandleWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, scale * 8));
  const candleWidth = realCandleWidth - candleGap;
  const visibleCount = Math.floor(width / realCandleWidth);

  // Calculate price range for scaling
  useEffect(() => {
    if (data.length === 0) return;
    const startIndex = Math.max(0, data.length - visibleCount - Math.round(offset));
    const endIndex = Math.min(data.length, startIndex + visibleCount);
    const visibleData = data.slice(startIndex, endIndex);
    if (visibleData.length === 0) return;
    const minPrice = Math.min(...visibleData.map((d) => d.low));
    const maxPrice = Math.max(...visibleData.map((d) => d.high));
    // Biraz padding ekle
    const padding = (maxPrice - minPrice) * 0.1;
    setPriceRange({
      min: minPrice - padding,
      max: maxPrice + padding,
    });
  }, [data, visibleCount, offset]);

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

    // Draw crosshair veya özel cursor
    if (activeDrawingTool && activeDrawingTool === 'cursor-cross') {
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

  useEffect(() => {
    if (!draggingHandle) {
      setSelectedDrawingId(hoverDrawingId)
    }
  }, [hoverDrawingId, draggingHandle])

  useEffect(() => {
    if (!canvasRef.current) return;
    if (draggingHandle || isDragging) {
      canvasRef.current.style.cursor = 'grabbing';
      return;
    }
    const drawing = drawings.find(d => d.id === hoverDrawingId);
    if (drawing && ['trendline', 'horizontalline', 'verticalline'].includes(drawing.type)) {
      canvasRef.current.style.cursor = 'pointer';
      return;
    }
    // Tool'a göre cursor ayarla
    switch (activeDrawingTool) {
      case 'cursor-cross':
        canvasRef.current.style.cursor = 'crosshair';
        break;
      case 'cursor-dot':
        canvasRef.current.style.cursor = 'pointer';
        break;
      case 'cursor-arrow':
        canvasRef.current.style.cursor = 'alias';
        break;
      case 'cursor-eraser':
        canvasRef.current.style.cursor = 'not-allowed';
        break;
      default:
        canvasRef.current.style.cursor = 'default';
    }
  }, [hoverDrawingId, drawings, draggingHandle, isDragging, activeDrawingTool]);

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
    data.forEach((candle, i) => {
      const x = indexToX(i);
      // Skip if outside visible area
      if (x < -realCandleWidth || x > width) return;
      const open = priceToY(candle.open);
      const close = priceToY(candle.close);
      const high = priceToY(candle.high);
      const low = priceToY(candle.low);
      // Draw wick
      ctx.beginPath();
      ctx.strokeStyle = candle.close >= candle.open ? "#26a69a" : "#ef5350";
      ctx.lineWidth = 1;
      ctx.moveTo(x, high);
      ctx.lineTo(x, low);
      ctx.stroke();
      // Draw body
      ctx.fillStyle = candle.close >= candle.open ? "#26a69a" : "#ef5350";
      const bodyHeight = Math.max(1, Math.abs(close - open));
      const bodyY = Math.min(open, close);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
    });
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
    let lineWidth = 1.2;
    if (drawing.type === 'trendline') {
      lineWidth = isHighlighted ? 3 : 2;
    } else if (drawing.type === 'fibonacci') {
      lineWidth = 1.5;
    } else if (drawing.type === 'measure') {
      lineWidth = isHighlighted ? 4 : 2.5;
    } else {
      lineWidth = isHighlighted ?2 : 0.5;
    }
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
      case "measure":
        drawMeasure(ctx, drawing, lineWidth)
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
    const R = 7
    // --- EKRAN KOORDİNATLARINA ÇEVİR ---
    const sx = indexToX(drawing.start.x)
    const sy = priceToY(drawing.start.y)
    const ex = indexToX(drawing.end.x)
    const ey = priceToY(drawing.end.y)
    const dx = ex - sx
    const dy = ey - sy
    const len = Math.sqrt(dx*dx + dy*dy)
    if (len < R*2+1) {
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    } else {
      const nx = dx / len
      const ny = dy / len
      const sxx = sx + nx * R
      const syy = sy + ny * R
      const exx = ex - nx * R
      const eyy = ey - ny * R
      ctx.beginPath()
      ctx.moveTo(sxx, syy)
      ctx.lineTo(exx, eyy)
      ctx.stroke()
    }
    ctx.setLineDash([])
    if (selectedDrawingId === drawing.id) {
      [[sx, sy], [ex, ey]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }

  const drawHorizontalLine = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    ctx.strokeStyle = drawing.color
    ctx.lineWidth = lineWidth
    if (currentDrawing === drawing) {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }
    const y = priceToY(drawing.start.y)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
    const price = drawing.start.y
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
    const x = indexToX(drawing.start.x)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
    const dataIndex = drawing.start.x
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
    const x1 = indexToX(drawing.start.x)
    const y1 = priceToY(drawing.start.y)
    const x2 = indexToX(drawing.end.x)
    const y2 = priceToY(drawing.end.y)
    const x = Math.min(x1, x2)
    const y = Math.min(y1, y2)
    const w = Math.abs(x2 - x1)
    const h = Math.abs(y2 - y1)
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.stroke()
    ctx.fillStyle = `${drawing.color}20`
    ctx.fill()
    ctx.setLineDash([])
  }

  const drawFibonacci = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    // Renk paleti ve transparan bantlar
    const bandColors = [
      'rgba(255, 193, 7, 0.18)', // sarı
      'rgba(76, 175, 80, 0.18)', // yeşil
      'rgba(33, 150, 243, 0.18)', // mavi
      'rgba(244, 67, 54, 0.18)', // kırmızı
      'rgba(156, 39, 176, 0.18)', // mor
      'rgba(255, 152, 0, 0.18)', // turuncu
      'rgba(0, 188, 212, 0.18)', // camgöbeği
    ];
    ctx.save();
    ctx.strokeStyle = drawing.color;
    ctx.lineWidth = lineWidth + 1;
    if (currentDrawing === drawing) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    const sx = indexToX(drawing.start.x);
    const sy = priceToY(drawing.start.y);
    const ex = indexToX(drawing.end.x);
    const ey = priceToY(drawing.end.y);
    const startPrice = drawing.start.y;
    const endPrice = drawing.end.y;
    const priceDiff = startPrice - endPrice;
    // Bantları çiz
    for (let i = 0; i < drawing.levels.length - 1; i++) {
      const level1 = drawing.levels[i];
      const level2 = drawing.levels[i + 1];
      const y1 = priceToY(startPrice - priceDiff * level1);
      const y2 = priceToY(startPrice - priceDiff * level2);
      ctx.beginPath();
      ctx.fillStyle = bandColors[i % bandColors.length];
      ctx.rect(Math.min(sx, ex), Math.min(y1, y2), Math.abs(ex - sx), Math.abs(y2 - y1));
      ctx.fill();
    }
    // Seviye çizgileri ve etiketler
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < drawing.levels.length; i++) {
      const level = drawing.levels[i];
      const levelPrice = startPrice - priceDiff * level;
      const y = priceToY(levelPrice);
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.lineTo(ex, y);
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = lineWidth + 0.2;
      ctx.stroke();
      // Etiket kutusu
      const label = `${(level * 100).toFixed(1)}%  ${formatPrice(levelPrice)}`;
      // Sağ kenara hizala, çizginin biraz dışına
      const labelPadding = 8;
      const labelWidth = ctx.measureText(label).width + 16;
      const labelHeight = 20;
      const labelX = Math.max(sx, ex) + labelPadding + 4;
      const labelY = y - labelHeight / 2;
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = '#232632';
      ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX + 8, y);
      ctx.restore();
    }
    ctx.setLineDash([]);
    // Ana çizgi
    ctx.save();
    ctx.strokeStyle = drawing.color;
    ctx.lineWidth = lineWidth + 0.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();
    // Seçili ise veya yeni çiziliyorsa, uçlara büyük tutma noktası çiz
    if (selectedDrawingId === drawing.id || currentDrawing === drawing) {
      [
        [sx, sy],
        [ex, ey],
      ].forEach(([x, y]) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI); // line solid suircle width
        ctx.fillStyle = '#131722';
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.strokeStyle = drawing.color;
        ctx.stroke();
        ctx.restore();
      });
    }
    ctx.restore();
  }

  const drawBuyPosition = (ctx: CanvasRenderingContext2D, drawing: any) => {
    const { point, price, size } = drawing
    const radius = 8 * Math.sqrt(size)
    const x = indexToX(point.x)
    const y = priceToY(point.y)
    ctx.fillStyle = drawing.color
    ctx.beginPath()
    ctx.moveTo(x, y - radius)
    ctx.lineTo(x + radius, y + radius)
    ctx.lineTo(x - radius, y + radius)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("B", x, y + 2)
    ctx.fillStyle = drawing.color
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.textBaseline = "bottom"
    ctx.fillText(`Buy @ ${formatPrice(price)}`, x + radius + 5, y)
  }

  const drawSellPosition = (ctx: CanvasRenderingContext2D, drawing: any) => {
    const { point, price, size } = drawing
    const radius = 8 * Math.sqrt(size)
    const x = indexToX(point.x)
    const y = priceToY(point.y)
    ctx.fillStyle = drawing.color
    ctx.beginPath()
    ctx.moveTo(x, y + radius)
    ctx.lineTo(x + radius, y - radius)
    ctx.lineTo(x - radius, y - radius)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("S", x, y - 2)
    ctx.fillStyle = drawing.color
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText(`Sell @ ${formatPrice(price)}`, x + radius + 5, y)
  }

  // Measure drawing render (TradingView style)
  const drawMeasure = (ctx: CanvasRenderingContext2D, drawing: any, lineWidth: number) => {
    const sx = indexToX(drawing.start.x);
    const sy = priceToY(drawing.start.y);
    const ex = indexToX(drawing.end.x);
    const ey = priceToY(drawing.end.y);
    // Çizgi
    ctx.save();
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);
    // Uçlarda tutma noktası
    [[sx, sy], [ex, ey]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.95;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2196f3';
      ctx.stroke();
    });
    // Mesafe, fiyat farkı, yüzde değişim etiketi (TradingView style)
    const dx = drawing.end.x - drawing.start.x;
    const dy = drawing.end.y - drawing.start.y;
    const barDistance = Math.abs(dx);
    const priceDiff = drawing.end.y - drawing.start.y;
    const percent = (priceDiff / drawing.start.y) * 100;
    // Orta nokta ve açı
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    const angle = Math.atan2(ey - sy, ex - sx);
    // Etiket kutusu
    const labelLines = [
      `${barDistance} bars`,
      `${priceDiff > 0 ? '+' : ''}${priceDiff.toFixed(2)}`,
      `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`
    ];
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    // Kutu boyutları
    const labelWidth = 90;
    const labelHeight = 44;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#232632';
    ctx.fillRect(-labelWidth/2, -labelHeight/2, labelWidth, labelHeight);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    ctx.strokeRect(-labelWidth/2, -labelHeight/2, labelWidth, labelHeight);
    // Yazılar
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelLines[0], 0, -14);
    ctx.fillStyle = priceDiff >= 0 ? '#4caf50' : '#f44336';
    ctx.fillText(labelLines[1], 0, 2);
    ctx.fillStyle = percent >= 0 ? '#4caf50' : '#f44336';
    ctx.fillText(labelLines[2], 0, 18);
    ctx.restore();
    ctx.restore();
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
    const startIndex = Math.max(0, data.length - visibleCount - Math.round(offset));
    return (index - startIndex) * realCandleWidth;
  }

  // Convert x coordinate to data index
  const xToIndex = (x: number) => {
    const startIndex = Math.max(0, data.length - visibleCount - Math.round(offset));
    const index = Math.round(startIndex + x / realCandleWidth);
    return Math.max(0, Math.min(data.length - 1, index));
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePosition({ x, y })

    // draggingLine aktifse çizgiyi taşı
    if (draggingLine && setDrawings) {
      const dx = x - draggingLine.last.x
      const dy = y - draggingLine.last.y
      setDrawings((prev: Drawing[]) => prev.map(d => {
        if (d.id === draggingLine.drawingId && (d.type === 'trendline' || d.type === 'fibonacci')) {
          // Bar index ve price için delta hesapla
          const deltaBar = dx / realCandleWidth;
          // Y ekseninde, priceToY(d.start.y) + dy yeni y koordinatı, bunu tekrar price'a çevir
          const startYpx = priceToY(d.start.y);
          const endYpx = priceToY(d.end.y);
          const newStartY = yToPrice(startYpx + dy);
          const newEndY = yToPrice(endYpx + dy);
          return {
            ...d,
            start: { x: d.start.x + deltaBar, y: newStartY },
            end: { x: d.end.x + deltaBar, y: newEndY }
          }
        }
        return d
      }))
      setDraggingLine({drawingId: draggingLine.drawingId, last: {x, y}})
      return
    }

    // Handle sürükleniyorsa, ilgili ucu güncelle
    if (draggingHandle && setDrawings) {
      setDrawings((prev: Drawing[]) => prev.map((d: Drawing) => {
        if (d.id === draggingHandle.drawingId && (d.type === 'trendline' || d.type === 'fibonacci')) {
          if (draggingHandle.handle === 'start') {
            return { ...d, start: { x: xToIndex(x), y: yToPrice(y) } }
          } else {
            return { ...d, end: { x: xToIndex(x), y: yToPrice(y) } }
          }
        }
        return d
      }))
      return
    }

    if (isDragging && activeDrawingTool) {
      updateCurrentDrawing(x, y)
    } else if (isPanning && panStartX !== null) {
      const deltaX = x - panStartX;
      const newOffset = panStartOffset + deltaX / realCandleWidth;
      onOffsetChange(newOffset);
      return;
    } else {
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
    // x1, y1, x2, y2: veri uzayında (barIndex, price)
    const sx = indexToX(x1)
    const sy = priceToY(y1)
    const ex = indexToX(x2)
    const ey = priceToY(y2)
    const A = x - sx
    const B = y - sy
    const C = ex - sx
    const D = ey - sy
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    if (lenSq !== 0) param = dot / lenSq
    let xx, yy
    if (param < 0) {
      xx = sx
      yy = sy
    } else if (param > 1) {
      xx = ex
      yy = ey
    } else {
      xx = sx + param * C
      yy = sy + param * D
    }
    const dx = x - xx
    const dy = y - yy
    return Math.sqrt(dx * dx + dy * dy) < threshold
  }

  const isPointInRectangle = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    // x1, y1, x2, y2: veri uzayında (barIndex, price)
    const rx1 = indexToX(x1)
    const ry1 = priceToY(y1)
    const rx2 = indexToX(x2)
    const ry2 = priceToY(y2)
    const minX = Math.min(rx1, rx2)
    const maxX = Math.max(rx1, rx2)
    const minY = Math.min(ry1, ry2)
    const maxY = Math.max(ry1, ry2)
    return x >= minX && x <= maxX && y >= minY && y <= maxY
  }

  const isPointNearPoint = (x: number, y: number, px: number, py: number, threshold = 5) => {
    // px, py: veri uzayında (barIndex, price)
    const sx = indexToX(px)
    const sy = priceToY(py)
    const dx = x - sx
    const dy = y - sy
    return Math.sqrt(dx * dx + dy * dy) < threshold
  }

  const updateCurrentDrawing = (x: number, y: number) => {
    if (!currentDrawing) return
    const barIndex = xToIndex(x)
    const price = yToPrice(y)
    switch (currentDrawing.type) {
      case "trendline":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x: barIndex, y: price },
        })
        break
      case "horizontalline":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x: barIndex, y: currentDrawing.start.y },
        })
        break
      case "verticalline":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x: currentDrawing.start.x, y: price },
        })
        break
      case "rectangle":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x: barIndex, y: price },
        })
        break
      case "fibonacci":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x: barIndex, y: price },
        })
        break
      case "measure":
        setCurrentDrawing({
          ...currentDrawing,
          end: { x: barIndex, y: price },
        })
        break
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Eraser tool aktifse, tıklanan çizimi sil
    if (activeDrawingTool === 'cursor-eraser' && setDrawings) {
      const hit = drawings.find((drawing) => {
        switch (drawing.type) {
          case 'trendline':
          case 'horizontalline':
          case 'verticalline':
            return isPointNearLine(x, y, drawing.start.x, drawing.start.y, drawing.end.x, drawing.end.y, 8)
          case 'rectangle':
            return isPointInRectangle(x, y, drawing.start.x, drawing.start.y, drawing.end.x, drawing.end.y)
          case 'fibonacci':
            return isPointNearLine(x, y, drawing.start.x, drawing.start.y, drawing.end.x, drawing.end.y, 8)
          case 'buyposition':
          case 'sellposition':
            return isPointNearPoint(x, y, drawing.point.x, drawing.point.y, 10)
          default:
            return false
        }
      })
      if (hit) {
        setDrawings((prev: Drawing[]) => prev.filter(d => d.id !== hit.id))
        if (typeof (onRemoveDrawing) === 'function') onRemoveDrawing(hit.id)
      }
      return
    }

    // Önce handle'a tıklanıp tıklanmadığını kontrol et
    const hit = drawings.find((drawing) => {
      if (drawing.type === 'trendline' || drawing.type === 'fibonacci') {
        if (isPointNearPoint(x, y, drawing.start.x, drawing.start.y, 10)) {
          setDraggingHandle({drawingId: drawing.id, handle: 'start'})
          setSelectedDrawingId(drawing.id)
          return true
        }
        if (isPointNearPoint(x, y, drawing.end.x, drawing.end.y, 10)) {
          setDraggingHandle({drawingId: drawing.id, handle: 'end'})
          setSelectedDrawingId(drawing.id)
          return true
        }
      }
      return false
    })
    if (hit) return

    // Çizgi ortasına tıklama kontrolü
    const hitMoveLine = drawings.find((drawing) => {
      if (drawing.type === 'trendline' || drawing.type === 'fibonacci') {
        const mx = (drawing.start.x + drawing.end.x) / 2
        const my = (drawing.start.y + drawing.end.y) / 2
        if (isPointNearPoint(x, y, mx, my, 30)) {
          setDraggingLine({drawingId: drawing.id, last: {x, y}})
          setSelectedDrawingId(drawing.id)
          return true
        }
      }
      return false
    })
    if (hitMoveLine) return

    if (activeDrawingTool && activeDrawingTool !== 'cursor-cross') {
      startDrawing(x, y)
      setSelectedDrawingId(null)
    } else {
      setIsPanning(true)
      setPanStartX(x)
      setPanStartOffset(offset)
      onPanStart(x)
      setSelectedDrawingId(null)
    }
  }

  const startDrawing = (x: number, y: number) => {
    if (!activeDrawingTool) return
    const barIndex = xToIndex(x)
    const price = yToPrice(y)
    const start = { x: barIndex, y: price }
    const end = { x: barIndex, y: price }
    switch (activeDrawingTool) {
      case "trendline":
      case "horizontalline":
      case "verticalline":
      case "rectangle":
      case "fibonacci":
      case "measure":
        setCurrentDrawing(createDrawing(activeDrawingTool, { start, end }))
        break
      case "buyposition":
      case "sellposition": {
        const timestamp = data[barIndex]?.timestamp || Date.now()
        const drawing = createDrawing(activeDrawingTool, {
          point: { x: barIndex, y: price },
          price,
          size: 1,
          timestamp,
        })
        onAddDrawing(drawing)
        break
      }
    }
    setIsDragging(true)
    setDragStart({ x, y })
  }

  const handleMouseUp = () => {
    if (draggingHandle) {
      setDraggingHandle(null)
      return
    }
    if (draggingLine) {
      setDraggingLine(null)
      return
    }
    if (isDragging && currentDrawing) {
      // Only add the drawing if it has a minimum size/length
      const isValid = validateDrawing(currentDrawing)

      if (isValid) {
        onAddDrawing(currentDrawing)
        if (typeof onDrawingFinished === 'function') onDrawingFinished()
      }

      setCurrentDrawing(null)
    }
    setIsDragging(false)

    if (isPanning) {
      setIsPanning(false)
      setPanStartX(null)
      setPanStartOffset(0)
      onPanEnd()
    }
  }

  const validateDrawing = (drawing: Drawing): boolean => {
    switch (drawing.type) {
      case "trendline":
      case "fibonacci": {
        // Ekran (piksel) uzayında uzunluk kontrolü
        const sx = indexToX(drawing.start.x)
        const sy = priceToY(drawing.start.y)
        const ex = indexToX(drawing.end.x)
        const ey = priceToY(drawing.end.y)
        const distance = Math.sqrt((ex - sx) * (ex - sx) + (ey - sy) * (ey - sy))
        return distance > 10 // Minimum 10px uzunluk
      }
      case "rectangle": {
        const sx = indexToX(drawing.start.x)
        const sy = priceToY(drawing.start.y)
        const ex = indexToX(drawing.end.x)
        const ey = priceToY(drawing.end.y)
        const width = Math.abs(ex - sx)
        const height = Math.abs(ey - sy)
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
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseIndex = xToIndex(mouseX);
    // Zoom miktarı
    let newScale = scale;
    if (e.deltaY < 0) {
      // Zoom in
      newScale = Math.min(scale * 1.1, 5);
    } else {
      // Zoom out
      newScale = Math.max(scale / 1.1, 0.5);
    }
    // Yeni candleWidth ve visibleCount hesapla
    const newRealCandleWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, newScale * 8));
    const newVisibleCount = Math.floor(width / newRealCandleWidth);
    // Mouse altındaki bar index aynı x'te kalsın diye yeni offset hesapla
    const newOffset = data.length - newVisibleCount - (mouseIndex - (mouseX / newRealCandleWidth));
    // Offset'i üst component'e bildir
    onOffsetChange(newOffset);
    // Scale'i güncelle
    onScaleChange(newScale);
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
    />
  )
}

