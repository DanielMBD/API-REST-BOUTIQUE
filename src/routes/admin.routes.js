const router = require("express").Router();
const { stats, clients } = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.use(protect, adminOnly);
router.get("/stats", stats);
router.get("/clients", clients);

module.exports = router;
