import { getVendorShops } from "@/lib/functions/shops";
import { getProducts } from "@/lib/functions/vendor/products";

export interface DashboardStats {
  totalRevenue: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  revenueChange: number;
  shopsChange: number;
  productsChange: number;
  ordersChange: number;
}

export interface RecentSale {
  id: string;
  productName: string;
  customerName: string;
  amount: number;
  date: Date;
  status: "completed" | "pending" | "cancelled";
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const shopsResponse = await getVendorShops();
  const shops = shopsResponse.shops || [];

  const totalRevenue = shops.reduce(
    (sum, shop) => sum + (shop.totalRevenue || 0),
    0
  );
  const totalShops = shops.length;
  const totalOrders = shops.reduce(
    (sum, shop) => sum + (shop.totalOrders || 0),
    0
  );

  // Get all products across all shops
  let totalProducts = 0;
  for (const shop of shops) {
    const productsResponse = await getProducts({ data: { shopId: shop.id } });
    totalProducts += productsResponse.data?.length || 0;
  }

  // Mock change percentages - in real app these would be calculated from historical data
  const revenueChange = 20.1;
  const shopsChange = totalShops > 0 ? 1 : 0;
  const productsChange = 19;
  const ordersChange = 201;

  return {
    totalRevenue,
    totalShops,
    totalProducts,
    totalOrders,
    revenueChange,
    shopsChange,
    productsChange,
    ordersChange,
  };
}

export async function getRecentSales(
  limit: number = 10
): Promise<RecentSale[]> {
  // Mock recent sales data - in real app this would fetch from database
  const mockSales: RecentSale[] = [
    {
      id: "1",
      productName: "Premium Wireless Headphones",
      customerName: "John Doe",
      amount: 299.99,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: "2",
      productName: "Smart Watch Pro",
      customerName: "Jane Smith",
      amount: 449.99,
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: "3",
      productName: "Laptop Stand Adjustable",
      customerName: "Mike Johnson",
      amount: 79.99,
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      id: "4",
      productName: "USB-C Hub 7-in-1",
      customerName: "Sarah Williams",
      amount: 59.99,
      date: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: "5",
      productName: "Mechanical Keyboard RGB",
      customerName: "David Brown",
      amount: 189.99,
      date: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: "completed",
    },
  ];

  return mockSales.slice(0, limit);
}

export async function getRevenueData(
  days: number = 30
): Promise<RevenueData[]> {
  // Mock revenue data - in real app this would fetch from database
  const data: RevenueData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate mock revenue with some variation
    const baseRevenue = 1500;
    const variation = Math.random() * 1000 - 500;
    const revenue = Math.max(0, baseRevenue + variation);

    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.round(revenue * 100) / 100,
    });
  }

  return data;
}
