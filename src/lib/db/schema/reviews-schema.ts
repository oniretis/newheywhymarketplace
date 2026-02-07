/**
 * Reviews Schema
 *
 * Database schema for product reviews in the multi-vendor marketplace.
 * Reviews are linked to products and customers with status management.
 */

import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { products } from "./products-schema";
import { user } from "./auth-schema";

// ============================================================================
// Enums
// ============================================================================

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "published",
  "rejected",
]);

// ============================================================================
// Reviews Table
// ============================================================================

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Review content
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),

  // Status management
  status: reviewStatusEnum("status").notNull().default("pending"),

  // Admin moderation
  adminNotes: text("admin_notes"),
  moderatedAt: timestamp("moderated_at"),
  moderatedBy: text("moderated_by").references(() => user.id, {
    onDelete: "set null",
  }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  customer: one(user, {
    fields: [reviews.customerId],
    references: [user.id],
  }),
  moderator: one(user, {
    fields: [reviews.moderatedBy],
    references: [user.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
