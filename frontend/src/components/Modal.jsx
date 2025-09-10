import React, { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    function onKey(e){
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(2,6,23,0.45)"
      }}
      onClick={onClose} // close if you click backdrop
    >
      <div
        style={{
          width: "min(920px, 96%)",
          maxHeight: "86vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 12px 40px rgba(2,6,23,0.35)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            border: "none",
            background: "#f3f4f6",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Close"
        >
          
        </button>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h3>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
