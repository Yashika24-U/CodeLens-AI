// /app/workers/discoveryWorker.js
const { Worker } = require("bullmq");
const { runDiscoveryPipeline } = require("../services/discoveryService");

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker(
  "DiscoveryPipelineQueue",
  async (job) => {
    if (job.name === "runClustering") {
      console.log("🤖 BullMQ Worker processing cluster grouping active job...");
      // Execute the K-Means logic we built earlier
      await runDiscoveryPipeline(3);
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} finalized successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} threw an execution error:`, err);
});
