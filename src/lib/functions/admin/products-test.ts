// ============================================================================
// Test Admin Products Function - Simplified for debugging
// ============================================================================

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/middleware/auth";
import type { ProductListResponse } from "@/types/products";

export const getAdminProductsTest = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProductListResponse> => {
    try {
      const userId = context.session.user.id;

      console.log("Test admin products request from user:", userId);

      // Return a simple test response
      return {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };
    } catch (error) {
      console.error("Error in getAdminProductsTest:", error);
      throw error;
    }
  });
