const express = require("express");
const router = express.Router();
const oauthController = require("../controllers/auth/oauthController");
const authController = require("../controllers/auth/authController");

// routes/authRoutes.js
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password", authController.resetPassword);
router.get("/github", oauthController.initiateGitHubLogin);
router.get("/github/callback", oauthController.handleCallback);

module.exports = router;
