import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRecentSales } from "@/lib/functions/vendor/dashboard";
import { Badge } from "@/components/ui/badge";

interface RecentSalesProps {
  className?: string;
}

export default function RecentSales({ className }: RecentSalesProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["dashboard", "recent-sales"],
    queryFn: () => getRecentSales(10),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="space-y-4">
          {data.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {sale.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sale.customerName}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ${sale.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(sale.date)}
                  </p>
                </div>
                <Badge className={`text-xs ${getStatusColor(sale.status)}`}>
                  {sale.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
