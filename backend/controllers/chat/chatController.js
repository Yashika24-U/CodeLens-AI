const logApiTransaction = require("../../services/analyticsService");
const { determineOptimalModel } = require("../../services/routerService");
const { aiJobQueue, connection } = require("../../config/redis");
const { getSlidingWindowContext } = require("../../services/historyService");
const { ChatMessage } = require("../../models");
const { executeLLMCall } = require("../../services/aiExecutionService");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

exports.handleUserPrompt = async (req, res) => {
  const { conversationId, prompt } = req.body;

  if (!prompt || prompt.trim().length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Missing conversationId or prompt." });
  }

  const cleanPrompt = prompt.trim().toLowerCase().replace(/\s+/g, " ");

  try {
    const sanitizedTargetId =
      conversationId && conversationId !== "" ? conversationId : null;
    const finalConversationId = sanitizedTargetId || crypto.randomUUID();

    // ⚡ STEP 1: Redis Semantic / Exact Match Caching Layer
    // We create a deterministic lookup key combining the conversation context and prompt string
    const cacheKey = `cache:chat:${finalConversationId}:${crypto.createHash("md5").update(cleanPrompt).digest("hex")}`;

    const cachedResponse = await connection.get(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(JSON.parse(cachedResponse));
    }

    // 🔍 STEP 2: Intent Classification Layer (The Semantic Router)
    // This happens *only* if Redis doesn't have the answer recorded yet.
    const selectedModel = await determineOptimalModel(cleanPrompt);

    // 📚 STEP 3: Context Compilation (Fetch history for active conversations)
    const history = sanitizedTargetId
      ? await getSlidingWindowContext(sanitizedTargetId, 4)
      : [];

    await ChatMessage.create({
      id: crypto.randomUUID(),
      conversationId: finalConversationId,
      sender: "user",
      text: cleanPrompt,
    });

    const startTime = performance.now();

    const aiResponseText = await executeLLMCall(
      selectedModel,
      cleanPrompt,
      history,
    );

    const endTime = performance.now();
    try {
      const savedMessage = await ChatMessage.create({
        id: crypto.randomUUID(),
        conversationId: finalConversationId, // 🔍 Double check what this variable equals right here!
        sender: "model",
        text: aiResponseText,
      });

      console.log(
        "✅ Postgres write verified successfully:",
        savedMessage.toJSON(),
      );
    } catch (dbError) {
      console.error("❌ SEQUELIZE INSERTION CRASHED:", dbError);
    }

    // 3. Save the response into your Redis Cache immediately (for the next hit)
    await connection.set(
      cacheKey,
      JSON.stringify({ reply: aiResponseText }),
      "EX",
      3600,
    );

    // Return instantly to the client so their application UI remains lightning fast
    return res.status(202).json({
      success: true,
      message: "Request queued for processing.",
      data: {
        conversationId: finalConversationId,
        reply: aiResponseText,
        routingLatencyMs: Math.round(endTime - startTime),
      },
    });
  } catch (error) {
    console.error("❌ Critical Gateway Error:", error);

    // 🛡️ Guard against secondary database failures
    try {
      // Best-effort attempt to save the error to the database
      await ChatMessage.create({
        id: crypto.randomUUID(),
        conversationId: finalConversationId,
        sender: "model",
        text: "⚠️ I encountered an internal routing error while processing this prompt. Please click retry.",
        isError: true,
      });
    } catch (dbError) {
      // If the DB itself is dead, we swallow this error so it doesn't block the HTTP response!
      console.error(
        "🚨 Secondary Failure: Could not write error log to PostgreSQL:",
        dbError,
      );
    }

    // 🎯 ALWAYS return the response to the client, even if the DB is completely down
    return res
      .status(500)
      .json({ success: false, message: "Internal Gateway Routing Error." });
  }
};

exports.getUserConversation = async (req, res) => {
  const conversationId = req.params.id;

  try {
    let response = await ChatMessage.findAll({
      where: {
        conversationId: conversationId,
      },
    });
    res.status(200).json({ success: true, response: response });
  } catch (error) {
    console.log("%c⧭error", "color: #ffa280", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Gateway Routing Error." });
  }
};
