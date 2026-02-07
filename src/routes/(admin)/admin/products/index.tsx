import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import AdminProductsTemplate from "@/components/templates/admin/admin-products-template";
import { getAdminProductsTest } from "@/lib/functions/admin/products-test";

export const Route = createFileRoute("/(admin)/admin/products/")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => getAdminProductsTest(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">
          Error loading products: {error.message}
        </div>
      </div>
    );
  }

  const products = productsData?.data || [];

  return <AdminProductsTemplate products={products} />;
}
