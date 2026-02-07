import { db } from "@/lib/db";
import { staff, staffInvitations } from "@/lib/db/schema/staff-schema";
import { user } from "@/lib/db/schema/auth-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import { eq, and, desc } from "drizzle-orm";
import type { Staff } from "@/types/staff";
import { randomUUID } from "crypto";

// Get all staff members for a shop
export async function getStaffByShop(shopId: string): Promise<Staff[]> {
  const staffRecords = await db
    .select({
      id: staff.id,
      name: user.name,
      email: user.email,
      role: staff.role,
      status: staff.status,
      joinedDate: staff.joinedDate,
      avatar: user.image,
    })
    .from(staff)
    .leftJoin(user, eq(staff.userId, user.id))
    .where(eq(staff.shopId, shopId))
    .orderBy(desc(staff.createdAt));

  return staffRecords.map((record) => ({
    id: record.id,
    name: record.name || "",
    email: record.email || "",
    role: record.role as "admin" | "manager" | "staff",
    status: record.status as "active" | "invited" | "inactive",
    joinedDate: record.joinedDate.toISOString(),
    avatar: record.avatar || undefined,
  }));
}

// Get all staff members (admin view - across all shops)
export async function getAllStaff(): Promise<Staff[]> {
  try {
    // First try to get staff records without JOIN
    const staffRecords = await db
      .select()
      .from(staff)
      .orderBy(desc(staff.createdAt));

    console.log("Raw staff records:", staffRecords.length);

    if (staffRecords.length === 0) {
      return [];
    }

    // Then get user data for each staff member
    const result = [];
    for (const staffRecord of staffRecords) {
      const userData = await db
        .select()
        .from(user)
        .where(eq(user.id, staffRecord.userId))
        .limit(1);

      if (userData.length > 0) {
        result.push({
          id: staffRecord.id,
          name: userData[0].name || "",
          email: userData[0].email || "",
          role: staffRecord.role as "admin" | "manager" | "staff",
          status: staffRecord.status as "active" | "invited" | "inactive",
          joinedDate: staffRecord.joinedDate.toISOString(),
          avatar: userData[0].image || undefined,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error in getAllStaff:", error);
    return [];
  }
}

// Add a new staff member
export async function addStaffMember(data: {
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "invited" | "inactive";
  shopId: string;
}) {
  // Check if shop exists, if not create default shop with vendor
  const existingShop = await db
    .select()
    .from(shops)
    .where(eq(shops.id, data.shopId))
    .limit(1);

  if (existingShop.length === 0) {
    console.log("Creating default vendor and shop:", data.shopId);

    // First create a vendor
    const vendorId = randomUUID();
    const vendorUserId = randomUUID();
    await db.insert(vendors).values({
      id: vendorId,
      userId: vendorUserId,
      businessName: "Default Vendor",
      commissionRate: "10.00",
      status: "active",
      contactEmail: "vendor@example.com",
      contactPhone: "+1234567890",
      address: "123 Vendor St",
    });

    // Then create the shop
    await db.insert(shops).values({
      id: data.shopId,
      vendorId,
      name: "Default Shop",
      description: "Default shop created automatically",
      slug: data.shopId,
      email: "shop@example.com",
      phone: "+1234567890",
      address: "123 Shop St",
      status: "active",
    });
  }

  // First create or get the user
  let userRecord = await db
    .select()
    .from(user)
    .where(eq(user.email, data.email))
    .limit(1);

  if (userRecord.length === 0) {
    // Create new user
    const newUsers = await db
      .insert(user)
      .values({
        id: randomUUID(),
        name: data.name,
        email: data.email,
        emailVerified: false,
        role: "staff",
      })
      .returning();
    userRecord = newUsers;
  }

  // Create staff record
  const newStaff = await db
    .insert(staff)
    .values({
      id: randomUUID(),
      userId: userRecord[0].id,
      shopId: data.shopId,
      role: data.role,
      status: data.status,
      permissions: [], // Default permissions - can be customized
    })
    .returning();

  return newStaff[0];
}

// Delete a staff member
export async function deleteStaffMember(staffId: string) {
  await db.delete(staff).where(eq(staff.id, staffId));
}

// Update staff member
export async function updateStaffMember(
  staffId: string,
  data: Partial<{
    role: "admin" | "manager" | "staff";
    status: "active" | "invited" | "inactive";
    permissions: string[];
  }>
) {
  const updatedStaff = await db
    .update(staff)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, staffId))
    .returning();

  return updatedStaff[0];
}

// Invite staff member
export async function inviteStaffMember(data: {
  email: string;
  role: "admin" | "manager" | "staff";
  shopId: string;
  invitedBy: string;
}) {
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const invitation = await db
    .insert(staffInvitations)
    .values({
      id: randomUUID(),
      email: data.email,
      shopId: data.shopId,
      role: data.role,
      invitedBy: data.invitedBy,
      token,
      expiresAt,
    })
    .returning();

  return invitation[0];
}
