const { GoogleGenAI } = require("@google/genai");
const { OpenAI } = require("openai");

// Initialize clients (ensure these environment variables are set in your .env file)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const groq = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function executeLLMCall(targetModel, userPrompt) {
  try {
    // 🌌 Route 1: Google Gemini Engines (Updated to use 2.5 versions)
    if (targetModel.startsWith("gemini")) {
      // Safely transform old strings to new versions recognized by the SDK
      let modelId = targetModel;
      if (targetModel === "gemini-1.5-flash") modelId = "gemini-2.5-flash";
      if (targetModel === "gemini-1.5-pro") modelId = "gemini-2.5-pro";

      const response = await ai.models.generateContent({
        model: modelId,
        contents: userPrompt,
      });
      return response.text;
    }

    // 🌌 Route 2: Groq Cloud Engine (Free Tier for Llama/DeepSeek Speed)
    if (targetModel.includes("llama") || targetModel.includes("deepseek")) {
      const response = await groq.chat.completions.create({
        model: targetModel,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.choices[0].message.content;
    }

    // 🌌 Route 3: OpenRouter Wrapper (With Server-Side Automated Fallbacks)
    if (
      targetModel.endsWith(":free") ||
      targetModel.includes("openai") ||
      targetModel.includes("qwen")
    ) {
      const response = await openrouter.chat.completions.create({
        model: targetModel,
        messages: [{ role: "user", content: userPrompt }],

        // 🛡️ OpenRouter automatically handles these backups if your 1st choice is busy/rate-limited
        extra_body: {
          models: [
            targetModel, // 1st choice
            "meta-llama/llama-3.3-70b-instruct:free", // 2nd choice backup
            "qwen/qwen-2.5-72b-instruct:free", // 3rd choice backup
          ],
        },
      });

      return response.choices[0].message.content;
    }

    // 🛡️ Safe Application-Level Fallback Layer
    // If a model string somehow slips past all routes above, route to Gemini Flash instead of crashing!
    console.warn(
      `⚠️ Model [${targetModel}] unhandled by routes. Redirecting to gemini-1.5-flash.`,
    );
    const fallbackResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: userPrompt,
    });
    return fallbackResponse.text;
  } catch (error) {
    console.error(`❌ LLM Call execution failed for ${targetModel}:`, error);
    throw error;
  }
}

module.exports = { executeLLMCall };
