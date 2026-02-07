import { db } from "@/lib/db";
import { products, productImages } from "@/lib/db/schema/products-schema";
import { reviews } from "@/lib/db/schema/reviews-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import { user } from "@/lib/db/schema/auth-schema";

async function seedSampleData() {
  try {
    console.log("🌱 Starting to seed sample data...");

    // Create sample users first
    const sampleUsers = [
      {
        id: "sample-user-1",
        name: "Alice Johnson",
        email: "alice@example.com",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
      },
      {
        id: "sample-user-2",
        name: "Bob Smith",
        email: "bob@example.com",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      },
      {
        id: "sample-user-3",
        name: "Charlie Brown",
        email: "charlie@example.com",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
    ];

    await db.insert(user).values(sampleUsers).onConflictDoNothing();
    console.log("✅ Sample users created");

    // Create sample vendor
    const sampleVendor = {
      id: "sample-vendor-1",
      userId: "sample-user-1",
      businessName: "Sample Electronics Business",
      commissionRate: "10.00",
      status: "active",
      contactEmail: "vendor@example.com",
      contactPhone: "+1234567890",
      address: "123 Sample St, Sample City",
    };

    await db.insert(vendors).values(sampleVendor).onConflictDoNothing();
    console.log("✅ Sample vendor created");

    // Create sample shop
    const sampleShop = {
      id: "sample-shop-1",
      vendorId: "sample-vendor-1",
      name: "Sample Electronics Store",
      slug: "sample-electronics",
      description: "A sample electronics store for testing",
      email: "shop@example.com",
      phone: "+1234567890",
      address: "123 Sample St, Sample City",
      status: "active",
    };

    await db.insert(shops).values(sampleShop).onConflictDoNothing();
    console.log("✅ Sample shop created");

    // Create sample products
    const sampleProducts = [
      {
        id: "sample-product-1",
        shopId: "sample-shop-1",
        name: "Wireless Headphones",
        slug: "wireless-headphones",
        sku: "WH-001",
        description: "High-quality wireless headphones with noise cancellation",
        shortDescription: "Premium wireless headphones",
        sellingPrice: "199.99",
        regularPrice: "249.99",
        stock: 50,
        status: "active" as const,
        productType: "simple" as const,
        isActive: true,
        averageRating: "4.5",
        reviewCount: 0,
      },
      {
        id: "sample-product-2",
        shopId: "sample-shop-1",
        name: "Smart Watch",
        slug: "smart-watch",
        sku: "SW-001",
        description: "Feature-rich smartwatch with health tracking",
        shortDescription: "Advanced smartwatch",
        sellingPrice: "299.99",
        regularPrice: "349.99",
        stock: 30,
        status: "active" as const,
        productType: "simple" as const,
        isActive: true,
        averageRating: "4.0",
        reviewCount: 0,
      },
      {
        id: "sample-product-3",
        shopId: "sample-shop-1",
        name: "Laptop Stand",
        slug: "laptop-stand",
        sku: "LS-001",
        description: "Ergonomic aluminum laptop stand",
        shortDescription: "Adjustable laptop stand",
        sellingPrice: "49.99",
        regularPrice: "69.99",
        stock: 100,
        status: "active" as const,
        productType: "simple" as const,
        isActive: true,
        averageRating: "3.5",
        reviewCount: 0,
      },
    ];

    await db.insert(products).values(sampleProducts).onConflictDoNothing();
    console.log("✅ Sample products created");

    // Create sample product images
    const sampleImages = [
      {
        id: "img-1",
        productId: "sample-product-1",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        alt: "Wireless Headphones",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: "img-2",
        productId: "sample-product-2",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
        alt: "Smart Watch",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: "img-3",
        productId: "sample-product-3",
        url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
        alt: "Laptop Stand",
        sortOrder: 0,
        isPrimary: true,
      },
    ];

    await db.insert(productImages).values(sampleImages).onConflictDoNothing();
    console.log("✅ Sample product images created");

    // Create sample reviews
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

    await db.insert(reviews).values(sampleReviews).onConflictDoNothing();
    console.log("✅ Sample reviews created");

    console.log("🎉 Sample data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding sample data:", error);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedSampleData();
}

export { seedSampleData };
