const { pipeline } = require("@xenova/transformers");
const db = require("../models");

let extractor = null;

// Initialize the model once on startup so we don't reload a 90MB file on every API call!
async function initEmbeddingModel() {
  if (!extractor) {
    // pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') - Node.js downloads the AI model's mathematical weights (the 90MB file)
    // and wraps it inside this extractor function. When you pass it text, it runs that text through the 6 layers of the neural network
    // and outputs the calculated meaning.

    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  
  
  }
}

async function getEmbedding(text) {
  // Fail-safe check in case initialization wasn't completed
  if (!extractor) await initEmbeddingModel();

  // 1. Generate the raw mathematical tensor output
  const output = await extractor(text, { pooling: "mean", normalize: true });

  // 2. Convert the raw tensor data structure into a standard JavaScript Float array
  const embeddingArray = Array.from(output.data);
  return embeddingArray; // This returns exactly an Array of 384 numbers
}
// ===============================================================================================================================================

//  Main Logic:

async function determineOptimalModel(text) {
  if (!extractor) await initEmbeddingModel();

  const userVector = await getEmbedding(text);

  const pgVectorString = `[${userVector.join(",")}]`;

  const query = `
    SELECT intent_name, target_model, (phrase_embedding <=> :vectorString) AS distance
    FROM router_dataset
    ORDER BY distance ASC LIMIT 1;
`;

  const res = await db.sequelize.query(query, {
    replacements: { vectorString: pgVectorString }, // Maps directly to :vectorString
    type: db.Sequelize.QueryTypes.SELECT,
  });



  const topMatch = res[0];

  

  const confidenceScore = topMatch ? 1 - topMatch.distance : 0;

 

  if (confidenceScore >= 0.6) {
   
    return topMatch.target_model;
  } else {
   

    await db.sequelize
      .query(
        `INSERT INTO unclassified_queries (raw_query, query_embedding) VALUES ($1, $2)`,
        {
          bind: [text, pgVectorString],
        },
      )
      .catch((err) => console.error("Failed to log unclassified query", err));

    return "gemini-1.5-flash";
  }
}
module.exports = { determineOptimalModel };

// await executeLLMCall(topMatch.target_model, userPrompt);
