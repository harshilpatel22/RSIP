const fs = require('fs');
const path = require('path');
const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');

// Initialize Google Speech client
const speechClient = new speech.SpeechClient({
  keyFilename: path.join(__dirname, '../config/google-credentials.json')
});

class VoiceProcessor {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir);
    }
  }

  // Convert OGG to WAV for Google Speech API
  async convertToWav(inputPath) {
    const outputPath = inputPath.replace('.ogg', '.wav');
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .audioChannels(1)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  // Transcribe audio using Google Speech-to-Text
  async transcribeAudio(audioPath, languageCode = 'gu-IN') {
    try {
      // Convert to WAV first
      const wavPath = await this.convertToWav(audioPath);
      
      // Read the audio file
      const audioBytes = fs.readFileSync(wavPath).toString('base64');

      const request = {
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: languageCode, // gu-IN, hi-IN, en-IN
          enableAutomaticPunctuation: true,
          model: 'latest_long',
          // Alternative languages for mixed speech
          alternativeLanguageCodes: ['hi-IN', 'en-IN'],
        },
      };

      const [response] = await speechClient.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      // Clean up temp files
      fs.unlinkSync(wavPath);

      return {
        success: true,
        transcript: transcription,
        language: languageCode
      };
    } catch (error) {
      console.error('Voice transcription error:', error);
      return {
        success: false,
        error: error.message,
        transcript: ''
      };
    }
  }

  // Process voice message from WhatsApp
  async processWhatsAppVoice(media, userLanguage = 'gu-IN') {
    try {
      // Save voice file
      const buffer = Buffer.from(media.data, 'base64');
      const fileName = `voice_${Date.now()}.ogg`;
      const filePath = path.join(this.tempDir, fileName);
      
      fs.writeFileSync(filePath, buffer);

      // Get language code
      const languageMap = {
        'gujarati': 'gu-IN',
        'hindi': 'hi-IN',
        'english': 'en-IN'
      };
      const languageCode = languageMap[userLanguage] || 'gu-IN';

      // Transcribe
      const result = await this.transcribeAudio(filePath, languageCode);
      
      // Move to permanent storage
      const permanentPath = path.join(__dirname, '../uploads/voice', fileName);
      fs.renameSync(filePath, permanentPath);

      return {
        ...result,
        filePath: `/voice/${fileName}`,
        fileName: fileName
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new VoiceProcessor();