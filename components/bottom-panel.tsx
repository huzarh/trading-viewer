"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Play, ChevronUp, ChevronDown } from "lucide-react"

interface BottomPanelProps {
  isReplayMode: boolean
}

export default function BottomPanel({ isReplayMode }: BottomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`border-t bg-card transition-all ${isExpanded ? "h-64" : "h-10"}`}>
      <div className="flex items-center justify-between px-4 h-10">
        <Tabs defaultValue="strategy" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="strategy">Strategy Tester</TabsTrigger>
              <TabsTrigger value="replay">Replay Trading</TabsTrigger>
            </TabsList>

            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>

          {isExpanded && (
            <>
              <TabsContent value="strategy" className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Strategy Parameters</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">Entry Condition</label>
                        <select className="w-full text-xs p-1 border rounded">
                          <option>RSI Oversold</option>
                          <option>MACD Crossover</option>
                          <option>Price Breakout</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs">Exit Condition</label>
                        <select className="w-full text-xs p-1 border rounded">
                          <option>Take Profit</option>
                          <option>Stop Loss</option>
                          <option>RSI Overbought</option>
                        </select>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">
                      Run Backtest
                    </Button>
                  </div>

                  <div className="border rounded p-2">
                    <h3 className="text-sm font-medium mb-2">Results</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Win Rate:</span>
                        <span>65%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Factor:</span>
                        <span>1.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Drawdown:</span>
                        <span>12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Trades:</span>
                        <span>42</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="replay" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Replay Trading</h3>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" disabled={!isReplayMode}>
                        <Play className="h-4 w-4 mr-1" />
                        Start Replay
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded p-2">
                    <h3 className="text-sm font-medium mb-2">Instructions</h3>
                    <p className="text-xs text-muted-foreground">
                      Use the replay feature to practice trading on historical data. Click "Start Replay" to begin, then
                      use the controls to advance through the chart. Make trading decisions as the chart unfolds to
                      simulate real trading conditions.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}

