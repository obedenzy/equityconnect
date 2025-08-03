import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.enum(["buyer", "investor"]),
  company: z.string().nullable(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  preferred_return_type: z.enum(["repayment", "equity", "both"]).nullable(),
  investment_focus: z.array(z.string()).default([]),
  preferred_industry: z.array(z.string()).default([]),
  preferred_location: z.string().nullable(),
  preferred_investment_range: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  password: z.string().min(6),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const listingSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  fundingAmount: z.number(),
  dealType: z.enum(["sba_loan", "non_sba_acquisition", "real_estate"]),
  industry: z.string(),
  location: z.string(),
  timeline: z.string(),
  userId: z.string(),
  status: z.enum(["active", "funded", "closed"]).default("active"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertListingSchema = listingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Listing = z.infer<typeof listingSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;

export const messageSchema = z.object({
  id: z.number(),
  senderId: z.string(),
  receiverId: z.string(),
  listingId: z.number().optional(),
  content: z.string(),
  createdAt: z.string(),
  readAt: z.string().nullable(),
});

export const insertMessageSchema = messageSchema.omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const documentSchema = z.object({
  id: z.number(),
  userId: z.string(),
  listingId: z.number().optional(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedAt: z.string(),
});

export const insertDocumentSchema = documentSchema.omit({
  id: true,
  uploadedAt: true,
});

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;