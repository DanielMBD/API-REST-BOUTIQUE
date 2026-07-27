const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function createOrder(req, res) {
  const { shippingAddress, paymentMethod = "mobile_money" } = req.body;
  if (!shippingAddress) {
    return res.status(400).json({ success: false, message: "Adresse de livraison requise" });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Le panier est vide" });
  }

  for (const item of cart.items) {
    if (!item.product || item.quantity > item.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant pour ${item.product?.name || "un produit"}`
      });
    }
  }

  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    shippingAddress,
    payment: { method: paymentMethod, status: "en_attente" }
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
}

async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
}

async function getOrder(req, res) {
  const filter = { _id: req.params.id };
  if (req.user.role !== "admin") filter.user = req.user._id;

  const order = await Order.findOne(filter).populate("user", "name email");
  if (!order) return res.status(404).json({ success: false, message: "Commande introuvable" });
  res.json({ success: true, order });
}

async function allOrders(_req, res) {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json({ success: true, orders });
}

async function updateStatus(req, res) {
  const allowed = ["en_attente", "confirmee", "en_preparation", "expediee", "livree", "annulee"];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ success: false, message: "Statut invalide" });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!order) return res.status(404).json({ success: false, message: "Commande introuvable" });
  res.json({ success: true, order });
}

module.exports = { createOrder, myOrders, getOrder, allOrders, updateStatus };
