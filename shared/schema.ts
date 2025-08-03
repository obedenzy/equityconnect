import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["buyer", "investor"]);
export const investmentTierEnum = pgEnum("investment_tier", ["starter", "growth", "scale", "enterprise"]);
export const marketTypeEnum = pgEnum("market_type", ["business", "real_estate"]);
export const returnTypeEnum = pgEnum("return_type", ["repayment", "equity", "both"]);
export const listingStatusEnum = pgEnum("listing_status", ["active", "pending", "closed", "expired"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  phone: text("phone"),
  bio: text("bio"),
  stripeCustomerId: text("stripe_customer_id"),
  preferredReturnType: returnTypeEnum("preferred_return_type"),
  investmentFocus: text("investment_focus").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  tier: investmentTierEnum("tier").notNull(),
  marketType: marketTypeEnum("market_type").notNull(),
  location: text("location"),
  industryType: text("industry_type"),
  expectedReturns: text("expected_returns"),
  timeframe: text("timeframe"),
  status: listingStatusEnum("status").default("pending").notNull(),
  featured: boolean("featured").default(false),
  listingFee: decimal("listing_fee", { precision: 10, scale: 2 }).notNull(),
  paymentIntentId: text("payment_intent_id"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  documentType: text("document_type").notNull(), // 'loi' or 'termsheet'
  isRedacted: boolean("is_redacted").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const documentAccess = pgTable("document_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  investorId: varchar("investor_id").notNull().references(() => users.id),
  canView: boolean("can_view").default(false),
  canDownload: boolean("can_download").default(false),
  verificationCode: text("verification_code"),
  codeExpiresAt: timestamp("code_expires_at"),
  accessGrantedAt: timestamp("access_granted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  investorId: varchar("investor_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  status: messageStatusEnum("status").default("sent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoCallRequests = pgTable("video_call_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  agenda: text("agenda"),
  meetingLink: text("meeting_link"),
  status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'declined', 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  sentMessages: many(messages),
  documentAccess: many(documentAccess),
  buyerConversations: many(conversations, { relationName: "buyerConversations" }),
  investorConversations: many(conversations, { relationName: "investorConversations" }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  buyer: one(users, {
    fields: [listings.buyerId],
    references: [users.id],
  }),
  documents: many(documents),
  conversations: many(conversations),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  listing: one(listings, {
    fields: [documents.listingId],
    references: [listings.id],
  }),
  access: many(documentAccess),
}));

export const documentAccessRelations = relations(documentAccess, ({ one }) => ({
  document: one(documents, {
    fields: [documentAccess.documentId],
    references: [documents.id],
  }),
  investor: one(users, {
    fields: [documentAccess.investorId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  listing: one(listings, {
    fields: [conversations.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [conversations.buyerId],
    references: [users.id],
    relationName: "buyerConversations",
  }),
  investor: one(users, {
    fields: [conversations.investorId],
    references: [users.id],
    relationName: "investorConversations",
  }),
  messages: many(messages),
  videoCallRequests: many(videoCallRequests),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const videoCallRequestsRelations = relations(videoCallRequests, ({ one }) => ({
  conversation: one(conversations, {
    fields: [videoCallRequests.conversationId],
    references: [conversations.id],
  }),
  requester: one(users, {
    fields: [videoCallRequests.requesterId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  paymentIntentId: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertVideoCallRequestSchema = createInsertSchema(videoCallRequests).omit({
  id: true,
  createdAt: true,
  status: true,
  meetingLink: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type VideoCallRequest = typeof videoCallRequests.$inferSelect;
export type InsertVideoCallRequest = z.infer<typeof insertVideoCallRequestSchema>;
