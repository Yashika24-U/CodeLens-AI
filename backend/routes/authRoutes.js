const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// routes/authRoutes.js
router.get("/github", authController.initiateGitHubLogin);
router.get("/github/callback", authController.handleCallback);

module.exports = router;
