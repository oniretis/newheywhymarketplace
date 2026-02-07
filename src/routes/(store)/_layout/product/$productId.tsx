import { createFileRoute, notFound } from "@tanstack/react-router";
import ProductDetailsTemplate from "@/components/templates/store/product-details-template";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema/products-schema";
import { categories } from "@/lib/db/schema/category-schema";
import { brands } from "@/lib/db/schema/brand-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { eq, and } from "drizzle-orm";

export const Route = createFileRoute("/(store)/_layout/product/$productId")({
  loader: async ({ params }) => {
    try {
      // Get product with all relations
      const productData = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          sku: products.sku,
          description: products.description,
          shortDescription: products.shortDescription,
          sellingPrice: products.sellingPrice,
          regularPrice: products.regularPrice,
          costPrice: products.costPrice,
          stock: products.stock,
          lowStockThreshold: products.lowStockThreshold,
          trackInventory: products.trackInventory,
          status: products.status,
          productType: products.productType,
          isFeatured: products.isFeatured,
          isActive: products.isActive,
          metaTitle: products.metaTitle,
          metaDescription: products.metaDescription,
          averageRating: products.averageRating,
          reviewCount: products.reviewCount,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            description: categories.description,
          },
          brand: {
            id: brands.id,
            name: brands.name,
            slug: brands.slug,
            description: brands.description,
            logo: brands.logo,
          },
          shop: {
            id: shops.id,
            name: shops.name,
            slug: shops.slug,
            logo: shops.logo,
            description: shops.description,
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
        .leftJoin(shops, eq(products.shopId, shops.id))
        .leftJoin(productImages, eq(products.id, productImages.productId))
        .where(
          and(
            eq(products.id, params.productId),
            eq(products.isActive, true),
            eq(products.status, "active")
          )
        );

      if (productData.length === 0) {
        throw notFound();
      }

      // Group images by product
      const product = productData.reduce((acc, row) => {
        if (!acc.id) {
          acc = {
            id: row.id,
            name: row.name,
            slug: row.slug,
            sku: row.sku,
            description: row.description,
            shortDescription: row.shortDescription,
            sellingPrice: row.sellingPrice,
            regularPrice: row.regularPrice,
            costPrice: row.costPrice,
            stock: row.stock,
            lowStockThreshold: row.lowStockThreshold,
            trackInventory: row.trackInventory,
            status: row.status,
            productType: row.productType,
            isFeatured: row.isFeatured,
            isActive: row.isActive,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            averageRating: row.averageRating,
            reviewCount: row.reviewCount,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            category: row.category,
            brand: row.brand,
            shop: row.shop,
            images: [],
          };
        }

        if (row.images.id) {
          acc.images.push(row.images);
        }

        return acc;
      }, {} as any);

      // Sort images: primary first, then by sort order
      product.images.sort((a: any, b: any) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.sortOrder - b.sortOrder;
      });

      return { product };
    } catch (error) {
      console.error("Product loader error:", error);
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { product } = Route.useLoaderData();
  return <ProductDetailsTemplate product={product} />;
}
