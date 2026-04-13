const githubService = require("../services/githubService");
const { User } = require("../models"); // Assuming your index.js exports models
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

exports.initiateGitHubLogin = (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  if (req.session) {
    req.session.oauthState = state;
  }
  const { GITHUB_CLIENT_ID, GITHUB_CALLBACK_URL } = process.env;
  // Basic guard clause
  if (!GITHUB_CLIENT_ID || !GITHUB_CALLBACK_URL) {
    return res.status(500).json({ error: "OAuth configuration missing" });
  }
  const GITHUB_AUTH_URL = process.env.GITHUB_AUTH_URL;
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: "user:email repo",
    state: state,
  });
  res.redirect(`${GITHUB_AUTH_URL}?${params.toString()}`);
};

// Handle callback
exports.handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "No code provided from GitHub" });
    }

    // 1. Exchange code for Access Token
    const accessToken = await githubService.exchangeCodeForToken(code);
    
    // 2. Get User Profile using that token
    const profile = await githubService.fetchGitHubProfile(accessToken);

    // 3. Find or Create User in PostgreSQL (Best Practice: Atomic operation)
    const [user, created] = await User.findOrCreate({
      where: { githubId: profile.id.toString() },
      defaults: {
        username: profile.login,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        githubAccessToken: accessToken, // Store this for later PR reviews
      },
    });

    // 4. Update token if user already exists (Best Practice: Token Refresh)
    if (!created) {
      await user.update({ githubAccessToken: accessToken });
    }

    // 5. Create our App's JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // 6. Set Secure Cookie (Best Practice: HttpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 7. Redirect to Frontend
    res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.error("Auth Error:", error.message);
    const errorUrl = `${process.env.FRONTEND_URL}/login?error=auth_failed`;
    res.redirect(errorUrl);
  }
};
