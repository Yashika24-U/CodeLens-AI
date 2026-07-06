const { pipeline } = require("@xenova/transformers");
const { QueryTypes } = require("sequelize");
const db = require("../models");

const trainingData = [
  // ==========================================
  // 1. CLOUD / DEVOPS DOMAIN -> Claude 3.5 Sonnet (Elite for Infrastructure)
  // ==========================================
  {
    intent: "CLOUD",
    model: "claude-3-5-sonnet",
    phrase: "how to configure aws iam policies and secure s3 buckets",
  },
  {
    intent: "CLOUD",
    model: "claude-3-5-sonnet",
    phrase: "setup a multi-stage ci/cd pipeline with github actions automation",
  },
  {
    intent: "CLOUD",
    model: "claude-3-5-sonnet",
    phrase:
      "kubernetes k8s deployment configuration files, pods, and dockerfiles",
  },
  {
    intent: "CLOUD",
    model: "claude-3-5-sonnet",
    phrase:
      "nginx reverse proxy setup load balancer and ssl certification routing",
  },

  // ==========================================
  // 2. ALGORITHMIC / LOGICAL DOMAIN -> Grok 4.3 (Parallel Multi-Agent Logic & Advanced Coding)
  // ==========================================
  {
    intent: "LOGICAL",
    model: "grok-4.3", // ◄ Swapped to Grok's elite reasoning/coding engine
    phrase: "solve dynamic programming array and graph problems on leetcode",
  },
  {
    intent: "LOGICAL",
    model: "grok-4.3",
    phrase:
      "how to invert a binary tree recursively with clean runtime complexity",
  },
  {
    intent: "LOGICAL",
    model: "grok-4.3",
    phrase:
      "debug a data race condition or memory leak in multi-threaded application",
  },
  {
    intent: "LOGICAL",
    model: "grok-4.3",
    phrase:
      "optimize nested loops and calculate big o worst case execution time",
  },

  // ==========================================
  // 3. SPORTS DOMAIN -> Gemini 1.5 Flash (Fast, High-Speed Updates)
  // ==========================================
  {
    intent: "SPORTS",
    model: "gemini-1.5-flash",
    phrase:
      "badminton rules scoring systems and how to hit a perfect smash shot",
  },
  {
    intent: "SPORTS",
    model: "gemini-1.5-flash",
    phrase:
      "premier league football match schedules scores standings and transfers",
  },
  {
    intent: "SPORTS",
    model: "gemini-1.5-flash",
    phrase: "cricket tournament world cup format line up runs and wickets",
  },
  {
    intent: "SPORTS",
    model: "gemini-1.5-flash",
    phrase:
      "nba basketball playoff brackets defensive tactics and player points",
  },

  // ==========================================
  // 4. FASHION & LIFESTYLE -> Claude 3.5 Sonnet (Amazing at Visual/Creative Copy)
  // ==========================================
  {
    intent: "FASHION",
    model: "claude-3-5-sonnet",
    phrase:
      "latest summer wardrobe trends streetwear clothing aesthetics and styling",
  },
  {
    intent: "FASHION",
    model: "claude-3-5-sonnet",
    phrase:
      "designer runway brands fashion week collections luxury apparel fabrics",
  },
  {
    intent: "FASHION",
    model: "claude-3-5-sonnet",
    phrase:
      "skincare routines healthy lifestyle habits nutrition and outfit matching",
  },

  // ==========================================
  // 5. STOCKS & FINANCE -> Grok 4.3 (Real-Time Market Sentiment & Live X Feeds)
  // ==========================================
  {
    intent: "STOCKS",
    model: "grok-4.3", // ◄ Grok dominates live financial sentiment analysis
    phrase:
      "stock market investing day trading strategies technical analysis candlestick patterns",
  },
  {
    intent: "STOCKS",
    model: "grok-4.3",
    phrase:
      "quarterly earnings reports profit margins dividend yields and revenue growth",
  },
  {
    intent: "STOCKS",
    model: "grok-4.3",
    phrase:
      "index funds mutual funds portfolios risk management and compound interest calculation",
  },

  // ==========================================
  // 6. POLITICS & CURRENT AFFAIRS -> Grok 4.3 (Live Firehose News Tracking)
  // ==========================================
  {
    intent: "POLITICS",
    model: "grok-4.3", // ◄ Swapped out Perplexity for Grok 4.3
    phrase:
      "government elections policy changes geopolitical summits parliament debates laws",
  },
  {
    intent: "POLITICS",
    model: "grok-4.3",
    phrase:
      "international relations trade agreements foreign policy updates and voting margins",
  },

  // ==========================================
  // 7. REAL-TIME SEARCH / NEWS -> Grok 4.3 (Unmatched Breaking News Speed)
  // ==========================================
  {
    intent: "SEARCH",
    model: "grok-4.3", // ◄ Swapped out Perplexity for Grok 4.3
    phrase:
      "what is the latest version current release notes status right now breaking news",
  },
  {
    intent: "SEARCH",
    model: "grok-4.3",
    phrase:
      "recent documentation changes announcements updates this week this year",
  },

  // ==========================================
  // 8. ARTIFICIAL INTELLIGENCE -> Gemini 1.5 Pro (Deep Theoretical Knowledge)
  // ==========================================
  {
    intent: "AI",
    model: "gemini-1.5-pro",
    phrase:
      "large language models deep learning neural networks weights training and backpropagation",
  },
  {
    intent: "AI",
    model: "gemini-1.5-pro",
    phrase:
      "prompt engineering retrieval augmented generation rag vector embedding space setup",
  },
  {
    intent: "AI",
    model: "gemini-1.5-pro",
    phrase:
      "fine tuning open source models transformers self attention mechanism tokenization",
  },
];

async function seedSystem() {
  try {
    // Load the local embedding pipeline
    const extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );

    // Clear existing training dataset so you can rerun this script safely to update it
    await db.sequelize.query("TRUNCATE TABLE router_dataset;");

    for (const item of trainingData) {
      // Generate the raw 384 tensor data
      const output = await extractor(item.phrase, {
        pooling: "mean",
        normalize: true,
      });
      const vectorArray = Array.from(output.data);
      const pgVectorString = `[${vectorArray.join(",")}]`;

      // Insert directly into postgres
      const query = `
                INSERT INTO router_dataset (intent_name,sample_phrase,phrase_embedding,target_model)
                VALUES ($1, $2, $3, $4);
            `;
      await db.sequelize.query(query, {
        bind: [item.intent, item.phrase, pgVectorString, item.model],
        type: QueryTypes.INSERT, // Tells Sequelize this is an insertion command
      });
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await db.sequelize.close();
  }
}

module.exports = { seedSystem };
