const Order = require("../models/Order");

async function simulatePayment(req, res) {
  const { orderId, method = "mobile_money" } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });

  if (!order) return res.status(404).json({ success: false, message: "Commande introuvable" });
  if (order.payment.status === "paye") {
    return res.status(400).json({ success: false, message: "Cette commande est déjà payée" });
  }

  const reference = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
  order.payment = { method, status: "paye", reference };
  order.status = "confirmee";
  await order.save();

  res.json({
    success: true,
    message: "Paiement simulé avec succès",
    reference,
    order
  });
}

module.exports = { simulatePayment };
