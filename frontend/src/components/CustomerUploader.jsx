import React from "react";
import { BASE_URL } from "../config.js";

export default function CustomerUploader() {
  const upload = async (formData) => {
    const resp = await fetch(`${BASE_URL}/api/customers/bulk`, {
      method: "POST",
      body: formData,
    });
    return resp.json();
  };

  return <div>{/* Customer Uploader UI */}</div>;
}
