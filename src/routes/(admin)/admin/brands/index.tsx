import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminBrandsTemplate from "@/components/templates/admin/admin-brands-template";
import {
  getAdminBrands,
  createAdminBrand,
  deleteAdminBrand,
} from "@/lib/functions/admin/brands";
import type { BrandFormValues, BrandItem } from "@/types/brands";

export const Route = createFileRoute("/(admin)/admin/brands/")({
  component: AdminBrandsPage,
});

function AdminBrandsPage() {
  const queryClient = useQueryClient();

  // Fetch real brands data
  const {
    data: brandsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => getAdminBrands(),
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: createAdminBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
    },
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: deleteAdminBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
    },
  });

  const handleAddBrand = (newBrandData: BrandFormValues) => {
    // For admin, we need to specify a shopId - using a default or getting from context
    const brandDataWithShop = {
      ...newBrandData,
      shopId: "1", // This could be dynamic based on admin context
    };
    createBrandMutation.mutate(brandDataWithShop);
  };

  const handleDeleteBrand = (brand: BrandItem) => {
    deleteBrandMutation.mutate({ id: brand.id });
  };

  if (isLoading) {
    return <div>Loading brands...</div>;
  }

  if (error) {
    return <div>Error loading brands: {error.message}</div>;
  }

  return (
    <AdminBrandsTemplate
      brands={brandsData?.data || []}
      onAddBrand={handleAddBrand}
      onDeleteBrand={handleDeleteBrand}
    />
  );
}
