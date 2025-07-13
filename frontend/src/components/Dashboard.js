import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  Settings, 
  LogOut, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Download,
  Bell,
  Calendar,
  BarChart3,
  Search,
  UserPlus,
  Shield,
  Monitor,
  Camera,
  MessageSquare,
  Zap,
  TrendingUp,
  Map,
  FileText,
  User,
  Lock
} from 'lucide-react';

// CSS Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb'
  },
  headerContent: {
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logo: {
    height: '32px',
    width: '32px',
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userInfo: {
    textAlign: 'right'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: 0
  },
  userRole: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  button: {
    padding: '8px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    transition: 'all 0.2s'
  },
  buttonHover: {
    color: '#6b7280',
    backgroundColor: '#f3f4f6'
  },
  primaryButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  mainLayout: {
    display: 'flex'
  },
  sidebar: {
    width: '256px',
    backgroundColor: 'white',
    boxShadow: '1px 0 3px 0 rgba(0, 0, 0, 0.1)',
    borderRight: '1px solid #e5e7eb'
  },
  sidebarNav: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sidebarItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    textAlign: 'left',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    color: '#6b7280'
  },
  sidebarItemActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe'
  },
  sidebarItemHover: {
    backgroundColor: '#f9fafb'
  },
  content: {
    flex: 1,
    padding: '24px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  cardHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  cardContent: {
    padding: '24px'
  },
  grid: {
    display: 'grid',
    gap: '24px'
  },
  gridCols4: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
  },
  gridCols2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
  },
  gridCols3: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '24px',
    display: 'flex',
    alignItems: 'center'
  },
  statIcon: {
    padding: '8px',
    borderRadius: '8px',
    marginRight: '16px'
  },
  statIconBlue: {
    backgroundColor: '#eff6ff',
    color: '#2563eb'
  },
  statIconGreen: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a'
  },
  statIconOrange: {
    backgroundColor: '#fff7ed',
    color: '#ea580c'
  },
  statIconYellow: {
    backgroundColor: '#fefce8',
    color: '#ca8a04'
  },
  statIconRed: {
    backgroundColor: '#fef2f2',
    color: '#dc2626'
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    margin: 0
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  alert: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  alertText: {
    fontWeight: '500',
    color: '#b91c1c'
  },
  issueItem: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  issueItemHover: {
    backgroundColor: '#f9fafb'
  },
  issueMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  issueId: {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#6b7280'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500'
  },
  badgeRed: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c'
  },
  badgeOrange: {
    backgroundColor: '#fff7ed',
    color: '#ea580c'
  },
  badgeYellow: {
    backgroundColor: '#fefce8',
    color: '#ca8a04'
  },
  badgeGreen: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a'
  },
  badgeGray: {
    backgroundColor: '#f9fafb',
    color: '#374151'
  },
  issueTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '4px'
  },
  issueDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
    lineHeight: '1.4'
  },
  issueFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '12px',
    color: '#6b7280'
  },
  issueFooterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '896px',
    width: '100%',
    margin: '16px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827'
  },
  modalClose: {
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'none',
    border: 'none'
  },
  modalBody: {
    padding: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '80px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
  },
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)'
  },
  loginCard: {
    maxWidth: '400px',
    width: '100%',
    padding: '32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    margin: '16px'
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  loginLogo: {
    margin: '0 auto 24px',
    height: '48px',
    width: '48px',
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px'
  },
  loginSubtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  demoCredentials: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  demoTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '8px'
  },
  demoList: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px',
    color: '#6b7280'
  },
  emptyIcon: {
    height: '48px',
    width: '48px',
    margin: '0 auto 12px',
    color: '#d1d5db'
  },
  placeholder: {
    height: '256px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280'
  },
  placeholderContent: {
    textAlign: 'center'
  }
};

// Mock data for demonstration
const SAMPLE_ISSUES = [
  {
    id: 'RSP001234',
    category: { en: 'Garbage/Waste', gu: 'કચરો/કચરાપેટી' },
    wardId: 15,
    status: 'open',
    severity: 'high',
    location: { 
      lat: 22.3039, 
      lng: 70.8022, 
      address: 'Bhaktinagar, Ward 15, Near School'
    },
    description: 'Garbage bin overflowing near school premises',
    phoneNumber: '+91-9876543210',
    language: 'gujarati',
    timestamps: {
      created: '2025-01-10T10:30:00Z',
      updated: '2025-01-10T11:00:00Z'
    },
    photos: ['photo1.jpg'],
    assignedTo: '',
    rmcResponse: ''
  },
  {
    id: 'RSP001235',
    category: { en: 'Drainage/Sewage', gu: 'ગટર/નાળું' },
    wardId: 12,
    status: 'in_progress',
    severity: 'critical',
    location: { 
      lat: 22.2897, 
      lng: 70.7869, 
      address: 'Kuvadva, Ward 12, Main Road'
    },
    description: 'Sewage overflow on main road causing traffic issues',
    phoneNumber: '+91-9876543211',
    language: 'hindi',
    timestamps: {
      created: '2025-01-09T14:15:00Z',
      updated: '2025-01-10T09:30:00Z'
    },
    photos: ['photo2.jpg', 'photo3.jpg'],
    assignedTo: 'Team C - Drainage',
    rmcResponse: 'Team dispatched, work in progress'
  }
];

const SAMPLE_EMPLOYEES = [
  {
    id: 'admin001',
    name: 'Dr. Rajesh Kumar',
    email: 'admin@rmc.rajkot.gov.in',
    role: 'admin',
    designation: 'Municipal Commissioner',
    department: 'Administration',
    phone: '+91-281-2441234',
    status: 'active'
  },
  {
    id: 'ward015',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@rmc.rajkot.gov.in',
    role: 'ward_officer',
    designation: 'Ward Officer',
    department: 'Sanitation',
    wards: [15],
    phone: '+91-9876543210',
    status: 'active'
  }
];

// Main Application Component
const RMCDashboard = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [issues, setIssues] = useState(SAMPLE_ISSUES);
  const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({
    ward: 'all',
    status: 'all',
    severity: 'all',
    timeRange: '7d'
  });

  // Authentication Functions
  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setCurrentView(data.user.role === 'admin' ? 'admin-dashboard' : 'ward-dashboard');
        await loadUserData(data.token);
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    localStorage.removeItem('token');
  };

  const loadUserData = async (token) => {
    try {
      const issuesResponse = await fetch('/api/issues-protected', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        setIssues(issuesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(userData => {
        setUser(userData);
        setCurrentView(userData.role === 'admin' ? 'admin-dashboard' : 'ward-dashboard');
        loadUserData(token);
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={styles.container}>
      <Header user={user} onLogout={handleLogout} onNavigate={setCurrentView} />
      
      <div style={styles.mainLayout}>
        <Sidebar 
          user={user} 
          currentView={currentView} 
          onNavigate={setCurrentView} 
        />
        
        <main style={styles.content}>
          {currentView === 'admin-dashboard' && (
            <AdminDashboard 
              issues={issues}
              employees={employees}
              onViewIssue={setSelectedIssue}
              onNavigate={setCurrentView}
            />
          )}
          
          {currentView === 'ward-dashboard' && (
            <WardDashboard 
              user={user}
              issues={issues.filter(issue => 
                user.wards.length === 0 || user.wards.includes(issue.wardId)
              )}
              onViewIssue={setSelectedIssue}
            />
          )}
          
          {currentView === 'map' && (
            <MapView 
              issues={issues}
              onViewIssue={setSelectedIssue}
            />
          )}
          
          {currentView === 'employees' && user.role === 'admin' && (
            <EmployeeManagement 
              employees={employees}
              onUpdate={setEmployees}
            />
          )}
          
          {currentView === 'analytics' && (
            <AnalyticsPage issues={issues} />
          )}
        </main>
      </div>
      
      {selectedIssue && (
        <IssueModal 
          issue={selectedIssue}
          user={user}
          onClose={() => setSelectedIssue(null)}
          onUpdate={(updatedIssue) => {
            setIssues(prev => prev.map(issue => 
              issue.id === updatedIssue.id ? updatedIssue : issue
            ));
          }}
        />
      )}
    </div>
  );
};

// Login Page Component
const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!credentials.email || !credentials.password) {
      alert('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    await onLogin(credentials);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <div style={styles.loginLogo}>
            <Shield style={{ height: '24px', width: '24px', color: 'white' }} />
          </div>
          <h2 style={styles.loginTitle}>
            RMC Employee Portal
          </h2>
          <p style={styles.loginSubtitle}>
            Rajkot Municipal Corporation
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              required
              style={styles.input}
              placeholder="your.email@rmc.rajkot.gov.in"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <div>
            <label style={styles.label}>
              Password
            </label>
            <input
              type="password"
              required
              style={styles.input}
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              ...styles.primaryButton,
              width: '100%',
              justifyContent: 'center',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        <div style={styles.demoCredentials}>
          <h3 style={styles.demoTitle}>Demo Credentials:</h3>
          <div style={styles.demoList}>
            <div><strong>Admin:</strong> admin@rmc.rajkot.gov.in / admin123</div>
            <div style={{ marginTop: '4px' }}><strong>Ward Officer:</strong> ramesh.patel@rmc.rajkot.gov.in / ward123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ user, onLogout, onNavigate }) => {
  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <Shield style={{ height: '20px', width: '20px', color: 'white' }} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>RMC Dashboard</h1>
            <p style={styles.headerSubtitle}>Rajkot Sanitation Intelligence Platform</p>
          </div>
        </div>
        
        <div style={styles.headerRight}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell style={{ height: '20px', width: '20px', color: '#9ca3af' }} />
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user?.name}</p>
              <p style={styles.userRole}>{user?.designation}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            style={styles.button}
            title="Logout"
          >
            <LogOut style={{ height: '20px', width: '20px' }} />
          </button>
        </div>
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar = ({ user, currentView, onNavigate }) => {
  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'map', label: 'Issues Map', icon: Map },
    { id: 'employees', label: 'Ward Officers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const wardMenuItems = [
    { id: 'ward-dashboard', label: 'My Ward', icon: Monitor },
    { id: 'map', label: 'Ward Map', icon: Map },
    { id: 'analytics', label: 'Reports', icon: BarChart3 },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : wardMenuItems;

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.sidebarNav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...styles.sidebarItem,
              ...(currentView === item.id ? styles.sidebarItemActive : {})
            }}
          >
            <item.icon style={{ height: '20px', width: '20px' }} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ issues, employees, onViewIssue, onNavigate }) => {
  const stats = {
    totalIssues: issues.length,
    openIssues: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    criticalIssues: issues.filter(i => i.severity === 'critical').length,
    activeEmployees: employees.filter(e => e.status === 'active').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={styles.pageTitle}>Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => onNavigate('employees')}
            style={styles.primaryButton}
          >
            <UserPlus style={{ height: '16px', width: '16px' }} />
            <span>Manage Employees</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ ...styles.grid, ...styles.gridCols4 }}>
        <StatCard 
          title="Total Issues" 
          value={stats.totalIssues} 
          icon={FileText} 
          color="blue" 
        />
        <StatCard 
          title="Open Issues" 
          value={stats.openIssues} 
          icon={AlertTriangle} 
          color="orange" 
        />
        <StatCard 
          title="In Progress" 
          value={stats.inProgress} 
          icon={Clock} 
          color="yellow" 
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolved} 
          icon={CheckCircle} 
          color="green" 
        />
      </div>

      {/* Quick Actions */}
      <div style={{ ...styles.grid, ...styles.gridCols3 }}>
        <QuickActionCard 
          title="Ward Performance"
          description="View ward-wise issue resolution rates and analytics"
          icon={TrendingUp}
          onClick={() => onNavigate('analytics')}
        />
        <QuickActionCard 
          title="Issues Mapping"
          description="Visualize all issues on interactive city map"
          icon={Map}
          onClick={() => onNavigate('map')}
        />
        <QuickActionCard 
          title="Ward Officers"
          description="Manage ward officers and team assignments"
          icon={Users}
          onClick={() => onNavigate('employees')}
        />
      </div>

      {/* Recent Issues with Filters */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={styles.cardTitle}>All Issues</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select style={{ ...styles.select, width: 'auto' }}>
                <option value="all">All Wards</option>
                {[...Array(23)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Ward {i + 1}</option>
                ))}
              </select>
              <select style={{ ...styles.select, width: 'auto' }}>
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <button style={styles.secondaryButton}>
                <Download style={{ height: '16px', width: '16px' }} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        <div style={styles.cardContent}>
          <IssuesList 
            issues={issues} 
            onViewIssue={onViewIssue}
            showActions={true}
          />
        </div>
      </div>
    </div>
  );
};

// Ward Dashboard Component
const WardDashboard = ({ user, issues, onViewIssue }) => {
  const wardIssues = issues.filter(issue => 
    user.wards.length === 0 || user.wards.includes(issue.wardId)
  );

  const stats = {
    totalIssues: wardIssues.length,
    openIssues: wardIssues.filter(i => i.status === 'open').length,
    inProgress: wardIssues.filter(i => i.status === 'in_progress').length,
    resolved: wardIssues.filter(i => i.status === 'resolved').length,
    criticalIssues: wardIssues.filter(i => i.severity === 'critical').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={styles.pageTitle}>
          {user.wardInfo ? `Ward ${user.wardInfo.wardNumber} - ${user.wardInfo.wardName}` : 'My Ward'}
        </h2>
        <p style={{ color: '#6b7280' }}>Welcome back, {user.name}</p>
      </div>

      {/* Stats Grid */}
      <div style={{ ...styles.grid, ...styles.gridCols4 }}>
        <StatCard 
          title="My Issues" 
          value={stats.totalIssues} 
          icon={FileText} 
          color="blue" 
        />
        <StatCard 
          title="Pending" 
          value={stats.openIssues} 
          icon={AlertTriangle} 
          color="orange" 
        />
        <StatCard 
          title="Working On" 
          value={stats.inProgress} 
          icon={Clock} 
          color="yellow" 
        />
        <StatCard 
          title="Completed" 
          value={stats.resolved} 
          icon={CheckCircle} 
          color="green" 
        />
      </div>

      {/* Critical Issues Alert */}
      {stats.criticalIssues > 0 && (
        <div style={styles.alert}>
          <Zap style={{ height: '20px', width: '20px', color: '#dc2626' }} />
          <span style={styles.alertText}>
            {stats.criticalIssues} Critical Issue{stats.criticalIssues > 1 ? 's' : ''} Require Immediate Attention
          </span>
        </div>
      )}

      {/* Recent Issues */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Recent Issues in My Ward</h3>
        </div>
        <div style={styles.cardContent}>
          <IssuesList 
            issues={wardIssues} 
            onViewIssue={onViewIssue}
            showActions={true}
          />
        </div>
      </div>
    </div>
  );
};

// Issues List Component
const IssuesList = ({ issues, onViewIssue, compact = false, showActions = false }) => {
  if (issues.length === 0) {
    return (
      <div style={styles.emptyState}>
        <AlertTriangle style={styles.emptyIcon} />
        <p>No issues found</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {issues.map((issue) => (
        <div
          key={issue.id}
          style={styles.issueItem}
          onClick={() => onViewIssue(issue)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.issueMeta}>
                <span style={styles.issueId}>#{issue.id}</span>
                <span style={{ ...styles.badge, ...getSeverityBadgeStyle(issue.severity) }}>
                  {issue.severity}
                </span>
                <span style={{ ...styles.badge, ...getStatusBadgeStyle(issue.status) }}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              
              <h4 style={styles.issueTitle}>
                {issue.category.en} - Ward {issue.wardId}
              </h4>
              
              <p style={styles.issueDescription}>
                {issue.description}
              </p>
              
              <div style={styles.issueFooter}>
                <div style={styles.issueFooterItem}>
                  <MapPin style={{ height: '12px', width: '12px' }} />
                  <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.location.address}
                  </span>
                </div>
                <div style={styles.issueFooterItem}>
                  <Calendar style={{ height: '12px', width: '12px' }} />
                  <span>{new Date(issue.timestamps.created).toLocaleDateString()}</span>
                </div>
                {issue.photos && issue.photos.length > 0 && (
                  <div style={styles.issueFooterItem}>
                    <Camera style={{ height: '12px', width: '12px' }} />
                    <span>{issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewIssue(issue);
                }}
                style={styles.button}
                title="View Details"
              >
                <Eye style={{ height: '16px', width: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Issue Modal Component
const IssueModal = ({ issue, user, onClose, onUpdate }) => {
  const [status, setStatus] = useState(issue.status);
  const [response, setResponse] = useState(issue.rmcResponse || '');
  const [assignedTo, setAssignedTo] = useState(issue.assignedTo || '');
  const [assignedWard, setAssignedWard] = useState(issue.wardId || '');

  // Ward officers data
  const wardOfficers = [
    { id: 15, name: 'Ramesh Patel', ward: 15, email: 'ramesh.patel@rmc.rajkot.gov.in' },
    { id: 12, name: 'Priya Sharma', ward: 12, email: 'priya.sharma@rmc.rajkot.gov.in' },
    { id: 18, name: 'Anjali Modi', ward: 18, email: 'anjali.modi@rmc.rajkot.gov.in' },
    { id: 8, name: 'Suresh Kumar', ward: 8, email: 'suresh.kumar@rmc.rajkot.gov.in' },
    { id: 5, name: 'Kavita Joshi', ward: 5, email: 'kavita.joshi@rmc.rajkot.gov.in' },
    { id: 10, name: 'Mohit Shah', ward: 10, email: 'mohit.shah@rmc.rajkot.gov.in' },
    { id: 20, name: 'Deepa Rani', ward: 20, email: 'deepa.rani@rmc.rajkot.gov.in' },
    { id: 3, name: 'Ashok Mehta', ward: 3, email: 'ashok.mehta@rmc.rajkot.gov.in' }
  ];

  // Available teams for assignment
  const teams = [
    'Team A - Garbage Collection',
    'Team B - Drainage Maintenance', 
    'Team C - Road Infrastructure',
    'Team D - Water Supply',
    'Team E - Street Cleaning',
    'Emergency Response Team'
  ];

  const handleUpdate = async () => {
    try {
      const updates = { 
        status, 
        rmcResponse: response, 
        assignedTo,
        wardId: parseInt(assignedWard) 
      };
      
      const token = localStorage.getItem('token');
      const response_api = await fetch(`/api/issues-protected/${issue.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response_api.ok) {
        const updatedIssue = await response_api.json();
        onUpdate(updatedIssue.data);
        onClose();
        alert('Issue updated successfully!');
      } else {
        alert('Failed to update issue');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Error updating issue');
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            Issue Details - #{issue.id}
          </h2>
          <button
            onClick={onClose}
            style={styles.modalClose}
          >
            ×
          </button>
        </div>
        
        <div style={styles.modalBody}>
          {/* Issue Info */}
          <div style={{ ...styles.grid, ...styles.gridCols2, marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '12px' }}>Issue Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div><span style={{ fontWeight: '500' }}>Category:</span> {issue.category.en}</div>
                <div><span style={{ fontWeight: '500' }}>Ward:</span> {issue.wardId}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '500' }}>Severity:</span>
                  <span style={{ ...styles.badge, ...getSeverityBadgeStyle(issue.severity) }}>
                    {issue.severity}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '500' }}>Status:</span>
                  <span style={{ ...styles.badge, ...getStatusBadgeStyle(issue.status) }}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>
                <div><span style={{ fontWeight: '500' }}>Reported:</span> {new Date(issue.timestamps.created).toLocaleString()}</div>
                <div><span style={{ fontWeight: '500' }}>Phone:</span> {issue.phoneNumber}</div>
                <div><span style={{ fontWeight: '500' }}>Language:</span> {issue.language}</div>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '12px' }}>Location</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div><span style={{ fontWeight: '500' }}>Address:</span> {issue.location.address}</div>
                <div><span style={{ fontWeight: '500' }}>Coordinates:</span> {issue.location.lat?.toFixed(6)}, {issue.location.lng?.toFixed(6)}</div>
              </div>
              
              {/* Interactive Map */}
<div style={{ marginTop: '16px' }}>
  <IssueLocationMap 
    lat={issue.location.lat} 
    lng={issue.location.lng} 
    address={issue.location.address}
  />
</div>
            </div>
          </div>
          
          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>Description</h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              backgroundColor: '#f9fafb', 
              padding: '12px', 
              borderRadius: '8px' 
            }}>
              {issue.description}
            </p>
          </div>
          
         {/* Photos */}
{issue.photos && issue.photos.length > 0 && (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>
      Photos ({issue.photos.length})
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
      {issue.photos.map((photo, index) => {
        // Construct the photo URL
        let photoUrl = '';
        if (photo.url) {
          photoUrl = photo.url;
        } else if (photo.path) {
          photoUrl = photo.path;
        } else if (photo.filename) {
          // Fallback for legacy format
          photoUrl = `/uploads/${issue.id}/${photo.filename}`;
        }
        
        // Ensure we have the full URL
        if (photoUrl && !photoUrl.startsWith('http')) {
          photoUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${photoUrl}`;
        }
        
        return (
          <div key={index} style={{ 
            aspectRatio: '1',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            border: '2px solid #e5e7eb'
          }}>
            {photoUrl ? (
              <>
                <img 
                  src={photoUrl}
                  alt={`Issue photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error(`Failed to load photo: ${photoUrl}`);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded photo: ${photoUrl}`);
                  }}
                />
                <div style={{ 
                  display: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6'
                }}>
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <Camera style={{ height: '24px', width: '24px', margin: '0 auto 4px' }} />
                    <p style={{ fontSize: '10px' }}>Photo {index + 1}</p>
                    <p style={{ fontSize: '8px' }}>Failed to load</p>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ 
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6'
              }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                  <Camera style={{ height: '24px', width: '24px', margin: '0 auto 4px' }} />
                  <p style={{ fontSize: '10px' }}>No photo URL</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
)}
          
          {/* Update Form */}
          {user && (user.role === 'admin' || user.permissions.includes('update_issues')) && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>Update Issue</h3>
              
              <div style={{ ...styles.formGrid, marginBottom: '16px' }}>
                <div>
                  <label style={styles.label}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={styles.select}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                {user.role === 'admin' && (
                  <div>
                    <label style={styles.label}>Assign to Ward</label>
                    <select
                      value={assignedWard}
                      onChange={(e) => setAssignedWard(e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Select Ward</option>
                      {wardOfficers.map(officer => (
                        <option key={officer.id} value={officer.ward}>
                          Ward {officer.ward} - {officer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Assign to Team</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>RMC Response</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter response or update for the citizen..."
                  style={styles.textarea}
                />
              </div>
              
              <div style={styles.buttonGroup}>
                <button
                  onClick={handleUpdate}
                  style={styles.primaryButton}
                >
                  Update Issue
                </button>
                <button
                  onClick={onClose}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Map View Component
const MapView = ({ issues, onViewIssue }) => {
  const mapContainer = useRef(null);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Group issues by severity for statistics
  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const highIssues = issues.filter(issue => issue.severity === 'high');
  const mediumIssues = issues.filter(issue => issue.severity === 'medium');
  const lowIssues = issues.filter(issue => issue.severity === 'low');

  // Calculate center of all issues
  const centerLat = issues.length > 0 ? 
    issues.reduce((sum, issue) => sum + (issue.location.lat || 22.3039), 0) / issues.length : 22.3039;
  const centerLng = issues.length > 0 ? 
    issues.reduce((sum, issue) => sum + (issue.location.lng || 70.8022), 0) / issues.length : 70.8022;

  useEffect(() => {
    let map = null;

    const initializeMap = () => {
      try {
        const mapboxgl = window.mapboxgl;
        // Use environment variable or a placeholder token
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

        map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [centerLng, centerLat],
          zoom: 12
        });

        map.on('load', () => {
          setMapLoaded(true);
          
          // Add issue markers
          issues.forEach((issue) => {
            if (issue.location && issue.location.lat && issue.location.lng) {
              const markerColor = {
                critical: '#dc2626',
                high: '#ea580c',
                medium: '#ca8a04',
                low: '#16a34a'
              }[issue.severity] || '#6b7280';
              
              // Create marker
              new mapboxgl.Marker({ color: markerColor })
                .setLngLat([issue.location.lng, issue.location.lat])
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div style="padding: 0.5rem; min-width: 200px;">
                      <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">
                        #${issue.id}
                      </h4>
                      <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;">
                        <strong>Category:</strong> ${issue.category?.en || 'Unknown'}
                      </p>
                      <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;">
                        <strong>Status:</strong> ${issue.status}
                      </p>
                      <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;">
                        <strong>Ward:</strong> ${issue.wardId}
                      </p>
                      <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;">
                        <strong>Severity:</strong> ${issue.severity}
                      </p>
                      <p style="margin: 0; font-size: 0.8rem; color: #666;">
                        ${issue.location.address || 'Address not available'}
                      </p>
                    </div>
                  `)
                )
                .addTo(map);
            }
          });
        });

        map.on('error', (e) => {
          console.error('Map error:', e);
          setMapError(true);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    };

    // Load Mapbox GL JS
    if (!window.mapboxgl) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => initializeMap();
      script.onerror = () => setMapError(true);
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else {
      initializeMap();
    }

    // Cleanup
    return () => {
      if (map) map.remove();
    };
  }, [issues, centerLat, centerLng]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={styles.pageTitle}>Issues Map</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={styles.secondaryButton}>
            <Download style={{ height: '16px', width: '16px' }} />
            <span>Export Map</span>
          </button>
        </div>
      </div>
      
      {/* Map Statistics */}
      <div style={{ ...styles.grid, ...styles.gridCols4 }}>
        <StatCard 
          title="Critical Issues" 
          value={criticalIssues.length} 
          icon={AlertTriangle} 
          color="red" 
        />
        <StatCard 
          title="High Priority" 
          value={highIssues.length} 
          icon={Zap} 
          color="orange" 
        />
        <StatCard 
          title="Medium Priority" 
          value={mediumIssues.length} 
          icon={Clock} 
          color="yellow" 
        />
        <StatCard 
          title="Low Priority" 
          value={lowIssues.length} 
          icon={CheckCircle} 
          color="green" 
        />
      </div>

      <div style={styles.card}>
        {/* Interactive Map Container */}
        {mapError ? (
          <div style={{ 
            height: '500px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Map style={{ height: '48px', width: '48px', margin: '0 auto 1rem', color: '#9ca3af' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Map could not be loaded</h3>
              <p style={{ color: '#6b7280' }}>Please check your Mapbox token configuration</p>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div 
              ref={mapContainer} 
              style={{ 
                width: '100%', 
                height: '500px', 
                borderRadius: '8px',
                overflow: 'hidden'
              }} 
            />
            {!mapLoaded && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Loading map...</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Map Legend */}
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '14px', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', color: '#374151' }}>Legend:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '50%', border: '2px solid white' }}></div>
              <span>Critical ({criticalIssues.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ea580c', borderRadius: '50%', border: '2px solid white' }}></div>
              <span>High ({highIssues.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ca8a04', borderRadius: '50%', border: '2px solid white' }}></div>
              <span>Medium ({mediumIssues.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#16a34a', borderRadius: '50%', border: '2px solid white' }}></div>
              <span>Low ({lowIssues.length})</span>
            </div>
          </div>
        </div>
      </div>
      {/* Issues List - Grouped by Severity */}
      <div style={{ ...styles.grid, ...styles.gridCols2 }}>
        {criticalIssues.length > 0 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                🚨 Critical Issues ({criticalIssues.length})
              </h3>
            </div>
            <div style={styles.cardContent}>
              <IssuesList 
                issues={criticalIssues.slice(0, 5)} 
                onViewIssue={onViewIssue}
                compact={true}
              />
              {criticalIssues.length > 5 && (
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                  + {criticalIssues.length - 5} more critical issues
                </p>
              )}
            </div>
          </div>
        )}
        
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Issues on Map</h3>
          </div>
          <div style={styles.cardContent}>
            <IssuesList 
              issues={issues.slice(0, 5)} 
              onViewIssue={onViewIssue}
              compact={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Management Component
const EmployeeManagement = ({ employees, onUpdate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={styles.pageTitle}>Ward Officers Management</h2>
        <button style={styles.primaryButton}>
          <UserPlus style={{ height: '16px', width: '16px' }} />
          <span>Add Ward Officer</span>
        </button>
      </div>
      
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>All Ward Officers</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Ward(s)</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td style={styles.td}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{employee.name}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{employee.designation}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(employee.role === 'admin' ? 
                        { backgroundColor: '#f3e8ff', color: '#7c3aed' } : 
                        { backgroundColor: '#eff6ff', color: '#2563eb' })
                    }}>
                      {employee.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {employee.wards ? employee.wards.join(', ') : 'All'}
                  </td>
                  <td style={styles.td}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>{employee.email}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{employee.phone}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(employee.status === 'active' ? styles.badgeGreen : styles.badgeRed)
                    }}>
                      {employee.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...styles.button, color: '#2563eb' }}>
                        <Edit style={{ height: '16px', width: '16px' }} />
                      </button>
                      <button style={{ ...styles.button, color: '#dc2626' }}>
                        <Trash2 style={{ height: '16px', width: '16px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simple Chart Components
const PieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{title}</h4>
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const largeArc = angle > 180 ? 1 : 0;
            const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            const result = (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                opacity={0.8}
              />
            );
            
            currentAngle += angle;
            return result;
          })}
        </svg>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: colors[index % colors.length], 
              borderRadius: '2px' 
            }}></div>
            <span>{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, title, xKey = 'name', yKey = 'value' }) => {
  const maxValue = Math.max(...data.map(item => item[yKey]));
  const chartHeight = 200;
  const chartWidth = 400;
  const barWidth = chartWidth / data.length - 10;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{title}</h4>
      <div style={{ position: 'relative', width: `${chartWidth}px`, height: `${chartHeight + 40}px` }}>
        <svg width={chartWidth} height={chartHeight + 40}>
          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item[yKey] / maxValue) * chartHeight;
            const x = index * (chartWidth / data.length) + 5;
            const y = chartHeight - barHeight;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#3b82f6"
                  opacity={0.8}
                  rx={2}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {item[xKey]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#374151"
                  fontWeight="500"
                >
                  {item[yKey]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const LineChart = ({ data, title, xKey = 'date', yKey = 'issues' }) => {
  const maxValue = Math.max(...data.map(item => item[yKey]));
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 20;
  
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
    const y = padding + (1 - item[yKey] / maxValue) * (chartHeight - padding * 2);
    return { x, y, value: item[yKey] };
  });
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{title}</h4>
      <div style={{ position: 'relative', width: `${chartWidth}px`, height: `${chartHeight + 40}px` }}>
        <svg width={chartWidth} height={chartHeight + 40}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i / 4) * (chartHeight - padding * 2)}
              x2={chartWidth - padding}
              y2={padding + (i / 4) * (chartHeight - padding * 2)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          
          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#3b82f6"
            />
          ))}
          
          {/* X-axis labels */}
          {data.map((item, index) => (
            <text
              key={index}
              x={padding + (index / (data.length - 1)) * (chartWidth - padding * 2)}
              y={chartHeight + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {new Date(item[xKey]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

// Analytics Page Component
const AnalyticsPage = ({ issues }) => {
  // Process data for charts
  const categoryData = issues.reduce((acc, issue) => {
    const category = issue.category?.en || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  
  const wardData = issues.reduce((acc, issue) => {
    const ward = `Ward ${issue.wardId}`;
    acc[ward] = (acc[ward] || 0) + 1;
    return acc;
  }, {});
  
  const wardChartData = Object.entries(wardData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  
  const statusData = issues.reduce((acc, issue) => {
    const status = issue.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ 
    name: name.replace('_', ' '), 
    value 
  }));
  
  // Weekly trend data
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayIssues = issues.filter(issue => {
      const issueDate = new Date(issue.timestamps.created).toISOString().split('T')[0];
      return issueDate === dateStr;
    }).length;
    
    weeklyData.push({ date: dateStr, issues: dayIssues });
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={styles.pageTitle}>Analytics & Reports</h2>
      
      {/* Key Metrics */}
      <div style={{ ...styles.grid, ...styles.gridCols4 }}>
        <StatCard 
          title="Total Issues" 
          value={issues.length} 
          icon={FileText} 
          color="blue" 
        />
        <StatCard 
          title="Resolution Rate" 
          value={`${Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100)}%`} 
          icon={CheckCircle} 
          color="green" 
        />
        <StatCard 
          title="Critical Issues" 
          value={issues.filter(i => i.severity === 'critical').length} 
          icon={AlertTriangle} 
          color="red" 
        />
        <StatCard 
          title="Active Wards" 
          value={new Set(issues.map(i => i.wardId)).size} 
          icon={Map} 
          color="yellow" 
        />
      </div>
      
      {/* Charts Grid */}
      <div style={{ ...styles.grid, ...styles.gridCols2 }}>
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <PieChart data={categoryChartData} title="Issues by Category" />
          </div>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <PieChart data={statusChartData} title="Issues by Status" />
          </div>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <BarChart data={wardChartData} title="Top 10 Wards by Issues" />
          </div>
        </div>
        
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <LineChart data={weeklyData} title="Issues Trend (Last 7 Days)" />
          </div>
        </div>
      </div>
      
      {/* Detailed Statistics */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Detailed Ward Statistics</h3>
        </div>
        <div style={styles.cardContent}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ward</th>
                  <th style={styles.th}>Total Issues</th>
                  <th style={styles.th}>Resolved</th>
                  <th style={styles.th}>In Progress</th>
                  <th style={styles.th}>Resolution Rate</th>
                  <th style={styles.th}>Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(wardData)
                  .sort(([, a], [, b]) => b - a)
                  .map(([ward, total]) => {
                    const wardNumber = parseInt(ward.replace('Ward ', ''));
                    const wardIssues = issues.filter(i => i.wardId === wardNumber);
                    const resolved = wardIssues.filter(i => i.status === 'resolved').length;
                    const inProgress = wardIssues.filter(i => i.status === 'in_progress').length;
                    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
                    
                    return (
                      <tr key={ward}>
                        <td style={styles.td}>{ward}</td>
                        <td style={styles.td}>{total}</td>
                        <td style={styles.td}>{resolved}</td>
                        <td style={styles.td}>{inProgress}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...(resolutionRate >= 80 ? styles.badgeGreen : 
                                resolutionRate >= 60 ? styles.badgeYellow : styles.badgeRed)
                          }}>
                            {resolutionRate}%
                          </span>
                        </td>
                        <td style={styles.td}>
                          {Math.floor(Math.random() * 48) + 12}h
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const StatCard = ({ title, value, icon: Icon, color }) => {
  const getIconStyle = () => {
    switch (color) {
      case 'blue': return styles.statIconBlue;
      case 'green': return styles.statIconGreen;
      case 'orange': return styles.statIconOrange;
      case 'yellow': return styles.statIconYellow;
      case 'red': return styles.statIconRed;
      default: return styles.statIconBlue;
    }
  };

  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, ...getIconStyle() }}>
        <Icon style={{ height: '24px', width: '24px' }} />
      </div>
      <div>
        <p style={styles.statLabel}>{title}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        ...styles.card,
        padding: '24px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
      onMouseLeave={(e) => e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
    >
      <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
        <div style={{ ...styles.statIcon, ...styles.statIconBlue }}>
          <Icon style={{ height: '24px', width: '24px' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{title}</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>{description}</p>
        </div>
      </div>
    </div>
  );
};

// Utility Functions
const getSeverityBadgeStyle = (severity) => {
  switch (severity) {
    case 'critical': return styles.badgeRed;
    case 'high': return styles.badgeOrange;
    case 'medium': return styles.badgeYellow;
    case 'low': return styles.badgeGreen;
    default: return styles.badgeYellow;
  }
};

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'open': return styles.badgeRed;
    case 'in_progress': return styles.badgeYellow;
    case 'resolved': return styles.badgeGreen;
    case 'closed': return styles.badgeGray;
    default: return styles.badgeRed;
  }
};
// Mini Map Component for Issue Modal
const IssueLocationMap = ({ lat, lng, address }) => {
  const mapContainer = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let map = null;

    const initializeMap = () => {
      try {
        const mapboxgl = window.mapboxgl;
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

        map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng || 70.8022, lat || 22.3039],
          zoom: 16
        });

        // Add marker
        new mapboxgl.Marker({ color: '#dc2626' })
          .setLngLat([lng || 70.8022, lat || 22.3039])
          .addTo(map);

      } catch (error) {
        console.error('Error initializing mini map:', error);
        setMapError(true);
      }
    };

    if (window.mapboxgl && lat && lng) {
      initializeMap();
    } else {
      setMapError(true);
    }

    return () => {
      if (map) map.remove();
    };
  }, [lat, lng]);

  if (mapError || !lat || !lng) {
    return (
      <div style={{ 
        height: '160px', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <Map style={{ height: '24px', width: '24px', margin: '0 auto 4px' }} />
          <p style={{ fontSize: '12px' }}>📍 {address || `${lat?.toFixed(6)}, ${lng?.toFixed(6)}`}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: '160px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }} 
    />
  );
};

export default RMCDashboard;