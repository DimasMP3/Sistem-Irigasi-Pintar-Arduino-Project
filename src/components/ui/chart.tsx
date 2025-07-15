import * as React from "react"
import { TooltipProps } from "recharts"
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent"

import { cn } from "@/lib/utils"

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

type ChartContainerProps = {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

export function ChartContainer({
  config,
  className,
  children,
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("h-[240px] w-full", className)}>
        {children}
      </div>
      <style jsx global>{`
        :root {
          ${Object.entries(config).map(
            ([key, value]) => `
            --chart-${key}: ${value.color};
            --color-${key}: ${value.color};
          `
          )}
        }
      `}</style>
    </ChartContext.Provider>
  )
}

function useChartContext() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider")
  }

  return context
}

interface ChartTooltipContentProps {

  className?: string
  children?: React.ReactNode
  active?: boolean
  payload?: any
  indicator?: "line" | "dot"
  hideLabel?: boolean
}

export function ChartTooltipContent({

  className,
  children,
  active,
  payload,
  indicator = "line",
  hideLabel = false,
  ...props
}: ChartTooltipContentProps) {
  const { config } = useChartContext()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950",
        className
      )}
      {...props}
    >
      {children || (
        <div className="grid gap-2">
          {payload.map((data: any, i: any) => {
            const name = data.dataKey as string
            const color = config[name]?.color ?? "var(--chart-1)"
            const value = data.value
            const label = hideLabel ? "" : config[name]?.label ?? name

            return (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={cn("mr-1", {
                    "h-1 w-4 rounded-full": indicator === "line",
                    "h-2 w-2 rounded-full": indicator === "dot",
                  })}
                  style={{ background: color }}
                />
                {label ? (
                  <span className="text-muted-foreground text-xs font-medium">
                    {label}:{" "}
                    <span className="text-foreground font-semibold">
                      {value}
                    </span>
                  </span>
                ) : (
                  <span className="text-foreground text-xs font-semibold">
                    {value}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ChartTooltip(props: TooltipProps<ValueType, NameType>) {
  return <ChartTooltipContent {...props} />
} 