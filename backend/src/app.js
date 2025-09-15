import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";


// routes
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import orderRoutes from "./routes/orders.js";
import aiRoutes from "./routes/ai.js";
import segmentRoutes from "./routes/segments.js";
import campaignRoutes from "./routes/campaigns.js";
import vendorRoutes from "./routes/vendor.js";
import templateRoutes from "./routes/template.js";
import docsRoutes from "./routes/docs.js";
import authGoogle from "./routes/authGoogle.js";

import authMe from "./routes/authMe.js";

dotenv.config();
const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());

// docs (Swagger UI)
app.use("/api/docs", docsRoutes);
app.use("/api/auth", authMe);

// api routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/segments", segmentRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/auth", authGoogle); // keeps /api/auth/dev and adds /api/auth/google
app.use("/api/ai", aiRoutes);

// healthcheck
app.get("/", (req, res) => res.json({ ok: true, time: new Date() }));

export default app;
