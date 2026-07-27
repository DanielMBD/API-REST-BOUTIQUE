const router = require("express").Router();
const { simulatePayment } = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/simulate", protect, simulatePayment);

module.exports = router;
