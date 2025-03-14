'use client'

import { useState, useRef, useEffect } from 'react'
import CandlestickChart from './candlestick-chart'
import VolumeIndicator from './volume-indicator'
import ChartControls from './chart-controls'
import { Drawing, DrawingToolType } from '@/lib/drawing-tools'

interface PriceData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TradingViewProps {
  data: PriceData[]
  isLogScale: boolean
  alerts: Array<{price: number, id: string}>
  onAddAlert: (price: number) => void
  activeDrawingTool: DrawingToolType | null
}

export default function TradingView({ 
  data, 
  isLogScale, 
  alerts, 
  onAddAlert,
  activeDrawingTool 
}: TradingViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState(0)
  const [drawings, setDrawings] = useState<Drawing[]>([])

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 100 // Reserve space for volume
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5))
  }

  const handleReset = () => {
    setScale(1)
    setOffset(0)
  }

  const handlePanStart = (x: number) => {
    setIsPanning(true)
    setPanStart(x)
  }

  const handlePanMove = (x: number) => {
    if (isPanning) {
      const diff = (x - panStart) / 100
      setOffset(prev => prev + diff)
      setPanStart(x)
    }
  }

  const handlePanEnd = () => {
    setIsPanning(false)
  }

  const handleScaleChange = (newScale: number) => {
    setScale(newScale)
  }

  const handleAddDrawing = (drawing: Drawing) => {
    setDrawings(prev => [...prev, drawing])
  }

  const handleRemoveDrawing = (id: string) => {
    setDrawings(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-[#131722] flex flex-col"
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <>
          <div className="flex-1 relative">
            <CandlestickChart
              data={data}
              width={dimensions.width}
              height={dimensions.height}
              isLogScale={isLogScale}
              alerts={alerts}
              activeDrawingTool={activeDrawingTool}
              onAddAlert={onAddAlert}
              scale={scale}
              offset={offset}
              onPanStart={handlePanStart}
              onPanMove={handlePanMove}
              onPanEnd={handlePanEnd}
              onScaleChange={handleScaleChange}
              onAddDrawing={handleAddDrawing}
              drawings={drawings}
            />
            <ChartControls 
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
            />
          </div>
          <div className="h-[100px]">
            <VolumeIndicator 
              data={data}
              width={dimensions.width}
              height={100}
            />
          </div>
        </>
      )}
    </div>
  )
}

