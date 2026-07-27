const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function stats(_req, res) {
  const [products, clients, orders, revenueResult, lowStock, pendingOrders] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ role: "client" }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { "payment.status": "paye" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Product.countDocuments({ stock: { $lte: 5 } }),
    Order.countDocuments({ status: "en_attente" })
  ]);

  res.json({
    success: true,
    stats: {
      products,
      clients,
      orders,
      revenue: revenueResult[0]?.total || 0,
      lowStock,
      pendingOrders
    }
  });
}

async function clients(_req, res) {
  const users = await User.find({ role: "client" }).sort({ createdAt: -1 });
  res.json({ success: true, clients: users });
}

module.exports = { stats, clients };
