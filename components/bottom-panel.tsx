"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleDollarSign, Clock, MessageSquare, BookOpen, List, AlertCircle, ChevronsUpDown } from "lucide-react"

interface BottomPanelProps {
  isReplayMode: boolean
}

export default function BottomPanel({ isReplayMode }: BottomPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`border-t bg-card transition-all ${isOpen ? "h-[350px]" : "h-9"}`}>
      {/* Toggle header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 flex items-center justify-between cursor-pointer hover:bg-muted/40"
      >
        <div className="flex items-center">
          <ChevronsUpDown className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Profit Shelter Terminal</span>
        </div>
        <span className="text-xs text-muted-foreground">{isOpen ? "Click to collapse" : "Click to expand"}</span>
      </div>

      {/* Panel content */}
      {isOpen && (
        <div className="h-[calc(350px-36px)] p-2">
          <Tabs defaultValue="positions">
            <TabsList className="grid grid-cols-6 w-[600px]">
              <TabsTrigger value="positions" className="flex items-center text-xs">
                <CircleDollarSign className="h-3.5 w-3.5 mr-1.5" />
                Positions
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center text-xs">
                <List className="h-3.5 w-3.5 mr-1.5" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center text-xs">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                History
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center text-xs">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center text-xs">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                News
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="pt-2">
              {isReplayMode ? (
                <div className="rounded-md border p-8 text-center">
                  <h3 className="font-medium mb-2">Replay Mode Active</h3>
                  <p className="text-sm text-muted-foreground">Trading is disabled during market replay.</p>
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Entry Price</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>P&L</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">EURUSD</TableCell>
                        <TableCell className="text-green-600">BUY</TableCell>
                        <TableCell>0.10</TableCell>
                        <TableCell>1.0915</TableCell>
                        <TableCell>1.0921</TableCell>
                        <TableCell className="text-green-600">+$6.00</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Modify</button>
                            <button className="px-2 py-1 text-xs rounded bg-red-600 text-white">Close</button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">GBPUSD</TableCell>
                        <TableCell className="text-red-600">SELL</TableCell>
                        <TableCell>0.25</TableCell>
                        <TableCell>1.2645</TableCell>
                        <TableCell>1.2658</TableCell>
                        <TableCell className="text-red-600">-$32.50</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Modify</button>
                            <button className="px-2 py-1 text-xs rounded bg-red-600 text-white">Close</button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="mt-3 flex justify-between">
                    <div className="text-sm">
                      <span className="font-medium">Account Balance:</span> $10,000.00
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Equity:</span> $9,973.50
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Margin Used:</span> $375.25 (3.8%)
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Free Margin:</span> $9,624.75
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <div className="rounded-md border p-8 text-center">
                <h3 className="font-medium mb-2">No Pending Orders</h3>
                <p className="text-sm text-muted-foreground">You don't have any pending orders at the moment.</p>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-03-14 09:45</TableCell>
                    <TableCell>EURUSD</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>0.50</TableCell>
                    <TableCell>1.0853</TableCell>
                    <TableCell className="text-green-600">+$78.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-03-13 14:22</TableCell>
                    <TableCell>USDJPY</TableCell>
                    <TableCell>SELL</TableCell>
                    <TableCell>0.25</TableCell>
                    <TableCell>149.83</TableCell>
                    <TableCell className="text-red-600">-$21.25</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-03-10 16:05</TableCell>
                    <TableCell>GBPUSD</TableCell>
                    <TableCell>BUY</TableCell>
                    <TableCell>0.10</TableCell>
                    <TableCell>1.2584</TableCell>
                    <TableCell className="text-green-600">+$43.80</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="alerts">
              <div className="rounded-md border p-8 text-center">
                <h3 className="font-medium mb-2">No Active Alerts</h3>
                <p className="text-sm text-muted-foreground">Right-click on the chart to set price alerts.</p>
              </div>
            </TabsContent>

            <TabsContent value="news">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">EUR/USD Outlook</CardTitle>
                    <CardDescription className="text-xs">Reuters • 1 hour ago</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-xs">
                      The Euro continued to gain against the US Dollar as markets anticipate the ECB meeting scheduled
                      for tomorrow. Analysts expect rates to remain unchanged...
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Fed Rate Decision Impact</CardTitle>
                    <CardDescription className="text-xs">Bloomberg • 3 hours ago</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-xs">
                      Federal Reserve officials signaled they're on track to cut interest rates this year, but
                      emphasized that they want to gain more confidence inflation is moving sustainably toward their 2%
                      goal...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="rounded-md border p-8 text-center">
                <h3 className="font-medium mb-2">Trading Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with other traders to discuss market conditions and strategies.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

