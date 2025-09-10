import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import redis from "./redisClient.js";
import CommLog from "../models/CommLog.js";
import Customer from "../models/Customer.js";
import { callVendorSend } from "./vendorService.js";

async function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

async function processItem(logId) {
  const log = await CommLog.findById(logId);
  if (!log || log.status !== "PENDING") return;

  const customer = await Customer.findById(log.customerId);
  if (!customer) return;

  const message = `Hi ${customer.name || ""}, this is a campaign message.`;

  await callVendorSend(message, log._id);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Worker connected to MongoDB");

  while (true) {
    try {
      const item = await redis.rpop("delivery-queue");
      if (!item) {
        await sleep(400);
        continue;
      }
      await processItem(item);
    } catch (err) {
      console.error("Worker error", err.message);
      await sleep(1000);
    }
  }
}

run().catch(err => console.error(err));
