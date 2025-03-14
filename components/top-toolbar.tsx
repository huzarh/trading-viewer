"use client"

import {
  TrendingUp,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import type { DrawingToolType } from "@/lib/drawing-tools"
import rawPriceData from "@/data/price.json"

interface TopToolbarProps {
  activeDrawingTool: DrawingToolType | null
  onDrawingToolSelect: (tool: DrawingToolType) => void
  isReplayMode: boolean
  toggleReplayMode: () => void
  advanceReplay: () => void
}

export default function TopToolbar({
  activeDrawingTool,
  onDrawingToolSelect,
  isReplayMode,
  toggleReplayMode,
  advanceReplay,
}: TopToolbarProps) {
  // Get the symbol from the price data
  const symbol = rawPriceData.symbol || "EURUSD"
  const description = rawPriceData.description || "Euro / US Dollar"

  // Calculate current price and daily change (placeholder for real data)
  const latestPrice = rawPriceData.close ? rawPriceData.close[rawPriceData.close.length - 1] : 1.0921
  const previousPrice = rawPriceData.close ? rawPriceData.close[rawPriceData.close.length - 2] : 1.0915
  const priceChange = latestPrice - previousPrice
  const priceChangePercent = (priceChange / previousPrice) * 100

  return (
    <div className="flex flex-col border-b bg-card">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold mr-2">{symbol}</h1>
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

      {/* Drawing tools toolbar */}
      <div className="flex items-center p-1 px-2 bg-muted/30 border-t border-border/40">
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={activeDrawingTool === "trendline" ? "default" : "ghost"} size="sm" className="h-8">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>Lines</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDrawingToolSelect("trendline")}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Trend Line
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDrawingToolSelect("horizontalline")}>
                      <Minus className="h-4 w-4 mr-2" />
                      Horizontal Line
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDrawingToolSelect("verticalline")}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Vertical Line
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Line Tools</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "rectangle" ? "default" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => onDrawingToolSelect("rectangle")}
                >
                  <Square className="h-4 w-4 mr-1" />
                  <span>Rectangle</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rectangle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "fibonacci" ? "default" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => onDrawingToolSelect("fibonacci")}
                >
                  <ChevronsUpDown className="h-4 w-4 mr-1" />
                  <span>Fibonacci</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fibonacci Retracement</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "indicators" ? "default" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => onDrawingToolSelect("indicators" as DrawingToolType)}
                >
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span>Indicators</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Technical Indicators</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "alert" ? "default" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => onDrawingToolSelect("alert" as DrawingToolType)}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  <span>Alerts</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Set Price Alerts (Right-click on chart)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "buyposition" ? "default" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => onDrawingToolSelect("buyposition")}
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>Buy Entry</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Buy Position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "sellposition" ? "default" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => onDrawingToolSelect("sellposition")}
                >
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span>Sell Entry</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Sell Position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

