import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChartLoading, ProfitPercentChartLoading } from "@/components/dashboard/chart-loading";
import { ChartErrorBoundary } from "@/components/dashboard/chart-error-boundary";
import {
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData, formatMonthlyPeriod } from "@/lib/financial-utils";
import { type FinancialDataResult } from "@/lib/financial-api";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);
const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

interface AppProps {
  financialData: Promise<FinancialDataResult>;
}

function App({ financialData }: AppProps) {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    financialData
      .then((result) => {
        if (!result.ok) throw result.error;
        setMetrics(computeKPIs(result.movements));
        setMonthlyData(computeMonthlyData(result.movements));
      })
      .catch((error: unknown) => {
        console.error("Failed to load financial data:", error);
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [financialData]);

  const period = loading
    ? "Loading..."
    : error
      ? "Period unavailable"
      : formatMonthlyPeriod(monthlyData) ?? "No data available";

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} />

          {error ? (
            <div role="alert" lang="es" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <ChartErrorBoundary title="Income vs. Outcome">
              <Suspense fallback={<IncomeOutcomeChartLoading />}>
                <IncomeOutcomeChart data={monthlyData} loading={loading} />
              </Suspense>
            </ChartErrorBoundary>
            <ChartErrorBoundary title="Profit Margin %">
              <Suspense fallback={<ProfitPercentChartLoading />}>
                <ProfitPercentChart data={monthlyData} loading={loading} />
              </Suspense>
            </ChartErrorBoundary>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
