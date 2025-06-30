const axios = require('axios');

// Placeholder for GitHub API helper functions
exports.getGitHubData = async (url, accessToken) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
}; 