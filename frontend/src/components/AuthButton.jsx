import React from "react";
import { BASE_URL } from "../config.js";

export default function AuthButton() {
  const handleDevAuth = async () => {
    try {
      const resp = await fetch(`${BASE_URL}/api/auth/dev`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("Dev auth result", await resp.json());
    } catch (err) {
      console.error("Dev auth error", err);
    }
  };

  const getGoogleUrl = () => {
    return `${BASE_URL}/api/auth/google`;
  };

  return (
    <div>
      <button onClick={handleDevAuth}>Dev Auth</button>
      <a href={getGoogleUrl()}>Sign in with Google</a>
    </div>
  );
}
