import React from "react";
import { BASE_URL } from "../config.js";

export default function Navbar() {
  const devAuth = async () => {
    try {
      const resp = await fetch(`${BASE_URL}/api/auth/dev`, {
        method: "POST",
      });
      console.log("Dev auth result", await resp.json());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav>
      <button onClick={devAuth}>Dev Auth</button>
    </nav>
  );
}
