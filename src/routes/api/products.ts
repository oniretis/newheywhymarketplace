import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema/products-schema";
import { categories } from "@/lib/db/schema/category-schema";
import { brands } from "@/lib/db/schema/brand-schema";
import { eq, and, isNotNull, desc, asc } from "drizzle-orm";

export const Route = createFileRoute("/api/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get("page") || "1");
          const limit = parseInt(url.searchParams.get("limit") || "12");
          const category = url.searchParams.get("category");
          const featured = url.searchParams.get("featured");
          const search = url.searchParams.get("search");
          const sortBy = url.searchParams.get("sortBy") || "createdAt";
          const sortDirection = url.searchParams.get("sortDirection") || "desc";

          const offset = (page - 1) * limit;

          // Build where conditions
          const whereConditions = [
            eq(products.isActive, true),
            eq(products.status, "active"),
            isNotNull(products.categoryId),
          ];

          if (category) {
            whereConditions.push(eq(categories.slug, category));
          }

          if (featured === "true") {
            whereConditions.push(eq(products.isFeatured, true));
          }

          if (search) {
            whereConditions.push(
              // Simple search - in production you'd want full-text search
              products.name
                .toLowerCase()
                .includes(search.toLowerCase())
            );
          }

          // Build order by
          const orderBy =
            sortDirection === "desc"
              ? desc(products[sortBy as keyof typeof products])
              : asc(products[sortBy as keyof typeof products]);

          // Get products with relations
          const productsData = await db
            .select({
              id: products.id,
              name: products.name,
              slug: products.slug,
              description: products.description,
              shortDescription: products.shortDescription,
              sellingPrice: products.sellingPrice,
              regularPrice: products.regularPrice,
              stock: products.stock,
              averageRating: products.averageRating,
              reviewCount: products.reviewCount,
              isFeatured: products.isFeatured,
              createdAt: products.createdAt,
              category: {
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
              },
              brand: {
                id: brands.id,
                name: brands.name,
                slug: brands.slug,
              },
              images: {
                id: productImages.id,
                url: productImages.url,
                alt: productImages.alt,
                sortOrder: productImages.sortOrder,
                isPrimary: productImages.isPrimary,
              },
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(brands, eq(products.brandId, brands.id))
            .leftJoin(productImages, eq(products.id, productImages.productId))
            .where(and(...whereConditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

          // Group images by product
          const groupedProducts = productsData.reduce(
            (acc, row) => {
              const productId = row.id;
              if (!acc[productId]) {
                acc[productId] = {
                  id: row.id,
                  name: row.name,
                  slug: row.slug,
                  description: row.description,
                  shortDescription: row.shortDescription,
                  sellingPrice: row.sellingPrice,
                  regularPrice: row.regularPrice,
                  stock: row.stock,
                  averageRating: row.averageRating,
                  reviewCount: row.reviewCount,
                  isFeatured: row.isFeatured,
                  createdAt: row.createdAt,
                  category: row.category,
                  brand: row.brand,
                  images: [],
                };
              }

              if (row.images.id) {
                acc[productId].images.push(row.images);
              }

              return acc;
            },
            {} as Record<string, any>
          );

          const result = Object.values(groupedProducts);

          // Get total count for pagination
          const totalCount = await db
            .select({ count: products.id })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(...whereConditions));

          return Response.json({
            success: true,
            data: {
              products: result,
              pagination: {
                page,
                limit,
                total: totalCount.length,
                totalPages: Math.ceil(totalCount.length / limit),
              },
            },
          });
        } catch (error) {
          console.error("Products API error:", error);
          return Response.json(
            {
              success: false,
              error: "Failed to fetch products",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
