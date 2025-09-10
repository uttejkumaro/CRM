import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  amount: Number,
  createdAt: { type: Date, default: Date.now },
  items: [{ sku: String, qty: Number, price: Number }]
});

export default mongoose.model("Order", OrderSchema);
