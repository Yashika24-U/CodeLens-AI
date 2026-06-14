const callExpensiveModel = async (prompt) => {
  if ((process.env === USE_MOCK_APIS) === "true") {
    console.log(
      "[MOCK MODE]: Simulating premium AI response to save tokens...",
    );

    return {
      text: "[Simulated Reasoning Response]: This is a high-quality mock answer resolving your complex code logic.",
      usage: {
        prompt_tokens: 120,
        completion_tokens: 250,
      },
      latencyMs: 1500,
    };
    // ─── OTHERWISE, RUN THE REAL PAID PRODUCTION CODE ───

    const response = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response;
  }
};
