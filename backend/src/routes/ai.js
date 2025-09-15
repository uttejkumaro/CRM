import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { parseSegmentFromNL, suggestMessages } from "../services/aiService.js";

const router = express.Router();

// NL -> conditionTree
router.post("/parse-segment", requireAuth, (req, res) => {
  try {
    const { text } = req.body;
    const tree = parseSegmentFromNL(text || "");
    res.json({ ok: true, tree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suggest messages
router.post("/suggest-messages", requireAuth, (req, res) => {
  try {
    const { objective, audienceHints } = req.body;
    const suggestions = suggestMessages(objective || "", audienceHints || "");
    res.json({ ok: true, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
