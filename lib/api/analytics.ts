// Swap point. USE_MOCK true → resolves from lib/mock/analytics.
// Flip the flag and the same function hits Spring Boot. Hooks/components
// don't move — the backend is expected to do the same {from,to} aggregation
// server-side and return the same FacilityAnalytics shape.

import { api } from "@/lib/axios"; // ⚠️ match your lib/api/queue.ts import exactly
import * as mock from "@/lib/mock/analytics";
import type { AnalyticsQuery, FacilityAnalytics } from "@/lib/types/analytics";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchAnalytics(
  query: AnalyticsQuery
): Promise<FacilityAnalytics> {
  if (USE_MOCK) return mock.queryAnalytics(query);
  const { data } = await api.get<FacilityAnalytics>("/analytics", {
    params: query,
  });
  return data;
}
