import express from "express";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/auth/me
 * Returns decoded token payload (user info) if authenticated
 */
router.get("/me", requireAuth, (req, res) => {
  try {
    res.json({ ok: true, user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
