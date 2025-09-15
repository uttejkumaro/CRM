import React, { useState } from "react";

export default function OrderUploader() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    let arr;
    try {
      arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("Must be array of orders");
    } catch (err) {
      return window.showToast?.("Invalid JSON: " + err.message, { type: "error" });
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:4000/api/orders/bulk", {
        method: "POST",
        headers: { "Content-Type":"application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ orders: arr })
      });
      const data = await resp.json();
      if (resp.status === 202) {
        window.showToast?.(`Accepted: queued ${arr.length}`, { type: "success" });
      } else {
        window.showToast?.("Response: " + JSON.stringify(data), { type: "info" });
      }
    } catch (err) {
      window.showToast?.("Upload failed: " + err.message, { type: "error" });
    }
    setLoading(false);
  }

  return (
    <div style={{padding:12, borderRadius:8, background:"#fff", border:"1px solid #eef"}}>
      <h4 style={{marginTop:0}}>Order Uploader</h4>
      <textarea
        rows={6}
        style={{width:"100%", fontSize:12, fontFamily:"monospace"}}
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder='Paste JSON array of orders'
      />
      <div style={{marginTop:8}}>
        <button onClick={submit} disabled={loading} className="btn btn-primary">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
