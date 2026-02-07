// ============================================================================
// Admin Products Functions
// ============================================================================

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products-schema";
import {
  executeProductQuery,
  fetchProductWithRelations,
} from "@/lib/helper/products-query-helpers";
import { requireAdminAccess } from "@/lib/helper/admin";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  adminProductsQuerySchema,
  getProductByIdSchema,
  deleteProductSchema,
  toggleProductActiveSchema,
  type AdminProductsQuery,
} from "@/lib/validators/shared/product-query";
import { createSuccessResponse } from "@/types/api-response";
import type { ProductListResponse } from "@/types/products";

// ============================================================================
// Get All Products (Admin)
// ============================================================================

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(adminProductsQuerySchema)
  .handler(async ({ context, data }): Promise<ProductListResponse> => {
    try {
      const userId = context.session.user.id;

      // Verify admin access
      // await requireAdminAccess(userId); // Temporarily commented for debugging

      console.log("Admin products request from user:", userId);
      console.log("Received data:", data);

      // Return a simple test response first
      return {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };

      const {
        limit,
        offset,
        search,
        status,
        productType,
        categoryId,
        brandId,
        tagId,
        attributeId,
        isFeatured,
        isActive,
        inStock,
        lowStock,
        minPrice,
        maxPrice,
        sortBy,
        sortDirection,
        shopId,
        vendorId,
      } = data as AdminProductsQuery;

      // Build base conditions for admin (can see all products)
      const baseConditions = [];

      // Optional shop filter
      if (shopId) {
        baseConditions.push(eq(products.shopId, shopId));
      }

      // Use shared query helper with admin-specific options
      const result = await executeProductQuery({
        baseConditions,
        search,
        status,
        productType,
        categoryId,
        brandId,
        tagId,
        attributeId,
        isFeatured,
        isActive,
        inStock,
        lowStock,
        minPrice,
        maxPrice,
        limit,
        offset,
        sortBy,
        sortDirection,
        // Admin sees shop and vendor info
        includeShopInfo: true,
        includeVendorInfo: true,
        // Admin doesn't need to see cost price unless specifically requested
        excludeCostPrice: true,
      });

      // Ensure we always return a valid response structure
      return {
        data: result?.data || [],
        total: result?.total || 0,
        limit: result?.limit || limit || 10,
        offset: result?.offset || offset || 0,
      };
    } catch (error) {
      console.error("Error in getAdminProducts:", error);
      throw error;
    }
  });

// ============================================================================
// Get Product by ID (Admin)
// ============================================================================

export const getAdminProductById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getProductByIdSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id } = data as { id: string };

    // Verify admin access
    await requireAdminAccess(userId);

    // Get product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      throw new Error("Product not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedProduct = await fetchProductWithRelations(product, {
      includeShopInfo: true,
      includeVendorInfo: true,
      excludeCostPrice: false, // Admin can see cost price
    });

    return { product: normalizedProduct };
  });

// ============================================================================
// Toggle Product Active Status (Admin)
// ============================================================================

export const toggleAdminProductActive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(toggleProductActiveSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id } = data as { id: string };

    // Verify admin access
    await requireAdminAccess(userId);

    // Get current product
    const [currentProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!currentProduct) {
      throw new Error("Product not found.");
    }

    // Toggle active status
    const newStatus = !currentProduct.isActive;

    await db
      .update(products)
      .set({ isActive: newStatus })
      .where(eq(products.id, id));

    return {
      ...createSuccessResponse(
        `Product ${newStatus ? "activated" : "deactivated"} successfully`
      ),
      isActive: newStatus,
    };
  });

// ============================================================================
// Delete Product (Admin)
// ============================================================================

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(deleteProductSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id } = data as { id: string };

    // Verify admin access
    await requireAdminAccess(userId);

    // Check if product exists
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    // Delete the product (images, tags, attributes will cascade delete)
    await db.delete(products).where(eq(products.id, id));

    return createSuccessResponse("Product deleted successfully");
  });
