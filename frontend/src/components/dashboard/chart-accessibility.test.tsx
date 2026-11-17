import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ChartDataTable } from './chart-data-table'
import { ProfitPercentChart } from './profit-percent-chart'
import { type MonthlyDataPoint } from '@/lib/financial-types'

const data: MonthlyDataPoint[] = [
  { month: 'Jan 2025', income: 1000, outcome: 250, profitPercent: 75 },
  { month: 'Feb 2025', income: 100, outcome: 100, profitPercent: 0 },
]

describe('chart data alternatives', () => {
  it('presents the monthly income and outcome values in a named table', () => {
    const html = renderToStaticMarkup(<ChartDataTable data={data} type="income-outcome" />)

    expect(html).toContain('Income and outcome by month')
    expect(html).toMatch(/<th scope="row"[^>]*>Jan 2025<\/th>/)
    expect(html).toContain('$1,000')
    expect(html).toContain('$250')
  })

  it('includes zero margins instead of treating them as missing data', () => {
    const html = renderToStaticMarkup(<ProfitPercentChart data={[data[1]]} />)

    expect(html).toContain('Profit margin by month')
    expect(html).toContain('0.0%')
    expect(html).not.toContain('No data available to display')
  })

  it('shows the empty state when there are no monthly values', () => {
    const html = renderToStaticMarkup(<ProfitPercentChart data={[]} />)

    expect(html).toContain('No data available to display')
    expect(html).not.toContain('<table')
  })
})
