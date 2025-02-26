const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_registration");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validateUser");

// Authentication routes
router.post("/register", validateRegistration, userController.register);
router.post("/login", validateLogin, userController.login);
router.post("/logout", userController.logout);

// User profile routes
router.get("/", userController.getUsers);

module.exports = router;
