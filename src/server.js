require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const { errorHandler } = require("./middleware/errorHandler");
const { doubleCsrfProtection } = require("./middleware/csrfProtection");
const userRoutes = require("./routes/user.route");
const productRoutes = require("./routes/product.route");
const cookieParser = require("cookie-parser");
const csrfRoute = require("./routes/csrf.route");

const app = express();

// Security middleware (prevent XXS attacks)
app.use(helmet());

// Cors middleware configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Session middleware Configuration
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Cookie-parser passed before CSRF protection middleware
app.use(cookieParser());

// CSRF endpoint for obtaining a new token
app.use("/api/csrf-token", csrfRoute);

// CSRF skip conditions for register, login, and logout routes
app.use((req, res, next) => {
  const skipPaths = [
    "/api/csrf-token",
    "/api/users/register",
    "/api/users/login",
    "/api/users/logout",
  ];
  if (skipPaths.includes(req.path)) {
    return next();
  }
  return doubleCsrfProtection(req, res, next);
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Error handling middleware
app.use(errorHandler);

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
