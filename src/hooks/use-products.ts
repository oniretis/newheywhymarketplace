import { useQuery } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sellingPrice: number;
  regularPrice: number | null;
  stock: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    page = 1,
    limit = 12,
    category,
    featured,
    search,
    sortBy = "createdAt",
    sortDirection = "desc",
  } = options;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortDirection,
  });

  if (category) queryParams.append("category", category);
  if (featured) queryParams.append("featured", "true");
  if (search) queryParams.append("search", search);

  return useQuery<ProductsResponse>({
    queryKey: ["products", options],
    queryFn: async () => {
      const response = await fetch(`/api/products?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFeaturedProducts(limit = 8) {
  return useProducts({
    featured: true,
    limit,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
}
