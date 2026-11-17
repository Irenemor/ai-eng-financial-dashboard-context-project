import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function ChartLoading({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
        <Skeleton className="mt-4 h-5 w-48 max-w-full" />
      </CardContent>
    </Card>
  )
}

export function IncomeOutcomeChartLoading() {
  return <ChartLoading title="Income vs. Outcome" description="Monthly revenue and expenditure evolution" />
}

export function ProfitPercentChartLoading() {
  return <ChartLoading title="Profit Margin %" description="Monthly profit as a percentage of total income" />
}
