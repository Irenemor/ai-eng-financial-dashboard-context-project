import { type MonthlyDataPoint } from '@/lib/financial-types'
import { formatCurrency, formatPercent } from '@/lib/financial-utils'

interface ChartDataTableProps {
  data: MonthlyDataPoint[]
  type: 'income-outcome' | 'profit-percent'
}

export function ChartDataTable({ data, type }: ChartDataTableProps) {
  const isIncomeOutcome = type === 'income-outcome'
  const title = isIncomeOutcome ? 'Income and outcome' : 'Profit margin'

  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer">View {title.toLowerCase()} data</summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left">
          <caption className="sr-only">{title} by month</caption>
          <thead>
            <tr>
              <th scope="col" className="py-1 pr-4">Month</th>
              {isIncomeOutcome ? (
                <>
                  <th scope="col" className="py-1 pr-4">Income</th>
                  <th scope="col" className="py-1">Outcome</th>
                </>
              ) : (
                <th scope="col" className="py-1">Profit margin</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.month}>
                <th scope="row" className="py-1 pr-4 font-normal">{point.month}</th>
                {isIncomeOutcome ? (
                  <>
                    <td className="py-1 pr-4">{formatCurrency(point.income)}</td>
                    <td className="py-1">{formatCurrency(point.outcome)}</td>
                  </>
                ) : (
                  <td className="py-1">{formatPercent(point.profitPercent)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
