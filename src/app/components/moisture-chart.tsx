"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { formatWIBTime } from "@/lib/utils"

// Type for the moisture data point
interface MoistureDataPoint {
  time: string;
  value: number;
}

// Props for the chart component
interface MoistureChartProps {
  currentMoisture: number;
}

// Chart configuration
const chartConfig = {
  moisture: {
    label: "Kelembapan",
    color: "var(--color-blue-500, #3b82f6)",
  },
} satisfies ChartConfig

export function MoistureChart({ currentMoisture }: MoistureChartProps) {
  // State to store chart data points
  const [chartData, setChartData] = useState<MoistureDataPoint[]>([]);
  // Track the trend
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  // Track trend percentage
  const [trendPercentage, setTrendPercentage] = useState<number>(0);

  useEffect(() => {
    // Function to add new data point
    const addDataPoint = () => {
      const now = new Date();
      // Format waktu dalam format WIB (Indonesia) menggunakan utility function
      const timeString = formatWIBTime(now, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const newPoint: MoistureDataPoint = {
        time: timeString,
        value: currentMoisture
      };
      
      setChartData(prevData => {
        // Keep only the last 30 data points (5 minutes at 10-second intervals)
        const newData = [...prevData, newPoint];
        if (newData.length > 30) {
          return newData.slice(newData.length - 30);
        }
        return newData;
      });
      
      // Calculate trend if we have enough data points
      if (chartData.length >= 2) {
        const lastValue = chartData[chartData.length - 1]?.value || 0;
        const beforeLastValue = chartData[chartData.length - 2]?.value || 0;
        
        if (currentMoisture > lastValue) {
          setTrend("up");
          const percentage = lastValue !== 0 ? ((currentMoisture - lastValue) / lastValue) * 100 : 0;
          setTrendPercentage(Number(percentage.toFixed(1)));
        } else if (currentMoisture < lastValue) {
          setTrend("down");
          const percentage = lastValue !== 0 ? ((lastValue - currentMoisture) / lastValue) * 100 : 0;
          setTrendPercentage(Number(percentage.toFixed(1)));
        } else {
          setTrend("stable");
          setTrendPercentage(0);
        }
      }
    };
    
    // Add the current data point immediately
    addDataPoint();
    
    // Set interval to add data every 10 seconds
    const intervalId = setInterval(addDataPoint, 10000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [currentMoisture, chartData.length]);

  // Get trend icon and color
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ChevronUp className="h-4 w-4" />;
      case "down":
        return <ChevronDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendText = () => {
    if (trend === "stable") return "Stabil";
    return `${trend === "up" ? "Naik" : "Turun"} ${trendPercentage}%`;
  };

  const getTrendClass = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "down":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800";
    }
  };

  // Get time range for display
  const getTimeRange = () => {
    if (chartData.length < 2) return "Data terkini";
    
    const firstTime = chartData[0]?.time || '';
    const lastTime = chartData[chartData.length - 1]?.time || '';
    
    return `${firstTime} - ${lastTime} WIB`;
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-5">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Rentang waktu pengukuran
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-300">
            {getTimeRange()}
          </div>
        </div>
        
        <div className="flex items-center mt-2 sm:mt-0">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getTrendClass()}`}>
            {getTrendIcon()}
            <span className="font-medium">{getTrendText()}</span>
          </div>
          <div className="ml-3 px-3 py-1 rounded-full text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            5 menit terakhir
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" className="dark:opacity-30" />
              <XAxis 
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
                minTickGap={20}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <YAxis
                domain={[0, 100]}
                tickCount={5}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="moisture"
                stroke="#3b82f6"
                fill="url(#moistureGradient)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5, stroke: "#1e40af", strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <span className="font-medium">Nilai saat ini: {currentMoisture}%</span>
        </div>
      </div>
    </>
  );
} 