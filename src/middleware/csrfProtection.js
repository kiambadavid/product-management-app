const { doubleCsrf } = require("csrf-csrf");

// CSRF protection options
const doubleCsrfOptions = {
  getSecret: (req) => process.env.CSRF_SECRET_KEY || "dangling-eel-pimple",
  getSessionIdentifier: (req) =>
    req.session && req.session.id ? req.session.id : "",
  cookieName: "__Host-csrf-token",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV,
    sameSite: "strict",
    path: "/",
  },
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  size: 64,
  getTokenFromRequest: (req) =>
    req.headers["csrf-token"] || (req.body && req.body._csrf),
};

// CSRF protection middleware
const { doubleCsrfProtection, generateToken } = doubleCsrf(doubleCsrfOptions);

module.exports = { doubleCsrfProtection, generateToken };
