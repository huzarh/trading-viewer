"use client"

import { X, BarChart2, Clock, CircleDollarSign, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const timeframes = ["1M", "5M", "15M", "30M", "1H", "4H", "1D", "1W"]

  // Get the latest price for calculations
  const latestPrice = rawPriceData.close ? rawPriceData.close[rawPriceData.close.length - 1] : 1.0921

  return (
    <div className="w-64 border-l bg-card p-0 flex flex-col">
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid grid-cols-3 w-full rounded-none">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Timeframe</h3>
            <div className="grid grid-cols-4 gap-1">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={activeTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Chart Options</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="log-scale">Logarithmic Scale</Label>
                <Switch id="log-scale" checked={isLogScale} onCheckedChange={setIsLogScale} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="extended-hours">Extended Hours</Label>
                <Switch id="extended-hours" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-volume">Show Volume</Label>
                <Switch id="show-volume" defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Chart Style</h3>
            <Select defaultValue="candles">
              <SelectTrigger>
                <SelectValue placeholder="Chart Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candles">Candlesticks</SelectItem>
                <SelectItem value="heikinashi">Heikin-Ashi</SelectItem>
                <SelectItem value="bars">OHLC Bars</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <BellRing className="h-4 w-4 mr-1" />
              Price Alerts
            </h3>
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
        </TabsContent>

        <TabsContent value="trading" className="p-4 space-y-4">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">New Position</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                  Buy
                </Button>
                <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700">
                  Sell
                </Button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label htmlFor="lot-size" className="text-xs">
                    Lot Size
                  </Label>
                  <Select defaultValue="0.01">
                    <SelectTrigger className="h-8 col-span-2">
                      <SelectValue placeholder="Lot Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.01">0.01</SelectItem>
                      <SelectItem value="0.1">0.1</SelectItem>
                      <SelectItem value="1">1.0</SelectItem>
                      <SelectItem value="10">10.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label htmlFor="stop-loss" className="text-xs">
                    Stop Loss
                  </Label>
                  <Select defaultValue="50">
                    <SelectTrigger className="h-8 col-span-2">
                      <SelectValue placeholder="Points" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 points</SelectItem>
                      <SelectItem value="25">25 points</SelectItem>
                      <SelectItem value="50">50 points</SelectItem>
                      <SelectItem value="100">100 points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label htmlFor="take-profit" className="text-xs">
                    Take Profit
                  </Label>
                  <Select defaultValue="100">
                    <SelectTrigger className="h-8 col-span-2">
                      <SelectValue placeholder="Points" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 points</SelectItem>
                      <SelectItem value="100">100 points</SelectItem>
                      <SelectItem value="200">200 points</SelectItem>
                      <SelectItem value="500">500 points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Risk Calculator</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Position Value:</span>
                  <span className="font-medium">$10,921.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Risk Amount:</span>
                  <span className="font-medium text-red-500">$54.61 (0.5%)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Potential Reward:</span>
                  <span className="font-medium text-green-500">$109.21 (1.0%)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Risk/Reward Ratio:</span>
                  <span className="font-medium">1:2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="p-4 space-y-4">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center">
                <BarChart2 className="h-4 w-4 mr-1" />
                Technical Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Moving Averages</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-700">
                    Buy
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Oscillators</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700">
                    Neutral
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">MACD</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-700">Sell</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">RSI (14)</span>
                  <span className="text-xs font-medium">57.3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Market Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>New York</span>
                  <span className="font-medium">09:30 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span>London</span>
                  <span className="font-medium">08:00 - 16:30</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokyo</span>
                  <span className="font-medium">09:00 - 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sydney</span>
                  <span className="font-medium">10:00 - 16:00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center">
                <CircleDollarSign className="h-4 w-4 mr-1" />
                Economic Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span>12:30 USD CPI m/m</span>
                  <span className="font-medium px-1.5 bg-red-500/20 text-red-700 rounded">High</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>14:00 EUR ECB Statement</span>
                  <span className="font-medium px-1.5 bg-red-500/20 text-red-700 rounded">High</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>14:30 USD Unemployment Claims</span>
                  <span className="font-medium px-1.5 bg-orange-500/20 text-orange-700 rounded">Medium</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

