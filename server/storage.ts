import { users, listings, documents, documentAccess, conversations, messages, videoCallRequests, type User, type InsertUser, type Listing, type InsertListing, type Document, type InsertDocument, type Conversation, type Message, type InsertMessage, type VideoCallRequest, type InsertVideoCallRequest } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeCustomerId(userId: string, customerId: string): Promise<User>;

  // Listings
  createListing(listing: InsertListing): Promise<Listing>;
  getListingById(id: string): Promise<Listing | undefined>;
  getListingsByBuyer(buyerId: string): Promise<Listing[]>;
  getActiveListings(filters?: { tier?: string; marketType?: string; returnType?: string }): Promise<Listing[]>;
  updateListingStatus(id: string, status: string, paymentIntentId?: string): Promise<Listing>;

  // Documents
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByListing(listingId: string): Promise<Document[]>;
  grantDocumentAccess(documentId: string, investorId: string, canView: boolean, canDownload: boolean): Promise<void>;
  checkDocumentAccess(documentId: string, investorId: string): Promise<boolean>;

  // Conversations and Messages
  createConversation(listingId: string, buyerId: string, investorId: string): Promise<Conversation>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;

  // Video Calls
  createVideoCallRequest(request: InsertVideoCallRequest): Promise<VideoCallRequest>;
  updateVideoCallLink(requestId: string, meetingLink: string): Promise<VideoCallRequest>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [createdListing] = await db
      .insert(listings)
      .values(listing)
      .returning();
    return createdListing;
  }

  async getListingById(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async getListingsByBuyer(buyerId: string): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(eq(listings.buyerId, buyerId))
      .orderBy(desc(listings.createdAt));
  }

  async getActiveListings(filters?: { tier?: string; marketType?: string; returnType?: string }): Promise<Listing[]> {
    let query = db
      .select()
      .from(listings)
      .where(eq(listings.status, "active"));

    // Note: In a real implementation, you'd add proper filtering based on filters parameter
    return await query.orderBy(desc(listings.createdAt));
  }

  async updateListingStatus(id: string, status: string, paymentIntentId?: string): Promise<Listing> {
    const updateData: any = { status };
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }

    const [listing] = await db
      .update(listings)
      .set(updateData)
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [createdDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return createdDocument;
  }

  async getDocumentsByListing(listingId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.listingId, listingId));
  }

  async grantDocumentAccess(documentId: string, investorId: string, canView: boolean, canDownload: boolean): Promise<void> {
    await db
      .insert(documentAccess)
      .values({
        documentId,
        investorId,
        canView,
        canDownload,
        accessGrantedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [documentAccess.documentId, documentAccess.investorId],
        set: {
          canView,
          canDownload,
          accessGrantedAt: new Date(),
        },
      });
  }

  async checkDocumentAccess(documentId: string, investorId: string): Promise<boolean> {
    const [access] = await db
      .select()
      .from(documentAccess)
      .where(
        and(
          eq(documentAccess.documentId, documentId),
          eq(documentAccess.investorId, investorId),
          eq(documentAccess.canView, true)
        )
      );
    return !!access;
  }

  async createConversation(listingId: string, buyerId: string, investorId: string): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({ listingId, buyerId, investorId })
      .returning();
    return conversation;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.buyerId, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return createdMessage;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async createVideoCallRequest(request: InsertVideoCallRequest): Promise<VideoCallRequest> {
    const [videoCall] = await db
      .insert(videoCallRequests)
      .values(request)
      .returning();
    return videoCall;
  }

  async updateVideoCallLink(requestId: string, meetingLink: string): Promise<VideoCallRequest> {
    const [videoCall] = await db
      .update(videoCallRequests)
      .set({ meetingLink, status: "accepted" })
      .where(eq(videoCallRequests.id, requestId))
      .returning();
    return videoCall;
  }
}

export const storage = new DatabaseStorage();
