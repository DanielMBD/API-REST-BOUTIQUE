const User = require("../models/User");
const createToken = require("../utils/token");

async function register(req, res) {
  const { name, email, password, address = "" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Nom, e-mail et mot de passe requis" });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ success: false, message: "Cet e-mail est déjà utilisé" });
  }

  const user = await User.create({ name, email, password, address });
  res.status(201).json({
    success: true,
    token: createToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address }
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password || ""))) {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }

  res.json({
    success: true,
    token: createToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address }
  });
}

async function profile(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { register, login, profile };
