const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ["en_attente", "confirmee", "en_preparation", "expediee", "livree", "annulee"],
      default: "en_attente"
    },
    payment: {
      method: { type: String, enum: ["mobile_money", "carte", "especes"], default: "mobile_money" },
      status: { type: String, enum: ["en_attente", "paye", "echoue"], default: "en_attente" },
      reference: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
