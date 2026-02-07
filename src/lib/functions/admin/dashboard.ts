import { db, shops, vendors, user, products } from "@/lib/db";
import { count, sum, sql } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    // Get total tenants (vendors)
    const totalTenantsResult = await db
      .select({ count: count() })
      .from(vendors);

    // Get total users
    const totalUsersResult = await db.select({ count: count() }).from(user);

    // Get total products
    const totalProductsResult = await db
      .select({ count: count() })
      .from(products);

    // Get total shops
    const totalShopsResult = await db.select({ count: count() }).from(shops);

    // Get active shops
    const activeShopsResult = await db
      .select({ count: count() })
      .from(shops)
      .where(sql`status = 'active'`);

    // Get vendors created this month
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const newTenantsThisMonthResult = await db
      .select({ count: count() })
      .from(vendors)
      .where(sql`created_at >= ${currentMonthStart}`);

    // Get users created this month
    const newUsersThisMonthResult = await db
      .select({ count: count() })
      .from(user)
      .where(sql`created_at >= ${currentMonthStart}`);

    // Get products created this month
    const newProductsThisMonthResult = await db
      .select({ count: count() })
      .from(products)
      .where(sql`created_at >= ${currentMonthStart}`);

    // Calculate platform revenue (sum of commission rates from all vendors)
    // This is a simplified calculation - in reality you'd track actual transactions
    const platformRevenueResult = await db
      .select({
        total: sum(sql`COALESCE(CAST(${shops.monthlyRevenue} AS NUMERIC), 0)`),
      })
      .from(shops)
      .where(sql`status = 'active' AND ${shops.monthlyRevenue} IS NOT NULL`);

    const platformRevenue = platformRevenueResult[0]?.total || 0;

    return {
      totalTenants: totalTenantsResult[0]?.count || 0,
      totalUsers: totalUsersResult[0]?.count || 0,
      totalProducts: totalProductsResult[0]?.count || 0,
      totalShops: totalShopsResult[0]?.count || 0,
      activeShops: activeShopsResult[0]?.count || 0,
      newTenantsThisMonth: newTenantsThisMonthResult[0]?.count || 0,
      newUsersThisMonth: newUsersThisMonthResult[0]?.count || 0,
      newProductsThisMonth: newProductsThisMonthResult[0]?.count || 0,
      platformRevenue: platformRevenue.toString(),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getRecentActivity() {
  try {
    // Get recent vendors
    const recentVendors = await db
      .select({
        id: vendors.id,
        businessName: vendors.businessName,
        status: vendors.status,
        createdAt: vendors.createdAt,
        userName: user.name,
      })
      .from(vendors)
      .leftJoin(user, sql`${vendors.userId} = ${user.id}`)
      .orderBy(sql`${vendors.createdAt} DESC`)
      .limit(5);

    // Get recent shops
    const recentShops = await db
      .select({
        id: shops.id,
        name: shops.name,
        status: shops.status,
        createdAt: shops.createdAt,
        vendorName: vendors.businessName,
      })
      .from(shops)
      .leftJoin(vendors, sql`${shops.vendorId} = ${vendors.id}`)
      .orderBy(sql`${shops.createdAt} DESC`)
      .limit(5);

    // Get recent products
    const recentProducts = await db
      .select({
        id: products.id,
        name: products.name,
        status: products.status,
        createdAt: products.createdAt,
        shopName: shops.name,
      })
      .from(products)
      .leftJoin(shops, sql`${products.shopId} = ${shops.id}`)
      .orderBy(sql`${products.createdAt} DESC`)
      .limit(5);

    return {
      recentVendors,
      recentShops,
      recentProducts,
    };
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
}

export async function getMonthlyStats() {
  try {
    // Get monthly data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyVendors = await db
      .select({
        month: sql`DATE_TRUNC('month', created_at)::date`.as("month"),
        count: count().as("count"),
      })
      .from(vendors)
      .where(sql`created_at >= ${sixMonthsAgo}`)
      .groupBy(sql`DATE_TRUNC('month', created_at)`)
      .orderBy(sql`DATE_TRUNC('month', created_at)`);

    const monthlyUsers = await db
      .select({
        month: sql`DATE_TRUNC('month', created_at)::date`.as("month"),
        count: count().as("count"),
      })
      .from(user)
      .where(sql`created_at >= ${sixMonthsAgo}`)
      .groupBy(sql`DATE_TRUNC('month', created_at)`)
      .orderBy(sql`DATE_TRUNC('month', created_at)`);

    const monthlyProducts = await db
      .select({
        month: sql`DATE_TRUNC('month', created_at)::date`.as("month"),
        count: count().as("count"),
      })
      .from(products)
      .where(sql`created_at >= ${sixMonthsAgo}`)
      .groupBy(sql`DATE_TRUNC('month', created_at)`)
      .orderBy(sql`DATE_TRUNC('month', created_at)`);

    return {
      monthlyVendors,
      monthlyUsers,
      monthlyProducts,
    };
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    throw new Error("Failed to fetch monthly statistics");
  }
}
