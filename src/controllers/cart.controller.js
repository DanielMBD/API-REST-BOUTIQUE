const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function getCart(req, res) {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
}

async function addItem(req, res) {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.active) {
    return res.status(404).json({ success: false, message: "Produit indisponible" });
  }

  const qty = Number(quantity);
  if (qty < 1 || qty > product.stock) {
    return res.status(400).json({ success: false, message: "Quantité invalide ou stock insuffisant" });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find((item) => item.product.toString() === productId);
  if (existing) {
    const newQuantity = existing.quantity + qty;
    if (newQuantity > product.stock) {
      return res.status(400).json({ success: false, message: "Stock insuffisant" });
    }
    existing.quantity = newQuantity;
    existing.unitPrice = product.price;
  } else {
    cart.items.push({ product: product._id, quantity: qty, unitPrice: product.price });
  }

  await cart.save();
  cart = await cart.populate("items.product");
  res.status(201).json({ success: true, cart });
}

async function updateItem(req, res) {
  const quantity = Number(req.body.quantity);
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });
  if (quantity < 1 || quantity > product.stock) {
    return res.status(400).json({ success: false, message: "Quantité invalide ou stock insuffisant" });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Panier introuvable" });

  const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ success: false, message: "Article absent du panier" });

  item.quantity = quantity;
  item.unitPrice = product.price;
  await cart.save();
  await cart.populate("items.product");
  res.json({ success: true, cart });
}

async function removeItem(req, res) {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Panier introuvable" });

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product");
  res.json({ success: true, cart });
}

async function clearCart(req, res) {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { new: true, upsert: true }
  );
  res.json({ success: true, cart });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
