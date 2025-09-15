import jwt from "jsonwebtoken";

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, process.env.JWT_SECRET || "dev", { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "dev");
  } catch (err) {
    return null;
  }
}
