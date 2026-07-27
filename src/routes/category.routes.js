const router = require("express").Router();
const controller = require("../controllers/category.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/", controller.listCategories);
router.post("/", protect, adminOnly, controller.createCategory);
router.put("/:id", protect, adminOnly, controller.updateCategory);
router.delete("/:id", protect, adminOnly, controller.deleteCategory);

module.exports = router;
