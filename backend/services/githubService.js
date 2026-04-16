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

exports.createLineComment = async (
  owner,
  repo,
  prNumber,
  token,
  commentData,
  commitId,
) => {
  try {
    console.log("commentData", commentData);
    const { body, path, line } = commentData;
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/comments`,
      {
        body: body,
        path: path,
        line: parseInt(line),
        side: "RIGHT",
        commit_id: commitId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

exports.getExistingComments = async (owner, repo, pullNumber, token) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    return new Set(response.data.map((c) => `${c.path}: ${c.body}`));
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

// exports.createPRreview = async (owner, repo, prNumber, token, reviewBody) => {
//   try {
//     const response = await axios.post(
//       `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
//       {
//         body: reviewBody,
//         event: "COMMENT",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: "application/vnd.github.v3+json",
//         },
//       },
//     );
//     return response.data;
//   } catch (error) {
//     console.error("GitHub API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };
