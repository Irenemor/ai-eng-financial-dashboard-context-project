// @vitest-environment jsdom

import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ChartErrorBoundary } from "./components/dashboard/chart-error-boundary";
import type { FinancialDataResult } from "./lib/financial-api";
import type { FinancialMovement } from "./lib/financial-types";

vi.mock("./components/dashboard/income-outcome-chart", () => ({
  IncomeOutcomeChart: () => null,
}));
vi.mock("./components/dashboard/profit-percent-chart", () => ({
  ProfitPercentChart: () => null,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("dashboard financial data", () => {
  it("transitions from loading to the period and KPIs derived from the data", async () => {
    let resolveData!: (result: FinancialDataResult) => void;
    const financialData = new Promise<FinancialDataResult>((resolve) => {
      resolveData = resolve;
    });
    const movements: FinancialMovement[] = [
      { create_date: "2026-01-08", amount: 300, operation_type: "income", category: "sales", business_type: "B2C" },
      { create_date: "2025-12-05", amount: 200, operation_type: "outcome", category: "operational", business_type: "B2B" },
      { create_date: "2025-12-03", amount: 1000, operation_type: "income", category: "sales", business_type: "B2B" },
    ];

    render(<App financialData={financialData} />);
    expect(screen.getByText("Loading...")).toBeTruthy();

    await act(async () => {
      resolveData({ ok: true, movements });
      await financialData;
    });

    expect(screen.getByText("Dec 2025 - Jan 2026")).toBeTruthy();
    const kpis = within(screen.getByRole("region", { name: "Key performance indicators" }));
    expect(kpis.getByText("$1,300")).toBeTruthy();
    expect(kpis.getByText("$200")).toBeTruthy();
    expect(kpis.getByText("$1,100")).toBeTruthy();
    expect(kpis.getByText("84.6%")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an empty period and zero metrics for an empty response", async () => {
    render(<App financialData={Promise.resolve({ ok: true, movements: [] })} />);

    expect(await screen.findByText("No data available")).toBeTruthy();
    const kpis = within(screen.getByRole("region", { name: "Key performance indicators" }));
    expect(kpis.getAllByText("$0")).toHaveLength(3);
    expect(kpis.getByText("0.0%")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("reports a failed response without displaying financial values", async () => {
    const error = new Error("API unavailable");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App financialData={Promise.resolve({ ok: false, error })} />);

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudo cargar");
    expect(screen.getByText("Period unavailable")).toBeTruthy();
    const kpis = within(screen.getByRole("region", { name: "Key performance indicators" }));
    expect(kpis.getAllByText("—")).toHaveLength(4);
    expect(log).toHaveBeenCalledWith("Failed to load financial data:", error);
  });
});

describe("chart error isolation", () => {
  it("reports a failing chart while leaving the other chart visible", () => {
    const error = new Error("Chart failed");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    function BrokenChart(): never {
      throw error;
    }

    render(
      <>
        <ChartErrorBoundary title="Income vs. Outcome"><BrokenChart /></ChartErrorBoundary>
        <ChartErrorBoundary title="Profit Margin %"><p>Other chart remains available</p></ChartErrorBoundary>
      </>,
    );

    expect(screen.getByRole("alert").textContent).toContain("Unable to load this chart");
    expect(screen.getByText("Other chart remains available")).toBeTruthy();
    expect(log).toHaveBeenCalledWith(
      "Failed to load or render Income vs. Outcome:",
      error,
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });
});
