/**
 * Admin Coupon Server Functions
 *
 * Server functions for coupon management in the admin dashboard.
 * Provides access to all coupons across all shops for admin users.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema/coupon-schema";
import {
  executeCouponQuery,
  fetchCouponWithRelations,
} from "@/lib/helper/coupon-query-helpers";

import { authMiddleware } from "@/lib/middleware/auth";
import { adminMiddleware } from "@/lib/middleware/admin";
import {
  createCouponSchema,
  deleteCouponSchema,
  getCouponByCodeSchema,
  getCouponByIdSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "@/lib/validators/shared/coupon-query";
import { createSuccessResponse } from "@/types/api-response";
import type {
  AvailableCouponsResponse,
  CouponListResponse,
  CreateCouponResponse,
  DeleteCouponResponse,
  UpdateCouponResponse,
  ValidateCouponResponse,
} from "@/types/coupons";

// ============================================================================
// Admin: Get All Coupons (List with Pagination)
// ============================================================================

export const adminGetAllCoupons = createServerFn({ method: "GET" })
  .middleware([authMiddleware, adminMiddleware])
  .inputValidator(
    z
      .object({
        limit: z.coerce.number().min(1).max(100).optional().default(20),
        offset: z.coerce.number().min(0).optional().default(0),
        search: z.string().optional(),
        type: z.enum(["percentage", "fixed", "free_shipping"]).optional(),
        status: z.enum(["active", "inactive", "expired"]).optional(),
        isActive: z.boolean().optional(),
        applicableTo: z
          .enum(["all", "specific_products", "specific_categories"])
          .optional(),
        sortBy: z
          .enum([
            "code",
            "discountAmount",
            "usageCount",
            "activeFrom",
            "activeTo",
            "createdAt",
          ])
          .optional()
          .default("createdAt"),
        sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
        shopId: z.string().optional(),
      })
      .optional()
      .default({})
  )
  .handler(async ({ data }): Promise<CouponListResponse> => {
    const params = data || {};
    const {
      limit = 20,
      offset = 0,
      search,
      type,
      status,
      isActive,
      applicableTo,
      sortBy = "createdAt",
      sortDirection = "desc",
      shopId,
    } = params;

    // Build base conditions
    const baseConditions = [];
    if (shopId) {
      baseConditions.push(eq(coupons.shopId, shopId));
    }

    // Use shared query helper with admin-specific options
    return executeCouponQuery({
      baseConditions,
      search,
      type,
      status,
      isActive,
      applicableTo,
      limit,
      offset,
      sortBy: sortBy as any,
      sortDirection,
      includeShopInfo: true,
      includeVendorInfo: true,
    });
  });

// ============================================================================
// Admin: Get Coupon by ID
// ============================================================================

export const adminGetCouponById = createServerFn({ method: "GET" })
  .middleware([authMiddleware, adminMiddleware])
  .inputValidator(getCouponByIdSchema)
  .handler(async ({ data }) => {
    const { id } = data;

    // Get coupon (admin can access any coupon)
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!coupon) {
      throw new Error("Coupon not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedCoupon = await fetchCouponWithRelations(coupon, {
      includeShopInfo: true,
      includeVendorInfo: true,
    });

    return { coupon: normalizedCoupon };
  });

// ============================================================================
// Admin: Update Coupon Status
// ============================================================================

export const adminUpdateCouponStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware, adminMiddleware])
  .inputValidator(
    z.object({
      id: z.string().min(1, "Coupon ID is required"),
      status: z.enum(["active", "inactive", "expired"]),
    })
  )
  .handler(async ({ data }) => {
    const { id, status } = data;

    // Check if coupon exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!existingCoupon) {
      throw new Error("Coupon not found.");
    }

    // Update coupon status
    await db
      .update(coupons)
      .set({
        status,
        isActive: status === "active",
      })
      .where(eq(coupons.id, id));

    // Fetch updated coupon
    const updatedCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!updatedCoupon) {
      throw new Error("Failed to update coupon.");
    }

    // Use shared helper for fetching with relations
    const normalizedCoupon = await fetchCouponWithRelations(updatedCoupon, {
      includeShopInfo: true,
      includeVendorInfo: true,
    });

    return {
      ...createSuccessResponse("Coupon status updated successfully"),
      coupon: normalizedCoupon,
    };
  });

// ============================================================================
// Admin: Delete Coupon
// ============================================================================

export const adminDeleteCoupon = createServerFn({ method: "POST" })
  .middleware([authMiddleware, adminMiddleware])
  .inputValidator(deleteCouponSchema)
  .handler(async ({ data }): Promise<DeleteCouponResponse> => {
    const { id } = data;

    // Check if coupon exists
    const existingCoupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!existingCoupon) {
      throw new Error("Coupon not found.");
    }

    // Delete the coupon (junction tables will cascade)
    await db.delete(coupons).where(eq(coupons.id, id));

    return createSuccessResponse("Coupon deleted successfully");
  });

// ============================================================================
// Admin: Get Coupon Analytics
// ============================================================================

export const adminGetCouponAnalytics = createServerFn({ method: "GET" })
  .middleware([authMiddleware, adminMiddleware])
  .inputValidator(
    z.object({
      couponId: z.string().optional(),
      shopId: z.string().optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { couponId, shopId, dateFrom, dateTo } = data;

    // Build conditions for analytics query
    const conditions = [];

    if (couponId) {
      conditions.push(eq(coupons.id, couponId));
    }

    if (shopId) {
      conditions.push(eq(coupons.shopId, shopId));
    }

    // Get coupons matching conditions
    const couponsData = await db.query.coupons.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });

    // Calculate analytics
    const totalUsage = couponsData.reduce(
      (sum, coupon) => sum + coupon.usageCount,
      0
    );
    const totalDiscount = couponsData.reduce((sum, coupon) => {
      const discountAmount = parseFloat(coupon.discountAmount);
      return sum + discountAmount * coupon.usageCount;
    }, 0);

    // For daily usage, we would need to query couponUsage table
    // This is a simplified version - in production you'd want proper date grouping
    const usageByDay = [
      // This would be populated by actual usage data from couponUsage table
      // For now, returning empty array as placeholder
    ];

    return {
      totalUsage,
      totalDiscount,
      usageByDay,
    };
  });
