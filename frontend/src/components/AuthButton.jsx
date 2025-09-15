import React, { useEffect } from "react";

/**
 * AuthButton
 * - Dev Login (POST /api/auth/dev)
 * - Google Login (redirect to /api/auth/google)
 * - On mount: if URL fragment contains /#/oauth?token=..., store token in localStorage
 */
export default function AuthButton(){
  useEffect(() => {
    try {
      const hash = window.location.hash || "";
      // expecting format: #/oauth?token=xxxxx
      if (hash.startsWith("#/oauth")) {
        const q = hash.split("?")[1] || "";
        const params = new URLSearchParams(q);
        const token = params.get("token");
        if (token) {
          localStorage.setItem("token", token);
          window.showToast?.("Google sign-in successful (token stored)", { type: "success" });
          // remove hash from URL without reload
          history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
          window.showToast?.("OAuth redirect missing token", { type: "error" });
        }
      }
    } catch (err) {
      console.error("Auth callback parse error", err);
    }
  }, []);

  const doDevAuth = async () => {
    try {
      const resp = await fetch("http://localhost:4000/api/auth/dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "dev-123" })
      });
      const data = await resp.json();
      localStorage.setItem("token", data.token);
      window.showToast?.("Dev token stored", { type: "success" });
    } catch (e) {
      window.showToast?.("Auth failed: " + (e.message || e), { type: "error" });
    }
  };

  const doGoogleAuth = () => {
    // opens Google OAuth flow on the backend
    const url = (process.env.REACT_APP_API_URL || "http://localhost:4000") + "/api/auth/google";
    // open in same tab (so Google can redirect back to frontend)
    window.location.href = url;
  };

  return (
    <div style={{display:"flex", gap:8, alignItems:"center"}}>
      <button onClick={doDevAuth} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md shadow">
        Dev Login
      </button>

      <button onClick={doGoogleAuth} className="bg-white border px-3 py-2 rounded-md shadow" title="Sign in with Google">
        <span style={{display:"inline-flex", alignItems:"center", gap:8}}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.5 8.2 2.8l6.1-6.1C35.6 3 30 1 24 1 14.9 1 6.9 6 3 13.7l7.6 5.9C11.7 15 17.3 9.5 24 9.5z"/><path fill="#34A853" d="M46.5 24.5c0-1.6-.1-2.9-.4-4.2H24v8.1h12.6c-.5 2.7-2.1 5-4.6 6.6l7.2 5.6C43.7 36.6 46.5 30.9 46.5 24.5z"/><path fill="#4A90E2" d="M10.6 28.6a14.7 14.7 0 01-.8-4.6c0-1.6.3-3.1.8-4.6L3 13.7C1.1 17.8 0 21.8 0 24.9s1.1 7 3 11.2l7.6-5.5z"/><path fill="#FBBC05" d="M24 46c6.1 0 11.4-2 15.2-5.4l-7.2-5.6c-2 1.4-4.6 2.3-8 2.3-6.7 0-12.3-5.5-13.9-12.7l-7.6 5.9C6.9 42 14.9 46 24 46z"/></svg>
          <span style={{fontSize:14}}>Sign in with Google</span>
        </span>
      </button>
    </div>
  );
}
