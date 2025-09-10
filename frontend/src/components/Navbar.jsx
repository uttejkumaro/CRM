import React, { useEffect, useState, useRef } from "react";

export default function Navbar(){
  const [query, setQuery] = useState(localStorage.getItem("campaignSearchQuery") || "");
  const [dark, setDark] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    // on mount, broadcast existing query (so list can initialize)
    window.dispatchEvent(new CustomEvent("campaignSearch", { detail: query }));
  }, []);

  function onChange(v){
    setQuery(v);
    localStorage.setItem("campaignSearchQuery", v);
    // debounce 400ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("campaignSearch", { detail: v }));
    }, 400);
  }

  function toggleDark(){
    setDark(d => {
      const nx = !d;
      document.documentElement.style.background = nx ? "#0b1220" : "#f8fafc";
      document.documentElement.style.color = nx ? "#e6eef8" : "#111827";
      return nx;
    });
  }

  async function doDevLogin(){
    try {
      const resp = await fetch("http://localhost:4000/api/auth/dev", {
        method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ userId:"dev-ui" })
      });
      const data = await resp.json();
      localStorage.setItem("token", data.token);
      if (window.showToast) window.showToast("Dev token stored", { type: "success" });
      else alert("Dev token stored");
    } catch(e){
      if (window.showToast) window.showToast("Dev login failed: " + e.message, { type: "error" });
      else alert("Dev login failed: " + e.message);
    }
  }

  return (
    <header>
      <div className="header-inner">
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <div className="logo-badge">CRM</div>
          <div className="header-meta">
            <h1>Mini CRM Campaigns</h1>
            <p className="text-muted">Test campaigns, segments and delivery (demo)</p>
          </div>
        </div>

        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <input
            placeholder="Search campaigns..."
            value={query}
            onChange={e=>onChange(e.target.value)}
            style={{padding:"8px 10px", borderRadius:8, border:"1px solid #e6eefc", width:280}}
          />
          <button onClick={toggleDark} className="btn btn-secondary">{dark ? "Light" : "Dark"}</button>
          <button onClick={doDevLogin} className="btn btn-primary" title="Dev token">Dev Login</button>
        </div>
      </div>
    </header>
  );
}
