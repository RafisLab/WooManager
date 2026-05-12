import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: admin.firestore.Firestore;
let SETTINGS_DOC = "settings/app";

async function startServer() {
  console.log("Starting server function called...");
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_me_in_env";

  // Initialize Firebase Admin inside startServer
  const configPath = path.join(__dirname, "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
        console.log("Firebase Admin initialized for project:", firebaseConfig.projectId);
      }
      db = admin.firestore(firebaseConfig.firestoreDatabaseId);
      console.log("Firestore initialized for database:", firebaseConfig.firestoreDatabaseId);
    } catch (fbErr) {
      console.error("Firebase Admin initialization failed:", fbErr);
    }
  } else {
    console.warn("Firebase config file not found - app will run in unconfigured mode");
  }

  app.use(express.json());

  // Health check at the very top
  app.get("/api/health", (req, res) => {
    console.log("Health check pinged");
    res.json({ status: "ok", timestamp: new Date().toISOString(), db_initialized: !!db });
  });

  const getAppState = async () => {
    if (!db) {
      console.warn("DB not initialized yet");
      return null;
    }
    try {
      const doc = await db.doc(SETTINGS_DOC).get();
      if (!doc.exists) {
        return {
          isConfigured: false,
          hashedPin: "",
          wooConfig: { url: "", consumerKey: "", consumerSecret: "" }
        };
      }
      return doc.data();
    } catch (err) {
      console.error("Error reading from Firestore:", err);
      return null;
    }
  };

  const updateAppState = async (data: any) => {
    if (!db) throw new Error("Database not initialized");
    await db.doc(SETTINGS_DOC).set(data, { merge: true });
  };

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get("/api/config-status", async (req, res) => {
    console.log("Fetching config status...");
    const state = await getAppState();
    res.json({ isConfigured: state?.isConfigured || false });
  });

  app.post("/api/setup", async (req, res) => {
    console.log("Setup request received");
    const { pin, wooConfig } = req.body;
    const state = await getAppState();
    if (state?.isConfigured) {
      return res.status(400).json({ error: "Already configured" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);
    
    await updateAppState({
      hashedPin,
      wooConfig,
      isConfigured: true
    });

    res.json({ success: true });
  });

  app.post("/api/login", async (req, res) => {
    console.log("Login attempt received");
    const { pin } = req.body;
    const state = await getAppState();
    if (!state?.isConfigured) {
      return res.status(400).json({ error: "App not configured" });
    }

    const validPin = await bcrypt.compare(pin, state.hashedPin);
    if (validPin) {
      const token = jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid PIN" });
    }
  });

  app.get("/api/orders", authenticateToken, async (req, res) => {
    const state = await getAppState();
    const wooConfig = state?.wooConfig;
    if (!wooConfig?.url) return res.status(400).json({ error: "WooCommerce not configured" });

    try {
      console.log(`Fetching orders from ${wooConfig.url}`);
      const response = await fetch(`${wooConfig.url}/wp-json/wc/v3/orders?consumer_key=${wooConfig.consumerKey}&consumer_secret=${wooConfig.consumerSecret}`);
      if (!response.ok) throw new Error(`WooCommerce API error: ${response.statusText}`);
      const orders = await response.json();
      res.json({ orders });
    } catch (err: any) {
      console.error("Order fetch error:", err.message);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.put("/api/orders/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const state = await getAppState();
    const wooConfig = state?.wooConfig;
    if (!wooConfig?.url) return res.status(400).json({ error: "WooCommerce not configured" });

    try {
      console.log(`Updating order ${id} status to ${status}`);
      const response = await fetch(`${wooConfig.url}/wp-json/wc/v3/orders/${id}?consumer_key=${wooConfig.consumerKey}&consumer_secret=${wooConfig.consumerSecret}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("WooCommerce API update error");
      const updatedOrder = await response.json();
      res.json(updatedOrder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.post("/api/update-settings", authenticateToken, async (req, res) => {
    const { wooConfig, newPin } = req.body;
    const updateData: any = {};
    
    if (wooConfig) {
      updateData.wooConfig = wooConfig;
    }
    
    if (newPin) {
      const salt = await bcrypt.genSalt(10);
      updateData.hashedPin = await bcrypt.hash(newPin, salt);
    }

    await updateAppState(updateData);
    res.json({ success: true });
  });

  app.get("/api/settings", authenticateToken, async (req, res) => {
    const state = await getAppState();
    const wooConfig = state?.wooConfig;
    res.json({ 
      url: wooConfig?.url,
      consumerKey: wooConfig?.consumerKey,
      consumerSecret: wooConfig?.consumerSecret
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware setup complete.");
    } catch (viteError) {
      console.error("Failed to start Vite server:", viteError);
    }
  } else {
    console.log("Production mode: serving static files from dist/");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
