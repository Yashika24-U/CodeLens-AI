const { aiService } = require("../../services/llmService");
const { Review } = require("../../models");
const { aiQueue } = require("../../config/redis");

exports.analyzePrompts = async (req, res) => {
  const ALLOWED_DEPTHS = ["BEGINNER", "INTERMEDIATE", "EXPERT"];
  let review;
  try {
    const { content, depth, tech_stack } = req.body;
    const cleanContent = content ? content.trim() : "";

    if (!cleanContent || cleanContent.length < 10) {
      return res
        .status(400)
        .json({ error: "Please provide meaningful code (min 10 chars)." });
    }

    if (!ALLOWED_DEPTHS.includes(depth)) {
      return res.status(400).json({ error: "Invalid depth level selected." });
    }

    review = await Review.create({
      user_id: req.user.id,
      tech_stack: req.body.tech_stack,
      content: req.body.content,
      depth: req.body.depth.toUpperCase(),
      status: "PENDING",
    });

    // 2. ADD TO REDIS (The Producer Step)
    // We pass the database 'id' so the worker knows which row to update later

    await aiQueue.add(
      "analyze-code",
      { reviewId: review.id, content, depth, tech_stack },
      {
        attempts: 3, // Try 3 times total
        backoff: {
          type: "exponential",
          delay: 5000, // Start with 5 seconds, then 10s, then 20s
        },
        removeOnComplete: true, // Clean up Redis after success
      },
    );

    // 3. RESPOND IMMEDIATELY
    // We don't wait for the AI. we just tell the user "We are working on it."
    return res.status(202).json({
      success: true,
      message: "Review in progress",
      reviewId: review.id,
    });
  } catch (error) {
    console.error("Queue Error:", error);
    return res.status(500).json({ error: "Failed to queue the review." });
  }
};
