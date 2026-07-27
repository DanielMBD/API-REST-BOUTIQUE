const router = require("express").Router();
const { register, login, profile } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un compte client
 *     responses:
 *       201:
 *         description: Compte créé
 */
router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);

module.exports = router;
