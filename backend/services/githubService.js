const axios = require("axios");
require("dotenv").config();

// exchangeCodeForToken
exports.exchangeCodeForToken = async (code) => {
  const response = await axios.post(
    process.env.GITHUB_TOKEN_URL,
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: { Accept: "application/json" },
    },
  );

  return response.data.access_token;
};

// fetchGitHubProfile
exports.fetchGitHubProfile = async (accessToken) => {
  const response = await axios.get(process.env.GITHUB_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

// Get PullReq Diff
exports.getPullRequestDiff = async (owner, repo, prNumber, token) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.diff",
        },
      },
    );
    return await response.data;
  } catch (error) {
    console.error(
      "Error fetching diff:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
