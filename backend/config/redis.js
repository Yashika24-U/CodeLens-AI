// ioredis = a tool that lets your Node.js app talk to Redis
const IORedis = require("ioredis");
const { Queue } = require("bullmq");

const connection = new IORedis({
  port: 6379,
  host: "redis",
  maxRetriesPerRequest: null,
});
connection.on("connect", () =>
  console.log("⚡ Connected to Redis container successfully!"),
);
connection.on("error", (err) =>
  console.error("❌ Redis Connection Error:", err),
);

// 2. Create the Queue (The Mailbox)
// THIS STRING "ai-review-queue" is what your Worker must also use!
// const aiQueue = new Queue("ai-review-queue", { connection });

const aiJobQueue = new Queue("DiscoveryPipelineQueue", {
  connection: connection,
});

async function scheduleDailyDiscovery() {
  await aiJobQueue.add(
    "runClustering",
    {},
    {
      repeat: { pattern: "0 0 * * *" },
    },
  );
  console.log("⏰ Discovery pipeline scheduled nightly via BullMQ.");
}

module.exports = { aiJobQueue, connection, scheduleDailyDiscovery };
