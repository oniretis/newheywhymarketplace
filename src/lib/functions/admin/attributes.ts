/**
 * Admin Attribute Server Functions
 *
 * Server functions for attribute management in the admin dashboard.
 * Uses TanStack Start's createServerFn with Zod validation.
 * Admin functions have global access across all shops.
 *
 * Performance Optimizations:
 * - Uses batch queries with inArray to eliminate N+1 queries for product counts
 * - Uses Promise.all for parallel database operations
 * - Computes productCount dynamically from productAttributes table for accuracy
 */

import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { productAttributes } from "@/lib/db/schema/products-schema";
import type { ProductAttribute } from "@/lib/db/schema/products-schema";
import { v4 as uuidv4 } from "uuid";
import { z as zod } from "zod";
import { db } from "@/lib/db";
import { attributes, attributeValues } from "@/lib/db/schema/attribute-schema";
import {
  executeAttributeQuery,
  fetchAttributeWithRelations,
} from "@/lib/helper/attribute-query-helpers";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateSlug } from "@/lib/utils/slug";
import {
  createAttributeSchema,
  updateAttributeSchema,
} from "@/lib/validators/shared/attribute-query";
import type { AttributeListResponse } from "@/types/attributes";

// ============================================================================
// Admin Attributes Query Schema
// ============================================================================

export const adminAttributesQuerySchema = zod.object({
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0),
  search: zod.string().optional(),
  type: zod.enum(["select", "color", "image", "label"]).optional(),
  isActive: zod.boolean().optional(),
  shopId: zod.string().optional(),
  sortBy: zod.enum(["name", "sortOrder", "createdAt"]).default("sortOrder"),
  sortDirection: zod.enum(["asc", "desc"]).default("asc"),
});

// ============================================================================
// Get All Attributes (Admin - Global across all shops)
// ============================================================================

export const getAdminAttributes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(adminAttributesQuerySchema.optional())
  .handler(async ({ data }): Promise<AttributeListResponse> => {
    const {
      limit = 50,
      offset = 0,
      search,
      type,
      isActive,
      shopId,
      sortBy = "sortOrder",
      sortDirection = "asc",
    } = data || {};

    // Build base conditions - admin can filter by shopId but not required
    const baseConditions = [];
    if (shopId) {
      baseConditions.push(eq(attributes.shopId, shopId));
    }

    // Use shared query helper without shop access restrictions for admin
    return executeAttributeQuery({
      baseConditions,
      search,
      type,
      isActive,
      limit,
      offset,
      sortBy,
      sortDirection,
      includeShopInfo: true, // Include shop info for admin
      includeValues: true,
    });
  });

// ============================================================================
// Get Attribute by ID (Admin)
// ============================================================================

export const getAdminAttributeById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    zod.object({ id: zod.string().min(1, "Attribute ID is required") })
  )
  .handler(async ({ data }) => {
    const { id } = data;

    // Get attribute with values (admin has global access)
    const attribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, id),
    });

    if (!attribute) {
      throw new Error("Attribute not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedAttribute = await fetchAttributeWithRelations(attribute, {
      includeShopInfo: true, // Include shop info for admin
      includeValues: true,
    });

    return { attribute: normalizedAttribute };
  });

// ============================================================================
// Create Attribute (Admin)
// ============================================================================

export const createAdminAttribute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createAttributeSchema)
  .handler(async ({ data }) => {
    const { shopId, values, ...attributeData } = data;

    // Generate slug if not provided
    let slug = attributeData.slug;
    if (!slug) {
      slug = generateSlug(attributeData.name);
    }

    // Check for duplicate slug within the shop
    const existingAttribute = await db.query.attributes.findFirst({
      where: and(eq(attributes.shopId, shopId), eq(attributes.slug, slug)),
    });

    if (existingAttribute) {
      throw new Error(
        "An attribute with this slug already exists in this shop. Please choose a different name or slug."
      );
    }

    // Create the attribute
    const attributeId = uuidv4();

    await db.insert(attributes).values({
      id: attributeId,
      shopId: shopId,
      name: attributeData.name,
      slug: slug,
      type: attributeData.type,
      sortOrder: attributeData.sortOrder ?? 0,
      isActive: attributeData.isActive ?? true,
    });

    // Create attribute values
    if (values && values.length > 0) {
      const valueRecords = values.map((val, index) => ({
        id: uuidv4(),
        attributeId: attributeId,
        name: val.name,
        slug: val.slug || generateSlug(val.name),
        value: val.value,
        sortOrder: index,
      }));

      await db.insert(attributeValues).values(valueRecords);
    }

    // Fetch the created attribute with values
    const newAttribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, attributeId),
    });

    if (!newAttribute) {
      throw new Error("Failed to create attribute.");
    }

    const normalizedAttribute = await fetchAttributeWithRelations(
      newAttribute,
      {
        includeShopInfo: true, // Include shop info for admin
        includeValues: true,
      }
    );

    return {
      success: true,
      attribute: normalizedAttribute,
    };
  });

// ============================================================================
// Update Attribute (Admin)
// ============================================================================

export const updateAdminAttribute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateAttributeSchema)
  .handler(async ({ data }) => {
    const { id, shopId, values, ...updateData } = data;

    // Check if attribute exists (admin has global access)
    const existingAttribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, id),
    });

    if (!existingAttribute) {
      throw new Error("Attribute not found.");
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingAttribute.slug) {
      const slugExists = await db.query.attributes.findFirst({
        where: and(
          eq(attributes.shopId, existingAttribute.shopId),
          eq(attributes.slug, updateData.slug)
        ),
      });

      if (slugExists) {
        throw new Error(
          "An attribute with this slug already exists in this shop."
        );
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.type !== undefined) updateValues.type = updateData.type;
    if (updateData.sortOrder !== undefined)
      updateValues.sortOrder = updateData.sortOrder;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;

    // Update the attribute
    if (Object.keys(updateValues).length > 0) {
      await db
        .update(attributes)
        .set(updateValues)
        .where(eq(attributes.id, id));
    }

    // Update values if provided
    if (values !== undefined) {
      // Delete existing values
      await db
        .delete(attributeValues)
        .where(eq(attributeValues.attributeId, id));

      // Insert new values
      if (values.length > 0) {
        const valueRecords = values.map((val, index) => ({
          id: uuidv4(),
          attributeId: id,
          name: val.name,
          slug: val.slug || generateSlug(val.name),
          value: val.value,
          sortOrder: index,
        }));

        await db.insert(attributeValues).values(valueRecords);
      }
    }

    // Fetch updated attribute with values
    const updatedAttribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, id),
    });

    if (!updatedAttribute) {
      throw new Error("Failed to update attribute.");
    }

    const normalizedAttribute = await fetchAttributeWithRelations(
      updatedAttribute,
      {
        includeShopInfo: true, // Include shop info for admin
        includeValues: true,
      }
    );

    return {
      success: true,
      attribute: normalizedAttribute,
    };
  });

// ============================================================================
// Delete Attribute (Admin)
// ============================================================================

export const deleteAdminAttribute = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    zod.object({ id: zod.string().min(1, "Attribute ID is required") })
  )
  .handler(async ({ data }) => {
    const { id } = data;

    // Check if attribute exists (admin has global access)
    const existingAttribute = await db.query.attributes.findFirst({
      where: eq(attributes.id, id),
    });

    if (!existingAttribute) {
      throw new Error("Attribute not found.");
    }

    // Check if attribute is used in products
    const productCount = await db.query.productAttributes.findFirst({
      where: eq(productAttributes.attributeId, id),
    });

    if (productCount) {
      throw new Error(
        "Cannot delete an attribute that is assigned to products. Please remove it from products first."
      );
    }

    // Delete the attribute (values will cascade delete)
    await db.delete(attributes).where(eq(attributes.id, id));

    return {
      success: true,
      message: "Attribute deleted successfully",
    };
  });
