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

// exports.analyzePrompts = async (req, res) => {
//   let review;
//   try {
//     const { content, depth } = req.body;
//     console.log("**", req.body.content);
//     if (!content) {
//       return res.status(400).json({ error: "Content is required!" });
//     }
//     let charCount = content.trim().length;

//     if (charCount < 10) {
//       return res
//         .status(400)
//         .json({ error: "Input is too short. Please provide more context" });
//     }
//     if (charCount > 8000) {
//       return res.status(400).json({ error: "Input is too long!" });
//     }
//     review = await Review.create({
//       user_id: req.user.id,
//       tech_stack: req.body.tech_stack,
//       content: req.body.content,
//       depth: req.body.depth,
//       status: "PENDING",
//     });
//     const result = await aiService.generate(req.body);
//     const aiData = result || {};
//     const finalScore = typeof aiData.score === "number" ? aiData.score : 0;
//     await review.update({
//       review_feedback: JSON.stringify(aiData),
//       score: finalScore,
//       status: "COMPLETED",
//     });

//     res.status(200).json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     console.error("Beast Mode Error Log:", error.message);
//     if (review) {
//       await review.update({ status: "FAILED" });
//     }
//     res.status(500).json({ success: false, message: error.message });
//   }
// }
