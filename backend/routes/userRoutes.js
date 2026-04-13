const express = require("express");
const router = express.Router();
const User = require("../models/User");
const githubService = require("../services/githubService");
// Checking the diff check-test

// Need to move this part to controllers
router.post("/github/webhook", async (req, res) => {
  const event = req.headers["x-github-event"];
  const { action, pull_request, repository } = req.body;
  if (
    event === "pull_request" &&
    (action === "opened" || action === "synchronize")
  ) {
    const owner = repository.owner.login;
    const repo = repository.name;
    const prNumber = pull_request.number;
    try {
      const user = await User.findOne({ githubUsername: owner });
      if (!user) {
        return res.status(400).send("User not found!");
      }

      // Fetch the diff
      const diff = githubService.getPullRequestDiff(
        owner,
        repo,
        prNumber,
        user.githubAccessToken,
      );
      console.log("Diff Received! Length:", diff.length);

      // 3. LOG THE DIFF (Just to see it for now)
      console.log("--- START OF DIFF ---");
      console.log(diff.substring(0, 500)); // Print first 500 chars
      console.log("--- END OF DIFF ---");
    } catch (error) {
      console.error("Workflow failed:", err);
    }
  }
  res.status(200).send("Processed");
});

// Checking the diff check-test

//  https://5688-2409-40f4-2e-daaf-f154-e11d-cb75-9040.ngrok-free.app/api/github/webhook

module.exports = router;
