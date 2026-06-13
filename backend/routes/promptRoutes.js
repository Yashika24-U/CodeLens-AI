const express = require("express");
const router = express.Router();
const {getDashboardStats} = require("../controllers/chat/analyticsController");
const {handleUserPrompt} = require("../controllers/chat/chatController");
// const analyzeController = require("../controllers/prompt/promptAnalyzeController");

router.post("/handle-user-prompt", handleUserPrompt);
router.get("/dashboard-stats", getDashboardStats);

// router.post("/github/prompt", analyzeController.analyzePrompts);

module.exports = router;
