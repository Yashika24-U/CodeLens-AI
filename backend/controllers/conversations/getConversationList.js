const { ChatMessage } = require("../../models");

exports.getConversationList = async (req, res) => {
  try {
    let allMessages = await ChatMessage.findAll({
      order: [["createdAt", "ASC"]],
    });

    const uniqueConversationsMap = new Map();

    allMessages.forEach((msg) => {
      // If we haven't tracked this conversationId yet, capture its FIRST message
      if (!uniqueConversationsMap.has(msg.conversationId)) {
        uniqueConversationsMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          // The first user prompt text becomes the Sidebar title thread string
          title:
            msg.text.length > 30 ? msg.text.substring(0, 30) + "..." : msg.text,
          createdAt: msg.createdAt,
        });
      }
    });

    const sidebarList = Array.from(uniqueConversationsMap.values());

    sidebarList.reverse();
    res.status(200).json({ success: true, data: sidebarList });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
