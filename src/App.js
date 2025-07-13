import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');




  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <h1>RSIP - RMC Dashboard</h1>
            <div className="connection-status">
              <span className={`status-indicator ${connectionStatus}`}></span>
              <span>{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </header>

        <nav className="navigation">
          <ul>
            <li>
              <Link 
                to="/" 
                className={activeTab === 'dashboard' ? 'active' : ''}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </Link>
            </li>
            
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 Rajkot Municipal Corporation - RSIP System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;