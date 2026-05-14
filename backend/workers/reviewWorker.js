const { Worker } = require("bullmq");
const { connection } = require("../config/redis");
const { Review } = require("../models");
const llmService = require("../services/llmService");

exports.reviewWorker = new Worker(
  "ai-review-queue",
  async (job) => {
    console.log("%c⧭ jodData", "color: #00a3cc", job.data);
    const { reviewId, content, depth, tech_stack } = job.data;

    try {
      console.log("%c Inside try in reviewWorker", "color: #917399");
      // 1. Call the actual AI service (takes ~45 seconds)

      const aiFeedback = await llmService.aiService.generate({
        content: job.data.content,
        depth: job.data.depth,
        tech_stack: job.data.tech_stack,
      });

      await Review.update(
        {
          status: "COMPLETED",
          review_feedback: JSON.stringify(aiFeedback),
        },
        {
          where: { id: reviewId },
        },
      );

      console.log(
        `%c⧭ Job ${job.id} completed for Review ${reviewId}`,
        "color: #00e600",
      );
    } catch (error) {
      await Review.update(
        {
          status: "FAILED",
        },
        {
          where: { id: reviewId },
        },
      );
      console.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  },
  { connection },
);
