// config/firebase.js
// ========================================
// Firebase Configuration
// File: config/firebase.js
// ========================================

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });

      console.log('🔥 Firebase Admin SDK initialized successfully');
    }

    return admin;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    
    // Fallback initialization for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Attempting fallback Firebase initialization...');
      
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://rsip-demo-default-rtdb.firebaseio.com'
        });
        
        console.log('🔥 Firebase initialized with default credentials');
      } catch (fallbackError) {
        console.error('❌ Firebase fallback initialization failed:', fallbackError);
        throw new Error('Failed to initialize Firebase. Please check your configuration.');
      }
    } else {
      throw error;
    }
  }
};

// Initialize Firebase
const firebaseApp = initializeFirebase();

// Get Firestore database instance
const db = firebaseApp.firestore();

// Configure Firestore settings
db.settings({
  timestampsInSnapshots: true,
  ignoreUndefinedProperties: true
});

// Get Storage instance
const storage = firebaseApp.storage();

// Get Auth instance
const auth = firebaseApp.auth();

// Collection references with proper indexes
const collections = {
  complaints: db.collection('complaints'),
  users: db.collection('users'),
  employees: db.collection('employees'),
  wards: db.collection('wards'),
  teams: db.collection('teams'),
  notifications: db.collection('notifications'),
  analytics: db.collection('analytics'),
  sessions: db.collection('sessions')
};

// Utility functions for Firestore operations
const firestoreUtils = {
  // Create document with auto-generated ID
  async createDocument(collectionName, data) {
    try {
      const docRef = await collections[collectionName].add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Document created in ${collectionName}:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Create document with custom ID
  async setDocument(collectionName, docId, data) {
    try {
      await collections[collectionName].doc(docId).set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Document set in ${collectionName}:`, docId);
      return docId;
    } catch (error) {
      console.error(`❌ Error setting document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Update document
  async updateDocument(collectionName, docId, data) {
    try {
      await collections[collectionName].doc(docId).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Document updated in ${collectionName}:`, docId);
      return docId;
    } catch (error) {
      console.error(`❌ Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Get document by ID
  async getDocument(collectionName, docId) {
    try {
      const doc = await collections[collectionName].doc(docId).get();
      
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Query documents with filters
  async queryDocuments(collectionName, filters = []) {
    try {
      let query = collections[collectionName];
      
      // Apply filters
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
      
      const snapshot = await query.get();
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (error) {
      console.error(`❌ Error querying documents from ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(collectionName, docId) {
    try {
      await collections[collectionName].doc(docId).delete();
      console.log(`✅ Document deleted from ${collectionName}:`, docId);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Batch operations
  batch() {
    return db.batch();
  },

  // Transaction
  async runTransaction(updateFunction) {
    return db.runTransaction(updateFunction);
  }
};

// Initialize required collections and indexes
const initializeCollections = async () => {
  try {
    console.log('🔄 Initializing Firestore collections...');
    
    // Check if collections exist, create sample documents if needed
    const sampleComplaint = {
      id: 'SAMPLE_001',
      category: { id: 'garbage', en: 'Garbage/Waste', gu: 'કચરો/કચરાપેટી' },
      wardId: 1,
      status: 'resolved',
      severity: 'medium',
      location: {
        lat: 22.3039,
        lng: 70.8022,
        address: 'Sample Location, Rajkot'
      },
      description: 'Sample complaint for testing',
      phoneNumber: '+91-0000000000',
      language: 'gujarati',
      timestamps: {
        created: new Date(),
        updated: new Date(),
        resolved: new Date()
      },
      isSample: true
    };

    // Create sample documents for testing
    const complaintsCount = (await collections.complaints.limit(1).get()).size;
    if (complaintsCount === 0) {
      await firestoreUtils.setDocument('complaints', 'SAMPLE_001', sampleComplaint);
      console.log('📝 Sample complaint created');
    }

    console.log('✅ Firestore collections initialized');
  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    // Don't throw error - app should still work without sample data
  }
};

// Initialize collections on startup
if (process.env.NODE_ENV !== 'test') {
  initializeCollections();
}

// Export everything
module.exports = {
  admin: firebaseApp,
  db,
  storage,
  auth,
  collections,
  firestoreUtils
};

// Helper functions for common operations
module.exports.helpers = {
  // Convert Firestore timestamp to ISO string
  timestampToISO: (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    return new Date(timestamp).toISOString();
  },

  // Validate phone number format
  validatePhoneNumber: (phone) => {
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // Generate complaint ID
  generateComplaintId: () => {
    const prefix = 'RSP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  },

  // Get ward boundaries (sample data)
  getWardBoundaries: (wardId) => {
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
};

console.log('🔥 Firebase configuration loaded successfully');