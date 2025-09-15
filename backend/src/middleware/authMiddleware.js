import { verifyToken } from "../utils/auth.js";

/**
 * requireAuth middleware
 * - Looks for Bearer token in Authorization header or x-access-token
 * - Verifies JWT via utils/auth.verifyToken
 * - Attaches req.user = decoded payload
 */
export default function requireAuth(req, res, next) {
  try {
    const auth = req.headers?.authorization || req.headers?.["x-access-token"] || "";
    let token = "";

    if (auth && typeof auth === "string") {
      if (auth.toLowerCase().startsWith("bearer ")) {
        token = auth.slice(7).trim();
      } else {
        token = auth.trim();
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: token required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Unauthorized: invalid token" });

    // attach user and continue
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("authMiddleware error", err?.message || err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
