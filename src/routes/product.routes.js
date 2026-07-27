const router = require("express").Router();
const controller = require("../controllers/product.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lister les produits
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get("/", controller.listProducts); // recupere tous les produits avec pagination et filtres
router.get("/:id", controller.getProduct); // recupere un produit par son id
router.post("/", protect, adminOnly, controller.createProduct);
router.put("/:id", protect, adminOnly, controller.updateProduct);
router.delete("/:id", protect, adminOnly, controller.deleteProduct);

module.exports = router;
