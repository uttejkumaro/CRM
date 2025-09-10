import React from "react";

export default function AuthButton(){
  const doDevAuth = async () => {
    try {
      const resp = await fetch("http://localhost:4000/api/auth/dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "dev-123" })
      });
      const data = await resp.json();
      localStorage.setItem("token", data.token);
      // nicer toast substitute
      alert("Dev token stored");
    } catch (e) { alert("Auth failed: " + e.message) }
  };

  return (
    <button onClick={doDevAuth} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md shadow">
      Dev Login
    </button>
  );
}
