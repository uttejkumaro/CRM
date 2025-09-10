import React, { useEffect, useState } from "react";

export default function Toasts(){
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // expose a global helper to add toasts
    window.showToast = (msg, opts = {}) => {
      const id = Math.random().toString(36).slice(2,9);
      const t = { id, msg, ttl: opts.ttl || 4000, type: opts.type || "info" };
      window.dispatchEvent(new CustomEvent("addToast", { detail: t }));
      return id;
    };

    function onAdd(e){
      const t = e.detail;
      setToasts(prev => [...prev, t]);
      // auto remove after ttl
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, t.ttl);
    }

    window.addEventListener("addToast", onAdd);
    return () => window.removeEventListener("addToast", onAdd);
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{position:"fixed", right:18, bottom:18, zIndex:9999, display:"flex", flexDirection:"column", gap:10}}>
      {toasts.map(t => (
        <div key={t.id} style={{
          minWidth:220,
          padding:12,
          borderRadius:10,
          background: t.type === "error" ? "#fee2e2" : (t.type === "success" ? "#ecfdf5" : "#eef2ff"),
          color: t.type === "error" ? "#991b1b" : (t.type === "success" ? "#065f46" : "#0f172a"),
          boxShadow:"0 6px 20px rgba(2,6,23,0.08)",
          border: "1px solid rgba(15,23,42,0.04)"
        }}>
          <div style={{fontSize:14, fontWeight:600, marginBottom:4}}>{t.type === "error" ? "Error" : (t.type === "success" ? "Success" : "Info")}</div>
          <div style={{fontSize:13}}>{t.msg}</div>
        </div>
      ))}
    </div>
  );
}
