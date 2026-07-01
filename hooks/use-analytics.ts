import { useQuery } from "@tanstack/react-query";
import * as analyticsApi from "@/lib/api/analytics";
import type { AnalyticsQuery } from "@/lib/types/analytics";

const keys = {
  all: ["analytics"] as const,
  range: (query: AnalyticsQuery) => [...keys.all, query] as const,
};

// Fetches the whole range once — facility totals/trends plus every
// department's breakdown — so switching the department selector is instant
// client-side selection, not a second request.
export function useAnalytics(query: AnalyticsQuery) {
  return useQuery({
    queryKey: keys.range(query),
    queryFn: () => analyticsApi.fetchAnalytics(query),
    placeholderData: (prev) => prev,
  });
}
