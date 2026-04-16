const generateMasterPrompt = async (reqBody) => {
  const { role, subRole, action, depth, content } = reqBody;

  // WHt if any of the option is not present

  try {
    const personPart = PERSONAS[role.toUpperCase()][subRole.toUpperCase()];
    const levelPart = LEVELS[depth.toUpperCase()];
    const actionPart = ACTIONS[action.toUpperCase()];
    return `
    ${BASE_GUARDRAIL}
    
    CORE ROLE: ${personaPart}
    TONE & DEPTH: ${levelPart}
    PRIMARY TASK: ${actionPart}
    
    Please provide the output in the structured JSON format previously defined.
  `;
  } catch (error) {
    console.error("Prompt Generation Error:", err);
    return `${BASE_GUARDRAIL} Act as a Senior Software Engineer and perform a standard review.`;
  }
};
