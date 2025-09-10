import express from "express";
import CommLog from "../models/CommLog.js";
import Campaign from "../models/Campaign.js";

const router = express.Router();

// Vendor endpoint that receives a send request (simulator). It will asynchronously update the comm log (simulating callback).
router.post("/send", async (req, res) => {
  // req: { commLogId, message }
  const { commLogId } = req.body;
  // Simulate async delivery with random result
  setTimeout(async () => {
    const isSent = Math.random() < 0.9;
    try {
      // update the comm log directly for simplicity
      await CommLog.findByIdAndUpdate(commLogId, {
        status: isSent ? "SENT" : "FAILED",
        lastUpdated: new Date(),
        attemptCount: 1
      });

      // update campaign stats
      const log = await CommLog.findById(commLogId);
      if (log) {
        const campaign = await Campaign.findById(log.campaignId);
        if (campaign) {
          if (isSent) campaign.stats.sent += 1;
          else campaign.stats.failed += 1;
          await campaign.save();
        }
      }
    } catch (err) {
      console.error("vendor simulator error", err.message);
    }
  }, Math.random() * 2000 + 200); // 200-2200ms

  res.json({ status: "ACCEPTED" });
});

// Realistic receipt endpoint (if an external vendor called back)
router.post("/receipt", async (req, res) => {
  const { commLogId, status } = req.body;
  try {
    const isSent = status === "SENT";
    await CommLog.findByIdAndUpdate(commLogId, { status: isSent ? "SENT" : "FAILED", lastUpdated: new Date() });

    const log = await CommLog.findById(commLogId);
    if (log) {
      const campaign = await Campaign.findById(log.campaignId);
      if (campaign) {
        if (isSent) campaign.stats.sent += 1;
        else campaign.stats.failed += 1;
        await campaign.save();
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
