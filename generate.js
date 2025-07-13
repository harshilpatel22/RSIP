const crypto = require('crypto');

// Generate 64 bytes (512 bits) random key
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);
