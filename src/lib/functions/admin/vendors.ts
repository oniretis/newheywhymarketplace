import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema/shop-schema";
import { adminMiddleware } from "@/lib/middleware/admin";
import { z } from "zod";

const updateVendorStatusSchema = z.object({
  vendorId: z.string(),
  status: z.enum(["pending_approval", "active", "suspended", "rejected"]),
});

export const updateVendorStatus = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .inputValidator(updateVendorStatusSchema)
  .handler(async ({ data }) => {
    const { vendorId, status } = data;

    // Update vendor status
    await db
      .update(vendors)
      .set({
        status,
        updatedAt: new Date(),
        // Set approval details if approving
        ...(status === "active" && {
          approvedAt: new Date(),
          // approvedBy will be set from middleware context
        }),
      })
      .where(eq(vendors.id, vendorId));

    return { success: true, status };
  });
