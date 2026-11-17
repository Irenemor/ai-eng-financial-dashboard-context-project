import { useId } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { IncomeOutcomeChartLoading } from '@/components/dashboard/chart-loading'
import { ChartDataTable } from '@/components/dashboard/chart-data-table'
import { type MonthlyDataPoint } from '@/lib/financial-types'
import { formatCurrency } from '@/lib/financial-utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface IncomeOutcomeChartProps {
  data: MonthlyDataPoint[]
  loading?: boolean
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {active && payload?.length ? (
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg text-sm">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 py-0.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-medium text-foreground ml-auto pl-4">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function IncomeOutcomeChart({ data, loading }: IncomeOutcomeChartProps) {
  const titleId = useId()
  const instructionsId = useId()

  if (loading) {
    return <IncomeOutcomeChartLoading />
  }

  const hasData = data.length > 0

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle id={titleId} className="text-base font-semibold">Income vs. Outcome</CardTitle>
        <CardDescription>Monthly revenue and expenditure evolution</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
            No data available to display
          </div>
        ) : (
          <>
            <p id={instructionsId} className="sr-only">Use the left and right arrow keys to explore monthly data, or open the data table below.</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} aria-labelledby={titleId} aria-describedby={instructionsId} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground capitalize">
                      {value === 'outcome' ? 'outcome (dashed)' : 'income (solid)'}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="income"
                  stroke="var(--chart-income)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--chart-income)', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="outcome"
                  name="outcome"
                  stroke="var(--chart-outcome)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: 'var(--chart-outcome)', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <ChartDataTable data={data} type="income-outcome" />
          </>
        )}
      </CardContent>
    </Card>
  )
}
