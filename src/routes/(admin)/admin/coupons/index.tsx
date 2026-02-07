import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AdminCouponsTemplate from "@/components/templates/admin/admin-coupons-template";
import {
  adminGetAllCoupons,
  adminUpdateCouponStatus,
} from "@/lib/functions/admin/coupons";
import type { Coupon, CouponFormValues } from "@/types/coupon";
import type { CouponListResponse } from "@/types/coupons";

export const Route = createFileRoute("/(admin)/admin/coupons/")({
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: CouponListResponse = await adminGetAllCoupons();
      setCoupons(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch coupons");
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponStatusChange = async (
    couponId: string,
    newStatus: "active" | "expired" | "inactive"
  ) => {
    try {
      await adminUpdateCouponStatus({ id: couponId, status: newStatus });

      // Update local state optimistically
      setCoupons(
        coupons.map((coupon) =>
          coupon.id === couponId ? { ...coupon, status: newStatus } : coupon
        )
      );
    } catch (err) {
      console.error("Error updating coupon status:", err);
      // Revert the change on error
      setError(
        err instanceof Error ? err.message : "Failed to update coupon status"
      );
    }
  };

  const handleAddCoupon = (data: CouponFormValues) => {
    // This would typically open a modal or navigate to a form
    // For now, we'll just log it as the create functionality
    // would need a proper form implementation
    console.log("Add coupon:", data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-sm text-muted-foreground">Loading coupons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="text-sm text-destructive">Error: {error}</div>
        <button
          onClick={fetchCoupons}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AdminCouponsTemplate
      coupons={coupons}
      onCouponStatusChange={handleCouponStatusChange}
      onAddCoupon={handleAddCoupon}
    />
  );
}
