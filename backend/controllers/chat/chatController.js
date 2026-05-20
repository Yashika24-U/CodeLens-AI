const logApiTransaction = require("../../services/analyticsService")


exports.handleUserPrompt = async(req,res)=>{
    const {conversationId, prompt} = req.body,

    //1. Start the timer immediately before calling the AI
    const startTime = performance.now();

    try{ 
        // 2. Run your existing routing logic (e.g., deciding which AI gets it)
        const chosenModel = "gemini-1.5-flash";

        // Call your actual AI handler function
        const aiResponse = await callAiProvider(chosenModel, prompt);

        console.log('%c⧭aiResponse', 'color: #ff6600', aiResponse);

        // 3. Stop the timer right when the response is ready
        const endTime = performance.now();

        const latencyMs = Math.round(endTime - startTime);

        const promptTokens = aiResponse.usage.prompt_tokens || 100;

        const completionTokens =  aiResponse.usage.completion_tokens || 250;


        // 5. Fire and forget the logger (don't block the user's response time!)

        logApiTransaction({
            conversationId,
            selectedModel: chosenModel,
            promptTokens,
            completionTokens,
            latencyMs,
            })
            .then(() => {
                console.log("Transaction logged successfully");
            })
            .catch((error) => {
                console.error("Failed to log transaction:", error);
            });

        return res.json({
            model: chosenModel,
            text: aiResponse.text
        });

    }catch(error){
        return res.status(500).json({ error: "Something went wrong during generation" });
    }
    // This gives the execution time in milliseconds with microsecond precision.



}