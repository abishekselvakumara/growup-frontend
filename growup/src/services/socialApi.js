// src/services/socialApi.js

// ======================================
// GITHUB API (WORKING)
// ======================================
export const fetchGitHubProfile = async (username) => {
  try {
    if (!username || username.includes("@")) {
      throw new Error("GitHub requires username, not email");
    }

    const response = await fetch(
      `https://api.github.com/users/${username}`
    );

    if (!response.ok) throw new Error("GitHub user not found");

    const data = await response.json();

    return {
      followers: data.followers || 0,
      public_repos: data.public_repos || 0,
      avatar: data.avatar_url,
      name: data.name || username,
      bio: data.bio || "",
      growth: calculateGrowth("github", data.followers || 0),
      source: 'api'
    };
  } catch (error) {
    console.error("GitHub API error:", error.message);
    return null;
  }
};

// ======================================
// YOUTUBE API - Requires API Key
// ======================================
export const fetchYouTubeStats = async (channelId, apiKey) => {
  try {
    if (!channelId || !apiKey) {
      throw new Error("Channel ID and API Key are required");
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    );
    
    if (!response.ok) throw new Error("YouTube channel not found");
    
    const data = await response.json();
    const stats = data.items?.[0]?.statistics || {};
    
    return {
      subscribers: parseInt(stats.subscriberCount) || 0,
      views: parseInt(stats.viewCount) || 0,
      videos: parseInt(stats.videoCount) || 0,
      growth: calculateGrowth("youtube", parseInt(stats.subscriberCount) || 0),
      source: 'api'
    };
  } catch (error) {
    console.error("YouTube API error:", error.message);
    return null;
  }
};

// ======================================
// LEETCODE - Using public API
// ======================================
export const fetchLeetCodeProfile = async (username) => {
  try {
    if (!username) {
      throw new Error("Username is required");
    }

    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    
    if (!response.ok) throw new Error("LeetCode user not found");
    
    const data = await response.json();
    
    if (data.status === "error") {
      throw new Error(data.message || "User not found");
    }

    return {
      totalSolved: data.totalSolved || 0,
      easy: data.easySolved || 0,
      medium: data.mediumSolved || 0,
      hard: data.hardSolved || 0,
      acceptance: data.acceptanceRate || 0,
      ranking: data.ranking || 0,
      contribution: data.contributionPoints || 0,
      reputation: data.reputation || 0,
      growth: calculateGrowth("leetcode", data.totalSolved || 0),
      source: 'api'
    };
  } catch (error) {
    console.error("LeetCode API error:", error.message);
    
    // Try alternative API
    try {
      const altResponse = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
      if (altResponse.ok) {
        const altData = await altResponse.json();
        return {
          totalSolved: altData.solvedProblem || 0,
          easy: altData.easySolved || 0,
          medium: altData.mediumSolved || 0,
          hard: altData.hardSolved || 0,
          growth: calculateGrowth("leetcode", altData.solvedProblem || 0),
          source: 'api'
        };
      }
    } catch (altError) {
      console.error("Alternative LeetCode API also failed:", altError);
    }
    
    return null;
  }
};

// ======================================
// MANUAL DATA INPUT HELPERS
// ======================================
export const saveManualData = (platform, data) => {
  try {
    localStorage.setItem(`${platform}-manual`, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      source: 'manual'
    }));
    return true;
  } catch (error) {
    console.error(`Error saving manual ${platform} data:`, error);
    return false;
  }
};

export const getManualData = (platform) => {
  try {
    const data = localStorage.getItem(`${platform}-manual`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting manual ${platform} data:`, error);
    return null;
  }
};

export const clearManualData = (platform) => {
  try {
    localStorage.removeItem(`${platform}-manual`);
    return true;
  } catch (error) {
    console.error(`Error clearing manual ${platform} data:`, error);
    return false;
  }
};

// ======================================
// GROWTH CALCULATION
// ======================================
const calculateGrowth = (platform, currentValue) => {
  try {
    const saved = localStorage.getItem(`${platform}-history`);
    let history = saved ? JSON.parse(saved) : [];

    history.push({
      value: currentValue,
      date: new Date().toISOString(),
    });

    history = history.slice(-10);
    localStorage.setItem(`${platform}-history`, JSON.stringify(history));

    if (history.length >= 2) {
      const previousValue = history[history.length - 2].value;
      if (previousValue > 0) {
        return (((currentValue - previousValue) / previousValue) * 100).toFixed(1);
      }
    }
    return 0;
  } catch (error) {
    console.error("Growth calc error:", error);
    return 0;
  }
};

// ======================================
// LINKEDIN - Placeholder (manual only)
// ======================================
export const fetchLinkedInProfile = async () => {
  return null;
};

// ======================================
// INSTAGRAM PROFILE - Placeholder (manual only)
// ======================================
export const fetchInstagramProfile = async () => {
  return null;
};

// ======================================
// FACEBOOK PROFILE - Placeholder (manual only)
// ======================================
export const fetchFacebookProfile = async () => {
  return null;
};