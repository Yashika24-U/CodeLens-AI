// /app/services/discoveryService.js
const db = require("../models"); // Adjust path to your Sequelize initialization
const { kmeans } = require("ml-kmeans");

async function runDiscoveryPipeline(numberOfClusters = 3) {
  try {
    // 1. Fetch all logged unclassified entries from Postgres
    const rawQueries = await db.sequelize.query(
      `SELECT raw_query, query_embedding FROM unclassified_queries`,
      { type: db.Sequelize.QueryTypes.SELECT },
    );

    if (rawQueries.length < numberOfClusters * 2) {
      return;
    }

    // 2. Format the database vector strings into standard JS numerical arrays
    // Postgres returns vector as a string: '[0.12, -0.4, ...]' -> convert to [0.12, -0.4, ...]
    const vectorDataMatrix = rawQueries.map((row) =>
      JSON.parse(row.query_embedding),
    );

    // 3. Execute the K-Means Algorithm!
    const result = kmeans(vectorDataMatrix, numberOfClusters, {
      initialization: "kmeans++", // Premium mathematical seeding technique
    });

    // 4. Map the algorithm cluster index outputs back to our raw text phrases
    const clusters = Array.from({ length: numberOfClusters }, () => []);

    result.clusters.forEach((clusterIndex, dataIndex) => {
      clusters[clusterIndex].push(rawQueries[dataIndex].raw_query);
    });

    // 5. Print out the structured clusters for analytical evaluation

    clusters.forEach((phrases, index) => {});

    return clusters;
  } catch (error) {
    console.error("❌ Error running discovery pipeline:", error);
  }
}

module.exports = { runDiscoveryPipeline };
