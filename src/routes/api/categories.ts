import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/category-schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const level = url.searchParams.get("level");
          const parentId = url.searchParams.get("parentId");
          const featured = url.searchParams.get("featured");

          // Build where conditions
          const whereConditions = [eq(categories.isActive, true)];

          if (level) {
            whereConditions.push(eq(categories.level, parseInt(level)));
          }

          if (parentId) {
            whereConditions.push(eq(categories.parentId, parentId));
          }

          if (featured === "true") {
            whereConditions.push(eq(categories.featured, true));
          }

          // Get categories
          const categoriesData = await db
            .select({
              id: categories.id,
              name: categories.name,
              slug: categories.slug,
              description: categories.description,
              image: categories.image,
              icon: categories.icon,
              level: categories.level,
              productCount: categories.productCount,
              isActive: categories.isActive,
              featured: categories.featured,
              sortOrder: categories.sortOrder,
              parentId: categories.parentId,
            })
            .from(categories)
            .where(and(...whereConditions))
            .orderBy(categories.sortOrder, categories.name);

          return Response.json({
            success: true,
            data: categoriesData,
          });
        } catch (error) {
          console.error("Categories API error:", error);
          return Response.json(
            {
              success: false,
              error: "Failed to fetch categories",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
