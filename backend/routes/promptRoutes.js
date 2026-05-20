const express = require("express");
const router = express.Router();
const analyzeController = require("../controllers/prompt/promptAnalyzeController");

router.post("/github/prompt", analyzeController.analyzePrompts);

module.exports = router;
