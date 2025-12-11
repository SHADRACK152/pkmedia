import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    } catch (error) {
      // If we can't read the response text, throw a generic error
      throw new Error(`${res.status}: ${res.statusText || 'Request failed'}`);
    }
  }

  // Even if res.ok, check if we got HTML instead of expected content
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    const text = await res.text();
    throw new Error(`Received HTML response for API request. This might be due to a browser extension or routing issue. Content starts with: ${text.substring(0, 100)}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    // Handle network errors gracefully
    if (error.message?.includes('ECONNRESET') || error.name === 'NetworkError') {
      console.error('Network connection error:', error);
      throw new Error('Network connection lost. Please try again.');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or authentication errors
        if (error?.message?.includes('404') || error?.message?.includes('401')) {
          return false;
        }
        // Retry network errors up to 2 times
        if (error?.message?.includes('Network') || error?.message?.includes('ECONNRESET')) {
          return failureCount < 2;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: false,
    },
  },
});
