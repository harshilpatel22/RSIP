// ========================================
// COMPLETE MESSAGE HANDLER REPLACEMENT
// Replace your simple message handler with this complete version
// ========================================

// First, add these message templates and bot configuration
const voiceProcessor = require('../services/voiceProcessor');
const geocoding = require('../services/geocoding');

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
  },

  location_request: {
    gu: 'કૃપા કરીને:\n\n📍 તમારું સ્થાન શેર કરો (Location button દબાવો)\n📸 સમસ્યાનો ફોટો મોકલો\n🎤 અથવા વૉઇસ મેસેજમાં વિગતે સમજાવો\n\nઉદાહરણ: "ભક્તિનગર વોર્ડ 15 માં સ્કૂલ પાસે કચરાપેટી ભરાઈ ગઈ છે"',
    hi: 'कृपया:\n\n📍 अपना स्थान साझा करें (Location button दबाएं)\n📸 समस्या की फोटो भेजें\n🎤 या वॉइस मैसेज में विस्तार से बताएं\n\nउदाहरण: "भक्तिनगर वार्ड 15 में स्कूल के पास कचरापेटी भर गई है"',
    en: 'Please:\n\n📍 Share your location (Press Location button)\n📸 Send photos of the issue\n🎤 Or explain via voice message\n\nExample: "Garbage bin overflowing near school in Bhaktinagar Ward 15"'
  },

  description_request: {
    gu: 'કૃપા કરીને સમસ્યાની વિગતે માહિતી આપો:\n📝 શું સમસ્યા છે?\n⏰ ક્યારે શરૂ થઈ?\n🚨 કેટલી ગંભીર છે?',
    hi: 'कृपया समस्या की विस्तृत जानकारी दें:\n📝 क्या समस्या है?\n⏰ कब शुरू हुई?\n🚨 कितनी गंभीर है?',
    en: 'Please provide detailed information about the issue:\n📝 What is the problem?\n⏰ When did it start?\n🚨 How severe is it?'
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

// REPLACE your existing client.on('message_create') handler with this:
client.on('message_create', async (message) => {
  if (message.fromMe) return;
  
  try {
    await handleIncomingMessage(message);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    await message.reply('માફ કરશો, કોઈ તકનીકી સમસ્યા છે. કૃપા કરીને થોડી વારે પ્રયાસ કરો.');
  }
});

// COMPLETE MESSAGE HANDLING FUNCTION
async function handleIncomingMessage(message) {
  const phoneNumber = message.from;
  const messageBody = message.body.trim().toLowerCase();
  const messageType = message.type;
  
  console.log(`📱 Message from ${phoneNumber}: ${messageBody} (Type: ${messageType})`);

  // Get or create user session
  let session = userSessions.get(phoneNumber);
  if (!session || session.isExpired()) {
    session = new UserSession(phoneNumber);
    userSessions.set(phoneNumber, session);
  }
  session.updateActivity();

  // Handle location
  if (message.location) {
    const { latitude, longitude } = message.location;
    
    try {
      // Get address from coordinates
      const locationData = await geocoding.reverseGeocode(latitude, longitude);
      
      userSession.location = {
        lat: latitude,
        lng: longitude,
        address: locationData.fullAddress,
        ward: locationData.ward,
        components: locationData.components
      };
      
      // Confirm location with user
      await message.reply(
        MESSAGES.locationConfirm[userSession.language]
          .replace('{{address}}', locationData.fullAddress)
          .replace('{{ward}}', locationData.ward)
      );
      
      // Move to next step
      userSession.step = 'awaitingDescription';
      
    } catch (error) {
      console.error('Geocoding error:', error);
      await message.reply(MESSAGES.locationError[userSession.language]);
    }
  }

  

  // Handle images
  if (messageType === 'image') {
    await handleImage(message, session);
    return;
  }

  if (message.type === 'audio' || message.hasMedia) {
    const media = await message.downloadMedia();
    
    if (media.mimetype.startsWith('audio/')) {
      try {
        // Process voice message
        const transcript = await voiceProcessor.processWhatsAppVoice(
          Buffer.from(media.data, 'base64'),
          userSession.language
        );
        
        // Save voice file and transcript
        const audioPath = await saveAudioFile(media.data, complaintId);
        
        // Update complaint with voice data
        await db.collection('complaints').doc(complaintId).update({
          voiceNotes: admin.firestore.FieldValue.arrayUnion({
            path: audioPath,
            transcript: transcript,
            timestamp: new Date()
          })
        });
        
        // Continue with complaint flow using transcript as description
        userSession.description = transcript;
        
        await message.reply(MESSAGES.confirmDetails[userSession.language]
          .replace('{{description}}', transcript));
          
      } catch (error) {
        console.error('Voice processing error:', error);
        await message.reply(MESSAGES.voiceError[userSession.language]);
      }
    }
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
    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  };
  
  session.step = 'DESCRIPTION';
  await sendDescriptionRequest(message, session);
}

async function handleLocationText(message, session) {
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
    
    if (!session.reportData.photos) {
      session.reportData.photos = [];
    }
    session.reportData.photos.push({
      filename: `complaint_${Date.now()}.jpg`,
      caption: message.body || ''
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

// Helper functions
async function sendWelcomeMessage(message) {
  await message.reply(MESSAGES.welcome.gu);
}

async function sendCategorySelection(message, session) {
  const lang = session.language || 'gu';
  await message.reply(MESSAGES.category_selection[lang]);
}

async function sendLocationRequest(message, session) {
  const lang = session.language || 'gu';
  await message.reply(MESSAGES.location_request[lang]);
}

async function sendDescriptionRequest(message, session) {
  const lang = session.language || 'gu';
  await message.reply(MESSAGES.description_request[lang]);
}

async function submitComplaint(message, session) {
  try {
    console.log(`📝 Submitting complaint from ${session.phoneNumber}`);
    
    // Generate complaint ID
    const complaintId = generateComplaintId();
    
    // Determine ward from location (simple random for demo)
    const wardId = Math.floor(Math.random() * 23) + 1;
    
    // Prepare complaint data
    const complaintData = {
      id: complaintId,
      phoneNumber: session.phoneNumber,
      category: session.reportData.category,
      location: session.reportData.location,
      description: session.reportData.description || 'No description provided',
      photos: session.reportData.photos || [],
      language: session.language,
      severity: 'medium', // Could be determined from description
      status: 'open',
      wardId: wardId,
      wardOfficer: `Ward ${wardId} Officer`,
      timestamps: {
        created: new Date(),
        updated: new Date(),
        resolved: null
      },
      rmcResponse: '',
      citizenFeedback: {
        rating: null,
        comment: ''
      }
    };
    
    // Save to database
    await saveComplaintToDatabase(complaintData);
    
    // Broadcast to dashboard
    broadcastToAllClients({
      type: 'NEW_ISSUE',
      data: complaintData
    });
    
    // Send confirmation to user
    await sendConfirmation(message, session, complaintData);
    
    // Reset session
    session.step = 'COMPLETED';
    session.reportData = {};
    
    console.log(`✅ Complaint ${complaintId} submitted successfully`);
    
  } catch (error) {
    console.error('❌ Error submitting complaint:', error);
    await message.reply('ફરિયાદ નોંધવામાં સમસ્યા. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
  }
}

async function sendConfirmation(message, session, complaintData) {
  const lang = session.language || 'gu';
  
  const messages = {
    gu: `✅ ધન્યવાદ! તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે.\n\n📋 ફરિયાદ નંબર: #${complaintData.id}\n📍 સ્થાન: ${complaintData.location.address}\n🗂️ પ્રકાર: ${complaintData.category.gu}\n📅 તારીખ: ${new Date().toLocaleDateString()}\n\n📞 અપડેટ માટે SMS આવશે\n🕐 સામાન્ય પ્રતિસાદ સમય: 24-48 કલાક\n👨‍💼 વોર્ડ અધિકારી: ${complaintData.wardOfficer}`,
    
    hi: `✅ धन्यवाद! आपकी शिकायत सफलतापूर्वक दर्ज हो गई है।\n\n📋 शिकायत नंबर: #${complaintData.id}\n📍 स्थान: ${complaintData.location.address}\n🗂️ प्रकार: ${complaintData.category.hi}\n📅 दिनांक: ${new Date().toLocaleDateString()}\n\n📞 अपडेट के लिए SMS आएगा\n🕐 सामान्य प्रतिक्रिया समय: 24-48 घंटे\n👨‍💼 वार्ड अधिकारी: ${complaintData.wardOfficer}`,
    
    en: `✅ Thank you! Your complaint has been successfully registered.\n\n📋 Complaint ID: #${complaintData.id}\n📍 Location: ${complaintData.location.address}\n🗂️ Category: ${complaintData.category.en}\n📅 Date: ${new Date().toLocaleDateString()}\n\n📞 SMS updates will be sent\n🕐 Typical response time: 24-48 hours\n👨‍💼 Ward Officer: ${complaintData.wardOfficer}`
  };
  
  await message.reply(messages[lang]);
}

function generateComplaintId() {
  const prefix = 'RSP';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

async function saveComplaintToDatabase(complaintData) {
  try {
    await db.collection('complaints').doc(complaintData.id).set(complaintData);
    console.log(`💾 Complaint ${complaintData.id} saved to database`);
  } catch (error) {
    console.error('Error saving complaint to database:', error);
    throw error;
  }
}