const router = require("express").Router();
const controller = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);
router.get("/", controller.getCart);
router.post("/items", controller.addItem);
router.put("/items/:productId", controller.updateItem);
router.delete("/items/:productId", controller.removeItem);
router.delete("/", controller.clearCart);

module.exports = router;
