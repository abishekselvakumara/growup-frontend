const API_BASE = 'https://growupgang.onrender.com/api'; // Change this to your actual backend URL
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Helper to create timeout promise
const timeout = (ms) => {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  // Check if response is ok
  if (!response.ok) {
    // Handle 401/403 - token expired
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Try to parse error response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
    } catch (e) {
      // If response is not JSON, get text
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }
  }

  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
  } else {
    // For non-JSON responses (like DELETE operations)
    const text = await response.text();
    return text || { success: true };
  }
};

const fetchWithTimeout = async (url, options = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        ...getAuthHeader()
      }
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

export const api = {
  // Auth
  login: async (credentials) => {
    return fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  },
  
  register: async (userData) => {
    return fetchWithTimeout(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },

  // Notes
  getNotes: async () => {
    return fetchWithTimeout(`${API_BASE}/notes`);
  },
  
  createNote: async (note) => {
    return fetchWithTimeout(`${API_BASE}/notes`, {
      method: 'POST',
      body: JSON.stringify(note)
    });
  },
  
  updateNote: async (id, note) => {
    return fetchWithTimeout(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note)
    });
  },
  
  deleteNote: async (id) => {
    return fetchWithTimeout(`${API_BASE}/notes/${id}`, {
      method: 'DELETE'
    });
  },

  // Events
  getEvents: async () => {
    return fetchWithTimeout(`${API_BASE}/events`);
  },
  
  getTodayEvents: async () => {
    return fetchWithTimeout(`${API_BASE}/events/today`);
  },
  
  getUpcomingEvents: async () => {
    return fetchWithTimeout(`${API_BASE}/events/upcoming`);
  },
  
  createEvent: async (event) => {
    return fetchWithTimeout(`${API_BASE}/events`, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  },
  
  updateEvent: async (id, event) => {
    return fetchWithTimeout(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event)
    });
  },
  
  deleteEvent: async (id) => {
    return fetchWithTimeout(`${API_BASE}/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Finance
  getTransactions: async () => {
    return fetchWithTimeout(`${API_BASE}/finance`);
  },
  
  getFinanceSummary: async () => {
    return fetchWithTimeout(`${API_BASE}/finance/summary`);
  },
  
  createTransaction: async (transaction) => {
    return fetchWithTimeout(`${API_BASE}/finance`, {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  },
  
  deleteTransaction: async (id) => {
    return fetchWithTimeout(`${API_BASE}/finance/${id}`, {
      method: 'DELETE'
    });
  },

  // Social Stats
  getSocialStats: async () => {
    return fetchWithTimeout(`${API_BASE}/social/grouped`);
  },
  
  saveManualStat: async (platform, data) => {
    return fetchWithTimeout(`${API_BASE}/social/${platform}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  saveApiStat: async (platform, data) => {
    return fetchWithTimeout(`${API_BASE}/social/${platform}/api`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Dashboard
  getDashboardSummary: async () => {
    return fetchWithTimeout(`${API_BASE}/dashboard/summary`);
  },

  // Diary
  getDiaryEntries: async () => {
    return fetchWithTimeout(`${API_BASE}/diary`);
  },
  
  createDiaryEntry: async (entry) => {
    return fetchWithTimeout(`${API_BASE}/diary`, {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  },
  
  deleteDiaryEntry: async (id) => {
    return fetchWithTimeout(`${API_BASE}/diary/${id}`, {
      method: 'DELETE'
    });
  },

  // Settings
  getSettings: async () => {
    return fetchWithTimeout(`${API_BASE}/settings`);
  },
  
  updateSettings: async (settings) => {
    return fetchWithTimeout(`${API_BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // API Credentials
  getApiCredentials: async () => {
    return fetchWithTimeout(`${API_BASE}/settings/credentials`);
  },
  
  updateApiCredentials: async (credentials) => {
    return fetchWithTimeout(`${API_BASE}/settings/credentials`, {
      method: 'PUT',
      body: JSON.stringify(credentials)
    });
  },

  // PLANT STREAK METHODS
  getPlantStreak: async () => {
    return fetchWithTimeout(`${API_BASE}/user/plant-streak`);
  },

  waterPlant: async () => {
    return fetchWithTimeout(`${API_BASE}/user/plant-streak/water`, {
      method: 'POST'
    });
  },

  resetPlantStreak: async () => {
    return fetchWithTimeout(`${API_BASE}/user/plant-streak/reset`, {
      method: 'POST'
    });
  },

  updatePlantStreak: async (watered) => {
    return fetchWithTimeout(`${API_BASE}/user/plant-streak/update`, {
      method: 'POST',
      body: JSON.stringify({ watered })
    });
  },

  getPlantStreakStatus: async () => {
    return fetchWithTimeout(`${API_BASE}/user/plant-streak/status`);
  },

  // SHARE PROFILE METHODS
  createSharedProfile: async (settings) => {
    return fetchWithTimeout(`${API_BASE}/share/create`, {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  },

  // Get public profile (no auth required)
  getPublicProfile: async (shareCode) => {
    const response = await fetch(`${API_BASE}/share/${shareCode}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Profile not found');
    return response.json();
  },

  // Update share settings
  updateShareSettings: async (settings) => {
    return fetchWithTimeout(`${API_BASE}/share/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Deactivate share link
  deactivateSharedProfile: async () => {
    return fetchWithTimeout(`${API_BASE}/share/deactivate`, {
      method: 'DELETE'
    });
  },

  // Get share analytics
  getShareAnalytics: async () => {
    return fetchWithTimeout(`${API_BASE}/share/analytics`);
  },

  // Helper to check if backend is running
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};