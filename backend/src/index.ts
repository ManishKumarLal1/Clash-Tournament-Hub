import express from 'express';
import cors from 'cors';
import { cocClient } from './coc';

const app = express();

// Middleware
app.use(cors()); // Allows your Next.js frontend to make requests
app.use(express.json()); // Parses JSON request bodies

// 1. Get Player Data Endpoint (Accepts BOTH /api/player?tag=X and /api/player/X)
app.get(['/api/player', '/api/player/:tag'], async (req, res) => {
    try {
    // Check if the tag is in the URL path OR the query string
    let rawTag = req.params.tag || req.query.tag;
    
    // Force it to be a string (in case the user sent an array like ?tag=a&tag=b)
    let tag = Array.isArray(rawTag) ? rawTag[0] : rawTag;
    
    if (!tag || typeof tag !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide a valid tag. Example: /api/player?tag=YOURTAG' });
    }

    // Normalize tag: ensure it starts with # and replace letter O with zero
    if (!tag.startsWith('#')) tag = '#' + tag;
    tag = tag.toUpperCase().replace(/O/g, '0');

    const player = await cocClient.getPlayer(tag);
    
    res.json({ 
      success: true, 
      data: {
        name: player.name,
        tag: player.tag,
        townHallLevel: player.townHallLevel,
        clan: player.clan ? player.clan.name : 'No Clan'
      }
    });
  } catch (error: any) {
    console.error("API Error:", error.message);
    res.status(404).json({ success: false, error: 'Player not found or API error' });
  }
});

// 2. Verify Player API Token Endpoint
app.post('/api/verify-player', async (req, res) => {
  try {
    let { tag, token } = req.body;
    
    if (!tag || !token) {
      return res.status(400).json({ success: false, error: 'Tag and token are required' });
    }

    // Normalize tag
    if (!tag.startsWith('#')) tag = '#' + tag;
    tag = tag.toUpperCase().replace(/O/g, '0');

    // Verify the token with Supercell
    const isVerified = await cocClient.verifyPlayerToken(tag, token);
    
    if (isVerified) {
      // If valid, fetch the full profile to get their real Name and TH level
      const player = await cocClient.getPlayer(tag);
      
      res.json({ 
        success: true, 
        verified: true, 
        player: {
          name: player.name,
          tag: player.tag,
          townHallLevel: player.townHallLevel
        }
      });
    } else {
      // Token was wrong or expired
      res.json({ 
        success: true, 
        verified: false, 
        reason: 'Invalid or expired token' 
      });
    }
  } catch (error: any) {
    console.error("Verification Error:", error.message);
    res.status(500).json({ success: false, error: 'Server error during verification' });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Clash API Proxy running on http://localhost:${PORT}`);
});