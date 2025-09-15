import dotenv from "dotenv";

// Load .env immediately so ALL modules (including redis client) can read env vars
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  app.listen(PORT, () => console.log(`Server listening ${PORT}`));
}

import("./services/ingestWorker.js")
  .then(() => console.log("Ingest worker started inside backend service"))
  .catch(err => console.error("Ingest worker failed:", err));

import("./services/deliveryWorker.js")
  .then(() => console.log("Delivery worker started inside backend service"))
  .catch(err => console.error("Delivery worker failed:", err));

import("./services/receiptWorker.js")
  .then(() => console.log("Receipt worker started inside backend service"))
  .catch(err => console.error("Receipt worker failed:", err));

start().catch(err => {
  console.error(err);
  process.exit(1);
});
