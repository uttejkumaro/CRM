import React, { useEffect, useState } from "react";

export default function SegmentPicker(){
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState(5000);

  async function loadSegments(){
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/segments");
      if (!res.ok) throw new Error("no GET route");
      const data = await res.json();
      setSegments(data);
    } catch (err) {
      // backend may not have GET /api/segments  ignore
      setSegments([]);
    } finally { setLoading(false) }
  }

  useEffect(()=> { loadSegments(); }, []);

  async function createSegment(){
    setCreating(true);
    try {
      const body = {
        name: newName || "UI segment",
        description: "created via SegmentPicker",
        conditionTree: { field: "totalSpend", cmp: ">", value: Number(newValue) }
      };
      const resp = await fetch("http://localhost:4000/api/segments", {
        method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body)
      });
      const doc = await resp.json();
      // save id to clipboard and localStorage for CampaignCreator
      try { await navigator.clipboard.writeText(doc._id); } catch(e) {}
      localStorage.setItem("selectedSegmentId", doc._id);
      alert("Segment created and id copied to clipboard");
      loadSegments();
    } catch(e){ alert("Create failed: " + e.message) }
    setCreating(false);
  }

  function choose(segment){
    localStorage.setItem("selectedSegmentId", segment._id);
    try { navigator.clipboard.writeText(segment._id); } catch(e){}
    alert(`Selected segment: ${segment.name} (id copied)`);
  }

  return (
    <div className="flex gap-3 items-center">
      <div className="text-sm text-slate-600">Segments</div>
      <div className="relative">
        <button onClick={loadSegments} className="px-3 py-1 border rounded bg-white hover:bg-slate-50">Refresh</button>
      </div>

      <div className="relative">
        <select
          className="border px-2 py-1 rounded bg-white"
          onChange={e => {
            const idx = e.target.selectedIndex - 1;
            if (idx >= 0) choose(segments[idx]);
          }}
        >
          <option>Pick segment...</option>
          {segments.map(s => <option key={s._id}>{s.name}</option>)}
        </select>
      </div>

      <button onClick={() => {
        const pre = prompt("Create new segment name (will use totalSpend > value):", "UI Big Spenders");
        if (!pre) return;
        const v = prompt("value for totalSpend >", "5000");
        if (!v) return;
        setNewName(pre); setNewValue(v); createSegment();
      }} className="px-3 py-1 bg-indigo-600 text-white rounded">Create</button>
    </div>
  );
}
