import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config.js";

export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${BASE_URL}/api/campaigns`);
      const data = await res.json();
      setCampaigns(data);
    })();
  }, []);

  const fetchLogs = async (c) => {
    const res = await fetch(`${BASE_URL}/api/campaigns/${c._id}/logs`);
    return res.json();
  };

  const retryLog = async (campaignId, logId) => {
    const resp = await fetch(`${BASE_URL}/api/campaigns/${campaignId}/logs/${logId}/retry`, {
      method: "POST",
    });
    return resp.json();
  };

  return <div>{/* Campaign History UI */}</div>;
}
