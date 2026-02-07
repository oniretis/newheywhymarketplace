/**
 * Admin Brand Server Functions
 *
 * Server functions for brand management in the admin dashboard.
 * Uses TanStack Start's createServerFn with Zod validation.
 * Admin functions have global access across all shops.
 *
 * Performance Optimizations:
 * - Uses batch queries to eliminate N+1 queries for product counts
 * - Uses Promise.all for parallel database operations
 * - Computes productCount dynamically from products table for accuracy
 */

import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z as zod } from "zod";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema/brand-schema";
import {
  executeBrandQuery,
  fetchBrandWithRelations,
} from "@/lib/helper/brands-query-helpers";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateSlug } from "@/lib/utils/slug";
import {
  createBrandSchema,
  updateBrandSchema,
  adminBrandsQuerySchema,
} from "@/lib/validators/shared/brand-query";
import type { BrandListResponse } from "@/types/brands";

// ============================================================================
// Get All Brands (Admin - Global across all shops)
// ============================================================================

export const getAdminBrands = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(adminBrandsQuerySchema.optional())
  .handler(async ({ data }): Promise<BrandListResponse> => {
    const {
      limit = 50,
      offset = 0,
      search,
      isActive,
      shopId,
      sortBy = "sortOrder",
      sortDirection = "asc",
    } = data || {};

    // Build base conditions - admin can filter by shopId but not required
    const baseConditions = [];
    if (shopId) {
      baseConditions.push(eq(brands.shopId, shopId));
    }

    // Use shared query helper without shop access restrictions for admin
    return executeBrandQuery({
      baseConditions,
      search,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true, // Include shop info for admin
    });
  });

// ============================================================================
// Get Brand by ID (Admin)
// ============================================================================

export const getAdminBrandById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    zod.object({ id: zod.string().min(1, "Brand ID is required") })
  )
  .handler(async ({ data }) => {
    const { id } = data;

    // Get brand (admin has global access)
    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    if (!brand) {
      throw new Error("Brand not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedBrand = await fetchBrandWithRelations(brand, {
      includeShopInfo: true, // Include shop info for admin
    });

    return { brand: normalizedBrand };
  });

// ============================================================================
// Create Brand (Admin)
// ============================================================================

export const createAdminBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createBrandSchema)
  .handler(async ({ data }) => {
    const { shopId, ...brandData } = data;

    // Generate slug if not provided
    let slug = brandData.slug;
    if (!slug) {
      slug = generateSlug(brandData.name);
    }

    // Check for duplicate slug within the shop
    const existingBrand = await db.query.brands.findFirst({
      where: and(eq(brands.shopId, shopId), eq(brands.slug, slug)),
    });

    if (existingBrand) {
      throw new Error(
        "A brand with this slug already exists in this shop. Please choose a different name or slug."
      );
    }

    // Create the brand
    const brandId = uuidv4();

    await db.insert(brands).values({
      id: brandId,
      shopId: shopId,
      name: brandData.name,
      slug: slug,
      description: brandData.description ?? null,
      logo: brandData.logo ?? null,
      website: brandData.website ?? null,
      sortOrder: brandData.sortOrder ?? 0,
      isActive: brandData.isActive ?? true,
    });

    // Fetch the created brand
    const newBrand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });

    if (!newBrand) {
      throw new Error("Failed to create brand.");
    }

    const normalizedBrand = await fetchBrandWithRelations(newBrand, {
      includeShopInfo: true, // Include shop info for admin
    });

    return {
      success: true,
      brand: normalizedBrand,
    };
  });

// ============================================================================
// Update Brand (Admin)
// ============================================================================

export const updateAdminBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateBrandSchema)
  .handler(async ({ data }) => {
    const { id, shopId, ...updateData } = data;

    // Check if brand exists (admin has global access)
    const existingBrand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingBrand.slug) {
      const slugExists = await db.query.brands.findFirst({
        where: and(
          eq(brands.shopId, existingBrand.shopId),
          eq(brands.slug, updateData.slug)
        ),
      });

      if (slugExists) {
        throw new Error("A brand with this slug already exists in this shop.");
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.description !== undefined)
      updateValues.description = updateData.description;
    if (updateData.logo !== undefined) updateValues.logo = updateData.logo;
    if (updateData.website !== undefined)
      updateValues.website = updateData.website;
    if (updateData.sortOrder !== undefined)
      updateValues.sortOrder = updateData.sortOrder;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;

    // Update the brand
    if (Object.keys(updateValues).length > 0) {
      await db.update(brands).set(updateValues).where(eq(brands.id, id));
    }

    // Fetch updated brand
    const updatedBrand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    if (!updatedBrand) {
      throw new Error("Failed to update brand.");
    }

    const normalizedBrand = await fetchBrandWithRelations(updatedBrand, {
      includeShopInfo: true, // Include shop info for admin
    });

    return {
      success: true,
      brand: normalizedBrand,
    };
  });

// ============================================================================
// Delete Brand (Admin)
// ============================================================================

export const deleteAdminBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    zod.object({ id: zod.string().min(1, "Brand ID is required") })
  )
  .handler(async ({ data }) => {
    const { id } = data;

    // Check if brand exists (admin has global access)
    const existingBrand = await db.query.brands.findFirst({
      where: eq(brands.id, id),
    });

    if (!existingBrand) {
      throw new Error("Brand not found.");
    }

    // Check if brand is used in products
    const actualProductCount = existingBrand.productCount ?? 0;
    if (actualProductCount > 0) {
      throw new Error(
        "Cannot delete a brand that is assigned to products. Please remove it from products first."
      );
    }

    // Delete the brand
    await db.delete(brands).where(eq(brands.id, id));

    return {
      success: true,
      message: "Brand deleted successfully",
    };
  });
