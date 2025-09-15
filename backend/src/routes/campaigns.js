import express from "express";
const router = express.Router();

import Campaign from "../models/Campaign.js";
import CommLog from "../models/CommLog.js";
import Segment from "../models/Segment.js";
import Customer from "../models/Customer.js";
import redis from "../services/redisClient.js";
import { buildMongoQuery } from "../services/ruleCompiler.js";
import requireAuth from "../middleware/authMiddleware.js";

// Create campaign (protected)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, messageTemplate, segmentId } = req.body;
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(400).json({ error: "Segment not found" });

    const q = buildMongoQuery(segment.conditionTree);
    const customers = await Customer.find(q).select("_id").lean();

    const campaign = await Campaign.create({ title, messageTemplate, segmentId, audienceSize: customers.length, status: "running" });

    // create comm logs
    const logs = customers.map(c => ({ campaignId: campaign._id, customerId: c._id }));
    const inserted = await CommLog.insertMany(logs);

    // enqueue each log (use redis client)
    for (const l of inserted) {
      try {
        await redis.lpush("delivery-queue", l._id.toString());
      } catch (e) {
        console.warn("Redis push failed (fallback may be stub):", e.message || e);
      }
    }

    res.json({ campaignId: campaign._id, audience: customers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List campaigns (protected - only logged-in users can view campaigns)
router.get("/", requireAuth, async (req, res) => {
  try {
    const list = await Campaign.find().sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Campaign logs (protected)
router.get("/:id/logs", requireAuth, async (req, res) => {
  try {
    const logs = await CommLog.find({ campaignId: req.params.id }).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retry a comm log: mark PENDING, increment attempt, re-enqueue (protected)
router.post("/:campaignId/logs/:logId/retry", requireAuth, async (req, res) => {
  try {
    const { campaignId, logId } = req.params;
    const log = await CommLog.findById(logId);
    if (!log) return res.status(404).json({ error: "CommLog not found" });

    // set status to PENDING and increment attemptCount
    log.status = "PENDING";
    log.attemptCount = (log.attemptCount || 0) + 1;
    log.lastUpdated = new Date();
    await log.save();

    // re-enqueue log id
    try {
      await redis.lpush("delivery-queue", log._id.toString());
    } catch (e) {
      console.warn("Redis push failed on retry:", e.message || e);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
