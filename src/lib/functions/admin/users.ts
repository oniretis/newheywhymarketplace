import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";
import { eq, desc, count } from "drizzle-orm";
import type { User, UserFormValues } from "@/types/users";
import { nanoid } from "nanoid";

export async function getUsers(): Promise<User[]> {
  try {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .orderBy(desc(user.createdAt));

    // Transform database users to match the User interface
    return users.map((dbUser) => ({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.image || undefined,
      totalOrders: 0, // TODO: Calculate from orders table when implemented
      totalSpent: "$0.00", // TODO: Calculate from orders table when implemented
      status: dbUser.banned
        ? "suspended"
        : dbUser.emailVerified
          ? "active"
          : "inactive",
      createdAt: dbUser.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const dbUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!dbUser[0]) return null;

    return {
      id: dbUser[0].id,
      name: dbUser[0].name,
      email: dbUser[0].email,
      avatar: dbUser[0].image || undefined,
      totalOrders: 0, // TODO: Calculate from orders table when implemented
      totalSpent: "$0.00", // TODO: Calculate from orders table when implemented
      status: dbUser[0].banned
        ? "suspended"
        : dbUser[0].emailVerified
          ? "active"
          : "inactive",
      createdAt: dbUser[0].createdAt,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Failed to fetch user");
  }
}

export async function createUser(userData: UserFormValues): Promise<User> {
  try {
    const userId = nanoid();

    // Determine emailVerified and banned based on status
    const emailVerified = userData.status === "active";
    const banned = userData.status === "suspended";

    const newUser = await db
      .insert(user)
      .values({
        id: userId,
        name: userData.name,
        email: userData.email,
        emailVerified,
        banned,
        role: "user", // Default role
      })
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        emailVerified: user.emailVerified,
      });

    const dbUser = newUser[0];

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.image || undefined,
      totalOrders: 0, // TODO: Calculate from orders table when implemented
      totalSpent: "$0.00", // TODO: Calculate from orders table when implemented
      status: dbUser.banned
        ? "suspended"
        : dbUser.emailVerified
          ? "active"
          : "inactive",
      createdAt: dbUser.createdAt,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function updateUser(
  id: string,
  userData: Partial<UserFormValues>
): Promise<User> {
  try {
    // Determine emailVerified and banned based on status
    const emailVerified =
      userData.status === "active"
        ? true
        : userData.status === "inactive"
          ? false
          : undefined;
    const banned =
      userData.status === "suspended"
        ? true
        : userData.status === "active" || userData.status === "inactive"
          ? false
          : undefined;

    const updatedUser = await db
      .update(user)
      .set({
        ...(userData.name && { name: userData.name }),
        ...(userData.email && { email: userData.email }),
        ...(emailVerified !== undefined && { emailVerified }),
        ...(banned !== undefined && { banned }),
      })
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        emailVerified: user.emailVerified,
      });

    if (!updatedUser[0]) {
      throw new Error("User not found");
    }

    const dbUser = updatedUser[0];

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.image || undefined,
      totalOrders: 0, // TODO: Calculate from orders table when implemented
      totalSpent: "$0.00", // TODO: Calculate from orders table when implemented
      status: dbUser.banned
        ? "suspended"
        : dbUser.emailVerified
          ? "active"
          : "inactive",
      createdAt: dbUser.createdAt,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await db.delete(user).where(eq(user.id, id));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function getUserStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
}> {
  try {
    const [totalResult, activeResult, inactiveResult, suspendedResult] =
      await Promise.all([
        db.select({ count: count() }).from(user),
        db
          .select({ count: count() })
          .from(user)
          .where(eq(user.emailVerified, true)),
        db
          .select({ count: count() })
          .from(user)
          .where(eq(user.emailVerified, false)),
        db.select({ count: count() }).from(user).where(eq(user.banned, true)),
      ]);

    return {
      totalUsers: totalResult[0].count,
      activeUsers: activeResult[0].count,
      inactiveUsers: inactiveResult[0].count,
      suspendedUsers: suspendedResult[0].count,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw new Error("Failed to fetch user stats");
  }
}
