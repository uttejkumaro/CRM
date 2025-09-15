import express from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { signToken } from "../utils/auth.js";

const router = express.Router();

// IMPORTANT: session middleware must be applied here on the auth router only.
// Keep session secret in env: SESSION_SECRET
router.use(session({
  secret: process.env.SESSION_SECRET || "dev-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true in production with HTTPS
}));

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("[authGoogle] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set - Google OAuth will fail until configured.");
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // Minimal: produce a user object. In production, find/create a user record in DB.
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: (profile.emails && profile.emails[0] && profile.emails[0].value) || null,
    provider: "google"
  };
  return done(null, user);
}));

// Kick off Google OAuth flow
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback. On success, issue a JWT and redirect to frontend with token in URL fragment.
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/?oauth=fail" }), (req, res) => {
  try {
    const user = req.user || {};
    const payload = { id: user.id, name: user.name, email: user.email };
    const token = signToken(payload, "7d");

    // Redirect front-end; use fragment so token not sent to server logs
    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontend}/#/oauth?token=${encodeURIComponent(token)}`;

    // optional: clear session after issuing token
    req.logout?.();

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("OAuth callback error", err);
    res.redirect((process.env.FRONTEND_URL || "http://localhost:3000") + "/?oauth=error");
  }
});

export default router;
