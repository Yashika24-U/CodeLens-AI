const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeCodeDiff = async (diffText) => {
  const model = await genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const prompt = `
        You are an expert Senior Software Engineer specializing in the MERN stack.
        I will provide you with a Git Diff. Please review it and provide feedback.
        
        Rules:
        1. If there are no issues, say "Looks great! No major concerns."
        2. Categorize feedback into: 🔴 Bug, 🛡️ Security, ⚡ Performance, 🎨 Style, or 🛠️ Formatting.
        3. If you see indentation or formatting issues, suggest using tools like Prettier or ESLint.
        4. Be concise and professional.
        5. Provide the feedback as a simple bulleted list.

        Code Diff to review:
        ${diffText}
    `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("LLM Analysis Failed:", error);
    return "I encountered an error while reviewing the code.";
  }
};
