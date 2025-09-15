import express from "express";
import redis from "../services/redisClient.js";

const router = express.Router();

/**
 * Vendor send endpoint (simulator).
 * This route still simulates async delivery by calling back to /api/vendor/receipt (simulated),
 * but the receipt route will now enqueue the receipt for batch processing.
 */
router.post("/send", async (req, res) => {
  const { commLogId, message } = req.body;
  // simulate async delivery result
  setTimeout(async () => {
    const isSent = Math.random() < 0.9;
    try {
      // Instead of updating DB here, call the receipt endpoint locally (simulated vendor callback)
      // The receipt endpoint will enqueue the receipt for batch processing.
      await fetch((process.env.VENDOR_CALLBACK_URL || "http://localhost:4000/api/vendor/receipt"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commLogId, status: isSent ? "SENT" : "FAILED" }),
      }).catch(err => {
        console.error("Vendor simulator callback failed:", err.message || err);
      });
    } catch (err) {
      console.error("vendor simulator error", err.message);
    }
  }, Math.random() * 2000 + 200);

  res.json({ status: "ACCEPTED" });
});

/**
 * Receipt endpoint - vendor calls this to report delivery result.
 * Instead of immediately writing to DB, enqueue the receipt for batch processing by receiptWorker.
 * Body: { commLogId, status } where status is "SENT" or "FAILED"
 */
router.post("/receipt", async (req, res) => {
  try {
    const { commLogId, status } = req.body;
    if (!commLogId || !status) return res.status(400).json({ error: "commLogId and status required" });

    // enqueue minimal receipt payload
    const payload = JSON.stringify({ commLogId, status, ts: new Date().toISOString() });
    await redis.lpush("receipts-queue", payload);

    // return quickly to vendor
    res.json({ ok: true, queued: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
