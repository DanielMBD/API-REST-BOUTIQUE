const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

cartSchema.virtual("total").get(function getTotal() {
  return this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
});

cartSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
