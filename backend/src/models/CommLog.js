import mongoose from "mongoose";

const CommLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  vendorMessageId: String,
  status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
  attemptCount: { type: Number, default: 0 },
  lastUpdated: Date
});

export default mongoose.model("CommLog", CommLogSchema);
