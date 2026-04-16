const express = require("express");
const router = express.Router();
const analyzeController = require("../controllers/promptAnalyzeController");

router.post("/github/prompt", analyzeController.analyzePrompts);
