import { Client } from 'clashofclans.js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CLASH_API_KEY) {
  console.warn('⚠️ CLASH_API_KEY is missing in .env');
}

export const cocClient = new Client({ 
  keys: [process.env.CLASH_API_KEY || ''] 
});