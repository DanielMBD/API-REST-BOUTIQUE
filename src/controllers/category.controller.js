const Category = require("../models/Category");
const Product = require("../models/Product");

async function listCategories(_req, res) {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, categories });
}

async function createCategory(req, res) {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
}

async function updateCategory(req, res) {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) return res.status(404).json({ success: false, message: "Catégorie introuvable" });
  res.json({ success: true, category });
}

async function deleteCategory(req, res) {
  const used = await Product.exists({ category: req.params.id });
  if (used) {
    return res.status(400).json({
      success: false,
      message: "Impossible de supprimer une catégorie utilisée par des produits"
    });
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Catégorie introuvable" });
  res.json({ success: true, message: "Catégorie supprimée" });
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
