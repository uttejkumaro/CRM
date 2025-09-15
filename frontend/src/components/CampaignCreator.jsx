import React from "react";
import { BASE_URL } from "../config.js";

export default function CampaignCreator() {
  const previewSegments = async (body) => {
    const resp = await fetch(`${BASE_URL}/api/segments/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return resp.json();
  };

  const renderTemplate = async (body) => {
    const r = await fetch(`${BASE_URL}/api/template/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  };

  const createCampaign = async (body) => {
    const resp = await fetch(`${BASE_URL}/api/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return resp.json();
  };

  const suggestMessages = async (body) => {
    const resp = await fetch(`${BASE_URL}/api/ai/suggest-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return resp.json();
  };

  return <div>{/* Campaign Creator UI */}</div>;
}
