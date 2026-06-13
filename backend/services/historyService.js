/**
 * Fetches only the most recent conversation turns to keep token footprints low
 * @param {string} conversationId - Unique identifier for the current chat session
 * @param {number} limitTurns - Maximum number of recent messages to fetch (Default: 4)
 * @returns {Array} - Array of formatted message objects ordered chronologically
 */

const { ChatMessage } = require("../models");

exports.getSlidingWindowContext = async (conversationId, limitTurns = 4) => {
  console.log("%c⧭**Inside getSlidingWindowContext**", "color: #bfffc8");
  try {
    const rawMessages = await ChatMessage.findAll({
      where: { conversationId },
      limit: limitTurns,
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return rawMessages.reverse();
  } catch (error) {
    console.error("Error fetching sliding window history:", error);
    return []; // Return empty array as fallback so the app doesn't cra
  }
};
