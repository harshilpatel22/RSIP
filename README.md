# Rajkot Sanitation Intelligence Platform (RSIP) 🏛️

A comprehensive digital platform that bridges citizens and municipal authorities through WhatsApp-based issue reporting and real-time administrative dashboards.

![RSIP Banner](https://img.shields.io/badge/Platform-Municipal%20Governance-blue) ![Status](https://img.shields.io/badge/Status-Production%20Ready-green) ![Languages](https://img.shields.io/badge/Languages-Hindi%20%7C%20Gujarati%20%7C%20English-orange)

## 🎯 Overview

RSIP revolutionizes municipal sanitation management by providing:
- **Citizens**: WhatsApp-based issue reporting with voice message support
- **Ward Officers**: Dedicated dashboard for field operations and team management
- **Administrators**: City-wide oversight with intelligent issue assignment capabilities

**Impact**: Serves 50,000+ households across 23 wards with real-time issue tracking and resolution.

## ✨ Features

### 🤖 WhatsApp Bot Interface
- **Multilingual Support**: Hindi, Gujarati, and English
- **Voice Messages**: Speech-to-text for non-literate users
- **Photo Sharing**: Automatic geolocation and visual evidence
- **Real-time Updates**: SMS confirmations and progress tracking
- **Smart Categorization**: Automatic issue classification

### 👥 Dual Dashboard System

#### Admin Dashboard
- 🌐 **City-wide Overview**: Real-time issue map across all wards
- 🎯 **Intelligent Assignment**: Drag-and-drop issue routing to wards
- 📊 **Performance Analytics**: Comparative ward metrics and KPIs
- 👤 **User Management**: Role-based access control and permissions
- 📈 **Advanced Reporting**: Custom analytics and export capabilities

#### Ward Dashboard
- 📍 **Ward-specific View**: Filtered issues and local operations
- 👷 **Team Management**: Field worker assignment and coordination
- 📱 **Mobile Optimized**: Responsive design for field officers
- 🔄 **Status Tracking**: Real-time progress updates with photo evidence
- 📞 **Citizen Communication**: Direct WhatsApp integration

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Next.js 13+
- **Styling**: Tailwind CSS with responsive design
- **Real-time**: Socket.io client for live updates
- **Maps**: Mapbox for geospatial visualization
- **Charts**: Recharts for analytics dashboards

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with RESTful APIs
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt encryption
- **Real-time**: Socket.io for live updates

### Integrations
- **WhatsApp**: Twilio WhatsApp Business API
- **SMS**: Twilio SMS notifications
- **Storage**: Cloudinary for media files
- **Deployment**: Railway/Heroku with SSL

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Twilio account for WhatsApp API
- Cloudinary account for media storage

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/rsip-platform.git
cd rsip-platform
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup
```bash
# Navigate to backend
cd backend

# Setup PostgreSQL database
createdb rsip_db

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Seed initial data
npm run seed
```

## ⚙️ Configuration

### Environment Variables

Create `.env` files in both backend and frontend directories:

#### Backend `.env`
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rsip_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-access-token"
```

## 🎮 Usage

### Start Development Servers

#### Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

#### Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### Access the Platform

#### Admin Dashboard
- URL: `http://localhost:3000/admin`
- Default Login:
  - Email: `admin@rsip.com`
  - Password: `admin123`

#### Ward Dashboard
- URL: `http://localhost:3000/ward`
- Default Login:
  - Email: `ward1@rsip.com`
  - Password: `ward123`

#### WhatsApp Bot
- Send "Hi" to your configured Twilio WhatsApp number
- Follow the conversation flow to report issues

### User Roles & Permissions

| Role | Permissions | Dashboard Access |
|------|-------------|------------------|
| **Super Admin** | Full system access | Admin + Ward |
| **Admin** | City-wide management | Admin only |
| **Ward Officer** | Ward-specific operations | Ward only |
| **Field Worker** | Assigned issues only | Ward (mobile) |

## 📡 API Documentation

### Authentication Endpoints
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/verify
```

### Issue Management
```http
GET    /api/issues                 # Get all issues (admin)
GET    /api/issues/ward/:wardId    # Get ward-specific issues
POST   /api/issues                 # Create new issue
PUT    /api/issues/:id             # Update issue status
DELETE /api/issues/:id             # Delete issue (admin only)
```

### WhatsApp Integration
```http
POST /api/whatsapp/webhook         # Twilio webhook endpoint
POST /api/whatsapp/send            # Send WhatsApp message
GET  /api/whatsapp/status/:id      # Check message status
```

### Example API Usage
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@rsip.com',
    password: 'admin123'
  })
});

// Get issues
const issues = await fetch('/api/issues', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test WhatsApp Webhook
```bash
curl -X POST http://localhost:3001/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"Body":"Hi","From":"whatsapp:+1234567890"}'
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

### Deploy to Production
```bash
# Deploy to Railway/Heroku
git push heroku main

# Run production migrations
heroku run npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for better municipal governance and citizen engagement**
