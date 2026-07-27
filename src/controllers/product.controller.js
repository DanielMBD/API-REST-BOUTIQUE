const Product = require("../models/Product");

async function listProducts(req, res) {
  const {
    search = "",
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 12
  } = req.query;

  const filter = { active: true };
  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 50);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }
  });
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });
  res.json({ success: true, product });
}

async function createProduct(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
}

async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });
  res.json({ success: true, product });
}

async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Produit introuvable" });
  res.json({ success: true, message: "Produit supprimé" });
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
