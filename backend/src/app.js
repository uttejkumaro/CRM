import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import segmentRoutes from "./routes/segments.js";
import campaignRoutes from "./routes/campaigns.js";
import vendorRoutes from "./routes/vendor.js";
import campaignsRoutes from './routes/campaigns.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/campaigns', campaignsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/segments", segmentRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/vendor", vendorRoutes);

app.get("/", (req, res) => res.json({ ok: true, time: new Date() }));

export default app;
