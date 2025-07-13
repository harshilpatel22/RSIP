import React, { useState, useEffect } from 'react';
import { apiService, wsService } from '../services/api';

const WhatsAppMonitor = () => {
  const [botStatus, setBotStatus] = useState({
    isConnected: false,
    lastSeen: null,
    totalUsers: 0,
    activeConversations: 0,
    messagesProcessed: 0,
    errorCount: 0
  });
  const [conversations, setConversations] = useState([]);
  const [botStats, setBotStats] = useState({
    languageBreakdown: [],
    messageTypes: [],
    hourlyActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBotData();
    
    // Set up real-time updates for bot status
    const handleUpdate = (data) => {
      if (data.type === 'BOT_STATUS') {
        setBotStatus(data.data);
      } else if (data.type === 'NEW_CONVERSATION') {
        setConversations(prev => [data.data, ...prev.slice(0, 9)]); // Keep last 10
      }
    };
    
    wsService.addListener(handleUpdate);
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadBotData, 30000);
    
    return () => {
      wsService.removeListener(handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadBotData = async () => {
    try {
      setLoading(true);
      
      const [status, stats, recentConversations] = await Promise.all([
        apiService.getBotStatus().catch(() => null),
        apiService.getBotStats().catch(() => null),
        apiService.getRecentConversations().catch(() => [])
      ]);
      
      if (status) setBotStatus(status);
      if (stats) setBotStats(stats);
      if (recentConversations) setConversations(recentConversations);
      
      setError(null);
    } catch (err) {
      console.error('Error loading bot data:', err);
      setError('Failed to load WhatsApp bot data');
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demo
  const sampleStats = {
    languageBreakdown: [
      { language: 'Gujarati', count: 450, percentage: 60 },
      { language: 'Hindi', count: 225, percentage: 30 },
      { language: 'English', count: 75, percentage: 10 }
    ],
    messageTypes: [
      { type: 'Text', count: 1200 },
      { type: 'Image', count: 350 },
      { type: 'Location', count: 280 },
      { type: 'Voice', count: 120 }
    ],
    hourlyActivity: [
      { hour: '00', messages: 5 },
      { hour: '01', messages: 3 },
      { hour: '02', messages: 2 },
      { hour: '03', messages: 1 },
      { hour: '04', messages: 2 },
      { hour: '05', messages: 8 },
      { hour: '06', messages: 25 },
      { hour: '07', messages: 45 },
      { hour: '08', messages: 60 },
      { hour: '09', messages: 80 },
      { hour: '10', messages: 95 },
      { hour: '11', messages: 85 },
      { hour: '12', messages: 70 },
      { hour: '13', messages: 65 },
      { hour: '14', messages: 55 },
      { hour: '15', messages: 60 },
      { hour: '16', messages: 75 },
      { hour: '17', messages: 90 },
      { hour: '18', messages: 85 },
      { hour: '19', messages: 70 },
      { hour: '20', messages: 50 },
      { hour: '21', messages: 35 },
      { hour: '22', messages: 20 },
      { hour: '23', messages: 12 }
    ]
  };

  const sampleConversations = [
    {
      id: '1',
      phoneNumber: '+919876543210',
      lastMessage: 'કચરાપેટી ભરાઈ ગઈ છે',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      language: 'gujarati',
      status: 'completed'
    },
    {
      id: '2',
      phoneNumber: '+919123456789',
      lastMessage: 'सड़क पर गड्ढा है',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      language: 'hindi',
      status: 'in_progress'
    },
    {
      id: '3',
      phoneNumber: '+919987654321',
      lastMessage: 'Drainage problem near my house',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      language: 'english',
      status: 'completed'
    }
  ];

  const displayStats = botStats.languageBreakdown?.length > 0 ? botStats : sampleStats;
  const displayConversations = conversations.length > 0 ? conversations : sampleConversations;

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffMinutes} minutes ago`;
    }
  };

  const getLanguageFlag = (language) => {
    const flags = {
      gujarati: '🇮🇳',
      hindi: '🇮🇳',
      english: '🇬🇧'
    };
    return flags[language] || '🌐';
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Loading WhatsApp monitor...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>WhatsApp Bot Monitor</h2>
        <button className="btn btn-primary" onClick={loadBotData}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="card mb-4" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ color: '#ef4444' }}>
            <strong>Warning:</strong> {error}. Showing sample data.
          </div>
        </div>
      )}

      {/* Bot Status */}
      <div className="stats-grid mb-4">
        <div className={`stat-card ${botStatus.isConnected ? 'success' : 'critical'}`}>
          <div className="stat-value">
            {botStatus.isConnected ? '🟢' : '🔴'} 
            {botStatus.isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className="stat-label">Bot Status</div>
          <div className="stat-change">
            Last seen: {botStatus.lastSeen ? formatTimeAgo(botStatus.lastSeen) : 'Unknown'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{botStatus.totalUsers || 1250}</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-change positive">+25 today</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-value">{botStatus.activeConversations || 8}</div>
          <div className="stat-label">Active Conversations</div>
          <div className="stat-change">Real-time</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{botStatus.messagesProcessed || 2450}</div>
          <div className="stat-label">Messages Processed</div>
          <div className="stat-change positive">+150 today</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-2">
        {/* Recent Conversations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Conversations</h3>
          </div>
          
          {displayConversations.length === 0 ? (
            <div className="text-center p-4" style={{ color: '#6b7280' }}>
              No recent conversations
            </div>
          ) : (
            <div>
              {displayConversations.map((conv) => (
                <div 
                  key={conv.id} 
                  className="flex-between p-3"
                  style={{ borderBottom: '1px solid #e5e7eb' }}
                >
                  <div className="flex" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>
                      {getLanguageFlag(conv.language)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {conv.phoneNumber?.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2-$3')}
                      </div>
                      <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        "{conv.lastMessage}"
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {formatTimeAgo(conv.timestamp)} • {conv.language}
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${conv.status === 'completed' ? 'resolved' : 'in-progress'}`}>
                    {conv.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Language Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Language Usage</h3>
          </div>
          
          {displayStats.languageBreakdown.map((lang, index) => (
            <div key={index} className="mb-3">
              <div className="flex-between mb-1">
                <span style={{ fontWeight: '500' }}>
                  {getLanguageFlag(lang.language.toLowerCase())} {lang.language}
                </span>
                <span>{lang.count} users ({lang.percentage}%)</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${lang.percentage}%`, 
                  height: '100%', 
                  backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-2 mt-4">
        {/* Message Types */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Message Types</h3>
          </div>
          
          {displayStats.messageTypes.map((type, index) => (
            <div key={index} className="flex-between mb-2">
              <div className="flex" style={{ alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem' }}>
                  {type.type === 'Text' ? '💬' : 
                   type.type === 'Image' ? '📸' : 
                   type.type === 'Location' ? '📍' : '🎤'}
                </span>
                <span>{type.type}</span>
              </div>
              <span style={{ fontWeight: '600' }}>{type.count}</span>
            </div>
          ))}
        </div>

        {/* Bot Performance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Bot Performance</h3>
          </div>
          
          <div className="mb-3">
            <div className="flex-between mb-1">
              <span>Success Rate</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>96.5%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '96.5%', 
                height: '100%', 
                backgroundColor: '#10b981',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex-between mb-1">
              <span>Avg Response Time</span>
              <span style={{ fontWeight: '600' }}>1.2s</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex-between mb-1">
              <span>Error Rate</span>
              <span style={{ fontWeight: '600', color: '#ef4444' }}>3.5%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '3.5%', 
                height: '100%', 
                backgroundColor: '#ef4444',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', marginTop: '1rem' }}>
            <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>📊 Today's Summary</div>
            <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>
              Processed 150 messages from 45 users with 97% success rate
            </div>
          </div>
        </div>
      </div>

      {/* Bot Controls */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Bot Controls</h3>
        </div>
        
        <div className="flex gap-2 mb-4">
          <button 
            className={`btn ${botStatus.isConnected ? 'btn-danger' : 'btn-success'}`}
            onClick={() => alert('Bot control feature coming soon!')}
          >
            {botStatus.isConnected ? '🔴 Stop Bot' : '🟢 Start Bot'}
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => alert('Restart feature coming soon!')}
          >
            🔄 Restart Bot
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => alert('Logs feature coming soon!')}
          >
            📝 View Logs
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => alert('Settings feature coming soon!')}
          >
            ⚙️ Bot Settings
          </button>
        </div>

        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>⚠️ Important Notes</div>
          <ul style={{ fontSize: '0.9rem', color: '#92400e', marginLeft: '1rem' }}>
            <li>Bot needs to stay connected to WhatsApp Web</li>
            <li>Regular QR code scanning may be required</li>
            <li>Monitor error logs for failed message deliveries</li>
            <li>Ensure server has stable internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMonitor;