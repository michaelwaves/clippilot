"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PerformanceChartProps {
  data: Array<{
    metric_value: number
    scraped_at: string
  }>
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data
    .map((item) => ({
      date: new Date(item.scraped_at).toLocaleDateString(),
      views: item.metric_value,
    }))
    .reverse()

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p>No performance data available</p>
          <p className="text-sm">Data will appear as campaigns are published</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
