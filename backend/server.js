require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const designsRouter = require("./routes/designs");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Ensure uploads dir exists ────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "50mb" }));     // large for canvas JSON + thumbnails
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(uploadsDir));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/designs", designsRouter);

app.get("/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date() })
);

// ─── MongoDB + Start ──────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
