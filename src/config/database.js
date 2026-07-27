const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/boutique_demo";
  await mongoose.connect(uri);
  console.log("Connexion MongoDB établie");
}

module.exports = connectDatabase;
