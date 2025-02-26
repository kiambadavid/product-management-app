const express = require("express");
const router = express.Router();
const { generateToken } = require("../middleware/csrfProtection");

// GET /api/csrf-token - generate and return a CSRF token (also sets the cookie)
router.get("/", (req, res) => {
  const token = generateToken(req, res);
  res.json({ csrfToken: token });
});

module.exports = router;
