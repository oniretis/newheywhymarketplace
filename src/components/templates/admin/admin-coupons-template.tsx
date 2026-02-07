import CouponHeader from "@/components/containers/shared/coupons/coupon-header";
import { AdminCouponTable } from "@/components/containers/admin/coupons/admin-coupon-table";
import { ADMIN_COUPON_PERMISSIONS } from "@/lib/config/coupon-permissions";
import type { Coupon, CouponFormValues } from "@/types/coupon";
import type { CouponItem } from "@/types/coupons";

interface AdminCouponsTemplateProps {
  coupons: Coupon[];
  onCouponStatusChange: (
    couponId: string,
    newStatus: "active" | "expired" | "inactive"
  ) => void;
  onAddCoupon?: (data: CouponFormValues) => void;
}

export default function AdminCouponsTemplate({
  coupons,
  onCouponStatusChange,
  onAddCoupon,
}: AdminCouponsTemplateProps) {
  const handleToggleStatus = (coupon: CouponItem) => {
    const newStatus: "active" | "expired" | "inactive" =
      coupon.status === "active" ? "inactive" : "active";
    onCouponStatusChange(coupon.id, newStatus);
  };

  return (
    <>
      <CouponHeader
        role="admin"
        onAdd={onAddCoupon ? () => {} : undefined}
        showAddButton={!!onAddCoupon}
      />
      <AdminCouponTable
        coupons={coupons}
        permissions={ADMIN_COUPON_PERMISSIONS}
        onToggleStatus={handleToggleStatus}
      />
    </>
  );
}
