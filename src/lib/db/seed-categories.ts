import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema/category-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function seedCategories() {
  try {
    console.log("🌱 Starting to seed categories...");

    // Get the sample shop or create a global shop ID
    const sampleShop = await db.query.shops.findFirst({
      where: eq(shops.slug, "sample-electronics"),
    });

    const shopId = sampleShop?.id || "global";

    // Define categories to seed
    const categoriesToSeed = [
      // Level 0 Categories (Main Categories)
      {
        id: "cat-electronics",
        name: "Electronics",
        slug: "electronics",
        description:
          "Latest gadgets, smartphones, laptops, and electronic accessories",
        image:
          "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
        icon: "📱",
        level: 0,
        productCount: 245,
        isActive: true,
        featured: true,
        sortOrder: 1,
      },
      {
        id: "cat-fashion",
        name: "Fashion",
        slug: "fashion",
        description: "Trendy clothing, shoes, and accessories for all ages",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
        icon: "👕",
        level: 0,
        productCount: 432,
        isActive: true,
        featured: true,
        sortOrder: 2,
      },
      {
        id: "cat-home-living",
        name: "Home & Living",
        slug: "home-living",
        description:
          "Furniture, decor, kitchen essentials, and home improvement",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        icon: "🏠",
        level: 0,
        productCount: 189,
        isActive: true,
        featured: true,
        sortOrder: 3,
      },
      {
        id: "cat-sports-outdoors",
        name: "Sports & Outdoors",
        slug: "sports-outdoors",
        description: "Sports equipment, activewear, and outdoor adventure gear",
        image:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
        icon: "⚽",
        level: 0,
        productCount: 156,
        isActive: true,
        featured: false,
        sortOrder: 4,
      },
      {
        id: "cat-books-media",
        name: "Books & Media",
        slug: "books-media",
        description: "Books, movies, music, and educational content",
        image:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
        icon: "📚",
        level: 0,
        productCount: 523,
        isActive: true,
        featured: false,
        sortOrder: 5,
      },
      {
        id: "cat-beauty-health",
        name: "Beauty & Health",
        slug: "beauty-health",
        description: "Skincare, makeup, health supplements, and personal care",
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
        icon: "💄",
        level: 0,
        productCount: 278,
        isActive: true,
        featured: false,
        sortOrder: 6,
      },

      // Level 1 Categories (Subcategories)
      // Electronics Subcategories
      {
        id: "cat-smartphones",
        name: "Smartphones",
        slug: "smartphones",
        description: "Latest smartphones and mobile accessories",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        icon: "📱",
        parentId: "cat-electronics",
        level: 1,
        productCount: 87,
        isActive: true,
        featured: true,
        sortOrder: 1,
      },
      {
        id: "cat-laptops",
        name: "Laptops",
        slug: "laptops",
        description: "Laptops, notebooks, and computer accessories",
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
        icon: "💻",
        parentId: "cat-electronics",
        level: 1,
        productCount: 64,
        isActive: true,
        featured: true,
        sortOrder: 2,
      },
      {
        id: "cat-audio",
        name: "Audio",
        slug: "audio",
        description: "Headphones, speakers, and audio equipment",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        icon: "🎧",
        parentId: "cat-electronics",
        level: 1,
        productCount: 94,
        isActive: true,
        featured: false,
        sortOrder: 3,
      },

      // Fashion Subcategories
      {
        id: "cat-mens-clothing",
        name: "Men's Clothing",
        slug: "mens-clothing",
        description: "Clothing and apparel for men",
        image:
          "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80",
        icon: "👔",
        parentId: "cat-fashion",
        level: 1,
        productCount: 178,
        isActive: true,
        featured: true,
        sortOrder: 1,
      },
      {
        id: "cat-womens-clothing",
        name: "Women's Clothing",
        slug: "womens-clothing",
        description: "Clothing and apparel for women",
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
        icon: "👗",
        parentId: "cat-fashion",
        level: 1,
        productCount: 203,
        isActive: true,
        featured: true,
        sortOrder: 2,
      },
      {
        id: "cat-footwear",
        name: "Footwear",
        slug: "footwear",
        description: "Shoes, sandals, and footwear for all occasions",
        image:
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
        icon: "👟",
        parentId: "cat-fashion",
        level: 1,
        productCount: 51,
        isActive: true,
        featured: false,
        sortOrder: 3,
      },

      // Home & Living Subcategories
      {
        id: "cat-furniture",
        name: "Furniture",
        slug: "furniture",
        description: "Furniture for every room in your home",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        icon: "🪑",
        parentId: "cat-home-living",
        level: 1,
        productCount: 76,
        isActive: true,
        featured: true,
        sortOrder: 1,
      },
      {
        id: "cat-kitchen",
        name: "Kitchen",
        slug: "kitchen",
        description: "Kitchen appliances, cookware, and dining essentials",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
        icon: "🍳",
        parentId: "cat-home-living",
        level: 1,
        productCount: 68,
        isActive: true,
        featured: false,
        sortOrder: 2,
      },
      {
        id: "cat-decor",
        name: "Decor",
        slug: "decor",
        description: "Home decor, lighting, and decorative accessories",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        icon: "🖼️",
        parentId: "cat-home-living",
        level: 1,
        productCount: 45,
        isActive: true,
        featured: false,
        sortOrder: 3,
      },

      // Level 2 Categories (Sub-subcategories)
      // Smartphones Subcategories
      {
        id: "cat-android-phones",
        name: "Android Phones",
        slug: "android-phones",
        description: "Android smartphones from various brands",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        icon: "🤖",
        parentId: "cat-smartphones",
        level: 2,
        productCount: 52,
        isActive: true,
        featured: false,
        sortOrder: 1,
      },
      {
        id: "cat-iphones",
        name: "iPhones",
        slug: "iphones",
        description: "Apple iPhone models and accessories",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        icon: "🍎",
        parentId: "cat-smartphones",
        level: 2,
        productCount: 35,
        isActive: true,
        featured: true,
        sortOrder: 2,
      },

      // Men's Clothing Subcategories
      {
        id: "cat-mens-shirts",
        name: "Shirts",
        slug: "mens-shirts",
        description: "Casual and formal shirts for men",
        image:
          "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80",
        icon: "👔",
        parentId: "cat-mens-clothing",
        level: 2,
        productCount: 67,
        isActive: true,
        featured: false,
        sortOrder: 1,
      },
      {
        id: "cat-mens-pants",
        name: "Pants",
        slug: "mens-pants",
        description: "Jeans, trousers, and pants for men",
        image:
          "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80",
        icon: "👖",
        parentId: "cat-mens-clothing",
        level: 2,
        productCount: 54,
        isActive: true,
        featured: false,
        sortOrder: 2,
      },
    ];

    // Insert categories with shopId
    const categoriesWithShop = categoriesToSeed.map((category) => ({
      ...category,
      shopId,
    }));

    await db
      .insert(categories)
      .values(categoriesWithShop)
      .onConflictDoNothing();
    console.log("✅ Categories seeded successfully");

    console.log("🎉 Categories seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories();
}

export { seedCategories };
