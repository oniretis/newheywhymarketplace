import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema/reviews-schema";

async function seedReviews() {
  try {
    // Sample review data that doesn't depend on existing products/users
    const sampleReviews = [
      {
        productId: "sample-product-1",
        customerId: "sample-user-1",
        rating: 5,
        title: "Amazing product!",
        comment:
          "This is exactly what I was looking for. Great quality and fast shipping!",
        status: "published" as const,
      },
      {
        productId: "sample-product-1",
        customerId: "sample-user-2",
        rating: 4,
        title: "Good value",
        comment:
          "Product is good but could be better. Overall satisfied with the purchase.",
        status: "published" as const,
      },
      {
        productId: "sample-product-2",
        customerId: "sample-user-1",
        rating: 2,
        title: "Not what I expected",
        comment:
          "The product doesn't match the description. Disappointed with the quality.",
        status: "pending" as const,
      },
      {
        productId: "sample-product-2",
        customerId: "sample-user-3",
        rating: 5,
        title: "Excellent!",
        comment: "Exceeded my expectations. Will definitely buy again!",
        status: "published" as const,
      },
      {
        productId: "sample-product-3",
        customerId: "sample-user-2",
        rating: 1,
        title: "Terrible experience",
        comment: "Product arrived damaged and customer service was unhelpful.",
        status: "rejected" as const,
      },
    ];

    // Insert reviews
    await db.insert(reviews).values(sampleReviews);

    console.log("✅ Reviews seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding reviews:", error);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedReviews();
}

export { seedReviews };
