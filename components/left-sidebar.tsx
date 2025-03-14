"use client"

import { TrendingUp, LineChart, Type, Scissors, Square, ArrowUp, ArrowDown, Minus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { DrawingToolType } from "@/lib/drawing-tools"

interface LeftSidebarProps {
  activeDrawingTool: DrawingToolType | null
  onDrawingToolSelect: (tool: DrawingToolType) => void
}

export default function LeftSidebar({ activeDrawingTool, onDrawingToolSelect }: LeftSidebarProps) {
  const tools = [
    { id: "trendline" as DrawingToolType, icon: TrendingUp, label: "Trend Line" },
    { id: "horizontalline" as DrawingToolType, icon: Minus, label: "Horizontal Line" },
    { id: "verticalline" as DrawingToolType, icon: ArrowRight, label: "Vertical Line" },
    { id: "rectangle" as DrawingToolType, icon: Square, label: "Rectangle" },
    { id: "fibonacci" as DrawingToolType, icon: LineChart, label: "Fibonacci Retracement" },
    { id: "buyposition" as DrawingToolType, icon: ArrowUp, label: "Buy Position" },
    { id: "sellposition" as DrawingToolType, icon: ArrowDown, label: "Sell Position" },
    { id: "text" as DrawingToolType, icon: Type, label: "Add Text" },
    { id: "measure" as DrawingToolType, icon: Scissors, label: "Measure Tool" },
  ]

  return (
    <div className="w-14 border-r bg-card flex flex-col items-center py-4 space-y-4">
      <TooltipProvider>
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeDrawingTool === tool.id ? "default" : "ghost"}
                size="icon"
                onClick={() => onDrawingToolSelect(tool.id)}
                className="h-10 w-10"
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

