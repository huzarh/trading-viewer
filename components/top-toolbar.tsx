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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

  return (
    <div className="flex items-center justify-between p-2 border-b bg-card">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold mr-4">{symbol}</h1>
        <span className="text-sm text-muted-foreground">{description}</span>

        <div className="ml-6 flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={activeDrawingTool === "trendline" ? "default" : "outline"} size="icon">
                      <TrendingUp className="h-4 w-4" />
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
                  variant={activeDrawingTool === "rectangle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onDrawingToolSelect("rectangle")}
                >
                  <Square className="h-4 w-4" />
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
                  variant={activeDrawingTool === "fibonacci" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onDrawingToolSelect("fibonacci")}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fibonacci Retracement</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>https://v0.dev/chat/next-js-single-page-pxSiNN6xaBR

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "indicators" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onDrawingToolSelect("indicators" as DrawingToolType)}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Indicators</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "alert" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onDrawingToolSelect("alert" as DrawingToolType)}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Set Alert (Right-click on chart)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === "buyposition" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onDrawingToolSelect("buyposition")}
                >
                  <ArrowUp className="h-4 w-4" />
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
                  variant={activeDrawingTool === "sellposition" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onDrawingToolSelect("sellposition")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Sell Position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={toggleReplayMode}>
          {isReplayMode ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {isReplayMode ? "Stop Replay" : "Start Replay"}
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

