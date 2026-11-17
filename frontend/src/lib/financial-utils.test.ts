import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
  formatMonthlyPeriod,
  formatPercent,
} from "./financial-utils";
import type { FinancialMovement } from "./financial-types";

const sampleMovements: FinancialMovement[] = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 250,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
  {
    create_date: "2024-02-01",
    amount: 500,
    operation_type: "income",
    category: "sales",
    business_type: "B2C",
  },
];

describe("computeKPIs", () => {
  it("calculates totals and profit values", () => {
    const metrics = computeKPIs(sampleMovements);

    expect(metrics).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
    });
  });

  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
});

describe("computeMonthlyData", () => {
  it("returns chronological year-month points with aggregated totals", () => {
    const unsortedCrossYearMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-08",
        amount: 300,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2025-12-05",
        amount: 200,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-03",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];
    const monthlyData = computeMonthlyData(unsortedCrossYearMovements);

    expect(monthlyData).toHaveLength(2);
    expect(monthlyData[0]).toEqual({
      month: "Dec 2025",
      income: 1000,
      outcome: 200,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profitPercent: 100,
    });
  });

  it("keeps ISO dates on the first day of a month in their calendar month", () => {
    const movements: FinancialMovement[] = [
      { ...sampleMovements[0], create_date: "2026-01-01" },
      { ...sampleMovements[0], create_date: "2025-12-01" },
    ];

    expect(computeMonthlyData(movements).map((point) => point.month)).toEqual([
      "Dec 2025",
      "Jan 2026",
    ]);
  });
});

describe("formatMonthlyPeriod", () => {
  it("uses the first and last months after chronological aggregation", () => {
    const movements: FinancialMovement[] = [
      { ...sampleMovements[0], create_date: "2026-01-08" },
      { ...sampleMovements[0], create_date: "2025-12-03" },
    ];

    expect(formatMonthlyPeriod(computeMonthlyData(movements))).toBe("Dec 2025 - Jan 2026");
  });

  it("shows a single month and returns no period for an empty dataset", () => {
    expect(formatMonthlyPeriod(computeMonthlyData([sampleMovements[0]]))).toBe("Jan 2024");
    expect(formatMonthlyPeriod(computeMonthlyData([]))).toBeNull();
  });
});

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});
