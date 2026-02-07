/**
 * Admin Tag Functions
 *
 * Server functions for tag management in the admin dashboard.
 * Uses TanStack Start's createServerFn with Zod validation.
 */

import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { z as zod } from "zod";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema/tags-schema";
import {
  executeTagQuery,
  fetchTagWithRelations,
} from "@/lib/helper/tag-query-helpers";
import { requireAdminAccess } from "@/lib/helper/admin";
import { authMiddleware } from "@/lib/middleware/auth";
import { generateSlug } from "@/lib/utils/slug";
import {
  createTagSchema,
  updateTagSchema,
  adminTagsQuerySchema,
} from "@/lib/validators/shared/tag-query";
import type { TagListResponse } from "@/types/tags";

// ============================================================================
// Get All Tags (Admin) - OPTIMIZED
// ============================================================================

export const getAdminTags = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(adminTagsQuerySchema)
  .handler(async ({ context, data }): Promise<TagListResponse> => {
    try {
      const userId = context.session.user.id;
      const { limit, offset, search, isActive, sortBy, sortDirection, shopId } =
        data;

      // Verify admin access
      await requireAdminAccess(userId);

      console.log("Admin tags request from user:", userId);
      console.log("Received data:", data);

      // Build base conditions
      const baseConditions = shopId ? [eq(tags.shopId, shopId)] : []; // Admin can see all tags across all shops

      // Use shared query helper
      return executeTagQuery({
        baseConditions,
        search,
        isActive,
        limit,
        offset,
        sortBy,
        sortDirection,
        includeShopInfo: true, // Include shop info for admin
      });
    } catch (error) {
      console.error("Error in getAdminTags:", error);
      throw error;
    }
  });

// ============================================================================
// Get Tag by ID (Admin)
// ============================================================================

export const getAdminTagById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    adminTagsQuerySchema
      .pick({ shopId: true })
      .extend({ id: zod.string().min(1, "Tag ID is required") })
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId?: string };

    // Verify admin access
    await requireAdminAccess(userId);

    // Get tag - admin can access any tag, optionally filtered by shop
    const whereConditions = shopId
      ? [eq(tags.id, id), eq(tags.shopId, shopId)]
      : [eq(tags.id, id)];

    const tag = await db.query.tags.findFirst({
      where: and(...whereConditions),
    });

    if (!tag) {
      throw new Error("Tag not found.");
    }

    // Use shared helper for fetching with relations
    const normalizedTag = await fetchTagWithRelations(tag, {
      includeShopInfo: true,
    });

    return { tag: normalizedTag };
  });

// ============================================================================
// Create Tag (Admin)
// ============================================================================

export const createAdminTag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createTagSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { shopId, ...tagData } = data;

    // Verify admin access
    await requireAdminAccess(userId);

    // Generate slug if not provided
    let slug = tagData.slug;
    if (!slug) {
      slug = generateSlug(tagData.name);
    }

    // Check for duplicate slug within the shop
    const existingTag = await db.query.tags.findFirst({
      where: and(eq(tags.shopId, shopId), eq(tags.slug, slug)),
    });

    if (existingTag) {
      throw new Error(
        "A tag with this slug already exists in this shop. Please choose a different name or slug."
      );
    }

    // Create the tag
    const tagId = crypto.randomUUID();

    await db.insert(tags).values({
      id: tagId,
      shopId: shopId,
      name: tagData.name,
      slug: slug,
      description: tagData.description,
      sortOrder: tagData.sortOrder ?? 0,
      isActive: tagData.isActive ?? true,
    });

    // Fetch the created tag
    const newTag = await db.query.tags.findFirst({
      where: eq(tags.id, tagId),
    });

    if (!newTag) {
      throw new Error("Failed to create tag.");
    }

    const normalizedTag = await fetchTagWithRelations(newTag, {
      includeShopInfo: true,
    });

    return {
      success: true,
      tag: normalizedTag,
    };
  });

// ============================================================================
// Update Tag (Admin)
// ============================================================================

export const updateAdminTag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateTagSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId, ...updateData } = data;

    // Verify admin access
    await requireAdminAccess(userId);

    // Check if tag exists
    const existingTag = await db.query.tags.findFirst({
      where: and(eq(tags.id, id), eq(tags.shopId, shopId)),
    });

    if (!existingTag) {
      throw new Error("Tag not found.");
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingTag.slug) {
      const slugExists = await db.query.tags.findFirst({
        where: and(eq(tags.shopId, shopId), eq(tags.slug, updateData.slug)),
      });

      if (slugExists) {
        throw new Error("A tag with this slug already exists in this shop.");
      }
    }

    // Build update object
    const updateValues: Record<string, any> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.slug !== undefined) updateValues.slug = updateData.slug;
    if (updateData.description !== undefined)
      updateValues.description = updateData.description;
    if (updateData.sortOrder !== undefined)
      updateValues.sortOrder = updateData.sortOrder;
    if (updateData.isActive !== undefined)
      updateValues.isActive = updateData.isActive;

    // Update the tag
    if (Object.keys(updateValues).length > 0) {
      await db.update(tags).set(updateValues).where(eq(tags.id, id));
    }

    // Fetch updated tag
    const updatedTag = await db.query.tags.findFirst({
      where: eq(tags.id, id),
    });

    if (!updatedTag) {
      throw new Error("Failed to update tag.");
    }

    const normalizedTag = await fetchTagWithRelations(updatedTag, {
      includeShopInfo: true,
    });

    return {
      success: true,
      tag: normalizedTag,
    };
  });

// ============================================================================
// Delete Tag (Admin)
// ============================================================================

export const deleteAdminTag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    adminTagsQuerySchema
      .pick({ shopId: true })
      .extend({ id: zod.string().min(1, "Tag ID is required") })
  )
  .handler(async ({ context, data }) => {
    const userId = context.session.user.id;
    const { id, shopId } = data as { id: string; shopId?: string };

    // Verify admin access
    await requireAdminAccess(userId);

    // Check if tag exists
    const whereConditions = shopId
      ? [eq(tags.id, id), eq(tags.shopId, shopId)]
      : [eq(tags.id, id)];

    const existingTag = await db.query.tags.findFirst({
      where: and(...whereConditions),
    });

    if (!existingTag) {
      throw new Error("Tag not found.");
    }

    // Check actual product count from tags table
    const actualProductCount = existingTag.productCount ?? 0;
    if (actualProductCount > 0) {
      throw new Error(
        "Cannot delete a tag that is assigned to products. Please remove it from products first."
      );
    }

    // Delete the tag
    await db.delete(tags).where(eq(tags.id, id));

    return {
      success: true,
      message: "Tag deleted successfully",
    };
  });
