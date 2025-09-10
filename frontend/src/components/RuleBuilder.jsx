import React, { useState } from "react";

export default function RuleBuilder(){
  const [tree, setTree] = useState({ op: "AND", rules: [] });

  function addSample() {
    setTree(t => ({ ...t, rules: [...t.rules, { field: "totalSpend", cmp: ">", value: 5000 }] }));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Rule Builder</h3>
        <button onClick={addSample} className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Add sample</button>
      </div>

      <div className="mt-3 text-sm text-slate-700">
        <p className="text-slate-500">Current rule tree (JSON):</p>
        <pre className="bg-slate-50 p-3 rounded mt-2 overflow-auto text-xs border">{JSON.stringify(tree, null, 2)}</pre>
      </div>
    </div>
  );
}
