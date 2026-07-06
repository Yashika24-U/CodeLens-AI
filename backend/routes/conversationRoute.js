const express = require("express");
const router = express.Router();
const {
  getConversationList,
} = require("../controllers/conversations/getConversationList");

const {
  deleteConversation,
} = require("../controllers/conversations/deleteConversationList");

const {
  handleSearchConversations,
} = require("../controllers/conversations/handleSearchConversations");

router.get("/list", getConversationList);
router.delete("/:conversationId", deleteConversation);
router.get("/handleSearchConversations", handleSearchConversations);

module.exports = router;
