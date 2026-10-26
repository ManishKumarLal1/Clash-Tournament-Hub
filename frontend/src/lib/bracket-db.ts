import { v4 as uuidv4 } from 'uuid'; // You may need to run: npm install uuid @types/uuid

export function generateBracketDB(participants: any[]) {
  const n = participants.length;
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)));
  const byesCount = nextPow2 - n;

  // Shuffle participants
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  // Create a pool with BYEs
  const pool = [...shuffled, ...Array(byesCount).fill(null)];

  const totalRounds = Math.log2(nextPow2);
  const matches: any[] = [];
  
  // Keep track of matches to link them later
  const roundMatches: Record<number, any[]> = {};

  for (let r = 1; r <= totalRounds; r++) {
    const matchesInRound = nextPow2 / Math.pow(2, r);
    roundMatches[r] = [];
    
    for (let i = 0; i < matchesInRound; i++) {
      const matchId = uuidv4();
      const match: any = {
        id: matchId,
        round_number: r,
        match_index: i,
        p1_id: null,
        p2_id: null,
        winner_id: null,
        next_match_id: null,
        next_match_slot: null,
        status: 'pending',
      };

      // Link to next round (if not the final)
      if (r < totalRounds) {
        const nextRoundIndex = Math.floor(i / 2);
        const nextMatch = roundMatches[r + 1]?.[nextRoundIndex] || matches.find(m => m.round_number === r + 1 && m.match_index === nextRoundIndex);
        
        if (nextMatch) {
          match.next_match_id = nextMatch.id;
          match.next_match_slot = i % 2 === 0 ? 'p1' : 'p2';
        } else {
          // We haven't created the next round yet, we'll fix this in a second pass
        }
      }

      roundMatches[r].push(match);
      matches.push(match);
    }
  }

  // Second pass: Fix next_match_id links (since we build top-down, next rounds might not exist yet)
  for (let r = 1; r < totalRounds; r++) {
    roundMatches[r].forEach((match, index) => {
      const nextMatch = roundMatches[r + 1][Math.floor(index / 2)];
      if (nextMatch) {
        match.next_match_id = nextMatch.id;
        match.next_match_slot = index % 2 === 0 ? 'p1' : 'p2';
      }
    });
  }

  // Fill Round 1
  roundMatches[1].forEach((match, index) => {
    const p1 = pool[index * 2];
    const p2 = pool[index * 2 + 1];
    
    match.p1_id = p1 ? p1.id : null;
    match.p2_id = p2 ? p2.id : null;

    // Handle BYEs
    if (match.p1_id && !match.p2_id) {
      match.winner_id = match.p1_id;
      match.status = 'completed';
      // Advance winner immediately
      if (match.next_match_id) {
        const nextMatch = matches.find(m => m.id === match.next_match_id);
        if (nextMatch) {
          if (match.next_match_slot === 'p1') nextMatch.p1_id = match.p1_id;
          if (match.next_match_slot === 'p2') nextMatch.p2_id = match.p1_id;
        }
      }
    } else if (!match.p1_id && match.p2_id) {
      match.winner_id = match.p2_id;
      match.status = 'completed';
      if (match.next_match_id) {
        const nextMatch = matches.find(m => m.id === match.next_match_id);
        if (nextMatch) {
          if (match.next_match_slot === 'p1') nextMatch.p1_id = match.p2_id;
          if (match.next_match_slot === 'p2') nextMatch.p2_id = match.p2_id;
        }
      }
    } else if (match.p1_id && match.p2_id) {
      match.status = 'ready';
    }
  });

  return matches;
}