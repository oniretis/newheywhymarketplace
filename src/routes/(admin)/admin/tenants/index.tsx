import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import AdminTenantsTemplate from "@/components/templates/admin/tenants/admin-tenants-template";
import { getAdminShops } from "@/lib/functions/admin/shops";
import type { AdminTenant } from "@/types/tenant";
import type { NormalizedShop } from "@/lib/functions/admin/shops";

// Transform NormalizedShop to AdminTenant format
function transformToAdminTenant(shop: NormalizedShop): AdminTenant {
  return {
    id: shop.vendorId, // Use vendorId for status updates
    name: shop.name,
    slug: shop.slug,
    ownerName: shop.ownerName || "Unknown",
    ownerEmail: shop.ownerEmail || "unknown@example.com",
    plan: "free", // TODO: Add plan field to vendors schema
    status:
      (shop.vendorStatus as
        | "active"
        | "suspended"
        | "pending"
        | "pending_approval"
        | "rejected") || "pending_approval",
    joinedDate: shop.createdAt,
    productCount: shop.totalProducts,
    orderCount: shop.totalOrders,
  };
}

export const Route = createFileRoute("/(admin)/admin/tenants/")({
  component: AdminTenantsPage,
});

function AdminTenantsPage() {
  const {
    data: shopsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-shops", { limit: 100, offset: 0 }],
    queryFn: () => getAdminShops({ data: { limit: 100, offset: 0 } }),
  });

  if (isLoading) {
    return <div>Loading tenants...</div>;
  }

  if (error) {
    return <div>Error loading tenants: {error.message}</div>;
  }

  const tenants: AdminTenant[] =
    shopsData?.data.map(transformToAdminTenant) || [];

  return <AdminTenantsTemplate tenants={tenants} />;
}
