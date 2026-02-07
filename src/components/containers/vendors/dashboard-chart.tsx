import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRevenueData } from "@/lib/functions/vendor/dashboard";

interface DashboardChartProps {
  className?: string;
}

export default function DashboardChart({ className }: DashboardChartProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: () => getRevenueData(30),
  });

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const minRevenue = Math.min(...data.map((d) => d.revenue));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-75">
          <div className="flex items-end justify-between h-full gap-1">
            {data.map((day, index) => {
              const height =
                maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              const isToday = index === data.length - 1;

              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center flex-1 min-w-0"
                  title={`${day.date}: $${day.revenue.toFixed(2)}`}
                >
                  <div
                    className={`w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600 ${
                      isToday ? "bg-blue-600" : ""
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                    {index % 5 === 0 || isToday
                      ? new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>${minRevenue.toFixed(0)}</span>
            <span>Revenue (Last 30 days)</span>
            <span>${maxRevenue.toFixed(0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
