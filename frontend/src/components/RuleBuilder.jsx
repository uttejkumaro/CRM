import React from "react";
import { BASE_URL } from "../config.js";

export default function RuleBuilder() {
  const parseSegment = async (body) => {
    const resp = await fetch(`${BASE_URL}/api/ai/parse-segment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return resp.json();
  };

  return <div>{/* Rule Builder UI */}</div>;
}
