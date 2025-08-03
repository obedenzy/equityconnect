import type { Express } from "express";
import { supabase } from "../lib/supabase";

export function registerStorageRoutes(app: Express) {
  // Create storage bucket if it doesn't exist
  app.post("/api/storage/create-bucket", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { bucketName, isPublic = false } = req.body;
      
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png'
        ],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, bucket: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List files in a bucket
  app.get("/api/storage/:bucketName/files", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { bucketName } = req.params;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('uploads', {
          limit: 100,
          offset: 0
        });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ files: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a file
  app.delete("/api/storage/:bucketName/files/:fileName", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { bucketName, fileName } = req.params;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([`uploads/${fileName}`]);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get signed URL for secure file access
  app.post("/api/storage/:bucketName/signed-url", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { bucketName } = req.params;
      const { filePath, expiresIn = 3600 } = req.body;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ signedUrl: data.signedUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}