require("dotenv").config();
require("express-async-errors");

const app = require("../src/app");
const connectDatabase = require("../src/config/database");

let databaseConnection;

function shouldConnectDatabase(req) {
  const pathname = req.url.split("?")[0];
  const publicJsonRoutes = ["/api", "/api/", "/api/demo", "/api/health", "/demo", "/health"];

  return !publicJsonRoutes.includes(pathname) && !pathname.startsWith("/api-docs");
}

module.exports = async (req, res) => {
  if (shouldConnectDatabase(req)) {
    databaseConnection = databaseConnection || connectDatabase();
    await databaseConnection;
  }

  return app(req, res);
};
