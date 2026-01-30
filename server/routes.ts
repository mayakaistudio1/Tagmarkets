import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { registerLiveAvatarRoutes } from "./integrations/liveavatar";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register LiveAvatar routes
  registerLiveAvatarRoutes(app);
  
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
