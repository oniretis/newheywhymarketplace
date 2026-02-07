import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, DollarSign, Package, ShoppingBag } from "lucide-react";
import { VendorDashboardSkeleton } from "@/components/base/vendors/skeleton/vendor-dashboard-skeleton";
import VendorDashboardTemplate from "@/components/templates/vendor/vendor-dashboard-template";
import { getDashboardStats } from "@/lib/functions/vendor/dashboard";

export const Route = createFileRoute("/(vendor)/_layout/dashboard")({
  component: VendorDashboardPage,
  loader: async () => {
    const stats = await getDashboardStats();
    return { stats };
  },
  pendingComponent: VendorDashboardSkeleton,
});

function VendorDashboardPage() {
  const { stats } = Route.useLoaderData();

  const formattedStats = [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalRevenue),
      change: `+${stats.revenueChange}% from last month`,
      icon: DollarSign,
    },
    {
      title: "Total Shops",
      value: stats.totalShops.toString(),
      change:
        stats.shopsChange > 0
          ? `+${stats.shopsChange} new shop this month`
          : "No new shops this month",
      icon: ShoppingBag,
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      change: `+${stats.productsChange} new products`,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: `+${stats.ordersChange} from last month`,
      icon: BarChart3,
    },
  ];

  return <VendorDashboardTemplate stats={formattedStats} />;
}
