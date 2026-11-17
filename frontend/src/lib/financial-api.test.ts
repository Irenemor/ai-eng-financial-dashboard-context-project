import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchFinancialData } from "./financial-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFinancialData", () => {
  it("returns the movements from a successful response", async () => {
    const movements = [{
      create_date: "2024-01-10",
      amount: 100,
      operation_type: "income",
      category: "sales",
      business_type: "B2B",
    }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => movements,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchFinancialData()).resolves.toEqual({ ok: true, movements });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/metrics$/);
  });

  it("preserves HTTP failures for the interface to report", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const result = await fetchFinancialData();
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected an HTTP failure");
    expect(result.error).toEqual(new Error("Failed to fetch financial data: 503"));
  });

  it("preserves network failures for the interface to report", async () => {
    const error = new Error("Network unavailable");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    await expect(fetchFinancialData()).resolves.toEqual({ ok: false, error });
  });
});
