import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema/brand-schema";
import { categories } from "@/lib/db/schema/category-schema";
import { productImages, products } from "@/lib/db/schema/products-schema";
import { shops } from "@/lib/db/schema/shop-schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const PRODUCT_NAMES = [
  "Wireless Bluetooth Headphones",
  "Smart Watch Series 5",
  "Ultra HD 4K Webcam",
  "Mechanical Gaming Keyboard",
  "Portable Power Bank 20000mAh",
  "Wireless Charging Pad",
  "USB-C Hub Adapter",
  "Laptop Stand Aluminum",
  "Wireless Mouse Ergonomic",
  "Bluetooth Speaker Waterproof",
  "Smartphone Camera Lens Kit",
  "Tablet Screen Protector",
  "Gaming Mouse Pad XXL",
  "Cable Management Organizer",
  "LED Desk Lamp Smart",
  "External SSD 1TB",
  "HDMI Cable 4K",
  "Wireless Earbuds Pro",
  "Smart Home Hub",
  "Fitness Tracker Band",
];

const BRAND_NAMES = [
  "TechPro",
  "SoundMax",
  "PowerTech",
  "SmartGear",
  "DigitalLife",
  "ConnectPro",
  "EcoTech",
  "MegaTech",
  "InnoTech",
  "CoreTech",
];

const DESCRIPTIONS = [
  "Premium quality product with advanced features and modern design. Perfect for everyday use with exceptional durability and performance.",
  " cutting-edge technology meets sleek design. This product offers unmatched quality and reliability for all your needs.",
  "Experience innovation at its finest. Crafted with precision and attention to detail for the ultimate user experience.",
  "Professional grade equipment designed for enthusiasts and experts alike. Built to last and perform under any conditions.",
  "Revolutionary product that sets new standards in quality and functionality. A must-have for modern lifestyles.",
];

async function seedProducts() {
  try {
    console.log("🌱 Starting to seed products...");

    // Get or create sample shop
    const sampleShop = await db.query.shops.findFirst({
      where: eq(shops.slug, "sample-electronics"),
    });

    let shopId = sampleShop?.id;
    if (!shopId) {
      // Create a sample shop if it doesn't exist
      const newShop = await db
        .insert(shops)
        .values({
          id: uuidv4(),
          vendorId: "sample-vendor", // This would need to reference a real vendor
          name: "Sample Electronics Store",
          slug: "sample-electronics",
          description: "A sample electronics store for demonstration",
          logo: "https://placehold.co/100x100?text=SE",
          banner:
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
          email: "info@sampleelectronics.com",
          phone: "+1-555-0123",
          address: "123 Main St, City, State 12345",
        })
        .returning();
      shopId = newShop[0].id;
    }

    // Get categories
    const allCategories = await db.query.categories.findMany();
    if (allCategories.length === 0) {
      console.log("⚠️  No categories found. Please seed categories first.");
      return;
    }

    // Get or create brands
    const existingBrands = await db.query.brands.findMany();
    const brandIds = existingBrands.map((b) => b.id);

    if (brandIds.length < BRAND_NAMES.length) {
      for (const brandName of BRAND_NAMES) {
        const existingBrand = existingBrands.find((b) => b.name === brandName);
        if (!existingBrand) {
          const newBrand = await db
            .insert(brands)
            .values({
              id: uuidv4(),
              name: brandName,
              slug: brandName.toLowerCase().replace(/\s+/g, "-"),
              description: `${brandName} - Quality electronics and accessories`,
              logo: `https://placehold.co/100x100?text=${brandName[0]}`,
              isActive: true,
              sortOrder: 0,
            })
            .returning();
          brandIds.push(newBrand[0].id);
        }
      }
    }

    // Create products
    const productsToSeed = PRODUCT_NAMES.map((productName, index) => {
      const categoryId = allCategories[index % allCategories.length].id;
      const brandId = brandIds[index % brandIds.length];
      const productId = uuidv4();

      const basePrice = Math.floor(Math.random() * 900) + 50; // $50-$950
      const hasDiscount = Math.random() > 0.7;
      const discountPercent = hasDiscount
        ? [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)]
        : 0;
      const sellingPrice = hasDiscount
        ? Math.round(basePrice * (1 - discountPercent / 100))
        : basePrice;

      return {
        id: productId,
        shopId,
        name: productName,
        slug: productName.toLowerCase().replace(/\s+/g, "-"),
        sku: `SKU-${String(index + 1).padStart(6, "0")}`,
        description: DESCRIPTIONS[index % DESCRIPTIONS.length],
        shortDescription: `High-quality ${productName.toLowerCase()} with premium features.`,
        sellingPrice: sellingPrice.toString(),
        regularPrice: hasDiscount ? basePrice.toString() : null,
        costPrice: Math.round(basePrice * 0.6).toString(), // 60% of base price
        stock: Math.floor(Math.random() * 100) + 10, // 10-110 units
        lowStockThreshold: 5,
        trackInventory: true,
        categoryId,
        brandId,
        status: "active" as const,
        productType: "simple" as const,
        isFeatured: Math.random() > 0.8, // 20% featured
        metaTitle: productName,
        metaDescription: `Buy ${productName} online - Best prices and fast shipping`,
        averageRating: (Math.random() * 2 + 3).toFixed(2), // 3.0-5.0 as string
        reviewCount: Math.floor(Math.random() * 100) + 5, // 5-105 reviews
      };
    });

    // Insert products
    await db.insert(products).values(productsToSeed).onConflictDoNothing();
    console.log(`✅ ${productsToSeed.length} products seeded successfully`);

    // Create product images
    const imagesToSeed = productsToSeed.flatMap((product) => {
      const images = [];
      for (let i = 1; i <= 3; i++) {
        images.push({
          id: uuidv4(),
          productId: product.id,
          url: `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}&color=${i === 1 ? "4f46e5" : i === 2 ? "06b6d4" : "10b981"}`,
          alt: `${product.name} - Image ${i}`,
          sortOrder: i - 1,
          isPrimary: i === 1,
        });
      }
      return images;
    });

    await db.insert(productImages).values(imagesToSeed).onConflictDoNothing();
    console.log(`✅ ${imagesToSeed.length} product images seeded successfully`);

    console.log("🎉 Products seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
}

// Run seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts();
}

export { seedProducts };
