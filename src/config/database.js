const mongoose = require("mongoose");

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/boutique_demo";
  await mongoose.connect(uri);
  console.log("Connexion MongoDB établie");
  return mongoose.connection;
}

module.exports = connectDatabase;
