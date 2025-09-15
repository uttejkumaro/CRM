import React, { useEffect, useState } from "react";

export default function CampaignCreator(){
  const [title, setTitle] = useState("Test Campaign");
  const [segmentId, setSegmentId] = useState(localStorage.getItem("selectedSegmentId") || "");
  const [template, setTemplate] = useState("Hi {{name}}, offer!");
  const [preview, setPreview] = useState(null);
  const [rendered, setRendered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objective, setObjective] = useState("");
  const [audienceHints, setAudienceHints] = useState("");

  useEffect(()=> {
    const handler = () => setSegmentId(localStorage.getItem("selectedSegmentId") || "");
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  async function doPreview() {
    if (!segmentId) {
      return window.showToast ? window.showToast("Pick or paste a segment ID", { type: "error" }) : alert("Pick or paste a segment ID");
    }
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:4000/api/segments/preview", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ conditionTree: { field: "totalSpend", cmp: ">", value: 5000 } })
      });
      const data = await resp.json();
      setPreview(data);

      // server-side render sample customers (first 3)
      const sample = (data.sample || []).slice(0, 3);
      if (sample.length > 0) {
        const r = await fetch("http://localhost:4000/api/template/render", {
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({ template, customers: sample })
        });
        const rr = await r.json();
        setRendered(rr.rendered || []);
      } else {
        setRendered([]);
      }

      if (window.showToast) window.showToast("Preview loaded", { type: "success" });
    } catch (e) {
      if (window.showToast) window.showToast("Preview failed: " + e.message, { type: "error" }); else alert("Preview failed: "+e.message);
    }
    setLoading(false);
  }

  async function create() {
    if (!segmentId) return window.showToast ? window.showToast("Pick or paste a segment ID", { type: "error" }) : alert("Pick or paste a segment ID");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = { title, messageTemplate: template, segmentId };
      const resp = await fetch("http://localhost:4000/api/campaigns", {
        method: "POST",
        headers: { "Content-Type":"application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (data.campaignId) {
        if (window.showToast) window.showToast("Campaign created ("+data.audience+" audience)", { type: "success" });
      } else {
        if (window.showToast) window.showToast("Create response: " + JSON.stringify(data), { type: "info" });
      }
      setPreview(null);
      setRendered([]);
    } catch (e) {
      if (window.showToast) window.showToast("Create failed: " + e.message, { type: "error" });
    }
    setLoading(false);
  }

  async function suggestMessages() {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type":"application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const resp = await fetch("http://localhost:4000/api/ai/suggest-messages", {
        method: "POST",
        headers,
        body: JSON.stringify({ objective, audienceHints })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(()=>({error: resp.statusText}));
        window.showToast?.("Suggest failed: " + (err.error || resp.statusText), { type: "error" });
        return;
      }
      const data = await resp.json();
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        // show small chooser (browser alert fallback)
        const pick = window.prompt("Suggestions:\\n1) " + data.suggestions.join("\\n2) ") + "\\n\\nType 1-3 to pick (or cancel)");
        const idx = Number(pick) - 1;
        if (!Number.isNaN(idx) && data.suggestions[idx]) {
          setTemplate(data.suggestions[idx]);
          window.showToast?.("Template inserted", { type: "success" });
        }
      } else {
        window.showToast?.("No suggestions returned", { type: "info" });
      }
    } catch (e) {
      window.showToast?.("Suggest failed: " + e.message, { type: "error" });
    }
  }

  return (
    <div>
      <h3 style={{fontSize:18, marginBottom:8}}>Create Campaign</h3>
      <div style={{display:"grid", gridTemplateColumns:"1fr", gap:10}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Campaign title" />
        <input value={segmentId} onChange={e=>{ setSegmentId(e.target.value); localStorage.setItem("selectedSegmentId", e.target.value); }} placeholder="Segment ID (or pick one)" />
        <textarea value={template} onChange={e=>setTemplate(e.target.value)} />
      </div>

      <div style={{marginTop:10, display:"flex", gap:8, alignItems:"center"}}>
        <button onClick={doPreview} className="btn btn-secondary">Preview</button>
        <button onClick={create} className="btn btn-primary">Create Campaign</button>
        <div style={{marginLeft:12}}>
          <input value={objective} onChange={e=>setObjective(e.target.value)} placeholder="Objective (e.g., win-back, promote sale)" style={{padding:6, borderRadius:6, border:"1px solid #e6eefc", width:240}} />
        </div>
        <div>
          <input value={audienceHints} onChange={e=>setAudienceHints(e.target.value)} placeholder="Audience hints (optional)" style={{padding:6, borderRadius:6, border:"1px solid #e6eefc", width:240}} />
        </div>
        <button onClick={suggestMessages} className="btn btn-secondary">Suggest messages</button>
        {loading && <div className="text-muted" style={{alignSelf:"center"}}>Working</div>}
      </div>

      {preview && (
        <div style={{marginTop:12, padding:12, borderRadius:8, background:"#f8fafc", border:"1px solid #e6eefc"}}>
          <div style={{fontSize:13, color:"#374151"}}>Matched: <strong>{preview.count}</strong></div>
          <div style={{marginTop:8}}>
            <div style={{fontSize:13, color:"#6b7280"}}>Rendered sample (first {Math.min(3, (preview.sample||[]).length)}):</div>
            <div style={{marginTop:8}}>
              {rendered.map((r, idx) => (
                <div key={idx} style={{background:"#fff", padding:10, borderRadius:6, marginBottom:8, border:"1px solid #eaeef8"}}>
                  <div style={{fontSize:13, color:"#6b7280"}}>To: <strong>{r.customer.name || r.customer.email || r.customer._id}</strong></div>
                  <div style={{marginTop:6, fontSize:14}}>{r.message}</div>
                </div>
              ))}
              <pre style={{background:"#fff", padding:8, borderRadius:6, marginTop:8, maxHeight:150, overflow:"auto"}}>{JSON.stringify(preview.sample || [], null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
