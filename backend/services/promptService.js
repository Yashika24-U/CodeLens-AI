const BASE_GUARDRAIL = require("../config/BASE_GUARDRAIL");
const { PERSONAS, LEVELS, ACTIONS } = require("../config/aiTemplate");

exports.generateMasterPrompt = async (reqBody) => {
  // 1. Destructure with default empty values to prevent "undefined" errors
  const {
    role = "DEVELOPER",
    subRole = "SENIOR",
    action = "REVIEW",
    depth = "INTERMEDIATE",
    content = "",
  } = reqBody;

  try {
    // 2. Safe Property Access: Check if the keys exist in your config files
    // If not, fall back to a safe default string
    const roleKey = role.toUpperCase();
    const subRoleKey = subRole.toUpperCase();
    const depthKey = depth.toUpperCase();
    const actionKey = action.toUpperCase();

    const personPart =
      PERSONAS[roleKey] && PERSONAS[roleKey][subRoleKey]
        ? PERSONAS[roleKey][subRoleKey]
        : "a Senior Software Engineer";

    const levelPart =
      LEVELS[depthKey] || "providing a balanced, intermediate-level analysis";
    const actionPart =
      ACTIONS[actionKey] || "perform a comprehensive technical review";

    // 3. The "Smart" Multi-Directional Prompt
    return `
    ${BASE_GUARDRAIL}
    
    ENVIRONMENT: You are operating in a strict "Technical Learning Zone." 
    Your goal is to eliminate distractions and focus purely on engineering excellence.

    CORE ROLE: ${personPart}
    TONE & DEPTH: ${levelPart}
    PRIMARY TASK: ${actionPart}
    
    INPUT:
    """
    ${content.trim()}
    """

    TASK LOGIC:
    1. CLASSIFY: Determine if the INPUT is Code, a Technical Question, or Non-Technical/Nonsense.
    2. STRICT SCOPE: If the input is NOT related to Software Engineering, System Design, or Programming, 
       return "success": false and explain that you only handle tech topics.
    3. SCORING:
       - If Code: Provide a score (0-100).
       - If Technical Question (no code): Set "score" to null and provide a detailed explanation.
       - If Garbage/Nonsense: Set "success": false.

    OUTPUT INSTRUCTIONS:
    Return ONLY a valid JSON object. No prose or markdown backticks.
    
    {
      "success": boolean,
      "isCode": boolean,
      "data": {
        "score": number | null, 
        "explanation": "A concise technical response or review summary",
        "issue": "Specific primary concern or null",
        "solutions": ["array", "of", "actionable", "steps"]
      }
    }
`;
  } catch (error) {
    // 4. Critical Failure Fallback
    console.error("Critical Prompt Generation Failure:", error);
    return `${BASE_GUARDRAIL} 
    Perform a standard technical review of the following input. 
    Ensure output is JSON format with score and explanation.
    INPUT: ${content}`;
  }
};
