import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import redis from "./redisClient.js";
import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

async function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

async function handleJob(jobStr) {
  try {
    const job = JSON.parse(jobStr);
    if (job.type === "customer") {
      await Customer.create(job.payload);
      console.log("Inserted customer", job.payload.email || job.payload.name);
    } else if (job.type === "order") {
      await Order.create(job.payload);
      console.log("Inserted order", job.payload.amount);
    }
  } catch (err) {
    console.error("Job failed", err.message);
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Ingest worker connected to MongoDB");

  while (true) {
    try {
      const item = await redis.rpop("ingest-queue");
      if (!item) {
        await sleep(500);
        continue;
      }
      await handleJob(item);
    } catch (err) {
      console.error("Worker error", err.message);
      await sleep(1000);
    }
  }
}

run().catch(err => console.error(err));
