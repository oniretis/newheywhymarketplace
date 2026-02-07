import { createFileRoute } from "@tanstack/react-router";
import {
  getDashboardStats,
  getRecentActivity,
  getMonthlyStats,
} from "@/lib/functions/admin/dashboard";

export const Route = createFileRoute("/api/admin/dashboard")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const [stats, recentActivity, monthlyStats] = await Promise.all([
            getDashboardStats(),
            getRecentActivity(),
            getMonthlyStats(),
          ]);

          return Response.json({
            success: true,
            data: {
              stats,
              recentActivity,
              monthlyStats,
            },
          });
        } catch (error) {
          console.error("Dashboard API error:", error);
          return Response.json(
            {
              success: false,
              error: "Failed to fetch dashboard data",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
