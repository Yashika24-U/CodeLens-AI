const express = require("express");
const router = express.Router();
const {
  getConversationList
} = require("../controllers/conversations/getConversationList");

router.get("/list", getConversationList);

module.exports = router;
