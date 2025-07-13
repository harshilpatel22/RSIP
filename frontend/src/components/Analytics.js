import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    issuesTrend: [],
    categoryBreakdown: [],
    wardStats: [],
    responseTimeData: [],
    resolutionRate: 0,
    userEngagement: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnalytics(timeRange);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
      // Set default data to prevent UI breaking
      setAnalytics({
        issuesTrend: [],
        categoryBreakdown: [],
        wardStats: [],
        responseTimeData: [],
        resolutionRate: 0,
        userEngagement: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demo (in case backend doesn't return data)
  const sampleData = {
    issuesTrend: [
      { date: '2025-01-01', issues: 12, resolved: 8 },
      { date: '2025-01-02', issues: 19, resolved: 15 },
      { date: '2025-01-03', issues: 8, resolved: 6 },
      { date: '2025-01-04', issues: 25, resolved: 18 },
      { date: '2025-01-05', issues: 15, resolved: 12 },
      { date: '2025-01-06', issues: 22, resolved: 20 },
      { date: '2025-01-07', issues: 18, resolved: 16 }
    ],
    categoryBreakdown: [
      { name: 'Garbage', value: 35, color: '#3b82f6' },
      { name: 'Water', value: 25, color: '#10b981' },
      { name: 'Roads', value: 20, color: '#f59e0b' },
      { name: 'Drainage', value: 15, color: '#ef4444' },
      { name: 'Others', value: 5, color: '#6b7280' }
    ],
    wardStats: [
      { ward: 'Ward 1', issues: 45, resolved: 38 },
      { ward: 'Ward 2', issues: 32, resolved: 30 },
      { ward: 'Ward 3', issues: 28, resolved: 25 },
      { ward: 'Ward 4', issues: 55, resolved: 42 },
      { ward: 'Ward 5', issues: 41, resolved: 39 }
    ],
    responseTimeData: [
      { time: '0-2h', count: 25 },
      { time: '2-6h', count: 35 },
      { time: '6-12h', count: 20 },
      { time: '12-24h', count: 15 },
      { time: '24h+', count: 5 }
    ]
  };

  // Use sample data if analytics is empty
  const chartData = {
    issuesTrend: analytics.issuesTrend?.length > 0 ? analytics.issuesTrend : sampleData.issuesTrend,
    categoryBreakdown: analytics.categoryBreakdown?.length > 0 ? analytics.categoryBreakdown : sampleData.categoryBreakdown,
    wardStats: analytics.wardStats?.length > 0 ? analytics.wardStats : sampleData.wardStats,
    responseTimeData: analytics.responseTimeData?.length > 0 ? analytics.responseTimeData : sampleData.responseTimeData
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280', '#8b5cf6', '#f97316'];

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Loading analytics...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Analytics Dashboard</h2>
        <div className="flex gap-2">
          <select 
            className="form-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>
          <button className="btn btn-primary" onClick={loadAnalytics}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="card mb-4" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ color: '#ef4444' }}>
            <strong>Warning:</strong> {error}. Showing sample data.
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-value">{analytics.totalIssues || 245}</div>
          <div className="stat-label">Total Issues</div>
          <div className="stat-change positive">+12% from last period</div>
        </div>

        <div className="stat-card success">
          <div className="stat-value">{analytics.resolutionRate || 78}%</div>
          <div className="stat-label">Resolution Rate</div>
          <div className="stat-change positive">+5% improvement</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-value">{analytics.avgResponseTime || 2.5}h</div>
          <div className="stat-label">Avg Response Time</div>
          <div className="stat-change negative">+0.3h from target</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{analytics.activeUsers || 1250}</div>
          <div className="stat-label">Active Users</div>
          <div className="stat-change positive">+85 new users</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-2">
        {/* Issues Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Issues Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.issuesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
              />
              <Legend />
              <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={3} name="New Issues" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Issues by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ward Performance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ward Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.wardStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ward" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="issues" fill="#3b82f6" name="Total Issues" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Response Time Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Detailed Statistics</h3>
        </div>
        
        <div className="grid grid-3">
          {/* Top Categories */}
          <div>
            <h4 className="mb-3">Top Issue Categories</h4>
            {chartData.categoryBreakdown.slice(0, 5).map((category, index) => (
              <div key={index} className="flex-between mb-2">
                <div className="flex" style={{ alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: category.color || COLORS[index],
                      borderRadius: '2px',
                      marginRight: '0.5rem'
                    }}
                  ></div>
                  <span>{category.name}</span>
                </div>
                <div>
                  <span style={{ fontWeight: '600' }}>{category.value}</span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                    ({((category.value / chartData.categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Performing Wards */}
          <div>
            <h4 className="mb-3">Top Performing Wards</h4>
            {chartData.wardStats
              .map(ward => ({ ...ward, rate: (ward.resolved / ward.issues * 100).toFixed(1) }))
              .sort((a, b) => b.rate - a.rate)
              .slice(0, 5)
              .map((ward, index) => (
                <div key={index} className="flex-between mb-2">
                  <span>{ward.ward}</span>
                  <div>
                    <span style={{ fontWeight: '600' }}>{ward.rate}%</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                      ({ward.resolved}/{ward.issues})
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Quick Insights */}
          <div>
            <h4 className="mb-3">Quick Insights</h4>
            <div className="mb-3" style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>📈 Trending Up</div>
              <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>
                Issue resolution rate improved by 5% this week
              </div>
            </div>
            
            <div className="mb-3" style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>⚠️ Attention Needed</div>
              <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                Ward 4 has the highest pending issues
              </div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>✅ Good Performance</div>
              <div style={{ fontSize: '0.9rem', color: '#065f46' }}>
                75% of issues resolved within 24 hours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Export Reports</h3>
        </div>
        
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => alert('CSV export feature coming soon!')}>
            📊 Export as CSV
          </button>
          <button className="btn btn-secondary" onClick={() => alert('PDF export feature coming soon!')}>
            📄 Export as PDF
          </button>
          <button className="btn btn-success" onClick={() => alert('Email report feature coming soon!')}>
            📧 Email Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;