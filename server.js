const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const roleRoutes = require("./routes/role.routes");
const userRoutes = require("./routes/user.routes");

app.use("/roles", roleRoutes);
app.use("/users", userRoutes);

// Root
app.get("/", (req, res) => {
  res.json({ message: "NNPTUDM Ngay5 API is running" });
});

// Connect to MongoDB & start server
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/nnptudm_ngay5";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
