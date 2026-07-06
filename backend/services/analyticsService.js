const { ApiLog } = require("../models");

const MODEL_PRICING = {
  "gemini-1.5-flash": { inputPrice: 0.075, outputPrice: 0.3 },
  "claude-3-5-sonnet": { inputPrice: 3.0, outputPrice: 15.0 },
  "o1-mini": { inputPrice: 3.0, outputPrice: 12.0 },
};

/**
 * Calculates token costs and logs the telemetry to the database
 */

exports.logApiTransaction = async ({
  conversationId,
  selectedModel,
  promptTokens,
  completionTokens,
  latencyMs,
}) => {
  try {
    const currentModel = MODEL_PRICING[selectedModel];
    const o1model = MODEL_PRICING["o1-mini"];
    if (!currentModel) {
      console.error(`Pricing rules not found for model: ${selectedModel}`);
      return null;
    }

    // Math: (Tokens / 1,000,000) * Price Per Million
    const calculatedCost =
      (promptTokens / 1000000) * currentModel.inputPrice +
      (completionTokens / 1000000) * currentModel.inputPrice;

    // Baseline calculation: What if we blindly routed this to o1-mini instead?

    const estimatedO1Cost =
      (promptTokens / 1000000) * o1Model.inputPrice +
      (completionTokens / 1000000) * o1Model.outputPrice;

    //  Save directly to PostgreSQL using Sequelize model

    const logEntry = await ApiLog.create({
      selectedModel,
      promptTokens,
      completionTokens,
      latencyMs,
      calculatedCost,
      estimatedO1Cost,
    });

    return logEntry;
  } catch (error) {
    console.error("Failed to log API transaction metrics:", error);
  }
};
