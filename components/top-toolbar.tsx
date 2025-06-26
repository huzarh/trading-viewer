"use client"

import {
  PenLine,
  BarChart2,
  Bell,
  Play,
  Pause,
  SkipForward,
  ArrowRight,
  Square,
  ArrowDown,
  ArrowUp,
  Minus,
  Settings,
  Save,
  Download,
  ChevronsUpDown,
  Crosshair,
  Dot,
  Eraser,
  Trash2,
  Ruler,
  Sun,
  Moon,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import type { DrawingToolType } from "@/lib/drawing-tools"
import rawPriceData from "@/data/price.json"
import { useTheme } from "next-themes"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface TopToolbarProps {
  activeDrawingTool: DrawingToolType | null
  onDrawingToolSelect: (tool: DrawingToolType) => void
  isReplayMode: boolean
  toggleReplayMode: () => void
  advanceReplay: () => void
  drawings?: any[]
  setDrawings?: (fn: any) => void
  selectedDataFile: string
  setSelectedDataFile: (file: string) => void
  dataFiles: { label: string, value: string }[]
  rawPriceData: any
}

export default function TopToolbar({
  activeDrawingTool,
  onDrawingToolSelect,
  isReplayMode,
  toggleReplayMode,
  advanceReplay,
  drawings = [],
  setDrawings,
  selectedDataFile,
  setSelectedDataFile,
  dataFiles,
  rawPriceData,
}: TopToolbarProps) {
  // Get the symbol from the price data
  const symbol = rawPriceData?.symbol || "EURUSD"
  const description = rawPriceData?.description || "Euro / US Dollar"

  // Calculate current price and daily change (placeholder for real data)
  const latestPrice = rawPriceData?.close ? rawPriceData.close[rawPriceData.close.length - 1] : 1.0921
  const previousPrice = rawPriceData?.close ? rawPriceData.close[rawPriceData.close.length - 2] : 1.0915
  const priceChange = latestPrice - previousPrice
  const priceChangePercent = (priceChange / previousPrice) * 100

  // Cursor tool ismi için yardımcı fonksiyon
  const getCursorLabel = (tool: DrawingToolType | null) => {
    switch (tool) {
      case 'cursor-cross': return 'Cross';
      case 'cursor-dot': return 'Dot';
      case 'cursor-arrow': return 'Arrow';
      case 'cursor-eraser': return 'Eraser';
      default: return 'Cross';
    }
  }

  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("")
  const filteredFiles = dataFiles.filter(f => f.label.toLowerCase().includes(search.toLowerCase()))
  const selectedLabel = dataFiles.find(f => f.value === selectedDataFile)?.label || symbol

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur z-20">
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2" aria-label="Change coin">
              <Search className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-0">
            <div className="p-3 pb-1 border-b">
              <Input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-2"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredFiles.length === 0 ? (
                <div className="px-3 py-2 text-muted-foreground text-sm">No results</div>
              ) : (
                filteredFiles.map(f => (
                  <Button
                    key={f.value}
                    variant={selectedDataFile === f.value ? "default" : "ghost"}
                    className="w-full justify-start rounded-none px-4 py-2 text-left"
                    onClick={() => { setSelectedDataFile(f.value); setSearch(""); }}
                  >
                    {f.label}
                  </Button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        <h1 className="text-xl font-bold mr-2">{selectedLabel}</h1>
        <span className="text-sm text-muted-foreground">{description}</span>

        {/* Price information */}
        <div className="ml-6 flex items-center space-x-2 bg-muted/30 px-3 py-1 rounded-md">
          <span className="text-lg font-semibold">{latestPrice.toFixed(4)}</span>
          <span className={`text-sm ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(4)} ({priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save Chart Layout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Chart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chart Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" onClick={toggleReplayMode} className="gap-2">
          {isReplayMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isReplayMode ? "Stop Replay" : "Market Replay"}
        </Button>

        {isReplayMode && (
          <Button variant="outline" size="icon" onClick={advanceReplay}>
            <SkipForward className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

