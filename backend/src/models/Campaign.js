import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  title: String,
  messageTemplate: String,
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Segment" },
  audienceSize: Number,
  status: { type: String, enum: ["pending", "running", "completed"], default: "pending" },
  stats: {
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Campaign", CampaignSchema);
