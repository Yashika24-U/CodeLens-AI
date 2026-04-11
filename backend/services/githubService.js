const axios = require('axios');
const axios = require('axios');
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';


// Create a reusable instance for GitHub API calls
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Yashika-Notification-App' // GitHub API REQUIRES a User-Agent
  }
});

exports.getAccessToken = async (code) => {
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: 'application/json' }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('GitHub Token Error:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for token');
  }
};

exports.getGitHubUser = async (accessToken) => {
  try {
    // Now we use the githubApi instance we created above
    const response = await githubApi.get('/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error('GitHub User Profile Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch GitHub user profile');
  }
};

exports.exchangeCodeForToken = async (code) => {
  const response = await axios.post(GITHUB_TOKEN_URL, {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  }, {
    headers: { Accept: 'application/json' }
  });
  
  return response.data.access_token;
};

exports.fetchGitHubProfile = async (accessToken) => {
  const response = await axios.get(GITHUB_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
};