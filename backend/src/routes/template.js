import express from "express";
import { renderTemplate } from "../utils/templateRenderer.js";

const router = express.Router();

/**
 * POST /api/template/render
 * Body: { template: string, customers: [ {...} ] }
 * Returns: { rendered: [ { customer, message } ] }
 */
router.post("/render", async (req, res) => {
  try {
    const { template, customers } = req.body;
    if (!template || !Array.isArray(customers)) {
      return res.status(400).json({ error: "template and customers array required" });
    }

    const rendered = customers.map(c => ({
      customer: c,
      message: renderTemplate(template || "", c || {})
    }));

    res.json({ rendered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
