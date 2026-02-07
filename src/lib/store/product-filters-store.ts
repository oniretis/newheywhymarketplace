import { useMemo, useState } from "react";
import type { SortOption } from "@/components/base/products/sort-dropdown";
import { useProducts } from "@/hooks/use-products";

export interface FilterState {
  search: string;
  sort: SortOption;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  rating: number | null;
  availability: string[];
  conditions: string[];
}

const initialState: FilterState = {
  search: "",
  sort: "relevance",
  categories: [],
  brands: [],
  priceRange: [0, 1000],
  colors: [],
  sizes: [],
  rating: null,
  availability: [],
  conditions: [],
};

export const useProductFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialState);
  const { data: productsData, isLoading: apiLoading } = useProducts({
    limit: 100,
  });

  const [isPending, setIsPending] = useState(false);

  const updateFilter = (
    key: keyof FilterState,
    value: string | number | string[] | [number, number] | null
  ) => {
    setIsPending(true);
    setFilters((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => setIsPending(false), 300);
  };

  const filteredProducts = useMemo(() => {
    let result = [...(productsData?.products || [])];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand?.name.toLowerCase().includes(query) ||
          false
      );
    }

    // Categories
    if (filters.categories.length > 0) {
      result = result.filter((p) =>
        filters.categories.includes(p.category?.name || "")
      );
    }

    // Brands
    if (filters.brands.length > 0) {
      result = result.filter((p) =>
        filters.brands.includes(p.brand?.name || "")
      );
    }

    // Price
    result = result.filter(
      (p) =>
        p.sellingPrice >= filters.priceRange[0] &&
        p.sellingPrice <= filters.priceRange[1]
    );

    // Rating
    if (filters.rating) {
      result = result.filter((p) => (p.averageRating || 0) >= filters.rating!);
    }

    // Availability
    if (filters.availability.length > 0) {
      result = result.filter((p) => {
        if (filters.availability.includes("In Stock") && p.stock > 0)
          return true;
        // Add other availability checks here if data becomes available
        return false;
      });
    }

    // Sort
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "rating":
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        // Relevance is default, no specific sort (or could be by ID/name)
        break;
    }

    return result;
  }, [filters, productsData]);

  // Derived state for active filters chips
  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.search)
      active.push({
        id: "search",
        label: `Search: ${filters.search}`,
        type: "search",
      });
    filters.categories.forEach((c) => {
      active.push({ id: c, label: c, type: "category" });
    });
    filters.brands.forEach((b) => {
      active.push({ id: b, label: b, type: "brand" });
    });
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      active.push({
        id: "price",
        label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
        type: "price",
      });
    }
    filters.colors.forEach((c) => {
      active.push({ id: c, label: c, type: "color" });
    });
    filters.sizes.forEach((s) => {
      active.push({ id: s, label: `Size: ${s}`, type: "size" });
    });
    if (filters.rating)
      active.push({
        id: "rating",
        label: `${filters.rating}+ Stars`,
        type: "rating",
      });
    filters.availability.forEach((a) => {
      active.push({ id: a, label: a, type: "availability" });
    });
    filters.conditions.forEach((c) => {
      active.push({ id: c, label: c, type: "condition" });
    });

    return active;
  }, [filters]);

  const removeFilter = (id: string, type: string) => {
    switch (type) {
      case "search":
        updateFilter("search", "");
        break;
      case "category":
        updateFilter(
          "categories",
          filters.categories.filter((c) => c !== id)
        );
        break;
      case "brand":
        updateFilter(
          "brands",
          filters.brands.filter((b) => b !== id)
        );
        break;
      case "price":
        updateFilter("priceRange", [0, 1000]);
        break;
      case "color":
        updateFilter(
          "colors",
          filters.colors.filter((c) => c !== id)
        );
        break;
      case "size":
        updateFilter(
          "sizes",
          filters.sizes.filter((s) => s !== id)
        );
        break;
      case "rating":
        updateFilter("rating", null);
        break;
      case "availability":
        updateFilter(
          "availability",
          filters.availability.filter((a) => a !== id)
        );
        break;
      case "condition":
        updateFilter(
          "conditions",
          filters.conditions.filter((c) => c !== id)
        );
        break;
    }
  };

  const clearAllFilters = () => {
    setFilters(initialState);
  };

  return {
    filters,
    updateFilter,
    products: filteredProducts,
    totalProducts: filteredProducts.length,
    isPending: isPending || apiLoading,
    activeFilters,
    removeFilter,
    clearAllFilters,
  };
};
