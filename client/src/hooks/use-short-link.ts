import { useQuery } from "@tanstack/react-query";

export function useShortLink(articleId: string) {
  const { data, isLoading } = useQuery<{ code: string; url: string }>({
    queryKey: [`/api/articles/${articleId}/short-link`],
    staleTime: Infinity, // Short links don't change
    retry: 2, // Retry if fails
  });

  // Return null while loading to prevent showing UUID fallback too early
  if (isLoading) return null;
  
  return data?.code || null;
}
