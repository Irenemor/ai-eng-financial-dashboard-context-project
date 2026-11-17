import { type FinancialMovement } from "./financial-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type FinancialDataResult =
  | { ok: true; movements: FinancialMovement[] }
  | { ok: false; error: unknown };

export async function fetchFinancialData(): Promise<FinancialDataResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch financial data: ${response.status}`);
    }
    return { ok: true, movements: await response.json() };
  } catch (error: unknown) {
    return { ok: false, error };
  }
}
