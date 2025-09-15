import React, { useEffect, useState } from "react";
import Modal from "./Modal";

export default function CampaignHistory(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState(null);
  const [filter, setFilter] = useState(localStorage.getItem("campaignSearchQuery") || "");

  async function load(){
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Authorization": "Bearer " + token } : {};
      const res = await fetch("http://localhost:4000/api/campaigns", { headers });
      if (!res.ok) {
        // Unauthorized or other error
        const err = await res.json().catch(()=>({ error: res.statusText }));
        if (res.status === 401) {
          window.showToast?.("Unauthorized — please sign in (Dev login or Google)", { type: "error" });
        } else {
          window.showToast?.("Failed to load campaigns: " + (err.error || res.statusText), { type: "error" });
        }
        setList([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      // ensure we have an array
      if (!Array.isArray(data)) {
        setList([]);
      } else {
        setList(data);
      }
    } catch(e) {
      console.error(e);
      setList([]);
      window.showToast?.("Failed to load campaigns: " + e.message, { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=> {
    load();
    const id = setInterval(load, 4000);
    return ()=> clearInterval(id);
  }, []);

  useEffect(() => {
    function onSearch(e){
      const q = e?.detail ?? "";
      setFilter(q || "");
    }
    window.addEventListener("campaignSearch", onSearch);
    function onStorage(e){
      if (e.key === "campaignSearchQuery") setFilter(e.newValue || "");
    }
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("campaignSearch", onSearch);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  async function openCampaign(c) {
    setSelected(c);
    setLogs(null);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Authorization": "Bearer " + token } : {};
      const res = await fetch(`http://localhost:4000/api/campaigns/${c._id}/logs`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(()=>({ error: res.statusText }));
        window.showToast?.("Failed loading logs: " + (err.error || res.statusText), { type: "error" });
        setLogs([]);
        return;
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setLogs([]);
      window.showToast?.("Failed to load logs: " + e.message, { type: "error" });
    }
  }

  async function retryLog(campaignId, logId) {
    const ok = window.confirm("Retry delivery for this message? This will re-enqueue it for delivery.");
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type":"application/json", ...(token ? { "Authorization": "Bearer " + token } : {}) };
      const resp = await fetch(`http://localhost:4000/api/campaigns/${campaignId}/logs/${logId}/retry`, {
        method: "POST", headers
      });
      const data = await resp.json();
      if (resp.ok && data.ok) {
        window.showToast?.("Retry enqueued", { type: "success" });
        // refresh logs
        const res = await fetch(`http://localhost:4000/api/campaigns/${campaignId}/logs`, { headers });
        if (res.ok) setLogs(await res.json());
      } else {
        window.showToast?.("Retry failed: " + (data.error || JSON.stringify(data)), { type: "error" });
      }
    } catch(err) {
      console.error(err);
      window.showToast?.("Retry failed: " + err.message, { type: "error" });
    }
  }

  const listArray = Array.isArray(list) ? list : [];

  const shown = filter ? listArray.filter(c => (c.title||"").toLowerCase().includes(filter.toLowerCase())) : listArray;

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        <div className="text-muted">Recent campaigns</div>
        <div>
          <button onClick={load} className="btn btn-secondary">Refresh</button>
        </div>
      </div>

      <div className="campaign-list">
        {loading && <div className="text-muted">Loading</div>}
        {!loading && shown.length === 0 && <div className="text-muted">No campaigns</div>}
        {shown.map(c => (
          <div key={c._id} className="campaign-item" style={{cursor:"pointer"}} onClick={()=>openCampaign(c)}>
            <div>
              <div style={{fontWeight:600}}>{c.title}</div>
              <div className="text-muted" style={{marginTop:6}}>Audience: {c.audienceSize || c.audience || 0}  {new Date(c.createdAt).toLocaleString()}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#059669", fontWeight:600}}>{c.stats?.sent || 0} Sent</div>
              <div style={{color:"#dc2626", fontWeight:600}}>{c.stats?.failed || 0} Failed</div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={()=>{ setSelected(null); setLogs(null); }} title={selected ? selected.title : ""}>
        <div style={{marginBottom:8}}>
          <div style={{fontSize:13, color:"#6b7280"}}>Audience: {selected?.audienceSize || selected?.audience || 0}  Created: {selected ? new Date(selected.createdAt).toLocaleString() : ""}</div>
        </div>

        <div style={{marginTop:12}}>
          <h4 style={{margin:"8px 0"}}>Delivery logs</h4>
          {!logs && <div className="text-muted">Loading logs</div>}
          {logs && logs.length === 0 && <div className="text-muted">No logs</div>}
          {logs && logs.length > 0 && (
            <div style={{maxHeight: '52vh', overflowY: 'auto'}}>
              <table style={{width:"100%", borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{textAlign:"left", borderBottom:"1px solid #eef2ff"}}>
                    <th style={{padding:"8px 6px"}}>Customer</th>
                    <th style={{padding:"8px 6px"}}>Status</th>
                    <th style={{padding:"8px 6px"}}>Attempts</th>
                    <th style={{padding:"8px 6px"}}>Last update</th>
                    <th style={{padding:"8px 6px", textAlign:"right"}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l._id} style={{borderBottom:"1px solid #f3f4f6"}}>
                      <td style={{padding:"8px 6px"}}>{l.customerId || l.customer?.name || l.customer}</td>
                      <td style={{padding:"8px 6px"}}>{l.status}</td>
                      <td style={{padding:"8px 6px"}}>{l.attemptCount || 0}</td>
                      <td style={{padding:"8px 6px"}}>{l.lastUpdated ? new Date(l.lastUpdated).toLocaleString() : "-"}</td>
                      <td style={{padding:"8px 6px", textAlign:"right"}}>
                        <button onClick={(e)=>{ e.stopPropagation(); retryLog(selected._id, l._id); }} className="btn btn-secondary" style={{padding:"6px 8px"}}>Retry</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
