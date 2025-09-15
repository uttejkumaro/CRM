import React, { useState } from "react";

export default function CustomerUploader() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  function parseCsv(content) {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = cols[i] ?? "");
      return obj;
    });
  }

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    try {
      setText(JSON.stringify(JSON.parse(txt), null, 2));
    } catch {
      const parsed = parseCsv(txt);
      setText(JSON.stringify(parsed, null, 2));
      window.showToast?.("Parsed CSV to JSON", { type: "info" });
    }
  }

  async function submit() {
    let arr;
    try {
      arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("Must be array of customers");
    } catch (err) {
      return window.showToast?.("Invalid JSON: " + err.message, { type: "error" });
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:4000/api/customers/bulk", {
        method: "POST",
        headers: { "Content-Type":"application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ customers: arr })
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
      <h4 style={{marginTop:0}}>Customer Uploader</h4>
      <textarea
        rows={6}
        style={{width:"100%", fontSize:12, fontFamily:"monospace"}}
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder='Paste JSON array of customers'
      />
      <div style={{marginTop:8, display:"flex", gap:8}}>
        <input type="file" accept=".json,.csv" onChange={handleFile}/>
        <button onClick={submit} disabled={loading} className="btn btn-primary">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
