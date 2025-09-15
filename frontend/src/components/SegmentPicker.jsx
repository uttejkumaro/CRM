import React, { useEffect, useState, useRef } from "react";
import RuleBuilder from "./RuleBuilder";

export default function SegmentPicker() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [preview, setPreview] = useState(null);
  const [tree, setTree] = useState({ op: "AND", rules: [] });
  const [editingId, setEditingId] = useState(null);
  const debounceRef = useRef(null);

  async function loadSegments(){
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/segments");
      if (!res.ok) throw new Error("no GET route");
      const data = await res.json();
      setSegments(data);
    } catch (err) {
      setSegments([]);
    } finally { setLoading(false) }
  }

  useEffect(()=> { loadSegments(); }, []);

  // live preview when tree changes (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch("http://localhost:4000/api/segments/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conditionTree: tree })
        });
        const data = await resp.json();
        setPreview(data);
      } catch (err) {
        setPreview(null);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [tree]);

  async function createSegment() {
    setCreating(true);
    try {
      const body = {
        name: newName || "UI segment",
        description: "created via SegmentPicker",
        conditionTree: tree
      };

      if (editingId) {
        // update existing
        const resp = await fetch(`http://localhost:4000/api/segments/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const updated = await resp.json();
        if (updated && updated._id) {
          window.showToast?.("Segment updated", { type: "success" });
          localStorage.setItem("selectedSegmentId", updated._id);
          setTimeout(()=> { window.location.href = "/"; }, 300);
        } else {
          window.showToast?.("Update response: " + JSON.stringify(updated), { type: "info" });
        }
      } else {
        const resp = await fetch("http://localhost:4000/api/segments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const doc = await resp.json();
        if (doc && doc._id) {
          try { await navigator.clipboard.writeText(doc._id); } catch(e) {}
          localStorage.setItem("selectedSegmentId", doc._id);
          window.showToast?.("Segment created and id copied to clipboard", { type: "success" });
          setTimeout(() => { window.location.href = "/"; }, 400);
        } else {
          window.showToast?.("Create response: " + JSON.stringify(doc), { type: "info" });
        }
      }

      loadSegments();
    } catch(e){ window.showToast?.("Create failed: " + e.message, { type: "error" }); }
    setCreating(false);
  }

  function choose(segment){
    localStorage.setItem("selectedSegmentId", segment._id);
    try { navigator.clipboard.writeText(segment._id); } catch(e){}
    window.showToast?.(`Selected segment: ${segment.name} (id copied)`, { type: "success" });
  }

  async function editSegment(id) {
    try {
      const resp = await fetch(`http://localhost:4000/api/segments/${id}`);
      if (!resp.ok) throw new Error("Segment not found");
      const seg = await resp.json();
      setEditingId(seg._id);
      setNewName(seg.name || "");
      setTree(seg.conditionTree || { op: "AND", rules: [] });
      window.showToast?.("Loaded segment for editing", { type: "info" });
      // scroll to top / focus for convenience
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      window.showToast?.("Failed to load segment: " + err.message, { type: "error" });
    }
  }

  return (
    <div>
      <div style={{display:"flex", gap:12, alignItems:"center", marginBottom:10}}>
        <div style={{fontWeight:600}}>Segments</div>
        <div>
          <button onClick={loadSegments} className="px-3 py-1 border rounded bg-white hover:bg-slate-50">Refresh</button>
        </div>
      </div>

      <div style={{marginBottom:12}}>
        <div style={{marginBottom:8}}><label style={{fontSize:13}}>{editingId ? "Edit segment" : "New segment"}</label></div>
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Segment name" style={{width:"100%", padding:8, borderRadius:6, border:"1px solid #e6eefc"}} />
      </div>

      <div style={{marginBottom:12}}>
        <RuleBuilder initial={tree} onChange={setTree} />
      </div>

      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <button onClick={createSegment} className="btn btn-primary" disabled={creating}>{creating ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update segment" : "Create segment")}</button>
        <div style={{fontSize:13, color:"#6b7280"}}>
          {preview ? <span>Matched: <strong>{preview.count}</strong> - sample <em style={{color:"#374151"}}>({(preview.sample||[]).length} shown)</em></span> : <span>No preview</span>}
        </div>
      </div>

      <div style={{marginTop:14}}>
        <div style={{fontSize:13, color:"#6b7280"}}>Saved segments</div>
        <div style={{marginTop:8}}>
          {segments.map(s => (
            <div key={s._id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:8, borderRadius:8, border:"1px solid #f3f4f6", marginBottom:8}}>
              <div>
                <div style={{fontWeight:600}}>{s.name}</div>
                <div className="text-muted" style={{fontSize:12}}>{s.description}</div>
              </div>
              <div style={{display:"flex", gap:8}}>
                <button onClick={()=>choose(s)} className="btn btn-secondary">Select</button>
                <button onClick={()=>editSegment(s._id)} className="btn btn-secondary">Edit</button>
              </div>
            </div>
          ))}
          {segments.length === 0 && <div className="text-muted" style={{padding:8}}>No segments saved yet</div>}
        </div>
      </div>
    </div>
  );
}
