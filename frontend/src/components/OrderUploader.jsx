import React from "react";
import { BASE_URL } from "../config.js";

export default function OrderUploader() {
  const uploadOrders = async (formData) => {
    const resp = await fetch(`${BASE_URL}/api/orders/bulk`, {
      method: "POST",
      body: formData,
    });
    return resp.json();
  };

  return <div>{/* Order Uploader UI */}</div>;
}
