"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import rawPriceData from "@/data/price.json"

interface RightSidebarProps {
  activeTimeframe: string
  setActiveTimeframe: (timeframe: string) => void
  isLogScale: boolean
  setIsLogScale: (isLogScale: boolean) => void
  alerts: Array<{ price: number; id: string }>
  onRemoveAlert: (id: string) => void
}

export default function RightSidebar({
  activeTimeframe,
  setActiveTimeframe,
  isLogScale,
  setIsLogScale,
  alerts,
  onRemoveAlert,
}: RightSidebarProps) {
  // Get period from price data or default to 1D
  const period = rawPriceData.period || 1440

  // Map period to timeframe label
  const periodToLabel = (p: number): string => {
    switch (p) {
      case 1:
        return "1M"
      case 5:
        return "5M"
      case 15:
        return "15M"
      case 30:
        return "30M"
      case 60:
        return "1H"
      case 240:
        return "4H"
      case 1440:
        return "1D"
      case 10080:
        return "1W"
      default:
        return `${p}M`
    }
  }

  // Generate available timeframes
  const timeframes = [periodToLabel(period), periodToLabel(period * 2), periodToLabel(period * 4)]

  return (
    <div className="w-48 border-l bg-card p-4 flex flex-col space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Timeframe</h3>
        <div className="flex space-x-2">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe}
              variant={activeTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTimeframe(timeframe)}
              className="flex-1"
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-2">Chart Options</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="log-scale">Log Scale</Label>
          <Switch id="log-scale" checked={isLogScale} onCheckedChange={setIsLogScale} />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-2">Alerts</h3>
        {alerts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No alerts set</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                <span className="text-sm">${alert.price}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveAlert(alert.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

