const { ChatMessage } = require("../../models");

exports.deleteConversation = async (req, res) => {
  const { conversationId } = req.params;
  if (!conversationId) {
    return res.status(400).json({ error: "Conversation ID is required" });
  }
  try {
    await ChatMessage.destroy({
      where: {
        conversationId: conversationId,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: false, error: "Internal server error" });
  }
};
