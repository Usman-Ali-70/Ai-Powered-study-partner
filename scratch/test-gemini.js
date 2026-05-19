const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

// Parse .env.local manually
let apiKey = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.*)/);
  if (match) {
    apiKey = match[1].trim();
  }
} catch (err) {
  console.log('Error reading .env.local:', err.message);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    console.log('Listing available models...');
    const response = await ai.models.list();
    console.log('Available models:');
    for (const model of response.models || []) {
      console.log(`- ${model.name} (${model.displayName})`);
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

run();
