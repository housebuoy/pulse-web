"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // optional

export function Providers({ children }: { children: ReactNode }) {
  // useState (not a module-level const) so the client is created once per
  // browser session and never shared across requests on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Fail fast on 4xx — retrying a 404 just saturates the browser's
            // connection pool and queues the real queries behind the storm.
            // Only network failures and 5xx get a couple of retries.
            retry: (failureCount, error) => {
              const status = (error as { response?: { status?: number } })
                ?.response?.status;
              if (status !== undefined && status < 500) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}