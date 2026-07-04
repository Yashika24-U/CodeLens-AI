const express = require("express");
const router = express.Router();
const {
  getConversationList,
} = require("../controllers/conversations/getConversationList");

const {
  deleteConversation,
} = require("../controllers/conversations/deleteConversationList");

router.get("/list", getConversationList);
router.delete("/:conversationId", deleteConversation);

module.exports = router;
