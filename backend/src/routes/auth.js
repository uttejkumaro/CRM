import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Quick dev auth: POST /api/auth/dev { userId }
router.post("/dev", (req, res) => {
  const user = { id: req.body.userId || "dev-user" };
  const token = jwt.sign(user, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
  res.json({ token });
});

export default router;
