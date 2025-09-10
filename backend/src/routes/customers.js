import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

router.post("/bulk", async (req, res) => {
  try {
    const customers = req.body.customers || [];
    const docs = await Customer.insertMany(customers);
    res.json({ inserted: docs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const docs = await Customer.find().limit(50);
  res.json(docs);
});

export default router;
