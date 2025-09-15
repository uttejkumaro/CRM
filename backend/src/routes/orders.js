import express from "express";
import redis from "../services/redisClient.js";
import requireAuth from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

// Enqueue ingestion
router.post("/bulk", requireAuth, async (req, res) => {
  try {
    const orders = Array.isArray(req.body.orders) ? req.body.orders : null;
    if (!orders?.length) return res.status(400).json({ error: "Provide orders: []" });

    await Promise.all(orders.map(o =>
      redis.lpush("ingest-queue", JSON.stringify({ type: "order", payload: o }))
    ));

    res.status(202).json({ accepted: orders.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Direct insert (dev only)
router.post("/ingest/direct", requireAuth, async (req, res) => {
  try {
    const orders = Array.isArray(req.body.orders) ? req.body.orders : null;
    if (!orders) return res.status(400).json({ error: "Provide orders: []" });

    const docs = await Order.insertMany(orders);
    res.json({ inserted: docs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEW: GET /api/orders - list recent orders (protected)
router.get("/", requireAuth, async (req, res) => {
  try {
    const docs = await Order.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
