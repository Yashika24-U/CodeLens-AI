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
      conversationId.trim() !== "" ? conversationId : null;
    const finalConversationId = sanitizedTargetId || crypto.randomUUID();

    // ⚡ STEP 1: Redis Semantic / Exact Match Caching Layer
    // We create a deterministic lookup key combining the conversation context and prompt string
    const cacheKey = `cache:chat:${finalConversationId}:${crypto.createHash("md5").update(cleanPrompt).digest("hex")}`;

    const cachedResponse = await connection.get(cacheKey);
    if (cachedResponse) {
      console.log("🚀 Redis Cache Hit! Returning instant response.");
      return res.status(200).json(JSON.parse(cachedResponse));
    }

    // 🔍 STEP 2: Intent Classification Layer (The Semantic Router)
    // This happens *only* if Redis doesn't have the answer recorded yet.
    const selectedModel = await determineOptimalModel(cleanPrompt);
    console.log(`🤖 Semantic Router selected model: ${selectedModel}`);

    // 📚 STEP 3: Context Compilation (Fetch history for active conversations)
    const history = sanitizedTargetId
      ? await getSlidingWindowContext(sanitizedTargetId, 4)
      : [];
    const startTime = performance.now();
    const aiResponseText = await executeLLMCall(
      selectedModel,
      cleanPrompt,
      history,
    );

    console.log("%c⧭Await after execute LLM", "color: #ffa280");
    // 3. Save the response into your Redis Cache immediately (for the next hit)
    await connection.set(
      cacheKey,
      JSON.stringify({ reply: aiResponseText }),
      "EX",
      3600,
    );

    console.log("%c⧭Afterrrr cachingggggg", "color: #eeff00");
    // 💾 STEP 4: Database Persistence (Save incoming user request state)
    await ChatMessage.create({
      id: crypto.randomUUID(),
      conversationId: finalConversationId,
      sender: "user",
      text: cleanPrompt,
    });

    const endTime = performance.now();

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
    return res
      .status(500)
      .json({ success: false, message: "Internal Gateway Routing Error." });
  }
};
