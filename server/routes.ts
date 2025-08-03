import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertListingSchema, insertMessageSchema, insertVideoCallRequestSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Tier pricing structure
const TIER_PRICING = {
  starter: 500,
  growth: 1000,
  scale: 2500,
  enterprise: 5000,
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Listings routes
  app.post("/api/listings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "buyer") {
      return res.sendStatus(401);
    }

    try {
      const listingData = insertListingSchema.parse({
        ...req.body,
        buyerId: req.user.id,
        listingFee: TIER_PRICING[req.body.tier as keyof typeof TIER_PRICING],
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      const listing = await storage.createListing(listingData);
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/listings", async (req, res) => {
    try {
      const { tier, marketType, returnType } = req.query;
      const listings = await storage.getActiveListings({
        tier: tier as string,
        marketType: marketType as string,
        returnType: returnType as string,
      });
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/listings/my", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "buyer") {
      return res.sendStatus(401);
    }

    try {
      const listings = await storage.getListingsByBuyer(req.user.id);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListingById(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { listingId, tier } = req.body;
      const amount = TIER_PRICING[tier as keyof typeof TIER_PRICING];

      if (!amount) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: "usd",
        metadata: {
          listingId,
          buyerId: req.user.id,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/confirm-payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { paymentIntentId, listingId } = req.body;
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        // Update listing status to active
        await storage.updateListingStatus(listingId, "active", paymentIntentId);
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment not completed" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Document access routes
  app.post("/api/documents/:documentId/grant-access", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { documentId } = req.params;
      const { investorId, canView = true, canDownload = false } = req.body;

      await storage.grantDocumentAccess(documentId, investorId, canView, canDownload);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/documents/:documentId/access", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "investor") {
      return res.sendStatus(401);
    }

    try {
      const { documentId } = req.params;
      const hasAccess = await storage.checkDocumentAccess(documentId, req.user.id);
      res.json({ hasAccess });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Conversations and messages
  app.post("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { listingId, investorId, buyerId } = req.body;
      
      const conversation = await storage.createConversation(
        listingId,
        buyerId || req.user.id,
        investorId || req.user.id
      );
      
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const conversations = await storage.getConversationsByUser(req.user.id);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video call requests
  app.post("/api/video-calls", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const requestData = insertVideoCallRequestSchema.parse({
        ...req.body,
        requesterId: req.user.id,
      });

      // Generate meeting link (mock implementation)
      const meetingLink = `https://whereby.com/equityconnect-${Date.now()}`;

      const videoCall = await storage.createVideoCallRequest(requestData);
      await storage.updateVideoCallLink(videoCall.id, meetingLink);

      res.json({ ...videoCall, meetingLink });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get tier pricing
  app.get("/api/tier-pricing", (req, res) => {
    res.json(TIER_PRICING);
  });

  const httpServer = createServer(app);
  return httpServer;
}
