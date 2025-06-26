"use client"

import { useState, useEffect } from "react"
import TradingView from "@/components/trading-view"
import TopToolbar from "@/components/top-toolbar"
import LeftSidebar from "@/components/left-sidebar"
import RightSidebar from "@/components/right-sidebar"
import BottomPanel from "@/components/bottom-panel"
import type { DrawingToolType } from "@/lib/drawing-tools"
import { transformPriceData } from "@/lib/data-transform"
import type { PriceData } from "@/types/price-data"
import { Loader2 } from "lucide-react"

const DATA_FILES = [
  { label: "EUR/USD", value: "price.json" },
  { label: "BTC/USDT", value: "BTCUSDT_M1.json" },
  { label: "VETUSDT", value: "VETUSDT_M15.json"},

]

export default function Home() {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolType | null>(null)
  const [activeTimeframe, setActiveTimeframe] = useState("1D")
  const [isLogScale, setIsLogScale] = useState(false)
  const [alerts, setAlerts] = useState<Array<{ price: number; id: string }>>([])
  const [isReplayMode, setIsReplayMode] = useState(false)
  const [replayIndex, setReplayIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [drawings, setDrawings] = useState<any[]>([])
  const [selectedDataFile, setSelectedDataFile] = useState<string>("price.json")
  const [rawPriceData, setRawPriceData] = useState<any>(null)

  const handleDrawingToolSelect = (tool: DrawingToolType) => {
    setActiveDrawingTool((prev) => (prev === tool ? null : tool))
  }

  const handleDrawingFinished = () => {
    setActiveDrawingTool('cursor-cross')
  }

  const handleAddAlert = (price: number) => {
    setAlerts((prev) => [...prev, { price, id: Math.random().toString(36).substr(2, 9) }])
  }

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const toggleReplayMode = () => {
    setIsReplayMode((prev) => !prev)
    setReplayIndex(0)
  }

  const advanceReplay = () => {
    if (replayIndex < priceData.length - 1) {
      setReplayIndex((prev) => prev + 1)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    import(`@/data/${selectedDataFile}`)
      .then((mod) => {
        setRawPriceData(mod.default)
        const transformedData = transformPriceData(mod.default)
        setPriceData(transformedData)
      })
      .catch((error) => {
        setRawPriceData(null)
        setPriceData([])
        console.error("Error loading data file:", error)
      })
      .finally(() => setIsLoading(false))
  }, [selectedDataFile])

  // Show a professional loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-medium">Loading Market Data</h2>
        <p className="text-muted-foreground mt-2">Please wait while we retrieve the latest pricing information</p>
      </div>
    )
  }

  // Don't render until we have price data
  if (priceData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h2 className="text-xl font-medium text-red-500">Data Error</h2>
        <p className="text-muted-foreground mt-2">
          Unable to load price data. Please check your connection and try again.
        </p>
      </div>
    )
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-background">
      <TopToolbar
        activeDrawingTool={activeDrawingTool}
        onDrawingToolSelect={handleDrawingToolSelect}
        isReplayMode={isReplayMode}
        toggleReplayMode={toggleReplayMode}
        advanceReplay={advanceReplay}
        drawings={drawings}
        setDrawings={setDrawings}
        selectedDataFile={selectedDataFile}
        setSelectedDataFile={setSelectedDataFile}
        dataFiles={DATA_FILES}
        rawPriceData={rawPriceData}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar activeDrawingTool={activeDrawingTool} onDrawingToolSelect={handleDrawingToolSelect} drawings={drawings} setDrawings={setDrawings} />

        <div className="flex-1 relative">
          <TradingView
            data={isReplayMode ? priceData.slice(0, replayIndex + 1) : priceData}
            isLogScale={isLogScale}
            alerts={alerts}
            onAddAlert={handleAddAlert}
            activeDrawingTool={activeDrawingTool}
            onDrawingFinished={handleDrawingFinished}
            drawings={drawings}
            setDrawings={setDrawings}
          />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
            <button className="px-6 py-3 rounded-md bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg">
              SELL
            </button>
            <button className="px-6 py-3 rounded-md bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg">
              BUY
            </button>
          </div>
        </div>

        <RightSidebar
          activeTimeframe={activeTimeframe}
          setActiveTimeframe={setActiveTimeframe}
          isLogScale={isLogScale}
          setIsLogScale={setIsLogScale}
          alerts={alerts}
          onRemoveAlert={handleRemoveAlert}
        />
      </div>

      <BottomPanel isReplayMode={isReplayMode} />
    </main>
  )
}

