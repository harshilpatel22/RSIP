// ========================================
// RSIP Complete Server - WhatsApp Bot + API + WebSocket
// File: whatsapp-bot/server.js
// ========================================

require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET 

const SAMPLE_EMPLOYEES = {
  admin: {
    id: 'admin001',
    email: 'admin@rmc.rajkot.gov.in',
    password: '$2b$10$8K1gVjPfPyN7n6zqKXK8JeqYn5YQoEgG4rOgFhWMZqO8nVhJdKV2C', // password: admin123
    name: 'Dr. Rajesh Kumar',
    role: 'admin',
    designation: 'Municipal Commissioner',
    department: 'Administration',
    wards: [], // Admin can access all wards
    permissions: ['all'],
    phone: '+91-281-2441234',
    joinedDate: '2020-01-15'
  },
  ward15: {
    id: 'ward015',
    email: 'ramesh.patel@rmc.rajkot.gov.in',
    password: '$2b$10$8K1gVjPfPyN7n6zqKXK8JeqYn5YQoEgG4rOgFhWMZqO8nVhJdKV2C', // password: ward123
    name: 'Ramesh Patel',
    role: 'ward_officer',
    designation: 'Ward Officer',
    department: 'Sanitation',
    wards: [15],
    permissions: ['view_ward_issues', 'update_issues', 'assign_teams'],
    phone: '+91-9876543210',
    joinedDate: '2021-03-10',
    wardInfo: {
      wardNumber: 15,
      wardName: 'Bhaktinagar',
      population: 12500,
      area: '2.3 sq km',
      teams: ['Team A - Garbage Collection', 'Team B - Drainage']
    }
  },
  ward12: {
    id: 'ward012',
    email: 'priya.sharma@rmc.rajkot.gov.in',
    password: '$2b$10$8K1gVjPfPyN7n6zqKXK8JeqYn5YQoEgG4rOgFhWMZqO8nVhJdKV2C', // password: ward123
    name: 'Priya Sharma',
    role: 'ward_officer',
    designation: 'Ward Officer',
    department: 'Sanitation',
    wards: [12],
    permissions: ['view_ward_issues', 'update_issues', 'assign_teams'],
    phone: '+91-9876543211',
    joinedDate: '2020-11-22',
    wardInfo: {
      wardNumber: 12,
      wardName: 'Kuvadva',
      population: 15200,
      area: '3.1 sq km',
      teams: ['Team C - Garbage Collection', 'Team D - Drainage', 'Team E - Infrastructure']
    }
  },
  ward18: {
    id: 'ward018',
    email: 'anjali.modi@rmc.rajkot.gov.in',
    password: '$2b$10$8K1gVjPfPyN7n6zqKXK8JeqYn5YQoEgG4rOgFhWMZqO8nVhJdKV2C', // password: ward123
    name: 'Anjali Modi',
    role: 'ward_officer',
    designation: 'Ward Officer',
    department: 'Sanitation',
    wards: [18],
    permissions: ['view_ward_issues', 'update_issues', 'assign_teams'],
    phone: '+91-9876543212',
    joinedDate: '2019-07-15',
    wardInfo: {
      wardNumber: 18,
      wardName: 'Race Course',
      population: 18900,
      area: '4.2 sq km',
      teams: ['Team F - Garbage Collection', 'Team G - Drainage', 'Team H - Infrastructure']
    }
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Check if user has required permissions
const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    if (userPermissions.includes('all')) {
      return next(); // Admin has all permissions
    }
    
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Check if user can access specific ward
const checkWardAccess = (req, res, next) => {
  const wardId = parseInt(req.params.wardId || req.query.ward);
  const userWards = req.user.wards || [];
  
  if (req.user.role === 'admin' || userWards.length === 0) {
    return next(); // Admin or users with no ward restrictions
  }
  
  if (wardId && !userWards.includes(wardId)) {
    return res.status(403).json({ error: 'Access denied to this ward' });
  }
  
  next();
};
// Firebase configuration
const { db } = require('./config/firebase');

// ========================================
// Express App Setup
// ========================================

const app = express();
const server = http.createServer(app);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', req.params.issueId || 'temp');
    // Use sync version to avoid blocking
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'));
    }
  }
});

const fsPromises = require('fs').promises;


// Serve static files (make sure this is in your backend server.js)
app.use('/uploads', (req, res, next) => {
  // Security: Prevent directory traversal
  if (req.path.includes('..')) {
    return res.status(400).send('Invalid path');
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Get issue details with files
app.get('/api/issues/:id', async (req, res) => {
  try {
    const doc = await db.collection('complaints').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const issue = { id: doc.id, ...doc.data() };
    
    // Check if photos exist in the database
    if (issue.photos && issue.photos.length > 0) {
      // Verify each photo file exists
      issue.photos = issue.photos.map(photo => {
        const fullPath = path.join(__dirname, photo.path);
        if (fs.existsSync(fullPath)) {
          return {
            ...photo,
            exists: true,
            url: photo.path
          };
        } else {
          console.warn(`Photo not found: ${photo.path}`);
          return {
            ...photo,
            exists: false,
            url: null
          };
        }
      }).filter(photo => photo.exists); // Only include existing photos
    }
    
    // Also check for any files in the directory not in database
    const uploadsDir = path.join(__dirname, 'uploads', req.params.id);
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const dbPhotoPaths = (issue.photos || []).map(p => p.filename);
      
      files.forEach(file => {
        if (!dbPhotoPaths.includes(file) && file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          // Add orphaned files to the response
          if (!issue.photos) issue.photos = [];
          issue.photos.push({
            filename: file,
            path: `/uploads/${req.params.id}/${file}`,
            url: `/uploads/${req.params.id}/${file}`,
            exists: true
          });
        }
      });
    }
    
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Security and middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'https://your-dashboard-url.vercel.app',
    process.env.DASHBOARD_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (for uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// ========================================
// WebSocket Server Setup
// ========================================

const wss = new WebSocket.Server({ 
  server,
  path: '/ws',
  clientTracking: true
});

// Store connected dashboard clients
const connectedClients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientInfo = {
    ws,
    id: clientId,
    connectedAt: new Date(),
    lastPing: new Date(),
    wardFilter: null,
    isAlive: true
  };

  connectedClients.set(clientId, clientInfo);
  console.log(`📡 Dashboard client connected: ${clientId} (Total: ${connectedClients.size})`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    clientId,
    timestamp: new Date().toISOString(),
    message: 'Connected to RSIP real-time updates'
  }));

  // Handle incoming messages from dashboard
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      handleDashboardMessage(clientId, data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log(`📡 Dashboard client disconnected: ${clientId}`);
    connectedClients.delete(clientId);
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    connectedClients.delete(clientId);
  });

  // Ping-pong for connection health
  ws.on('pong', () => {
    const client = connectedClients.get(clientId);
    if (client) {
      client.lastPing = new Date();
      client.isAlive = true;
    }
  });

  // Set up ping interval
  const pingInterval = setInterval(() => {
    const client = connectedClients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      if (!client.isAlive) {
        console.log(`💀 Terminating unresponsive client: ${clientId}`);
        client.ws.terminate();
        connectedClients.delete(clientId);
        clearInterval(pingInterval);
        return;
      }
      client.isAlive = false;
      client.ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
});

// ========================================
// WebSocket Helper Functions
// ========================================

const broadcastToAllClients = (data) => {
  const message = JSON.stringify({
    ...data,
    timestamp: new Date().toISOString()
  });
  
  let sentCount = 0;
  let failedCount = 0;

  connectedClients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(message);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
        connectedClients.delete(clientId);
        failedCount++;
      }
    } else {
      connectedClients.delete(clientId);
      failedCount++;
    }
  });

  console.log(`📡 Broadcast sent to ${sentCount} clients, ${failedCount} failed/removed`);
  return { sent: sentCount, failed: failedCount };
};

const broadcastToWard = (wardId, data) => {
  const message = JSON.stringify({
    ...data,
    wardId,
    timestamp: new Date().toISOString()
  });
  
  let sentCount = 0;
  connectedClients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN && 
        (!client.wardFilter || client.wardFilter === wardId)) {
      try {
        client.ws.send(message);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send ward message to client ${clientId}:`, error);
      }
    }
  });

  console.log(`📡 Ward ${wardId} broadcast sent to ${sentCount} clients`);
  return sentCount;
};

const handleDashboardMessage = (clientId, data) => {
  const client = connectedClients.get(clientId);
  if (!client) return;

  switch (data.type) {
    case 'SUBSCRIBE_WARD':
      client.wardFilter = data.wardId;
      client.ws.send(JSON.stringify({
        type: 'SUBSCRIPTION_CONFIRMED',
        wardId: data.wardId,
        message: `Subscribed to Ward ${data.wardId} updates`
      }));
      break;

    case 'UNSUBSCRIBE_WARD':
      client.wardFilter = null;
      client.ws.send(JSON.stringify({
        type: 'SUBSCRIPTION_CONFIRMED',
        wardId: null,
        message: 'Subscribed to all ward updates'
      }));
      break;

    case 'PING':
      client.lastPing = new Date();
      client.ws.send(JSON.stringify({
        type: 'PONG',
        timestamp: new Date().toISOString()
      }));
      break;

    case 'GET_STATUS':
      client.ws.send(JSON.stringify({
        type: 'STATUS_RESPONSE',
        data: {
          connectedClients: connectedClients.size,
          uptime: process.uptime(),
          wardFilter: client.wardFilter
        }
      }));
      break;
  }
};

// ========================================
// REST API Endpoints
// ========================================

// GET /api/issues - Fetch all issues with filtering

// Updated login route with development fallback
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Login attempt for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user
    const user = Object.values(SAMPLE_EMPLOYEES).find(emp => emp.email === email);
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    let isValidPassword = false;
    
    // DEVELOPMENT MODE: Simple password check
    const devPasswords = {
      'admin@rmc.rajkot.gov.in': 'admin123',
      'ramesh.patel@rmc.rajkot.gov.in': 'ward123',
      'priya.sharma@rmc.rajkot.gov.in': 'ward123'
    };
    
    if (devPasswords[email] === password) {
      isValidPassword = true;
      console.log(`✅ Development mode: Password accepted for ${email}`);
    } else {
      // Try bcrypt if available
      try {
        isValidPassword = await bcrypt.compare(password, user.password);
      } catch (error) {
        console.log(`⚠️  Bcrypt failed, using development mode`);
      }
    }
    
    if (!isValidPassword) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        wards: user.wards || [],
        permissions: user.permissions || []
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`✅ Login successful for: ${email} (${user.role})`);
    
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout - User logout
app.post('/auth/logout', authenticateToken, (req, res) => {
  // In a real app, you'd add the token to a blacklist
  console.log(`👋 User logged out: ${req.user.email}`);
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/issues/:id/upload', upload.array('photos', 5), (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/${id}/${file.filename}`
    }));
    
    res.json({ 
      success: true, 
      files: uploadedFiles,
      message: `${files.length} file(s) uploaded successfully`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /auth/profile - Get current user profile
app.get('/auth/profile', authenticateToken, (req, res) => {
  try {
    const user = Object.values(SAMPLE_EMPLOYEES).find(emp => emp.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/employees', authenticateToken, checkPermissions(['all']), (req, res) => {
  try {
    const employees = Object.values(SAMPLE_EMPLOYEES).map(emp => {
      const { password: _, ...employeeWithoutPassword } = emp;
      return employeeWithoutPassword;
    });
    
    console.log(`📋 Admin fetched ${employees.length} employees`);
    res.json(employees);
    
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/employees/:id - Get specific employee
app.get('/api/employees/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can view their own profile, admins can view any
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const employee = Object.values(SAMPLE_EMPLOYEES).find(emp => emp.id === id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const { password: _, ...employeeWithoutPassword } = employee;
    res.json(employeeWithoutPassword);
    
  } catch (error) {
    console.error('❌ Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:id - Update employee (admin only or self)
app.put('/api/employees/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Users can update their own profile, admins can update any
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const employee = Object.values(SAMPLE_EMPLOYEES).find(emp => emp.id === id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // In a real app, you'd update the database here
    console.log(`✅ Employee ${id} updated by ${req.user.email}`);
    
    res.json({ 
      success: true, 
      message: 'Employee updated successfully',
      updates 
    });
    
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========================================
// WARD-SPECIFIC ROUTES
// ========================================

// GET /api/wards - Get all wards with basic info
app.get('/api/wards', authenticateToken, (req, res) => {
  try {
    const wards = [];
    
    // Generate ward data for all 23 wards
    for (let i = 1; i <= 23; i++) {
      const wardOfficer = Object.values(SAMPLE_EMPLOYEES).find(emp => 
        emp.wards && emp.wards.includes(i)
      );
      
      wards.push({
        id: i,
        name: getWardName(i),
        officer: wardOfficer ? wardOfficer.name : `Ward ${i} Officer`,
        officerEmail: wardOfficer ? wardOfficer.email : null,
        population: Math.floor(Math.random() * 10000) + 8000,
        area: (Math.random() * 3 + 1).toFixed(1) + ' sq km',
        teams: wardOfficer && wardOfficer.wardInfo ? wardOfficer.wardInfo.teams : [`Team ${String.fromCharCode(65 + (i % 8))} - Sanitation`]
      });
    }
    
    // Filter wards based on user permissions
    let filteredWards = wards;
    if (req.user.role === 'ward_officer' && req.user.wards.length > 0) {
      filteredWards = wards.filter(ward => req.user.wards.includes(ward.id));
    }
    
    res.json(filteredWards);
    
  } catch (error) {
    console.error('❌ Error fetching wards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/wards/:id - Get specific ward details
app.get('/api/wards/:id', authenticateToken, checkWardAccess, (req, res) => {
  try {
    const wardId = parseInt(req.params.id);
    
    const wardOfficer = Object.values(SAMPLE_EMPLOYEES).find(emp => 
      emp.wards && emp.wards.includes(wardId)
    );
    
    const wardDetails = {
      id: wardId,
      name: getWardName(wardId),
      officer: wardOfficer ? wardOfficer.name : `Ward ${wardId} Officer`,
      officerDetails: wardOfficer || null,
      population: Math.floor(Math.random() * 10000) + 8000,
      area: (Math.random() * 3 + 1).toFixed(1) + ' sq km',
      teams: wardOfficer && wardOfficer.wardInfo ? wardOfficer.wardInfo.teams : [`Team ${String.fromCharCode(65 + (wardId % 8))} - Sanitation`],
      boundaries: getWardBoundaries(wardId),
      demographics: {
        households: Math.floor(Math.random() * 2000) + 1500,
        commercialEstablishments: Math.floor(Math.random() * 500) + 100,
        schools: Math.floor(Math.random() * 10) + 2,
        hospitals: Math.floor(Math.random() * 5) + 1
      }
    };
    
    res.json(wardDetails);
    
  } catch (error) {
    console.error('❌ Error fetching ward details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function getWardName(wardId) {
  const wardNames = {
    15: 'Bhaktinagar',
    12: 'Kuvadva', 
    18: 'Race Course',
    8: 'Rajkot-1',
    5: 'Gandhigram',
    10: 'University Road',
    20: 'Mavdi',
    3: 'Ghanteshwar'
  };
  
  return wardNames[wardId] || `Ward ${wardId}`;
}

function getWardBoundaries(wardId) {
  // Sample coordinate boundaries for Rajkot wards
  const baseLat = 22.3039;
  const baseLng = 70.8022;
  const offset = (wardId % 5) * 0.01;
  
  return {
    north: baseLat + offset + 0.005,
    south: baseLat + offset - 0.005,
    east: baseLng + offset + 0.007,
    west: baseLng + offset - 0.007,
    center: {
      lat: baseLat + offset,
      lng: baseLng + offset
    }
  };
}


app.get('/api/issues-protected', authenticateToken, async (req, res) => {
  try {
    const { ward, status, timeRange, category, severity, limit = 100 } = req.query;
    console.log(`📊 Fetching issues for ${req.user.email} with filters:`, req.query);
    
    let query = db.collection('complaints');
    
    // Apply ward restrictions for ward officers
    let wardFilter = ward;
    if (req.user.role === 'ward_officer' && req.user.wards.length > 0) {
      if (!wardFilter || wardFilter === 'all') {
        // If no ward specified, use user's wards
        wardFilter = req.user.wards[0].toString(); // Use first ward if multiple
      } else if (!req.user.wards.includes(parseInt(wardFilter))) {
        // If specified ward is not accessible to user
        return res.status(403).json({ error: 'Access denied to this ward' });
      }
    }
    
    // Apply filters (same logic as original route)
    if (wardFilter && wardFilter !== 'all' && wardFilter !== '') {
      query = query.where('wardId', '==', parseInt(wardFilter));
    }
    
    if (status && status !== 'all' && status !== '') {
      query = query.where('status', '==', status);
    }
    
    if (category && category !== 'all' && category !== '') {
      query = query.where('category.id', '==', category);
    }
    
    if (severity && severity !== 'all' && severity !== '') {
      query = query.where('severity', '==', severity);
    }
    
    // Apply time range filter
    if (timeRange && timeRange !== 'all' && timeRange !== '') {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      if (startDate) {
        query = query.where('timestamps.created', '>=', startDate);
      }
    }
    
    // Order by creation date and apply limit
    query = query.orderBy('timestamps.created', 'desc').limit(parseInt(limit));
    
    const snapshot = await query.get();
    const issues = snapshot.docs.map(doc => {
      const data = doc.data();
      const issueData = {
        id: doc.id, 
        ...data,
        timestamps: {
          created: data.timestamps?.created?.toDate ? 
            data.timestamps.created.toDate().toISOString() : data.timestamps?.created,
          updated: data.timestamps?.updated?.toDate ? 
            data.timestamps.updated.toDate().toISOString() : data.timestamps?.updated,
          resolved: data.timestamps?.resolved?.toDate ? 
            data.timestamps.resolved.toDate().toISOString() : data.timestamps?.resolved
        }
      };
      
      // Verify photos exist
      if (issueData.photos && issueData.photos.length > 0) {
        issueData.photos = issueData.photos.map(photo => {
          // Check if it's already a properly formatted photo object
          if (typeof photo === 'object' && photo.path) {
            return photo;
          }
          // Handle legacy string format if any
          if (typeof photo === 'string') {
            return {
              filename: photo,
              path: `/uploads/${doc.id}/${photo}`,
              url: `/uploads/${doc.id}/${photo}`
            };
          }
          return photo;
        }).filter(photo => photo); // Remove any null/undefined entries
      }
      
      return issueData;
    });
    
    console.log(`✅ Found ${issues.length} issues for ${req.user.email}`);
    res.json(issues);
    
  } catch (error) {
    console.error('❌ Error fetching protected issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/issues/:id - Update issue status
app.patch('/api/issues-protected/:id', authenticateToken, checkPermissions(['update_issues', 'all']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`📝 ${req.user.email} updating issue ${id} with:`, updates);
    
    // Get current issue data to check ward access
    const docRef = db.collection('complaints').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const currentData = doc.data();
    
    // Check ward access for ward officers
    if (req.user.role === 'ward_officer' && req.user.wards.length > 0) {
      if (!req.user.wards.includes(currentData.wardId)) {
        return res.status(403).json({ error: 'Access denied to this ward issue' });
      }
    }
    
    // Prepare update data
    const updateData = {
      ...updates,
      'timestamps.updated': new Date(),
      lastUpdatedBy: req.user.email
    };

    if (updates.wardId) {
      updateData.wardId = parseInt(updates.wardId);
    }
    
    // If status is being changed to resolved, add resolved timestamp
    if (updates.status === 'resolved') {
      updateData['timestamps.resolved'] = new Date();
    }
    
    // Update in database
    await docRef.update(updateData);
    
    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedData = { 
      id: updatedDoc.id, 
      ...updatedDoc.data(),
      timestamps: {
        created: updatedDoc.data().timestamps?.created?.toDate?.() || updatedDoc.data().timestamps?.created,
        updated: updatedDoc.data().timestamps?.updated?.toDate?.() || updatedDoc.data().timestamps?.updated,
        resolved: updatedDoc.data().timestamps?.resolved?.toDate?.() || updatedDoc.data().timestamps?.resolved
      }
    };
    
    // Broadcast update to dashboards
    broadcastToAllClients({
      type: 'ISSUE_UPDATED',
      data: updatedData,
      changes: updates,
      updatedBy: req.user.email
    });
    
    console.log(`✅ Issue ${id} updated successfully by ${req.user.email}`);
    res.json({ success: true, data: updatedData });
    
  } catch (error) {
    console.error('❌ Error updating protected issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/issues/:id/assign - Assign team to issue
app.patch('/api/issues-protected/:id', authenticateToken, checkPermissions(['update_issues', 'all']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`📝 ${req.user.email} updating issue ${id} with:`, updates);
    
    // Get current issue data to check ward access
    const docRef = db.collection('complaints').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const currentData = doc.data();
    
    // Check ward access for ward officers
    if (req.user.role === 'ward_officer' && req.user.wards.length > 0) {
      if (!req.user.wards.includes(currentData.wardId)) {
        return res.status(403).json({ error: 'Access denied to this ward issue' });
      }
    }
    
    // Prepare update data
    const updateData = {
      ...updates,
      'timestamps.updated': new Date(),
      lastUpdatedBy: req.user.email
    };
    
    // If status is being changed to resolved, add resolved timestamp
    if (updates.status === 'resolved') {
      updateData['timestamps.resolved'] = new Date();
    }
    
    // Update in database
    await docRef.update(updateData);
    
    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedData = { 
      id: updatedDoc.id, 
      ...updatedDoc.data(),
      timestamps: {
        created: updatedDoc.data().timestamps?.created?.toDate?.() || updatedDoc.data().timestamps?.created,
        updated: updatedDoc.data().timestamps?.updated?.toDate?.() || updatedDoc.data().timestamps?.updated,
        resolved: updatedDoc.data().timestamps?.resolved?.toDate?.() || updatedDoc.data().timestamps?.resolved
      }
    };
    
    // Broadcast update to dashboards
    broadcastToAllClients({
      type: 'ISSUE_UPDATED',
      data: updatedData,
      changes: updates,
      updatedBy: req.user.email
    });
    
    console.log(`✅ Issue ${id} updated successfully by ${req.user.email}`);
    res.json({ success: true, data: updatedData });
    
  } catch (error) {
    console.error('❌ Error updating protected issue:', error);
    res.status(500).json({ error: error.message });
  }
});

console.log('🔐 Authentication routes added successfully');

// Debug endpoint to check issue photos
app.get('/api/debug/issue/:id/photos', async (req, res) => {
  try {
    const doc = await db.collection('complaints').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const data = doc.data();
    const uploadsDir = path.join(__dirname, 'uploads', req.params.id);
    
    let filesOnDisk = [];
    if (fs.existsSync(uploadsDir)) {
      filesOnDisk = fs.readdirSync(uploadsDir);
    }
    
    res.json({
      issueId: doc.id,
      photosInDB: data.photos || [],
      filesOnDisk: filesOnDisk,
      uploadsDir: uploadsDir
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics - Get analytics data
app.get('/api/analytics', async (req, res) => {
  try {
    const { range = '7d', ward } = req.query;
    
    console.log(`📊 Calculating analytics for range: ${range}, ward: ${ward || 'all'}`);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    let query = db.collection('complaints');
    
    // Apply ward filter if specified
    if (ward && ward !== 'all') {
      query = query.where('wardId', '==', parseInt(ward));
    }
    
    // Get issues in date range
    query = query.where('timestamps.created', '>=', startDate);
    const snapshot = await query.get();
    const issues = snapshot.docs.map(doc => doc.data());
    
    // Calculate detailed analytics
    const analytics = {
      totalIssues: issues.length,
      resolutionRate: calculateResolutionRate(issues),
      avgResponseTime: calculateAvgResponseTime(issues),
      activeUsers: await getActiveUsersCount(),
      issuesTrend: generateDetailedIssuesTrend(issues, range),
      categoryBreakdown: generateDetailedCategoryBreakdown(issues),
      wardStats: await generateDetailedWardStats(issues, ward),
      responseTimeData: generateDetailedResponseTimeData(issues),
      severityBreakdown: generateSeverityBreakdown(issues),
      statusBreakdown: generateStatusBreakdown(issues)
    };
    
    console.log('✅ Analytics calculated successfully');
    res.json(analytics);
    
  } catch (error) {
    console.error('❌ Error calculating analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/stats - Dashboard overview statistics  
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    // Get all complaints for general stats
    const complaintsRef = db.collection('complaints');
    const snapshot = await complaintsRef.get();
    const allIssues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate time-based stats (this week vs last week)
    const now = new Date();
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekIssues = allIssues.filter(issue => {
      const created = issue.timestamps?.created?.toDate ? 
        issue.timestamps.created.toDate() : new Date(issue.timestamps?.created);
      return created >= thisWeekStart;
    });
    
    const lastWeekIssues = allIssues.filter(issue => {
      const created = issue.timestamps?.created?.toDate ? 
        issue.timestamps.created.toDate() : new Date(issue.timestamps?.created);
      return created >= lastWeekStart && created < thisWeekStart;
    });
    
    const resolvedThisWeek = thisWeekIssues.filter(issue => 
      issue.status === 'resolved'
    ).length;
    
    const resolvedLastWeek = lastWeekIssues.filter(issue => 
      issue.status === 'resolved'
    ).length;
    
    // Get active users count
    const usersSnapshot = await db.collection('users').get();
    const activeUsers = usersSnapshot.docs.filter(doc => {
      const lastActive = doc.data().lastActive?.toDate ? 
        doc.data().lastActive.toDate() : new Date(doc.data().lastActive);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActive >= weekAgo;
    }).length;
    
    const stats = {
      totalIssues: allIssues.length,
      openIssues: allIssues.filter(issue => issue.status === 'open').length,
      resolvedIssues: allIssues.filter(issue => issue.status === 'resolved').length,
      criticalIssues: allIssues.filter(issue => issue.severity === 'critical').length,
      avgResponseTime: calculateAvgResponseTime(allIssues),
      activeUsers: activeUsers,
      newIssuesThisWeek: thisWeekIssues.length,
      resolvedThisWeek: resolvedThisWeek,
      newUsersThisWeek: usersSnapshot.docs.filter(doc => {
        const created = doc.data().createdAt?.toDate ? 
          doc.data().createdAt.toDate() : new Date(doc.data().lastActive);
        return created >= thisWeekStart;
      }).length,
      // Comparison with last week
      weeklyGrowth: {
        issues: thisWeekIssues.length - lastWeekIssues.length,
        resolved: resolvedThisWeek - resolvedLastWeek
      }
    };
    
    console.log('✅ Dashboard stats calculated:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/recent - Recent activity for dashboard
app.get('/api/dashboard/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    console.log(`📋 Fetching ${limit} recent issues...`);
    
    const complaintsRef = db.collection('complaints');
    const snapshot = await complaintsRef
      .orderBy('timestamps.created', 'desc')
      .limit(limit)
      .get();
    
    const recentIssues = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure timestamps are properly formatted
        timestamps: {
          created: data.timestamps?.created?.toDate ? 
            data.timestamps.created.toDate().toISOString() : data.timestamps?.created,
          updated: data.timestamps?.updated?.toDate ? 
            data.timestamps.updated.toDate().toISOString() : data.timestamps?.updated,
          resolved: data.timestamps?.resolved?.toDate ? 
            data.timestamps.resolved.toDate().toISOString() : data.timestamps?.resolved
        }
      };
    });
    
    console.log(`✅ Found ${recentIssues.length} recent issues`);
    res.json(recentIssues);
    
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bot/status - WhatsApp bot status
app.get('/api/bot/status', async (req, res) => {
  try {
    console.log('🤖 Checking bot status...');
    
    let clientState = 'DISCONNECTED';
    let isConnected = false;
    let phoneNumber = null;
    
    // Safely check client status
    try {
      if (client && client.info) {
        isConnected = true;
        phoneNumber = client.info.wid.user;
        clientState = await client.getState();
      }
    } catch (clientError) {
      console.log('⚠️  Client not ready yet:', clientError.message);
    }
    
    const botStatus = {
      isConnected: isConnected,
      lastSeen: isConnected ? new Date().toISOString() : null,
      phoneNumber: phoneNumber,
      state: clientState,
      totalUsers: 0,
      activeConversations: userSessions.size,
      messagesProcessed: 0,
      errorCount: 0,
      uptime: Math.round(process.uptime())
    };
    
    // Get user count from database (safely)
    try {
      const usersSnapshot = await db.collection('users').get();
      botStatus.totalUsers = usersSnapshot.size;
    } catch (dbError) {
      console.error('Error getting user count:', dbError);
    }
    
    res.json(botStatus);
    
  } catch (error) {
    console.error('❌ Error getting bot status:', error);
    res.status(500).json({ 
      error: error.message,
      isConnected: false,
      state: 'ERROR'
    });
  }
});

// GET /api/bot/stats - Bot usage statistics
app.get('/api/bot/stats', async (req, res) => {
  try {
    console.log('📊 Calculating bot stats...');
    
    // Get user language breakdown
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    
    const languageBreakdown = {
      gujarati: 0,
      hindi: 0,
      english: 0
    };
    
    users.forEach(user => {
      if (user.language && languageBreakdown.hasOwnProperty(user.language)) {
        languageBreakdown[user.language]++;
      }
    });
    
    const total = users.length;
    
    // Get recent complaints for message type analysis
    const complaintsSnapshot = await db.collection('complaints')
      .where('timestamps.created', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .get();
    
    const recentComplaints = complaintsSnapshot.docs.map(doc => doc.data());
    
    const messageTypes = {
      text: recentComplaints.filter(c => !c.photos || c.photos.length === 0).length,
      image: recentComplaints.filter(c => c.photos && c.photos.length > 0).length,
      location: recentComplaints.filter(c => c.location && c.location.lat).length,
      voice: 0 // Voice messages would be tracked separately in production
    };
    
    const stats = {
      languageBreakdown: Object.entries(languageBreakdown).map(([language, count]) => ({
        language: language.charAt(0).toUpperCase() + language.slice(1),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      })),
      messageTypes: Object.entries(messageTypes).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count
      })),
      hourlyActivity: generateHourlyActivity(recentComplaints),
      totalInteractions: total,
      activeToday: users.filter(user => {
        const lastActive = user.lastActive?.toDate ? 
          user.lastActive.toDate() : new Date(user.lastActive);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return lastActive >= today;
      }).length
    };
    
    console.log('✅ Bot stats calculated');
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error getting bot stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bot/conversations - Recent conversations
app.get('/api/bot/conversations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    console.log(`💬 Fetching ${limit} recent conversations...`);
    
    // Get recent complaints as conversations
    const complaintsSnapshot = await db.collection('complaints')
      .orderBy('timestamps.created', 'desc')
      .limit(limit)
      .get();
    
    const conversations = complaintsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        phoneNumber: data.phoneNumber,
        lastMessage: data.description || 'No message',
        timestamp: data.timestamps?.created?.toDate ? 
          data.timestamps.created.toDate().toISOString() : data.timestamps?.created,
        language: data.language || 'gujarati',
        status: data.status === 'resolved' ? 'completed' : 'in_progress',
        category: data.category?.en || 'Unknown',
        wardId: data.wardId
      };
    });
    
    console.log(`✅ Found ${conversations.length} recent conversations`);
    res.json(conversations);
    
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/export/issues - Export issues to CSV
app.get('/api/export/issues', async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;
    
    console.log(`📥 Exporting issues in ${format} format with filters:`, filters);
    
    // Get filtered issues (reuse existing filter logic)
    let query = db.collection('complaints');
    
    // Apply filters (same logic as /api/issues)
    if (filters.ward && filters.ward !== 'all') {
      query = query.where('wardId', '==', parseInt(filters.ward));
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters.severity && filters.severity !== 'all') {
      query = query.where('severity', '==', filters.severity);
    }
    
    // Apply time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      if (startDate) {
        query = query.where('timestamps.created', '>=', startDate);
      }
    }
    
    const snapshot = await query.orderBy('timestamps.created', 'desc').get();
    const issues = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category?.en || 'Unknown',
        ward: data.wardId,
        status: data.status,
        severity: data.severity,
        created: data.timestamps?.created?.toDate ? 
          data.timestamps.created.toDate().toLocaleString() : data.timestamps?.created,
        location: data.location?.address || 'Not provided',
        description: data.description || 'No description',
        assignedTo: data.assignedTo || 'Unassigned',
        phoneNumber: data.phoneNumber,
        language: data.language,
        wardOfficer: data.wardOfficer || '',
        rmcResponse: data.rmcResponse || ''
      };
    });
    
    if (format === 'csv') {
      const csvContent = convertIssuesToCSV(issues);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="rsip_issues_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      res.json(issues);
    }
    
    console.log(`✅ Exported ${issues.length} issues in ${format} format`);
    
  } catch (error) {
    console.error('❌ Error exporting issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// WhatsApp Bot Setup
// ========================================

// ========================================
// Replace the WhatsApp Bot Setup section in your server.js with this WORKING version
// ========================================

// Create .wwebjs_auth directory if it doesn't exist
const authPath = path.join(__dirname, '.wwebjs_auth');
if (!fs.existsSync(authPath)) {
  fs.mkdirSync(authPath, { recursive: true });
  console.log('📁 Created .wwebjs_auth directory');
}

// Initialize client state variables
let isClientReady = false;
let qrCodeCount = 0;

// WhatsApp Client - SIMPLIFIED WORKING VERSION


const client = new Client({
  authStrategy: new LocalAuth({
    clientId: process.env.BOT_SESSION_NAME || 'rsip-bot-session',
    dataPath: authPath
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
  // IMPORTANT: webVersionCache removed - it can cause initialization issues
});

const userSessions = new Map();

class UserSession {
  constructor(phoneNumber) {
    this.phoneNumber = phoneNumber;
    this.language = null;
    this.step = 'LANGUAGE_SELECTION';
    this.reportData = {};
    this.lastActivity = Date.now();
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  isExpired() {
    return Date.now() - this.lastActivity > 30 * 60 * 1000; // 30 minutes
  }
}

// WhatsApp Client Event Handlers - KEEP IT SIMPLE
client.on('loading_screen', (percent, message) => {
  console.log(`📱 WhatsApp loading: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp authenticated successfully!');
  qrCodeCount = 0;
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp authentication failed:', msg);
  
  // Clear session data and restart
  console.log('🔄 Clearing session data...');
  if (fs.existsSync(authPath)) {
    fs.rmSync(authPath, { recursive: true, force: true });
  }
  
  console.log('🔄 Restarting in 5 seconds...');
  setTimeout(() => {
    client.initialize();
  }, 5000);
});

client.on('qr', (qr) => {
  qrCodeCount++;
  console.log(`\n📱 QR Code received (${qrCodeCount}/3):`);
  console.log('📱 Open WhatsApp → Settings → Linked Devices → Link a Device\n');
  qrcode.generate(qr, { small: true });
  console.log('\n');
});

client.on('ready', () => {
  isClientReady = true;
  console.log('\n🎉 WhatsApp Bot is READY!');
  console.log('📞 Bot Phone Number:', client.info.wid.user);
  console.log('✅ Listening for messages...\n');
  
  // Broadcast bot status to dashboards
  broadcastToAllClients({
    type: 'BOT_STATUS',
    data: {
      status: 'online',
      phoneNumber: client.info.wid.user,
      timestamp: new Date().toISOString(),
      isReady: true
    }
  });
});

client.on('disconnected', (reason) => {
  isClientReady = false;
  console.log('📱 WhatsApp Bot disconnected:', reason);
  
  // Broadcast disconnection to dashboards
  broadcastToAllClients({
    type: 'BOT_STATUS',
    data: {
      status: 'offline',
      reason: reason,
      timestamp: new Date().toISOString(),
      isReady: false
    }
  });
  
  // Simple reconnect logic
  console.log('🔄 Attempting to reconnect in 10 seconds...');
  setTimeout(() => {
    client.initialize();
  }, 10000);
});

// Message handler
client.on('message_create', async (message) => {
  if (message.fromMe) return;
  
  if (!isClientReady) {
    console.log('⚠️  Received message but bot not ready yet');
    return;
  }
  
  try {
    await handleIncomingMessage(message);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    
    try {
      await message.reply('માફ કરશો, કોઈ તકનીકી સમસ્યા છે. કૃપા કરીને થોડી વારે પ્રયાસ કરો.');
    } catch (replyError) {
      console.error('❌ Failed to send error message:', replyError);
    }
  }
});

// Error handler
client.on('error', (error) => {
  console.error('🚨 WhatsApp Client Error:', error);
});




// ========================================
// IMPORTANT: Update Server Startup Section
// ========================================


// ========================================
// Session Cleanup (Keep as is)
// =======================================

// ========================================
// Graceful Shutdown (Simplified)
// ========================================


// ========================================
// WhatsApp Message Handling
// ========================================

const MESSAGES = {
  welcome: {
    gu: '🙏 નમસ્તે! RSIP માં આપનું સ્વાગત છે.\n\nઆ બોટ રાજકોટના સફાઈ સમસ્યાઓ નોંધવા માટે છે.\n\nકૃપા કરીને તમારી ભાષા પસંદ કરો:\n1️⃣ हिंदी (Hindi)\n2️⃣ ગુજરાતી (Gujarati)\n3️⃣ English',
    hi: '🙏 नमस्ते! RSIP में आपका स्वागत है।\n\nयह बॉट राजकोट की सफाई समस्याओं की रिपोर्ट करने के लिए है।\n\nकृपया अपनी भाषा चुनें:\n1️⃣ हिंदी (Hindi)\n2️⃣ ગુજરાતી (Gujarati)\n3️⃣ English',
    en: '🙏 Hello! Welcome to RSIP.\n\nThis bot is for reporting sanitation issues in Rajkot.\n\nPlease choose your language:\n1️⃣ हिंदी (Hindi)\n2️⃣ ગુજરાતી (Gujarati)\n3️⃣ English'
  },
  
  category_selection: {
    gu: 'સરસ! હવે તમે કયા પ્રકારની સમસ્યા નોંધાવવા માંગો છો?\n\n1️⃣ કચરો/કચરાપેટી 🗑️\n2️⃣ ગટર/નાળું 🚰\n3️⃣ પાણીનું લીકેજ 💧\n4️⃣ માર્ગ/માળખું 🛣️\n5️⃣ અન્ય ❓\n\nનંબર મોકલો અથવા વૉઇસ મેસેજમાં સમજાવો 🎤',
    hi: 'बहुत बढ़िया! अब आप किस प्रकार की समस्या रिपोर्ट करना चाहते हैं?\n\n1️⃣ कचरा/कचरापेटी 🗑️\n2️⃣ गटर/नाली 🚰\n3️⃣ पानी का रिसाव 💧\n4️⃣ सड़क/ढांचा 🛣️\n5️⃣ अन्य ❓\n\nनंबर भेजें या वॉइस मैसेज में बताएं 🎤',
    en: 'Great! What type of issue would you like to report?\n\n1️⃣ Garbage/Waste 🗑️\n2️⃣ Drainage/Sewage 🚰\n3️⃣ Water Leakage 💧\n4️⃣ Road/Infrastructure 🛣️\n5️⃣ Other ❓\n\nSend number or explain via voice message 🎤'
  }
};

const BOT_CONFIG = {
  categories: {
    '1': { id: 'garbage', gu: 'કચરો/કચરાપેટી', hi: 'कचरा/कचरापेटी', en: 'Garbage/Waste' },
    '2': { id: 'drainage', gu: 'ગટર/નાળું', hi: 'गटर/नाली', en: 'Drainage/Sewage' },
    '3': { id: 'water_leak', gu: 'પાણીનું લીકેજ', hi: 'पानी का रिसाव', en: 'Water Leakage' },
    '4': { id: 'infrastructure', gu: 'માર્ગ/માળખું', hi: 'सड़क/ढांचा', en: 'Road/Infrastructure' },
    '5': { id: 'other', gu: 'અન્ય', hi: 'अन्य', en: 'Other' }
  }
};

async function handleIncomingMessage(message) {
  const phoneNumber = message.from;
  const messageBody = message.body.trim().toLowerCase();
  const messageType = message.type;
  
  
  
  console.log(`📱 Processing message from ${phoneNumber}: ${messageBody} (Type: ${messageType})`);
  
  // Get or create user session
  let session = userSessions.get(phoneNumber);
  if (!session || session.isExpired()) {
    session = new UserSession(phoneNumber);
    userSessions.set(phoneNumber, session);
  }
  session.updateActivity();

  console.log(`📱 Message from ${phoneNumber}: ${messageBody} (Type: ${messageType})`);

  // Handle location
  if (message.location) {
    await handleLocation(message, session);
    return;
  }

  // Handle images
  if (messageType === 'image') {
    await handleImage(message, session);
    return;
  }

  // Global commands
  if (['menu', 'મેનૂ', 'मेनू'].includes(messageBody)) {
    session.step = 'LANGUAGE_SELECTION';
    await sendWelcomeMessage(message);
    return;
  }

  if (['new', 'નવી', 'नई'].includes(messageBody)) {
    session.step = 'CATEGORY_SELECTION';
    session.reportData = {};
    await sendCategorySelection(message, session);
    return;
  }

  // Step-based handling
  switch (session.step) {
    case 'LANGUAGE_SELECTION':
      await handleLanguageSelection(message, session);
      break;
    
    case 'CATEGORY_SELECTION':
      await handleCategorySelection(message, session);
      break;
    
    case 'LOCATION_CAPTURE':
      await handleLocationText(message, session);
      break;
    
    case 'DESCRIPTION':
      await handleDescription(message, session);
      break;
    
    default:
      await sendWelcomeMessage(message);
  }
}

async function handleLanguageSelection(message, session) {
  const choice = message.body.trim();
  
  switch (choice) {
    case '1':
      session.language = 'hi';
      break;
    case '2':
      session.language = 'gu';
      break;
    case '3':
      session.language = 'en';
      break;
    default:
      await message.reply(MESSAGES.welcome.gu);
      return;
  }
  
  session.step = 'CATEGORY_SELECTION';
  await sendCategorySelection(message, session);
}

async function handleCategorySelection(message, session) {
  const choice = message.body.trim();
  
  if (BOT_CONFIG.categories[choice]) {
    session.reportData.category = BOT_CONFIG.categories[choice];
    session.step = 'LOCATION_CAPTURE';
    await sendLocationRequest(message, session);
  } else {
    await sendCategorySelection(message, session);
  }
}

async function handleLocation(message, session) {
  if (session.step !== 'LOCATION_CAPTURE') return;
  
  const { latitude, longitude } = message.location;
  session.reportData.location = {
    lat: latitude,
    lng: longitude,
    address: await getAddressFromCoordinates(latitude, longitude)
  };
  
  // Check if we have description, if not request it
  if (!session.reportData.description) {
    session.step = 'DESCRIPTION';
    await sendDescriptionRequest(message, session);
  } else {
    await submitComplaint(message, session);
  }
}

async function handleLocationText(message, session) {
  // Handle manual location entry
  session.reportData.location = {
    lat: null,
    lng: null,
    address: message.body.trim()
  };
  
  session.step = 'DESCRIPTION';
  await sendDescriptionRequest(message, session);
}

async function handleDescription(message, session) {
  session.reportData.description = message.body.trim();
  await submitComplaint(message, session);
}

async function handleImage(message, session) {
  try {
    const media = await message.downloadMedia();
    
    // Generate a temporary filename
    const tempFilename = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const tempPath = path.join(__dirname, 'uploads', 'temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    
    // Save image to temp folder
    const tempFilePath = path.join(tempPath, tempFilename);
    fs.writeFileSync(tempFilePath, media.data, 'base64');
    
    // Store temp image info
    if (!session.reportData.photos) {
      session.reportData.photos = [];
    }
    session.reportData.photos.push({
      tempFilename: tempFilename,
      tempPath: tempFilePath,
      caption: message.body || '',
      mimeType: media.mimetype || 'image/jpeg'
    });
    
    const lang = session.language || 'gu';
    const confirmMsg = {
      gu: '📸 ફોટો મળ્યો! હવે કૃપા કરીને તમારું સ્થાન શેર કરો.',
      hi: '📸 फोटो मिली! अब कृपया अपना स्थान साझा करें।',
      en: '📸 Photo received! Now please share your location.'
    };
    
    await message.reply(confirmMsg[lang]);
    
  } catch (error) {
    console.error('Error processing image:', error);
    await message.reply('ફોટો અપલોડ કરવામાં સમસ્યા. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
  }
}

// ========================================
// Helper Functions
// ========================================

async function sendWelcomeMessage(message) {
  await message.reply(MESSAGES.welcome.gu);
}

async function sendCategorySelection(message, session) {
  const lang = session.language || 'gu';
  await message.reply(MESSAGES.category_selection[lang]);
}

async function sendLocationRequest(message, session) {
  const lang = session.language || 'gu';
  const category = session.reportData.category[lang];
  
  const messages = {
    gu: `${category} સમસ્યા નોંધાઈ. હવે કૃપા કરીને:\n\n📍 તમારું સ્થાન શેર કરો (Location button દબાવો)\n📸 સમસ્યાનો ફોટો મોકલો\n🎤 અથવા વૉઇસ મેસેજમાં વિગતે સમજાવો\n\nઉદાહરણ: "ભક્તિનગર વોર્ડ 15 માં સ્કૂલ પાસે કચરાપેટી ભરાઈ ગઈ છે"`,
    hi: `${category} समस्या दर्ज हुई। अब कृपया:\n\n📍 अपना स्थान साझा करें (Location button दबाएं)\n📸 समस्या की फोटो भेजें\n🎤 या वॉइस मैसेज में विस्तार से बताएं\n\nउदाहरण: "भक्तिनगर वार्ड 15 में स्कूल के पास कचरापेटी भर गई है"`,
    en: `${category} issue noted. Now please:\n\n📍 Share your location (Press Location button)\n📸 Send photos of the issue\n🎤 Or explain via voice message\n\nExample: "Garbage bin overflowing near school in Bhaktinagar Ward 15"`
  };
  
  await message.reply(messages[lang]);
}

async function sendDescriptionRequest(message, session) {
  const lang = session.language || 'gu';
  const messages = {
    gu: 'કૃપા કરીને સમસ્યાની વિગતે માહિતી આપો:\n📝 શું સમસ્યા છે?\n⏰ ક્યારે શરૂ થઈ?\n🚨 કેટલી ગંભીર છે?',
    hi: 'कृपया समस्या की विस्तृत जानकारी दें:\n📝 क्या समस्या है?\n⏰ कब शुरू हुई?\n🚨 कितनी गंभीर है?',
    en: 'Please provide detailed information about the issue:\n📝 What is the problem?\n⏰ When did it start?\n🚨 How severe is it?'
  };
  
  await message.reply(messages[lang]);
}

async function submitComplaint(message, session) {
  try {
    console.log(`📝 Submitting complaint from ${session.phoneNumber}`);
    
    // Generate complaint ID
    const complaintId = generateComplaintId();

    const issueDir = path.join(__dirname, 'uploads', complaintId);
    if (!fs.existsSync(issueDir)) {
      fs.mkdirSync(issueDir, { recursive: true });
    }

    const movedPhotos = [];
    if (session.reportData.photos && session.reportData.photos.length > 0) {
      for (const photo of session.reportData.photos) {
        try {
          const newFilename = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
          const newPath = path.join(issueDir, newFilename);
          
          // Move file from temp to issue folder
          if (fs.existsSync(photo.tempPath)) {
            fs.renameSync(photo.tempPath, newPath);
            
            movedPhotos.push({
              filename: newFilename,
              path: `/uploads/${complaintId}/${newFilename}`,
              caption: photo.caption,
              mimeType: photo.mimeType
            });
            
            console.log(`📸 Moved photo: ${photo.tempFilename} → ${newFilename}`);
          }
        } catch (moveError) {
          console.error('Error moving photo:', moveError);
        }
      }
    }
    
    // Determine ward from location
    const wardId = await getWardFromLocation(session.reportData.location);
    
    // Prepare complaint data
    const complaintData = {
      id: complaintId,
      phoneNumber: session.phoneNumber,
      category: session.reportData.category,
      location: session.reportData.location,
      description: session.reportData.description || 'No description provided',
      photos: movedPhotos,
      language: session.language,
      severity: determineSeverity(session.reportData),
      status: 'open',
      wardId: wardId,
      wardOfficer: await getWardOfficer(wardId),
      timestamps: {
        created: new Date(),
        updated: new Date(),
        resolved: null
      },
      rmcResponse: '',
      citizenFeedback: {
        rating: null,
        comment: ''
      },
      // Additional fields for dashboard
      title: session.reportData.title || generateTitle(session.reportData),
      titleEnglish: await translateToEnglish(session.reportData.description, session.language),
      reportedBy: `WhatsApp User (${session.phoneNumber})`,
      reportedAt: new Date()
    };
    
    // Save to database
    await saveComplaintToDatabase(complaintData);
    
    // Broadcast to WebSocket clients
    console.log('📡 Broadcasting new issue to dashboards...');
    
    // Broadcast new issue
    broadcastToAllClients({
      type: 'NEW_ISSUE',
      data: complaintData
    });
    
    // Broadcast notification
    broadcastToAllClients({
      type: 'NOTIFICATION',
      data: {
        id: Date.now(),
        type: determineSeverityNotificationType(complaintData.severity),
        message: `New ${complaintData.category.en} issue reported in Ward ${complaintData.wardId}`,
        complaintId: complaintId,
        severity: complaintData.severity,
        wardId: complaintData.wardId,
        location: complaintData.location.address,
        time: 'Just now'
      }
    });
    
    // Ward-specific broadcast
    broadcastToWard(complaintData.wardId, {
      type: 'WARD_NEW_ISSUE',
      data: complaintData
    });
    
    // Send confirmation to user
    await sendConfirmation(message, session, complaintData);
    
    // Send SMS confirmation
    await sendSMSConfirmation(session.phoneNumber, complaintId);
    
    // Reset session
    session.step = 'COMPLETED';
    session.reportData = {};
    
    console.log(`✅ Complaint ${complaintId} submitted successfully and broadcast`);
    
  } catch (error) {
    console.error('❌ Error submitting complaint:', error);
    
    // Broadcast error notification
    broadcastToAllClients({
      type: 'SYSTEM_ERROR',
      data: {
        message: 'Failed to process new complaint',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
    
    // Send error message to user
    const lang = session.language || 'gu';
    const errorMessages = {
      gu: 'ફરિયાદ નોંધવામાં સમસ્યા. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
      hi: 'शिकायत दर्ज करने में समस्या। कृपया फिर से प्रयास करें।',
      en: 'Error submitting complaint. Please try again.'
    };
    
    await message.reply(errorMessages[lang]);
  }
}

// Clean up old temp files every hour


async function sendConfirmation(message, session, complaintData) {
  const lang = session.language || 'gu';
  
  const messages = {
    gu: `✅ ધન્યવાદ! તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે.\n\n📋 ફરિયાદ નંબર: #${complaintData.id}\n📍 સ્થાન: ${complaintData.location.address}\n🗂️ પ્રકાર: ${complaintData.category.gu}\n📅 તારીખ: ${new Date().toLocaleDateString()}\n\n📞 અપડેટ માટે SMS આવશે\n🕐 સામાન્ય પ્રતિસાદ સમય: 24-48 કલાક\n👨‍💼 વોર્ડ અધિકારી: ${complaintData.wardOfficer}\n\nશું તમને બીજી કોઈ સમસ્યા નોંધાવવી છે?\n"હા" લખો અથવા મુખ્ય મેનૂ માટે "મેનૂ" લખો।`,
    
    hi: `✅ धन्यवाद! आपकी शिकायत सफलतापूर्वक दर्ज हो गई है।\n\n📋 शिकायत नंबर: #${complaintData.id}\n📍 स्थान: ${complaintData.location.address}\n🗂️ प्रकार: ${complaintData.category.hi}\n📅 दिनांक: ${new Date().toLocaleDateString()}\n\n📞 अपडेट के लिए SMS आएगा\n🕐 सामान्य प्रतिक्रिया समय: 24-48 घंटे\n👨‍💼 वार्ड अधिकारी: ${complaintData.wardOfficer}\n\nक्या आपको कोई और समस्या रिपोर्ट करनी है?\n"हां" लिखें या मुख्य मेनू के लिए "मेनू" लिखें।`,
    
    en: `✅ Thank you! Your complaint has been successfully registered.\n\n📋 Complaint ID: #${complaintData.id}\n📍 Location: ${complaintData.location.address}\n🗂️ Category: ${complaintData.category.en}\n📅 Date: ${new Date().toLocaleDateString()}\n\n📞 SMS updates will be sent\n🕐 Typical response time: 24-48 hours\n👨‍💼 Ward Officer: ${complaintData.wardOfficer}\n\nDo you want to report another issue?\nType "yes" or "menu" for main menu.`
  };
  
  await message.reply(messages[lang]);
}

// ========================================
// Utility Functions
// ========================================

function generateComplaintId() {
  const prefix = 'RSP';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

function determineSeverity(reportData) {
  const description = (reportData.description || '').toLowerCase();
  const category = reportData.category?.id || '';
  
  // Critical keywords
  const criticalKeywords = ['emergency', 'urgent', 'તાત્કાલિક', 'તુરંત', 'आपातकाल', 'तुरंत'];
  if (criticalKeywords.some(keyword => description.includes(keyword))) {
    return 'critical';
  }
  
  // High priority categories or keywords
  const highKeywords = ['overflow', 'blocked', 'burst', 'ભરાઈ', 'બંધ', 'फूट', 'भरा'];
  if (category === 'drainage' || highKeywords.some(keyword => description.includes(keyword))) {
    return 'high';
  }
  
  // Default to medium
  return 'medium';
}

function determineSeverityNotificationType(severity) {
  switch (severity) {
    case 'critical': return 'urgent';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'info';
    default: return 'info';
  }
}

function generateTitle(reportData) {
  const category = reportData.category?.en || 'Issue';
  const location = reportData.location?.address || 'Unknown location';
  return `${category} reported in ${location}`;
}

async function translateToEnglish(text, fromLanguage) {
  if (fromLanguage === 'english' || !text) return text;
  
  // Simple keyword mapping for demo
  const translations = {
    'કચરો': 'garbage',
    'ગટર': 'drainage',
    'પાણી': 'water',
    'कचरा': 'garbage',
    'नाली': 'drainage',
    'पानी': 'water',
    'ભરાઈ': 'overflowing',
    'બંધ': 'blocked',
    'भरा': 'overflowing',
    'बंद': 'blocked'
  };
  
  let translated = text;
  for (const [original, english] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(original, 'g'), english);
  }
  
  return translated;
}

async function getWardFromLocation(location) {
  if (!location || (!location.lat && !location.address)) {
    return Math.floor(Math.random() * 23) + 1; // Random ward for demo
  }
  
  // Simple ward mapping based on coordinates or address
  if (location.lat && location.lng) {
    const lat = location.lat;
    const lng = location.lng;
    
    // Example ward boundaries for Rajkot (replace with actual data)
    if (lat >= 22.29 && lat <= 22.31 && lng >= 70.77 && lng <= 70.79) return 15; // Bhaktinagar
    if (lat >= 22.27 && lat <= 22.29 && lng >= 70.78 && lng <= 70.80) return 12; // Kuvadva
    if (lat >= 22.29 && lat <= 22.31 && lng >= 70.76 && lng <= 70.78) return 18; // Race Course
  }
  
  // Address-based mapping
  if (location.address) {
    const address = location.address.toLowerCase();
    if (address.includes('bhaktinagar')) return 15;
    if (address.includes('kuvadva')) return 12;
    if (address.includes('race course')) return 18;
  }
  
  // Default ward
  return Math.floor(Math.random() * 23) + 1;
}

async function getWardOfficer(wardId) {
  const officers = {
    15: 'Ramesh Patel',
    12: 'Priya Sharma', 
    18: 'Anjali Modi',
    8: 'Suresh Kumar',
    5: 'Kavita Joshi',
    10: 'Mohit Shah',
    20: 'Deepa Rani',
    3: 'Ashok Mehta'
  };
  
  return officers[wardId] || `Ward ${wardId} Officer`;
}

async function getAddressFromCoordinates(lat, lng) {
  try {
    // Using reverse geocoding API (Google Maps or similar)
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: { 
          latlng: `${lat},${lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY 
        }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Error getting address:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

async function saveComplaintToDatabase(complaintData) {
  try {
    // Save to Firestore
    await db.collection('complaints').doc(complaintData.id).set(complaintData);
    
    // Update or create user record
    const userRef = db.collection('users').doc(complaintData.phoneNumber);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update({
        language: complaintData.language,
        wardId: complaintData.wardId,
        totalReports: (userDoc.data().totalReports || 0) + 1,
        lastActive: new Date()
      });
    } else {
      await userRef.set({
        phoneNumber: complaintData.phoneNumber,
        language: complaintData.language,
        name: 'Anonymous User',
        wardId: complaintData.wardId,
        totalReports: 1,
        resolvedReports: 0,
        lastActive: new Date(),
        isBlocked: false
      });
    }
    
    console.log(`💾 Complaint ${complaintData.id} saved to database`);
  } catch (error) {
    console.error('Error saving complaint to database:', error);
    throw error;
  }
}

async function sendSMSConfirmation(phoneNumber, complaintId) {
  try {
    // SMS service integration (if Twilio is configured)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio');
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const message = `RSIP: તમારી ફરિયાદ #${complaintId} નોંધાઈ ગઈ છે. અપડેટ માટે આ નંબર સેવ કરો.`;
      
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log(`📱 SMS sent to ${phoneNumber}: ${message}`);
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    // Don't throw - SMS failure shouldn't break complaint submission
  }
}

async function notifyUserOfUpdate(complaintId, originalData, updates) {
  try {
    const phoneNumber = originalData.phoneNumber;
    const language = originalData.language || 'gu';
    
    let updateMessage = '';
    
    if (updates.status === 'in_progress') {
      const messages = {
        gu: `📋 અપડેટ: તમારી ફરિયાદ #${complaintId} પર કામ શરૂ થયું છે.\n\n👥 ટીમ: ${updates.assignedTo || 'RMC ટીમ'}\n⏰ અપેક્ષિત સમય: 24-48 કલાક`,
        hi: `📋 अपडेट: आपकी शिकायत #${complaintId} पर काम शुरू हो गया है।\n\n👥 टीम: ${updates.assignedTo || 'RMC टीम'}\n⏰ अपेक्षित समय: 24-48 घंटे`,
        en: `📋 Update: Work has started on your complaint #${complaintId}.\n\n👥 Team: ${updates.assignedTo || 'RMC Team'}\n⏰ Expected time: 24-48 hours`
      };
      updateMessage = messages[language];
    }
    
    if (updates.status === 'resolved') {
      const messages = {
        gu: `✅ સુખદ સમાચાર! તમારી ફરિયાદ #${complaintId} હલ થઈ ગઈ છે.\n\n📝 ${updates.rmcResponse || 'સમસ્યાનું નિરાકરણ કરાયું છે.'}\n\n⭐ કૃપા કરીને અમારી સેવા રેટ કરો (1-5):`,
        hi: `✅ खुशखबरी! आपकी शिकायत #${complaintId} हल हो गई है।\n\n📝 ${updates.rmcResponse || 'समस्या का समाधान कर दिया गया है।'}\n\n⭐ कृपया हमारी सेवा को रेट करें (1-5):`,
        en: `✅ Good news! Your complaint #${complaintId} has been resolved.\n\n📝 ${updates.rmcResponse || 'The issue has been resolved.'}\n\n⭐ Please rate our service (1-5):`
      };
      updateMessage = messages[language];
    }
    
    if (updateMessage) {
      // Send via WhatsApp bot
      await client.sendMessage(phoneNumber, updateMessage);
      
      // Also send SMS backup
      await sendSMS(phoneNumber, updateMessage.replace(/\n/g, ' '));
    }
    
  } catch (error) {
    console.error('Error notifying user of update:', error);
    // Don't throw error - notification failure shouldn't break the update
  }
}

async function sendSMS(phoneNumber, message) {
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio');
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log(`📱 SMS sent to ${phoneNumber}`);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

// ========================================
// Analytics Utility Functions
// ========================================

function calculateResolutionRate(issues) {
  if (issues.length === 0) return 0;
  const resolved = issues.filter(issue => issue.status === 'resolved').length;
  return Math.round((resolved / issues.length) * 100);
}

function calculateAvgResponseTime(issues) {
  const resolvedIssues = issues.filter(issue => 
    issue.status === 'resolved' && issue.timestamps?.created && issue.timestamps?.resolved
  );
  
  if (resolvedIssues.length === 0) return 0;
  
  const totalHours = resolvedIssues.reduce((total, issue) => {
    const created = issue.timestamps.created.toDate ? 
      issue.timestamps.created.toDate() : new Date(issue.timestamps.created);
    const resolved = issue.timestamps.resolved.toDate ? 
      issue.timestamps.resolved.toDate() : new Date(issue.timestamps.resolved);
    
    return total + (resolved - created) / (1000 * 60 * 60);
  }, 0);
  
  return Math.round(totalHours / resolvedIssues.length);
}

async function getActiveUsersCount() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const usersSnapshot = await db.collection('users')
    .where('lastActive', '>=', weekAgo)
    .get();
  
  return usersSnapshot.size;
}

function generateDetailedIssuesTrend(issues, timeRange) {
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const trend = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayIssues = issues.filter(issue => {
      const created = issue.timestamps?.created?.toDate ? 
        issue.timestamps.created.toDate() : new Date(issue.timestamps?.created);
      return created.toISOString().startsWith(dateStr);
    });
    
    const dayResolved = dayIssues.filter(issue => issue.status === 'resolved');
    
    trend.push({
      date: dateStr,
      issues: dayIssues.length,
      resolved: dayResolved.length
    });
  }
  
  return trend;
}

function generateDetailedCategoryBreakdown(issues) {
  const categories = {};
  
  issues.forEach(issue => {
    const category = issue.category?.en || 'Unknown';
    categories[category] = (categories[category] || 0) + 1;
  });
  
  const total = issues.length;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280', '#8b5cf6'];
  
  return Object.entries(categories)
    .map(([name, value], index) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value);
}

async function generateDetailedWardStats(issues, wardFilter) {
  if (wardFilter && wardFilter !== 'all') {
    // Return single ward stats
    const wardIssues = issues.filter(issue => issue.wardId === parseInt(wardFilter));
    return [{
      ward: `Ward ${wardFilter}`,
      issues: wardIssues.length,
      resolved: wardIssues.filter(issue => issue.status === 'resolved').length
    }];
  }
  
  // Generate stats for all wards
  const wards = {};
  
  issues.forEach(issue => {
    const ward = `Ward ${issue.wardId}`;
    if (!wards[ward]) {
      wards[ward] = { issues: 0, resolved: 0 };
    }
    wards[ward].issues++;
    if (issue.status === 'resolved') {
      wards[ward].resolved++;
    }
  });
  
  return Object.entries(wards)
    .map(([ward, stats]) => ({
      ward,
      ...stats,
      resolutionRate: stats.issues > 0 ? Math.round((stats.resolved / stats.issues) * 100) : 0
    }))
    .sort((a, b) => b.resolutionRate - a.resolutionRate);
}

function generateDetailedResponseTimeData(issues) {
  const timeRanges = {
    '0-2h': 0,
    '2-6h': 0,
    '6-12h': 0,
    '12-24h': 0,
    '24h+': 0
  };
  
  issues.forEach(issue => {
    if (issue.status === 'resolved' && issue.timestamps?.created && issue.timestamps?.resolved) {
      const created = issue.timestamps.created.toDate ? 
        issue.timestamps.created.toDate() : new Date(issue.timestamps.created);
      const resolved = issue.timestamps.resolved.toDate ? 
        issue.timestamps.resolved.toDate() : new Date(issue.timestamps.resolved);
      
      const diffHours = (resolved - created) / (1000 * 60 * 60);
      
      if (diffHours <= 2) timeRanges['0-2h']++;
      else if (diffHours <= 6) timeRanges['2-6h']++;
      else if (diffHours <= 12) timeRanges['6-12h']++;
      else if (diffHours <= 24) timeRanges['12-24h']++;
      else timeRanges['24h+']++;
    }
  });
  
  return Object.entries(timeRanges).map(([time, count]) => ({
    time,
    count
  }));
}

function generateSeverityBreakdown(issues) {
  const severity = { low: 0, medium: 0, high: 0, critical: 0 };
  
  issues.forEach(issue => {
    if (severity.hasOwnProperty(issue.severity)) {
      severity[issue.severity]++;
    }
  });
  
  return Object.entries(severity).map(([level, count]) => ({
    severity: level,
    count,
    percentage: issues.length > 0 ? Math.round((count / issues.length) * 100) : 0
  }));
}

function generateStatusBreakdown(issues) {
  const status = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  
  issues.forEach(issue => {
    if (status.hasOwnProperty(issue.status)) {
      status[issue.status]++;
    }
  });
  
  return Object.entries(status).map(([state, count]) => ({
    status: state,
    count,
    percentage: issues.length > 0 ? Math.round((count / issues.length) * 100) : 0
  }));
}

function generateHourlyActivity(complaints) {
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: hour.toString().padStart(2, '0'),
    messages: 0
  }));
  
  complaints.forEach(complaint => {
    const created = complaint.timestamps?.created?.toDate ? 
      complaint.timestamps.created.toDate() : new Date(complaint.timestamps?.created);
    const hour = created.getHours();
    hourlyData[hour].messages++;
  });
  
  return hourlyData;
}

function convertIssuesToCSV(issues) {
  const headers = [
    'Issue ID', 'Category', 'Ward', 'Status', 'Severity', 'Created Date',
    'Location', 'Description', 'Assigned To', 'Phone Number', 'Language',
    'Ward Officer', 'RMC Response'
  ];
  
  const rows = issues.map(issue => [
    issue.id,
    issue.category,
    issue.ward,
    issue.status,
    issue.severity,
    issue.created,
    `"${issue.location.replace(/"/g, '""')}"`, // Escape quotes in location
    `"${issue.description.replace(/"/g, '""')}"`, // Escape quotes in description
    issue.assignedTo,
    issue.phoneNumber,
    issue.language,
    issue.wardOfficer,
    `"${issue.rmcResponse.replace(/"/g, '""')}"` // Escape quotes in response
  ]);
  
  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
}

// ========================================
// Session Cleanup
// ========================================

// Clean up expired sessions every 10 minutes
setInterval(() => {
  userSessions.forEach((session, phoneNumber) => {
    if (session.isExpired()) {
      userSessions.delete(phoneNumber);
      console.log(`🧹 Cleaned up expired session for ${phoneNumber}`);
    }
  });
}, 10 * 60 * 1000);

setInterval(() => {
  const tempDir = path.join(__dirname, 'uploads', 'temp');
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < oneHourAgo) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Cleaned up old temp file: ${file}`);
      }
    });
  }
}, 60 * 60 * 1000); // Run every hour

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'temp')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// Call this before starting the server
ensureDirectories();

// =======================================

// ========================================
// Server Startup
// ========================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 RSIP Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready at ws://localhost:${PORT}/ws`);
  console.log(`🌐 HTTP API available at http://localhost:${PORT}`);
  console.log(`👥 Dashboard clients: ${connectedClients.size}`);
  console.log('\n📱 Initializing WhatsApp bot...\n');
  
  // Initialize WhatsApp client DIRECTLY (no setTimeout)
  client.initialize().catch(error => {
    console.error('❌ Failed to initialize WhatsApp client:', error);
    console.log('\n🔧 Debug Info:');
    console.log('- Error message:', error.message);
    console.log('- Make sure Chrome/Chromium is installed');
    console.log('- Try running: npm rebuild puppeteer');
    console.log('- Check if another instance is already running');
  });
});


// ========================================
// Graceful Shutdown Handler
// ========================================


process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  
  // Notify dashboards
  broadcastToAllClients({
    type: 'BOT_STATUS',
    data: {
      status: 'shutting_down',
      timestamp: new Date().toISOString()
    }
  });
  
  // Close all WebSocket connections
  setTimeout(() => {
    connectedClients.forEach((client, clientId) => {
      client.ws.close(1001, 'Server shutdown');
    });
    
    // Destroy WhatsApp client
    if (client) {
      console.log('📱 Destroying WhatsApp client...');
      client.destroy();
    }
    
    server.close(() => {
      console.log('✅ Server shut down complete');
      process.exit(0);
    });
  }, 1000);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  
  // Notify all clients about shutdown
  broadcastToAllClients({
    type: 'SERVER_SHUTDOWN',
    message: 'Server is shutting down for maintenance'
  });
  
  // Close all WebSocket connections
  setTimeout(() => {
    connectedClients.forEach((client, clientId) => {
      client.ws.close(1001, 'Server shutdown');
    });
    
    server.close(() => {
      console.log('✅ Server shut down complete');
      process.exit(0);
    });
  }, 1000);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  
  // Broadcast error to dashboards
  broadcastToAllClients({
    type: 'SYSTEM_ERROR',
    data: {
      message: 'Server encountered an unexpected error',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing and external use
module.exports = { 
  app, 
  server, 
  client,
  broadcastToAllClients, 
  broadcastToWard, 
  connectedClients,
  userSessions
};
