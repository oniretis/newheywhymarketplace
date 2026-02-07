import { PackageOpen } from "lucide-react";
import { useState } from "react";
import NotFound from "@/components/base/empty/notfound";
import ProductCard from "@/components/base/products/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";

interface StoreProductsProps {
  storeName: string;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function StoreProducts({ storeName }: StoreProductsProps) {
  const [sortBy, setSortBy] = useState("newest");
  const { data: productsData, isLoading } = useProducts({ limit: 100 });

  // Filter products by store name
  // Note: API products don't have store field, so this will show all products for now
  // In a real implementation, you'd have a storeId field or filter by vendor
  const storeProducts = productsData?.products || [];

  // Sort products
  const sortedProducts = [...storeProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.sellingPrice - b.sellingPrice;
      case "price-high":
        return b.sellingPrice - a.sellingPrice;
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      case "popular":
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex @2xl:flex-row flex-col items-start @2xl:items-center justify-between gap-4">
          <div className="@2xl:items-center">
            <h2 className="font-semibold text-xl">Products</h2>
            <p className="text-muted-foreground text-sm">Loading products...</p>
          </div>
        </div>
        <div className="grid @2xl:grid-cols-2 @5xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (storeProducts.length === 0) {
    return (
      <NotFound
        title="No Products Yet"
        description="This store hasn't listed any products yet. Check back soon!"
        icon={<PackageOpen className="size-12 text-muted-foreground" />}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count and sort */}
      <div className="flex @2xl:flex-row flex-col items-start @2xl:items-center justify-between gap-4">
        <div className="@2xl:items-center">
          <h2 className="font-semibold text-xl">
            Products ({storeProducts.length})
          </h2>
          <p className="text-muted-foreground text-sm">
            Browse all products from {storeName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid @2xl:grid-cols-2 @5xl:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
