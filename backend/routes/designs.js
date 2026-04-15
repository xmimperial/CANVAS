const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Design = require("../models/Design");

// ─── Multer for image uploads ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error("Invalid file type"), ext && mime);
  },
});

// ─── POST /api/designs – Save / Create design ────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, canvasJSON, canvasSize, elements, thumbnail, tags } = req.body;

    if (!canvasJSON) {
      return res.status(400).json({ error: "canvasJSON is required" });
    }

    const design = await Design.create({
      name: name || "Untitled Design",
      canvasJSON,
      canvasSize: canvasSize || { width: 800, height: 600 },
      elements: elements || [],
      thumbnail: thumbnail || "",
      tags: tags || [],
    });

    res.status(201).json({ success: true, design });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save design", detail: err.message });
  }
});

// ─── PUT /api/designs/:id – Update existing design ───────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const design = await Design.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!design) return res.status(404).json({ error: "Design not found" });
    res.json({ success: true, design });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/designs – List all designs ─────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const designs = await Design.find(filter)
      .select("name thumbnail canvasSize tags createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Design.countDocuments(filter);
    res.json({ designs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/designs/:id – Get single design ────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: "Design not found" });
    res.json({ success: true, design });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/designs/:id ──────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) return res.status(404).json({ error: "Design not found" });
    res.json({ success: true, message: "Design deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/designs/upload-image ──────────────────────────────────────────
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

module.exports = router;
