import express from "express";
import Segment from "../models/Segment.js";
import Customer from "../models/Customer.js";
import { buildMongoQuery } from "../services/ruleCompiler.js";

const router = express.Router();

router.post("/preview", async (req, res) => {
  try {
    const tree = req.body.conditionTree;
    const q = buildMongoQuery(tree);
    const count = await Customer.countDocuments(q);
    const sample = await Customer.find(q).limit(10);
    res.json({ count, sample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const doc = await Segment.create(req.body);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
