"use client"

import { PenLine, LineChart, Type, Ruler, Square, ArrowUp, ArrowDown, Minus, ArrowRight, Trash2, Crosshair, Dot, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import type { DrawingToolType } from "@/lib/drawing-tools"
import { useState } from "react"

interface LeftSidebarProps {
  activeDrawingTool: DrawingToolType | null
  onDrawingToolSelect: (tool: DrawingToolType) => void
  drawings?: any[]
  setDrawings?: (fn: any) => void
}

export default function LeftSidebar({ activeDrawingTool, onDrawingToolSelect, drawings = [], setDrawings }: LeftSidebarProps) {
  const [cursorPopoverOpen, setCursorPopoverOpen] = useState(false)

  const tools = [
    { id: "trendline" as DrawingToolType, icon: PenLine, label: "Trend Line" },
    { id: "horizontalline" as DrawingToolType, icon: Minus, label: "Horizontal Line" },
    { id: "verticalline" as DrawingToolType, icon: ArrowRight, label: "Vertical Line" },
    { id: "rectangle" as DrawingToolType, icon: Square, label: "Rectangle" },
    { id: "fibonacci" as DrawingToolType, icon: LineChart, label: "Fibonacci Retracement" },
    { id: "buyposition" as DrawingToolType, icon: ArrowUp, label: "Buy Position" },
    { id: "sellposition" as DrawingToolType, icon: ArrowDown, label: "Sell Position" },
    { id: "text" as DrawingToolType, icon: Type, label: "Add Text" },
    { id: "measure" as DrawingToolType, icon: Ruler, label: "Measure Tool" },
  ]

  const cursorTools = [
    { id: "cursor-cross" as DrawingToolType, icon: Crosshair, label: "Cross" },
    { id: "cursor-dot" as DrawingToolType, icon: Dot, label: "Dot" },
    { id: "cursor-arrow" as DrawingToolType, icon: ArrowRight, label: "Arrow" },
    { id: "cursor-eraser" as DrawingToolType, icon: Eraser, label: "Eraser" },
  ]

  return (
    <div className="w-16 border-r bg-card flex flex-col items-center pt-4">
      <div >
        <Popover open={cursorPopoverOpen} onOpenChange={setCursorPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 p-0" aria-label="Cursor tools">
              {(() => {
                const activeCursor = cursorTools.find(t => t.id === activeDrawingTool)
                const Icon = activeCursor ? activeCursor.icon : Crosshair
                return <Icon className="!h-6 !w-6 text-primary" />
              })()}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-44 p-2">
            <div className="flex flex-col gap-2">
              {cursorTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeDrawingTool === tool.id ? "default" : "ghost"}
                  size="icon"
                  onClick={() => { onDrawingToolSelect(tool.id); setCursorPopoverOpen(false); }}
                  className="w-full flex items-center gap-3 justify-start p-2"
                >
                  <tool.icon className="!h-6 !w-6" />
                  <span className="text-base">{tool.label}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <hr className="my-3 w-10 border-t border-border/80" />
      <div className="flex flex-col items-center space-y-2">
        <TooltipProvider>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeDrawingTool === tool.id ? "default" : "ghost"}
                  size="icon"
                  onClick={() => onDrawingToolSelect(tool.id)}
                  className="h-12 w-12 mb-2 p-0" // line bottom
                >
                    <tool.icon className="!h-6  !w-6 " />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      <div className="mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setDrawings && setDrawings([])}
                disabled={!drawings || drawings.length === 0}
                aria-label="Remove all drawings"
                className="h-12 w-12 p-0"
              > 
                  <Trash2 className="!h-6 !w-6" /> 
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Remove all drawings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

