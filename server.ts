import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";

const db = new Database("beardify.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    username TEXT,
    tries_left INTEGER DEFAULT 10,
    is_admin INTEGER DEFAULT 0,
    has_paid INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount INTEGER,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS style_images (
    id TEXT PRIMARY KEY,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS before_after_pairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    before_url TEXT,
    after_url TEXT
  );
`);

// Migrate stars_balance to tries_left if needed
try {
  db.prepare("ALTER TABLE users RENAME COLUMN stars_balance TO tries_left").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE users ADD COLUMN has_paid INTEGER DEFAULT 0").run();
} catch (e) {}

// Default settings
const defaultSettings = [
  ['video_try_cost', '1'],
  ['emotion_cost', '1'],
  ['viral_cost', '1'],
  ['other_beard_cost', '1'],
  ['free_tries_on_signup', '10'],
  ['logo_url', '']
];

const insertSetting = db.prepare("INSERT OR IGNORE INTO admin_settings (key, value) VALUES (?, ?)");
defaultSettings.forEach(s => insertSetting.run(s[0], s[1]));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Middleware to mock/get user from headers or query (for demo/preview)
  app.use((req, res, next) => {
    const tgId = req.headers['x-telegram-id'] || 'demo_user';
    let user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(tgId);
    if (!user) {
      const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
      const isAdmin = (userCount === 0 || tgId === 'demo_user') ? 1 : 0;
      const freeTries = db.prepare("SELECT value FROM admin_settings WHERE key = 'free_tries_on_signup'").get().value;
      db.prepare("INSERT INTO users (telegram_id, tries_left, is_admin) VALUES (?, ?, ?)").run(tgId, parseInt(freeTries), isAdmin);
      user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(tgId);
    } else if (tgId === 'demo_user') {
      if (user.is_admin === 0) {
        db.prepare("UPDATE users SET is_admin = 1 WHERE telegram_id = 'demo_user'").run();
        user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(tgId);
      }
    }
    (req as any).user = user;
    next();
  });

  // API Routes
  app.get("/api/user", (req, res) => {
    res.json((req as any).user);
  });

  app.get("/api/admin/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM admin_settings").all();
    const settingsObj = settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    const images = db.prepare("SELECT * FROM style_images").all();
    const imagesObj = images.reduce((acc: any, img: any) => {
      acc[img.id] = img.image_url;
      return acc;
    }, {});

    res.json({ settings: settingsObj, images: imagesObj });
  });

  app.get("/api/before-after", (req, res) => {
    const pairs = db.prepare("SELECT * FROM before_after_pairs").all();
    res.json(pairs);
  });

  app.post("/api/admin/before-after", (req, res) => {
    const { pairs } = req.body;
    
    db.prepare("DELETE FROM before_after_pairs").run();
    const insert = db.prepare("INSERT INTO before_after_pairs (before_url, after_url) VALUES (?, ?)");
    
    pairs.forEach((pair: any) => {
      insert.run(pair.before_url, pair.after_url);
    });

    res.json({ success: true });
  });

  app.post("/api/admin/settings", (req, res) => {
    const { settings, images } = req.body;
    
    if (settings) {
      const updateSetting = db.prepare("UPDATE admin_settings SET value = ? WHERE key = ?");
      Object.entries(settings).forEach(([key, value]) => {
        updateSetting.run(String(value), key);
      });
    }

    if (images) {
      const upsertImage = db.prepare("INSERT OR REPLACE INTO style_images (id, image_url) VALUES (?, ?)");
      Object.entries(images).forEach(([id, url]) => {
        upsertImage.run(id, String(url));
      });
    }

    res.json({ success: true });
  });

  app.post("/api/spend", (req, res) => {
    const { amount, type } = req.body;
    const user = (req as any).user;

    if (user.tries_left < amount) {
      return res.status(400).json({ error: "Not enough tries" });
    }

    db.prepare("UPDATE users SET tries_left = tries_left - ? WHERE id = ?").run(amount, user.id);
    db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, ?)").run(user.id, amount, type);

    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    res.json(updatedUser);
  });

  app.post("/api/buy-tries", (req, res) => {
    const { amount } = req.body;
    const user = (req as any).user;

    db.prepare("UPDATE users SET tries_left = tries_left + ?, has_paid = 1 WHERE id = ?").run(amount, user.id);
    db.prepare("INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, ?)").run(user.id, amount, 'buy_tries');

    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    res.json(updatedUser);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
