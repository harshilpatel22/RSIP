const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();

// Simple WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  console.log('QR Code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot is ready!');
});

client.on('message', msg => {
  console.log('Message:', msg.body);
  if (msg.body === 'test') {
    msg.reply('Bot is working!');
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Initializing WhatsApp...');
  
  client.initialize().catch(err => {
    console.error('Init error:', err);
  });
});