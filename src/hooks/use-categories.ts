import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  level: number;
  productCount: number;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  parentId: string | null;
}

interface UseCategoriesOptions {
  level?: number;
  parentId?: string;
  featured?: boolean;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const { level, parentId, featured } = options;

  const queryParams = new URLSearchParams();
  if (level !== undefined) queryParams.append("level", level.toString());
  if (parentId) queryParams.append("parentId", parentId);
  if (featured) queryParams.append("featured", "true");

  return useQuery<Category[]>({
    queryKey: ["categories", options],
    queryFn: async () => {
      const response = await fetch(`/api/categories?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useMainCategories() {
  return useCategories({ level: 0, featured: true });
}

export function useFeaturedCategories() {
  return useCategories({ featured: true });
}
