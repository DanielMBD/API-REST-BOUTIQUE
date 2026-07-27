const router = require("express").Router();
const controller = require("../controllers/order.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.use(protect);
router.post("/", controller.createOrder);
router.get("/my-orders", controller.myOrders);
router.get("/", adminOnly, controller.allOrders);
router.put("/:id/status", adminOnly, controller.updateStatus);
router.get("/:id", controller.getOrder);

module.exports = router;
