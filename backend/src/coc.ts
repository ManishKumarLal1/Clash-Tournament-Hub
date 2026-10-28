import { Client } from 'clashofclans.js';
import dotenv from 'dotenv';

dotenv.config();

const email = process.env.CLASH_API_EMAIL || '';
const password = process.env.CLASH_API_PASSWORD || '';

if (!email || !password) {
  console.warn('⚠️ CLASH_API_EMAIL or PASSWORD is missing in .env');
}

// 1. Create the client
export const cocClient = new Client();

// 2. Login with fallback strings
cocClient.login({
  email: email,
  password: password,
  keyName: 'ClashHub_Backend_Key',
}).then(() => {
  console.log('✅ Successfully logged into Supercell Dev Portal');
}).catch((err) => {
  console.error('❌ Failed to log into Supercell Dev Portal:', err.message);
});

// Optional: Log when the library successfully rotates a key
cocClient.on('keys', (keys) => {
  console.log(`🔑 API Key successfully rotated for current IP! Total active keys: ${keys.length}`);
});