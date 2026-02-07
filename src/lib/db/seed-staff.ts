import { db } from "./index";
import { staff } from "./schema/staff-schema";
import { user } from "./schema/auth-schema";
import { shops } from "./schema/shop-schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function seedStaff() {
  try {
    console.log("Starting staff seed...");

    // First, check if we have any shops
    const existingShops = await db.select().from(shops).limit(1);
    console.log("Existing shops found:", existingShops.length);
    let shopId: string;

    if (existingShops.length === 0) {
      console.log("Creating default shop...");
      // Create a default shop for testing
      const newShops = await db
        .insert(shops)
        .values({
          id: "admin-shop",
          name: "Admin Shop",
          description: "Default admin shop for testing",
          slug: "admin-shop",
          email: "admin@example.com",
          phone: "+1234567890",
          address: "123 Admin St",
          city: "Admin City",
          state: "Admin State",
          country: "Admin Country",
          zipCode: "12345",
          currency: "USD",
          timezone: "UTC",
          language: "en",
          status: "active",
        })
        .returning();
      shopId = newShops[0].id;
      console.log("Created shop with ID:", shopId);
    } else {
      shopId = existingShops[0].id;
      console.log("Using existing shop with ID:", shopId);
    }

    // Create test users if they don't exist
    const testUsers = [
      {
        id: randomUUID(),
        name: "John Doe",
        email: "john@example.com",
        emailVerified: true,
        role: "admin",
      },
      {
        id: randomUUID(),
        name: "Jane Smith",
        email: "jane@example.com",
        emailVerified: true,
        role: "manager",
      },
      {
        id: randomUUID(),
        name: "Bob Johnson",
        email: "bob@example.com",
        emailVerified: true,
        role: "staff",
      },
    ];

    for (const userData of testUsers) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, userData.email))
        .limit(1);

      if (existingUser.length === 0) {
        console.log("Creating user:", userData.email);
        await db.insert(user).values(userData);
      } else {
        console.log("User already exists:", userData.email);
      }
    }

    // Create staff records
    const staffData = [
      {
        userId: (
          await db
            .select()
            .from(user)
            .where(eq(user.email, "john@example.com"))
            .limit(1)
        )[0].id,
        shopId,
        role: "admin",
        status: "active" as const,
        permissions: ["all"],
      },
      {
        userId: (
          await db
            .select()
            .from(user)
            .where(eq(user.email, "jane@example.com"))
            .limit(1)
        )[0].id,
        shopId,
        role: "manager",
        status: "active" as const,
        permissions: ["manage_products", "manage_orders", "view_reports"],
      },
      {
        userId: (
          await db
            .select()
            .from(user)
            .where(eq(user.email, "bob@example.com"))
            .limit(1)
        )[0].id,
        shopId,
        role: "staff",
        status: "invited" as const,
        permissions: ["view_products", "manage_orders"],
      },
    ];

    console.log("Creating staff records...");
    for (const staffRecord of staffData) {
      const existingStaff = await db
        .select()
        .from(staff)
        .where(eq(staff.userId, staffRecord.userId))
        .limit(1);

      if (existingStaff.length === 0) {
        console.log("Creating staff record for user:", staffRecord.userId);
        await db.insert(staff).values({
          id: randomUUID(),
          ...staffRecord,
        });
      } else {
        console.log(
          "Staff record already exists for user:",
          staffRecord.userId
        );
      }
    }

    console.log("Staff seed data created successfully!");
  } catch (error) {
    console.error("Error seeding staff data:", error);
  }
}
