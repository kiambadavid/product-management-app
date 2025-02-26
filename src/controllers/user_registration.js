const bcrypt = require("bcrypt");
const { db } = require("../configurations/knex");
const { isAuthenticated } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");
const { logger } = require("../utilities/logger");
const { ResponseHandler } = require("../utilities/responseHandler");

// User registration
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      logger.debug("Name, email, or password not provided");
      return ResponseHandler.badRequest(res, "Fill all the fields to proceed.");
    }

    logger.debug(`Attempting registration for email: ${email}`);

    // Check if user already exists
    const existingUser = await db("user_registrations").where({ email });

    if (existingUser.length > 0) {
      logger.debug(`Email already exists: ${email}`);
      return ResponseHandler.badRequest(res, "Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.debug(`Password hashed for email: ${email}`);

    // Register new user
    const result = await db("user_registrations")
      .insert({ name, email, password: hashedPassword })
      .returning(["id", "name", "email", "created_at"]);

    logger.info(`New user registered: ${email}`);
    return ResponseHandler.created(res, { user: result });
  } catch (error) {
    if (error.code === "23505") {
      logger.debug(`Email already exists: ${email}`);
      return ResponseHandler.badRequest(res, "Email already exists");
    }
    logger.error("Registration error:", error);
    next(new AppError("Registration failed", 500));
  }
};

// User login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      logger.debug("Email or password not provided");
      return ResponseHandler.badRequest(res, "Fill all the fields to proceed.");
    }

    logger.debug(`Attempting login for email: ${email}`);

    // Check if user exists
    const user = await db("user_registrations").where({ email }).first();

    if (!user) {
      logger.debug(`No user found with email: ${email}`);
      return ResponseHandler.unauthorized(res, "Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.debug(`Password mismatch for email: ${email}`);
      return ResponseHandler.unauthorized(res, "Invalid credentials");
    }

    logger.debug(`User authenticated: ${email}`);
    logger.info(`User logged in: ${email}`);

    // Save user session
    req.session.user = { id: user.id, email: user.email, name: user.name };
    req.session.save((err) => {
      if (err) {
        logger.error("Session save error:", err);
        return next(new AppError("Session error", 500));
      }
      logger.debug(`Session saved for user: ${email}`);
      return ResponseHandler.success(res, {
        user: { id: user.id, email: user.email, name: user.name },
      });
    });
  } catch (error) {
    logger.error("Login error:", error);
    next(new AppError("Login failed", 500));
  }
};

// User logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error("Logout error:", err);
      return ResponseHandler.error(res, "Logout failed", 500);
    }
    res.clearCookie("connect.sid");
    logger.info("User logged out");
    return ResponseHandler.success(res, null, "Logged out successfully");
  });
};

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const users = await db("user_registrations").select(
      "id",
      "name",
      "email",
      "created_at"
    );
    logger.info("Users fetched");
    return ResponseHandler.success(res, { users });
  } catch (error) {
    logger.error("Get users error:", error);
    next(new AppError("Failed to fetch users", 500));
  }
};

module.exports = { register, login, logout, getUsers };
