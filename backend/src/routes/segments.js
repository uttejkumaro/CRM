import express from "express";
import Segment from "../models/Segment.js";
import Customer from "../models/Customer.js";
import { buildMongoQuery } from "../services/ruleCompiler.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Preview (public) - allow unauthenticated preview for quick testing
router.post("/preview", async (req, res) => {
  try {
    const tree = req.body.conditionTree;
    const q = buildMongoQuery(tree);
    const count = await Customer.countDocuments(q);
    const sample = await Customer.find(q).limit(10);
    res.json({ count, sample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create (protected)
router.post("/", requireAuth, async (req, res) => {
  try {
    const doc = await Segment.create(req.body);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List segments (public)
router.get("/", async (req, res) => {
  try {
    const docs = await Segment.find().sort({ savedAt: -1 }).limit(200).lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get segment by id (public, used for edit UX; you may protect if desired)
router.get("/:id", async (req, res) => {
  try {
    const seg = await Segment.findById(req.params.id).lean();
    if (!seg) return res.status(404).json({ error: "Segment not found" });
    res.json(seg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update segment (protected)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      description: req.body.description,
      conditionTree: req.body.conditionTree,
      savedAt: new Date()
    };
    const updated = await Segment.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Segment not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
