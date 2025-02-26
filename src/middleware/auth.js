const { db } = require("../configurations/knex");
const { ResponseHandler } = require("../utilities/responseHandler");

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const result = await db("user_registrations").where({
      id: req.session.user.id,
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    ResponseHandler.unauthorized(res, "Please log in to continue");
  }
};

module.exports = {
  authMiddleware,
  isAuthenticated,
};
