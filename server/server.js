// Catch ALL errors
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// Middleware
const sanitizeMiddleware = require("./middleware/sanitize");

// ======================
// Middleware
// ======================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",

      // Replace these with your Firebase URLs after deployment
      "https://YOUR-CLIENT.web.app",
      "https://YOUR-ADMIN.web.app",
      "https://YOUR-CLIENT.firebaseapp.com",
      "https://YOUR-ADMIN.firebaseapp.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);

// Disable cache
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// ======================
// MongoDB
// ======================

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

connectDB();

// ======================
// Routes
// ======================

app.use("/api", require("./routes"));

// ======================
// Root Route
// ======================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sri Neelambiga Industries API Running Successfully 🚀",
    version: "1.0.0",
  });
});

// ======================
// 404 Handler
// ======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// ======================
// Global Error Handler
// ======================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});