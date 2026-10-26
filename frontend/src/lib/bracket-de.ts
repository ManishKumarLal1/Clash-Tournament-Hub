import { v4 as uuidv4 } from 'uuid';

export function generateDoubleEliminationDB(participants: any[]) {
  const n = participants.length;
  const pow2 = Math.pow(2, Math.ceil(Math.log2(n)));
  const byes = pow2 - n;
  const shuffled = [...participants, ...Array(byes).fill(null)].sort(() => Math.random() - 0.5);

  const matches: any[] = [];
  const wbRounds = Math.log2(pow2);
  const lbRounds = wbRounds * 2 - 2;

  const createMatch = (bracketType: string, round: number, index: number) => {
    const match = {
      id: uuidv4(), bracket_type: bracketType, round_number: round, match_index: index,
      p1_id: null, p2_id: null, winner_id: null,
      next_winner_match_id: null, next_winner_slot: null,
      next_loser_match_id: null, next_loser_slot: null,
      status: 'pending',
    };
    matches.push(match);
    return match;
  };

  // 1. Create Winners Bracket
  const wbMatches: any[][] = [];
  for (let r = 1; r <= wbRounds; r++) {
    wbMatches[r] = [];
    const count = pow2 / Math.pow(2, r);
    for (let i = 0; i < count; i++) wbMatches[r].push(createMatch('winners', r, i));
  }

  // Link WB matches
  for (let r = 1; r < wbRounds; r++) {
    wbMatches[r].forEach((m, i) => {
      m.next_winner_match_id = wbMatches[r + 1][Math.floor(i / 2)].id;
      m.next_winner_slot = i % 2 === 0 ? 'p1' : 'p2';
    });
  }

  // 2. Create Losers Bracket
  const lbMatches: any[][] = [];
  for (let r = 1; r <= lbRounds; r++) {
    lbMatches[r] = [];
    let count = r === 1 ? pow2 / 4 : (r % 2 === 0 ? lbMatches[r - 1].length : lbMatches[r - 1].length / 2);
    for (let i = 0; i < count; i++) lbMatches[r].push(createMatch('losers', r, i));
  }

  // Link LB matches
  for (let r = 1; r < lbRounds; r++) {
    lbMatches[r].forEach((m, i) => {
      let nextIndex = r % 2 !== 0 ? i : Math.floor(i / 2);
      const nextMatch = lbMatches[r + 1][nextIndex];
      if (nextMatch) {
        m.next_winner_match_id = nextMatch.id;
        m.next_winner_slot = r % 2 === 0 ? 'p1' : (i % 2 === 0 ? 'p1' : 'p2');
      }
    });
  }

  // 3. Map WB Losers to LB
  for (let r = 1; r <= wbRounds; r++) {
    wbMatches[r].forEach((m, i) => {
      if (r === 1) {
        const lbMatch = lbMatches[1][Math.floor(i / 2)];
        m.next_loser_match_id = lbMatch.id;
        m.next_loser_slot = i % 2 === 0 ? 'p1' : 'p2';
      } else if (r < wbRounds) {
        const lbRound = r * 2 - 2;
        m.next_loser_match_id = lbMatches[lbRound][i].id;
        m.next_loser_slot = 'p2';
      }
    });
  }

  // 4. Grand Finals
    // 4. Grand Finals (Create two: GF1 and Reset GF2)
  const gf1 = createMatch('grand_final', 1, 0); 
  const gf2 = createMatch('grand_final', 1, 1); // The reset match

  // WB Winner goes to GF1 Slot 1
  wbMatches[wbRounds][0].next_winner_match_id = gf1.id;
  wbMatches[wbRounds][0].next_winner_slot = 'p1';
  
  // LB Winner goes to GF1 Slot 2
  lbMatches[lbRounds][0].next_winner_match_id = gf1.id;
  lbMatches[lbRounds][0].next_winner_slot = 'p2';

  // Note: gf1 doesn't automatically link to gf2 in the DB. 
  // Our frontend logic will handle copying the players over if a reset is needed.

  // 5. Populate Round 1 WB
  wbMatches[1].forEach((m, i) => {
    m.p1_id = shuffled[i * 2]?.id || null;
    m.p2_id = shuffled[i * 2 + 1]?.id || null;
    
    if (m.p1_id && !m.p2_id) {
      m.winner_id = m.p1_id; m.status = 'completed';
      const nextW = matches.find(x => x.id === m.next_winner_match_id);
      if (nextW) nextW[m.next_winner_slot] = m.p1_id;
    } else if (!m.p1_id && m.p2_id) {
      m.winner_id = m.p2_id; m.status = 'completed';
      const nextW = matches.find(x => x.id === m.next_winner_match_id);
      if (nextW) nextW[m.next_winner_slot] = m.p2_id;
    } else if (m.p1_id && m.p2_id) {
      m.status = 'ready';
    }
  });

  return matches;
}