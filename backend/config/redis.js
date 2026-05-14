// ioredis = a tool that lets your Node.js app talk to Redis
const IORedis = require("ioredis");
const { Queue } = require("bullmq");

const connection = new IORedis({
  port: 6379,
  host: "redis",
  maxRetriesPerRequest: null,
});

// 2. Create the Queue (The Mailbox)
// THIS STRING "ai-review-queue" is what your Worker must also use!
const aiQueue = new Queue("ai-review-queue", { connection });

module.exports = { aiQueue, connection };
