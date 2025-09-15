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
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
start().catch(err => {
  console.error(err);
  process.exit(1);
});
