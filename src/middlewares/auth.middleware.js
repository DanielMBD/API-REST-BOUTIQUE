const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentification requise" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Utilisateur introuvable" });
    }
    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Jeton invalide ou expiré" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Accès administrateur requis" });
  }
  next();
}

module.exports = { protect, adminOnly };
