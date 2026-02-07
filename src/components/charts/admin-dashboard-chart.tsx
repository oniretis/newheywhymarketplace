import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartProps {
  data: {
    monthlyVendors: Array<{ month: string; count: number }>;
    monthlyUsers: Array<{ month: string; count: number }>;
    monthlyProducts: Array<{ month: string; count: number }>;
  };
}

export default function AdminDashboardChart({ data }: DashboardChartProps) {
  // Combine all monthly data into a single format for the chart
  const chartData = data.monthlyVendors.map((vendor) => {
    const userMonth = data.monthlyUsers.find((u) => u.month === vendor.month);
    const productMonth = data.monthlyProducts.find(
      (p) => p.month === vendor.month
    );

    return {
      month: new Date(vendor.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      vendors: vendor.count,
      users: userMonth?.count || 0,
      products: productMonth?.count || 0,
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="vendors"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
            name="Vendors"
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
            activeDot={{ r: 6 }}
            name="Users"
          />
          <Line
            type="monotone"
            dataKey="products"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
            activeDot={{ r: 6 }}
            name="Products"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
