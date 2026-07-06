const { Op } = require("sequelize");
const { ChatMessage } = require("../../models");

exports.handleSearchConversations = async (req, res) => {
  const { query } = req.query;
  const cleanQuery = query?.trim();

  if (!cleanQuery) {
    return res.status(400).json({ error: "Search query string is required" });
  }

  try {
    // 1. Find all rows matching the keyword globally across the single table
    const matchingRows = await ChatMessage.findAll({
      where: {
        text: {
          [Op.iLike]: `%${cleanQuery}%`,
        },
      },
      order: [["createdAt", "DESC"]],
      limit: 50, // Pull up to 50 matches to group them
    });

    // 2. 🎯 THE GEMINI TRICK: Group the results by conversation_id in memory
    const groupedResults = {};

    matchingRows.forEach((row) => {
      const convoId = row.conversationId;

      if (!groupedResults[convoId]) {
        groupedResults[convoId] = {
          conversationId: convoId,
          lastMatchAt: row.createdAt,
          snippets: [],
        };
      }
      //   // Push the specific message text match into this conversation's snippet barrel
      groupedResults[convoId].snippets.push({
        id: row.id,
        sender: row.sender,
        text: row.text,
        createdAt: row.createdAt,
      });
    });

    console.log("%c⧭ groupedResults", "color: #731d6d", groupedResults);

    // Convert the dictionary object back into a clean array for the frontend UI
    return res.status(200).json({
      success: true,
      results: Object.values(groupedResults),
    });
  } catch (error) {
    console.error("Single-table search failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
