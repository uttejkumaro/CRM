import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config.js";

export default function SegmentPicker() {
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${BASE_URL}/api/segments`);
      const data = await res.json();
      setSegments(data);
    })();
  }, []);

  const preview = async (body) => {
    const resp = await fetch(`${BASE_URL}/api/segments/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return resp.json();
  };

  const getSegment = async (id) => {
    const resp = await fetch(`${BASE_URL}/api/segments/${id}`);
    return resp.json();
  };

  const saveSegment = async (body) => {
    const resp = await fetch(`${BASE_URL}/api/segments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return resp.json();
  };

  return <div>{/* Segment Picker UI */}</div>;
}
