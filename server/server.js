// Catch ALL errors
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

const express = require("express");
require("express-async-errors"); // Handle async errors globally in Express 4
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// ======================
// Environment Validation
// ======================
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`ERROR: Missing required environment variable: ${varName}`);
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
});

const app = express();

// Middleware
const sanitizeMiddleware = require("./middleware/sanitize");

// ======================
// CORS Configuration
// ======================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://sri-neelambiga-industries.web.app",
      "https://sri-neelambiga-industries.firebaseapp.com"
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                        origin.startsWith("http://localhost:") ||
                        /^https:\/\/(www\.)?sri-neelambiga-industries(-[a-z0-9]+)?\.(web\.app|firebaseapp\.com)$/i.test(origin);
                        
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200 // Ensure success status code for OPTIONS preflight requests
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
// MongoDB (Serverless Optimized)
// ======================
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Prevent hanging queries
    });
    cachedConnection = conn;
    console.log("MongoDB Connected:", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

// Middleware to ensure DB connection is alive on every request (crucial for Serverless cold/hot starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(new Error(`Database connection failed: ${error.message}`));
  }
});

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

// Listen only when run directly (local development), Vercel will import the app
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;