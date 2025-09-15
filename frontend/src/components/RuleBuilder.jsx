import React, { useEffect, useState } from "react";

export default function RuleBuilder({ initial = { op: "AND", rules: [] }, onChange = () => {} }) {
  const [tree, setTree] = useState(initial);
  const [nl, setNl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTree(initial);
  }, [initial]);

  useEffect(() => {
    onChange(tree);
  }, [tree]);

  function addSample() {
    setTree(t => ({ ...t, rules: [...(t.rules || []), { field: "totalSpend", cmp: ">", value: 5000 }] }));
  }

  function removeRule(idx) {
    setTree(t => ({ ...t, rules: t.rules.filter((_, i) => i !== idx) }));
  }

  function updateRule(idx, key, val) {
    setTree(t => {
      const rules = [...(t.rules || [])];
      rules[idx] = { ...rules[idx], [key]: val };
      return { ...t, rules };
    });
  }

  async function convertNL() {
    if (!nl) return window.showToast?.("Type a natural language description first", { type: "error" });
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) };
      const resp = await fetch("http://localhost:4000/api/ai/parse-segment", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: nl })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(()=>({ error: resp.statusText }));
        window.showToast?.("Parse failed: " + (err.error || resp.statusText), { type: "error" });
      } else {
        const data = await resp.json();
        if (data?.tree) {
          setTree(data.tree);
          window.showToast?.("Converted to rule tree", { type: "success" });
        } else {
          window.showToast?.("No tree returned from AI", { type: "error" });
        }
      }
    } catch (e) {
      window.showToast?.("Parse failed: " + e.message, { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:10}}>
        <input value={nl} onChange={e=>setNl(e.target.value)} placeholder="Describe audience in plain English (e.g. haven't shopped in 6 months and spent over ₹5k)" style={{flex:1, padding:8, borderRadius:6, border:"1px solid #e6eefc"}} />
        <button onClick={convertNL} className="btn btn-primary" disabled={loading}>{loading ? "Converting..." : "Convert"}</button>
      </div>

      <div className="mt-3 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <h4>Rule Builder</h4>
          <button onClick={addSample} className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Add sample</button>
        </div>

        <p className="text-slate-500 mt-2">Current rule tree (JSON):</p>
        <pre className="bg-slate-50 p-3 rounded mt-2 overflow-auto text-xs border">{JSON.stringify(tree, null, 2)}</pre>

        <div style={{marginTop:8}}>
          <h5 style={{marginBottom:6}}>Rules</h5>
          {(tree.rules || []).map((r, idx) => (
            <div key={idx} style={{display:"flex", gap:8, alignItems:"center", marginBottom:6}}>
              <select value={r.field||""} onChange={e=>updateRule(idx,"field", e.target.value)}>
                <option value="totalSpend">totalSpend</option>
                <option value="visits">visits</option>
                <option value="lastOrderAt">lastOrderAt</option>
                <option value="tags">tags</option>
              </select>
              <select value={r.cmp||""} onChange={e=>updateRule(idx,"cmp", e.target.value)}>
                <option value=">">{">"}</option>
                <option value="<">{"<"}</option>
                <option value=">=">{">="}</option>
                <option value="<=">{"<="}</option>
                <option value="==">{"=="}</option>
                <option value="in">in</option>
                <option value="inactive_days_gt">inactive_days_gt</option>
              </select>
              <input value={r.value||""} onChange={e=>updateRule(idx,"value", e.target.value)} placeholder="value" style={{width:120}} />
              <button onClick={()=>removeRule(idx)} className="btn btn-secondary">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
