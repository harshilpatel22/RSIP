const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Issues API
  async getIssues(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/issues${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getIssue(id) {
    return this.request(`/api/issues/${id}`);
  }

  async updateIssue(id, updates) {
    return this.request(`/api/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async assignIssue(id, assignedTo) {
    return this.updateIssue(id, { assignedTo });
  }

  async updateIssueStatus(id, status, response = '') {
    return this.updateIssue(id, { 
      status, 
      rmcResponse: response,
      'timestamps.updated': new Date().toISOString()
    });
  }

  // File upload for issues
  async uploadFiles(issueId, files) {
    const formData = new FormData();
    
    // Handle both single file and array of files
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    const response = await fetch(`${this.baseURL}/api/issues/${issueId}/files`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status}`);
    }

    return response.json();
  }

  // Analytics API
  async getAnalytics(timeRange = '7d') {
    return this.request(`/api/analytics?range=${timeRange}`);
  }

  async getWardStats() {
    return this.request('/api/analytics/wards');
  }

  async getCategoryStats() {
    return this.request('/api/analytics/categories');
  }

  // Dashboard API
  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }

  async getRecentActivity() {
    return this.request('/api/dashboard/recent');
  }

  // WhatsApp Bot API
  async getBotStatus() {
    return this.request('/api/bot/status');
  }

  async getBotStats() {
    return this.request('/api/bot/stats');
  }

  async getRecentConversations() {
    return this.request('/api/bot/conversations');
  }

  // Health check

  // Export functionality
  async exportIssues(filters = {}, format = 'csv') {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    queryParams.append('format', format);
    
    const response = await fetch(`${this.baseURL}/api/export/issues?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

// WebSocket service for real-time updates
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    const wsURL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws';
    
    try {
      this.ws = new WebSocket(wsURL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instances
const apiService = new ApiService();
const wsService = new WebSocketService();

// Auto-connect WebSocket 
wsService.connect();

export { apiService, wsService };
export default apiService;