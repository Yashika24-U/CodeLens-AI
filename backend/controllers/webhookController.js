const { User } = require("../models");
const githubService = require("../services/githubService");

const handleGithubWebhook = async (req, res) => {
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
      const user = await User.findOne({
        where: { username: owner },
      });
      console.log("user", user);
      if (!user) {
        return res.status(400).send("User not found!");
      }

      // Fetch the diff
      const diff = await githubService.getPullRequestDiff(
        owner,
        repo,
        prNumber,
        user.githubAccessToken,
      );
      console.log("diff", diff);
      console.log("Diff, Received! Length:", diff.length);

      // 3. LOG THE DIFF (Just to see it for now)
      console.log("--- START OF DIFF ---");
      console.log(diff.substring(0, 500)); // Print first 500 chars
      console.log("--- END OF DIFF ---");
    } catch (error) {
      console.error("Workflow failed:", error);
    }
  }
  res.status(200).send("Processed");
};

module.exports = { handleGithubWebhook };
