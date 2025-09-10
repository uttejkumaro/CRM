import mongoose from "mongoose";

const SegmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  conditionTree: mongoose.Schema.Types.Mixed,
  nlText: String,
  lastCount: Number,
  savedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Segment", SegmentSchema);
