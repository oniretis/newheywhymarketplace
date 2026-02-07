import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { shops } from "./shop-schema";

export const staff = pgTable(
  "staff",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "admin", "manager", "staff"
    status: text("status").notNull().default("active"), // "active", "invited", "inactive"
    joinedDate: timestamp("joined_date").defaultNow().notNull(),
    permissions: text("permissions").array(), // Array of permission strings
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("staff_userId_idx").on(table.userId),
    index("staff_shopId_idx").on(table.shopId),
    index("staff_role_idx").on(table.role),
    index("staff_status_idx").on(table.status),
  ]
);

export const staffRelations = relations(staff, ({ one }) => ({
  user: one(user, {
    fields: [staff.userId],
    references: [user.id],
  }),
  shop: one(shops, {
    fields: [staff.shopId],
    references: [shops.id],
  }),
}));

export const staffInvitations = pgTable(
  "staff_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("staff_invitations_email_idx").on(table.email),
    index("staff_invitations_shopId_idx").on(table.shopId),
    index("staff_invitations_token_idx").on(table.token),
  ]
);

export const staffInvitationsRelations = relations(
  staffInvitations,
  ({ one }) => ({
    shop: one(shops, {
      fields: [staffInvitations.shopId],
      references: [shops.id],
    }),
    invitedByUser: one(user, {
      fields: [staffInvitations.invitedBy],
      references: [user.id],
    }),
  })
);
