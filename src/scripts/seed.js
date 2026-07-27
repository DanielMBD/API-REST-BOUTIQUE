require("dotenv").config();
const connectDatabase = require("../config/database");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

async function seed() {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({})
  ]);

  const admin = await User.create({
    name: "Administrateur",
    email: "admin@boutique.ga",
    password: "Admin123!",
    role: "admin",
    address: "Libreville, Gabon"
  });

  const client = await User.create({
    name: "Client Démo",
    email: "client@boutique.ga",
    password: "Client123!",
    role: "client",
    address: "Port-Gentil, Gabon"
  });

  const categories = await Category.insertMany([
    { name: "Téléphones", description: "Smartphones et accessoires" },
    { name: "Ordinateurs", description: "Ordinateurs portables et accessoires" },
    { name: "Maison", description: "Produits pratiques pour la maison" }
  ]);

  await Product.insertMany([
    {
      name: "Samsung Galaxy A56",
      description: "Smartphone Android 5G, 128 Go.",
      price: 250000,
      stock: 12,
      image: "https://placehold.co/600x400?text=Galaxy+A56",
      category: categories[0]._id
    },
    {
      name: "iPhone 15",
      description: "Smartphone Apple, 128 Go.",
      price: 650000,
      stock: 7,
      image: "https://placehold.co/600x400?text=iPhone+15",
      category: categories[0]._id
    },
    {
      name: "Lenovo IdeaPad",
      description: "Ordinateur portable 15 pouces, 8 Go RAM, SSD 512 Go.",
      price: 420000,
      stock: 6,
      image: "https://placehold.co/600x400?text=Lenovo+IdeaPad",
      category: categories[1]._id
    },
    {
      name: "Casque Bluetooth",
      description: "Casque sans fil avec autonomie de 30 heures.",
      price: 35000,
      stock: 18,
      image: "https://placehold.co/600x400?text=Casque+Bluetooth",
      category: categories[0]._id
    },
    {
      name: "Mixeur multifonction",
      description: "Mixeur électrique avec trois vitesses.",
      price: 45000,
      stock: 4,
      image: "https://placehold.co/600x400?text=Mixeur",
      category: categories[2]._id
    },
    {
      name: "Lampe LED rechargeable",
      description: "Lampe rechargeable USB pour la maison.",
      price: 15000,
      stock: 20,
      image: "https://placehold.co/600x400?text=Lampe+LED",
      category: categories[2]._id
    }
  ]);

  console.log("Données de démonstration ajoutées.");
  console.log("Admin :", admin.email, "/ Admin123!");
  console.log("Client :", client.email, "/ Client123!");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
