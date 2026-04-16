const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const promptService = require("../services/promptService");

exports.analyzeCodeDiff = async (diffText) => {
  const model = await genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });

  const prompt = `
    You are an expert Senior Software Engineer. Review this Git Diff.
    
    CRITICAL RULES:
    1. Output MUST be ONLY a valid JSON array of objects. No intro text, no bullet points.
    2. If no issues are found, return an empty array: [].
    3. Each object MUST have: "path" (string), "line" (number), and "body" (string).
    4. Categorize the "body" starting with [Bug], [Security], [Performance], [Style], or [Formatting].
    5. Only comment on lines starting with "+" in the diff.

    Diff to review:
    ${diffText}

    Required JSON Structure:
    [{"path": "file.js", "line": 5, "body": "Remove console.log"}]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("LLM Analysis Failed:", error.message);
    // Returning "[]" is perfect here; it prevents the controller from crashing
    return "[]";
  }
};

exports.aiService = {
  generate: async (reqBody) => {
    const systemInstruction = promptService.generateMasterPrompt(reqBody);
    try {
      const model = await genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: systemInstruction,
      });

      const result = await model.generateContent(reqBody.content);

      const response = await result.response;

      const text = response.text();

      const cleanedText = text.replace(/```json|```/g, "").trim();

      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Gemini Service Error:", error);
      throw new Error("Failed to process request with Gemini");
    }
  },
};
