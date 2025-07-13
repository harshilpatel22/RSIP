import React, { useState, useEffect } from 'react';
import { apiService, wsService } from '../services/api';

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    ward: '',
    severity: '',
    timeRange: '7d'
  });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    assignedTo: '',
    rmcResponse: ''
  });

  useEffect(() => {
    loadIssues();
    
    // Set up real-time updates
    const handleUpdate = (data) => {
      if (data.type === 'NEW_ISSUE') {
        loadIssues(); // Refresh issues list
      } else if (data.type === 'ISSUE_UPDATED') {
        updateIssueInList(data.data);
      }
    };
    
    wsService.addListener(handleUpdate);
    
    return () => {
      wsService.removeListener(handleUpdate);
    };
  }, []);

  useEffect(() => {
    loadIssues();
  }, [filters]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIssues(filters);
      setIssues(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error loading issues:', err);
      setError('Failed to load issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const updateIssueInList = (updatedIssue) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === updatedIssue.id ? { ...issue, ...updatedIssue } : issue
      )
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setUpdateForm({
      status: issue.status,
      assignedTo: issue.assignedTo || '',
      rmcResponse: issue.rmcResponse || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIssue(null);
    setUpdateForm({ status: '', assignedTo: '', rmcResponse: '' });
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    
    if (!selectedIssue) return;
    
    try {
      await apiService.updateIssue(selectedIssue.id, updateForm);
      
      // Update the issue in the local list
      updateIssueInList({ ...selectedIssue, ...updateForm });
      
      closeModal();
      alert('Issue updated successfully!');
    } catch (err) {
      console.error('Error updating issue:', err);
      alert('Failed to update issue');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportIssues(filters, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `issues_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c2d12'
    };
    return colors[severity] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Loading issues...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Issues Management</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleExport}>
            📊 Export
          </button>
          <button className="btn btn-primary" onClick={loadIssues}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="card mb-4" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ color: '#ef4444' }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Filters</h3>
        </div>
        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ward</label>
            <select 
              className="form-select"
              value={filters.ward}
              onChange={(e) => handleFilterChange('ward', e.target.value)}
            >
              <option value="">All Wards</option>
              {Array.from({ length: 23 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Ward {i + 1}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Severity</label>
            <select 
              className="form-select"
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Issues ({issues.length})
          </h3>
        </div>

        {issues.length === 0 ? (
          <div className="text-center p-4" style={{ color: '#6b7280' }}>
            No issues found with current filters
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Ward</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {issue.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {issue.category?.en || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {issue.category?.gu || ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                          {issue.location?.address || 'Not provided'}
                        </div>
                        {issue.location?.lat && (
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex" style={{ alignItems: 'center' }}>
                        <div 
                          className="severity-indicator"
                          style={{ backgroundColor: getSeverityColor(issue.severity) }}
                        ></div>
                        <span style={{ textTransform: 'capitalize' }}>
                          {issue.severity}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${issue.status}`}>
                        {issue.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{issue.wardId}</td>
                    <td>{formatDate(issue.timestamps?.created)}</td>
                    <td>
                      <button 
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => openIssueModal(issue)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Update Modal */}
      {showModal && selectedIssue && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeModal}
        >
          <div 
            className="modal-content"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <h3>Update Issue: {selectedIssue.id}</h3>
              <button 
                className="btn btn-secondary"
                onClick={closeModal}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            {/* Issue Details */}
            <div className="mb-4" style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
              <h4>Issue Details</h4>
              <div className="grid grid-2 gap-2 mt-2">
                <div>
                  <strong>Category:</strong> {selectedIssue.category?.en}
                </div>
                <div>
                  <strong>Ward:</strong> {selectedIssue.wardId}
                </div>
                <div>
                  <strong>Severity:</strong> 
                  <span style={{ textTransform: 'capitalize', marginLeft: '0.5rem' }}>
                    {selectedIssue.severity}
                  </span>
                </div>
                <div>
                  <strong>Created:</strong> {formatDate(selectedIssue.timestamps?.created)}
                </div>
              </div>
              {selectedIssue.description && (
                <div className="mt-2">
                  <strong>Description:</strong>
                  <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                    {selectedIssue.description}
                  </p>
                </div>
              )}
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateIssue}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                  required
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input 
                  type="text"
                  className="form-input"
                  value={updateForm.assignedTo}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Team or person name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">RMC Response</label>
                <textarea 
                  className="form-textarea"
                  rows="4"
                  value={updateForm.rmcResponse}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, rmcResponse: e.target.value }))}
                  placeholder="Response message to citizen..."
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn btn-success">
                  Update Issue
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesList;