const { User } = require("../models");
const llmService = require("../services/llmService");
const githubService = require("../services/githubService");

const handleGithubWebhook = async (req, res) => {
  const event = req.headers["x-github-event"];

  const { action, pull_request, repository } = req.body;

  // Exit early if its not the right event or the PR is closed
  if (
    event !== "pull_request" ||
    !["opened", "synchronize"].includes(action) ||
    pull_request.state !== "open"
  ) {
    return res.status(200).send("Event ignored or PR not active.");
  }

  // 1. Filter for relevant PR events
  if (
    event === "pull_request" &&
    (action === "opened" || action === "synchronize")
  ) {
    const owner = repository.owner.login;
    const ownerId = repository.owner.id;
    const repo = repository.name;
    const prNumber = pull_request.number;
    const commitId = "f2c5397ddd5716b87c2372ccb256028d527cf1d6";

    try {
      // 2. Identify the user
      let user;
      if (ownerId) {
        user = await User.findOne({ where: { githubId: ownerId.toString() } });
      } else {
        console.warn("⚠️ ownerId missing, falling back to username search...");
        user = await User.findOne({ where: { username: owner } });
      }

      if (!user) {
        return res.status(400).send("User not found!");
      }

      // 3. Fetch the diff
      const diff = await githubService.getPullRequestDiff(
        owner,
        repo,
        prNumber,
        user.githubAccessToken,
      );

      // 4. Analyze code via LLMd
      console.log("🧠 AI is analyzing the code...");

      const rawAiReview = await llmService.analyzeCodeDiff(diff);

      if (!rawAiReview || typeof rawAiReview !== "string") {
        throw new Error("Empty or invalid response from AI");
      }

      // Clean Markdown formatting if present
      let cleanString = rawAiReview.replace(/```json|```/g, "").trim();

      // 5. Extract and Parse JSON
      const jsonStart = cleanString.indexOf("[");
      const jsonEnd = cleanString.lastIndexOf("]") + 1;

      if (jsonStart !== -1) {
        const finalJson = cleanString.substring(jsonStart, jsonEnd);
        const suggestions = JSON.parse(finalJson);

        console.log("Found suggestions:", suggestions.length);

        const existingCommentsSet = await githubService.getExistingComments(
          owner,
          repo,
          prNumber,
          user.githubAccessToken,
        );
        console.log("exc", existingCommentsSet);

        // // 6. Post comments to GitHub
        for (const comment of suggestions) {
          // 2. Create a unique key for the current suggestion
          const suggestionKey = `${comment.path}:${comment.body}`;

          if (existingCommentsSet.has(suggestionKey)) {
            console.log(`Skipping duplicate comment for ${suggestion.path}`);
            continue; // Skip to the next suggestion
          }
          try {
            const result = await githubService.createLineComment(
              owner,
              repo,
              prNumber,
              user.githubAccessToken,
              comment,
              commitId,
            );
            console.log(
              `Comment created with ID: ${result.id} on line ${result.line}`,
            );
          } catch (error) {
            console.error("Error creating comment:", error.message);
          }
        }

        console.log("✅ All review comments posted successfully.");

        return res.status(200).send("Review posted!");
      } else {
        console.warn("No JSON array found in AI response.");
        return res.status(422).send("No actionable suggestions found.");
      }
    } catch (error) {
      console.error("Error processing webhook:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  } else {
    return res.status(200).send("Event ignored.");
  }
};

module.exports = { handleGithubWebhook };
