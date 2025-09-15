import React from "react";
import AuthButton from "./components/AuthButton";
import RuleBuilder from "./components/RuleBuilder";
import CampaignCreator from "./components/CampaignCreator";
import CampaignHistory from "./components/CampaignHistory";
import SegmentPicker from "./components/SegmentPicker";
import CustomerUploader from "./components/CustomerUploader";
import OrderUploader from "./components/OrderUploader";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-slate-800">
      <header className="bg-white/80 backdrop-blur-sm border-b py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">
              CRM
            </div>
            <div>
              <h1 className="text-lg font-semibold">Mini CRM Campaigns</h1>
              <p className="text-sm text-slate-500">
                Test campaigns, segments and delivery (demo)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SegmentPicker />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-12 gap-6">
        <section className="col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <RuleBuilder />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <CampaignCreator />
          </div>
        </section>

        <aside className="col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h2 className="text-lg font-semibold mb-2">Data Ingestion</h2>
            <div style={{display:"grid", gap:12}}>
              <CustomerUploader />
              <OrderUploader />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h2 className="text-lg font-semibold mb-2">Campaign History</h2>
            <CampaignHistory />
          </div>
        </aside>
      </main>
    </div>
  );
}
