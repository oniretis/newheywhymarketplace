import { createFileRoute } from "@tanstack/react-router";
import { Building2, DollarSign, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardChart from "@/components/charts/admin-dashboard-chart";

export const Route = createFileRoute("/(admin)/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      return result.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Platform-wide overview and statistics
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Platform-wide overview and statistics
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              Failed to load dashboard data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, recentActivity, monthlyStats } = dashboardData;

  const statsData = [
    {
      title: "Total Tenants",
      value: stats.totalTenants.toLocaleString(),
      change: `+${stats.newTenantsThisMonth} new this month`,
      icon: Building2,
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersThisMonth} from last month`,
      icon: Users,
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      change: `+${stats.newProductsThisMonth} from last month`,
      icon: ShoppingBag,
    },
    {
      title: "Platform Revenue",
      value: `$${parseFloat(stats.platformRevenue).toLocaleString()}`,
      change: "From active shops",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Platform-wide overview and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stat.value}</div>
                <p className="text-muted-foreground text-xs">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalShops}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Shops
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.activeShops}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Shops
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {stats.totalShops > 0
                      ? Math.round((stats.activeShops / stats.totalShops) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Activation Rate
                  </div>
                </div>
              </div>
              <AdminDashboardChart data={monthlyStats} />
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Recent Vendors</h4>
                <div className="space-y-2">
                  {recentActivity.recentVendors
                    .slice(0, 3)
                    .map((vendor: any) => (
                      <div
                        key={vendor.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <div className="font-medium">
                            {vendor.businessName || "Unnamed Vendor"}
                          </div>
                          <div className="text-muted-foreground">
                            {vendor.userName}
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs ${
                            vendor.status === "active"
                              ? "bg-green-100 text-green-800"
                              : vendor.status === "pending_approval"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vendor.status?.replace("_", " ") || "Unknown"}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Recent Shops</h4>
                <div className="space-y-2">
                  {recentActivity.recentShops.slice(0, 2).map((shop: any) => (
                    <div
                      key={shop.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="font-medium">{shop.name}</div>
                        <div className="text-muted-foreground">
                          {shop.vendorName}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          shop.status === "active"
                            ? "bg-green-100 text-green-800"
                            : shop.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {shop.status || "Unknown"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
