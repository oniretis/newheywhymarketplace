import { useProducts } from "@/hooks/use-products";
import ProductGrid from "@/components/containers/store/product-list/product-grid";
import ProductGridSkeleton from "@/components/base/products/product-grid-skeleton";

export default function HomepageContainer() {
  const { data: productsData, isLoading, error } = useProducts({ limit: 12 });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load products</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <ProductGrid
          products={productsData?.products || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
