import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema/reviews-schema";
import { products, productImages } from "@/lib/db/schema/products-schema";
import { user } from "@/lib/db/schema/auth-schema";
import { eq, desc } from "drizzle-orm";
import type { Review } from "@/types/review";

export async function getReviews(): Promise<Review[]> {
  try {
    // First get all reviews with product and customer info
    const reviewsWithProducts = await db
      .select({
        id: reviews.id,
        productName: products.name,
        customerName: user.name,
        customerAvatar: user.image,
        rating: reviews.rating,
        comment: reviews.comment,
        date: reviews.createdAt,
        status: reviews.status,
        productId: reviews.productId,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .leftJoin(user, eq(reviews.customerId, user.id))
      .orderBy(desc(reviews.createdAt));

    // Then get primary images for each product
    const productIds = [
      ...new Set(reviewsWithProducts.map((r) => r.productId).filter(Boolean)),
    ];
    const primaryImages =
      productIds.length > 0
        ? await db
            .select({
              url: productImages.url,
              productId: productImages.productId,
            })
            .from(productImages)
            .where(eq(productImages.isPrimary, true))
        : [];

    const imageMap = new Map(
      primaryImages.map((img) => [img.productId, img.url])
    );

    return reviewsWithProducts.map((review) => ({
      id: review.id,
      productName: review.productName || "Unknown Product",
      productImage: imageMap.get(review.productId) || "",
      customerName: review.customerName || "Anonymous Customer",
      customerAvatar: review.customerAvatar || undefined,
      rating: review.rating,
      comment: review.comment || "",
      date: review.date.toISOString().split("T")[0],
      status: review.status as "published" | "pending" | "rejected",
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Return empty array if there's an error or no data
    return [];
  }
}

export async function updateReviewStatus(
  reviewId: string,
  newStatus: "published" | "pending" | "rejected"
): Promise<boolean> {
  try {
    await db
      .update(reviews)
      .set({
        status: newStatus,
        moderatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId));

    return true;
  } catch (error) {
    console.error("Error updating review status:", error);
    return false;
  }
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    await db.delete(reviews).where(eq(reviews.id, reviewId));
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
}
