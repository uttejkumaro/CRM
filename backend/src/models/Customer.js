import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: true },
  phone: String,
  totalSpend: { type: Number, default: 0 },
  lastOrderAt: Date,
  visits: { type: Number, default: 0 },
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed
});

export default mongoose.model("Customer", CustomerSchema);
