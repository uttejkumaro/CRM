import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import redis from "./redisClient.js";
import CommLog from "../models/CommLog.js";
import Campaign from "../models/Campaign.js";

const BATCH_SIZE = Number(process.env.RECEIPT_BATCH_SIZE) || 50;
const FLUSH_INTERVAL_MS = Number(process.env.RECEIPT_FLUSH_MS) || 2000;

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function processBatch(batch) {
  if (!batch.length) return;
  // parse receipts
  const receipts = batch.map(b => {
    try { return JSON.parse(b); } catch { return null; }
  }).filter(Boolean);

  // Map campaign updates: campaignId -> { sentDelta, failedDelta }
  const campaignDeltas = new Map();

  // We'll perform updates for commlogs individually but using bulkWrite for efficiency
  const bulkOps = receipts.map(r => {
    const isSent = (r.status === "SENT");
    // record delta to campaign stats if we can discover campaignId from commlog later
    return {
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId(r.commLogId) },
        update: { $set: { status: r.status, lastUpdated: new Date() }, $inc: { attemptCount: 1 } }
      }
    };
  });

  try {
    if (bulkOps.length) {
      // apply commlog bulk updates
      const res = await CommLog.bulkWrite(bulkOps, { ordered: false });
      // After updating commlogs, fetch the commlog docs to know campaign ids and statuses
      const commLogIds = receipts.map(r => mongoose.Types.ObjectId(r.commLogId));
      const logs = await CommLog.find({ _id: { $in: commLogIds } }).lean();

      // build campaign deltas and apply campaign updates in bulk
      for (const l of logs) {
        if (!l.campaignId) continue;
        const wasSent = l.status === "SENT";
        // we will increment campaign.stats.sent or failed based on status
        let delta = campaignDeltas.get(String(l.campaignId)) || { sent: 0, failed: 0 };
        if (l.status === "SENT") delta.sent += 1;
        else delta.failed += 1;
        campaignDeltas.set(String(l.campaignId), delta);
      }

      // apply campaign deltas (bulk)
      const campaignOps = [];
      for (const [cid, d] of campaignDeltas.entries()) {
        campaignOps.push({
          updateOne: {
            filter: { _id: mongoose.Types.ObjectId(cid) },
            update: { $inc: { "stats.sent": d.sent, "stats.failed": d.failed } }
          }
        });
      }
      if (campaignOps.length) await Campaign.bulkWrite(campaignOps, { ordered: false });
    }
  } catch (err) {
    console.error("receiptWorker batch process error", err.message || err);
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Receipt worker connected to MongoDB");

  let buffer = [];
  let lastFlush = Date.now();

  while (true) {
    try {
      const item = await redis.rpop("receipts-queue");
      if (item) {
        buffer.push(item);
      }

      const now = Date.now();
      if (buffer.length >= BATCH_SIZE || (buffer.length > 0 && (now - lastFlush) >= FLUSH_INTERVAL_MS)) {
        const toProcess = buffer.splice(0, buffer.length);
        await processBatch(toProcess);
        lastFlush = Date.now();
      }

      if (!item) await sleep(200);
    } catch (err) {
      console.error("receiptWorker error", err.message || err);
      await sleep(1000);
    }
  }
}

run().catch(err => console.error("receiptWorker failed", err));
