require("dotenv").config();
require("express-async-errors");

const app = require("./src/app");
const connectDatabase = require("./src/config/database");

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Documentation Swagger : http://localhost:${PORT}/api-docs`);
  });
}

start().catch((error) => {
  console.error("Impossible de démarrer le serveur :", error.message);
  process.exit(1);
});
