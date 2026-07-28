const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

function getApiOverview(req) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return {
    success: true,
    name: "Boutique API REST",
    message: "Bienvenue sur l'API REST de demonstration de la boutique.",
    usage: {
      local: "http://localhost:3000/api",
      online: `${baseUrl}/api`,
      directDemo: `${baseUrl}/demo`
    },
    examples: {
      health: `${baseUrl}/api/health`,
      demo: `${baseUrl}/api/demo`,
      demoDirect: `${baseUrl}/demo`,
      products: `${baseUrl}/api/products`,
      categories: `${baseUrl}/api/categories`,
      swagger: `${baseUrl}/api-docs`
    }
  };
}

function getDemoData() {
  return {
    success: true,
    message: "Exemple de donnees JSON renvoyees par une API REST.",
    data: [
      {
        id: 1,
        name: "Sac artisanal",
        price: 15000,
        currency: "FCFA",
        inStock: true
      },
      {
        id: 2,
        name: "T-shirt coton",
        price: 8000,
        currency: "FCFA",
        inStock: true
      }
    ]
  };
}

app.get(["/api", "/api/"], (req, res) => {
  res.json(getApiOverview(req));
});

app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ success: true, message: "API opérationnelle" });
});

app.get(["/api/demo", "/demo"], (_req, res) => {
  res.json(getDemoData());
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
