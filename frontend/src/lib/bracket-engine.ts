export interface Player {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  round: number;
  p1: Player | null;
  p2: Player | null;
  winnerId: string | null;
  nextMatchId: string | null;
}

export const BYE_PLAYER: Player = { id: 'bye', name: 'BYE' };

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateBracket(players: Player[]): Match[] {
  // 1. Calculate next power of 2
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(players.length)));
  const byesCount = nextPow2 - players.length;

  // 2. Add BYEs to the pool and shuffle
  const pool = [...players, ...Array(byesCount).fill(BYE_PLAYER)];
  const shuffledPool = shuffleArray(pool);

  const totalRounds = Math.log2(nextPow2);
  const matches: Match[] = [];

  // 3. Generate empty matches
  let matchesInRound = nextPow2 / 2;
  let currentRound = 1;

  while (matchesInRound >= 1) {
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `m-${currentRound}-${i}`,
        round: currentRound,
        p1: null,
        p2: null,
        winnerId: null,
        nextMatchId: currentRound < totalRounds ? `m-${currentRound + 1}-${Math.floor(i / 2)}` : null,
      });
    }
    matchesInRound /= 2;
    currentRound++;
  }

  // 4. Populate Round 1
  const round1Matches = matches.filter((m) => m.round === 1);
  round1Matches.forEach((match, index) => {
    match.p1 = shuffledPool[index * 2];
    match.p2 = shuffledPool[index * 2 + 1];
  });

  // 5. Auto-advance BYEs in Round 1
  round1Matches.forEach((match) => {
    // FIXED: Added "&& match.p2" and "&& match.p1" to satisfy TypeScript
    if (match.p1?.id === 'bye' && match.p2) {
      match.winnerId = match.p2.id;
    } else if (match.p2?.id === 'bye' && match.p1) {
      match.winnerId = match.p1.id;
    }
  });

  // 6. Propagate Round 1 auto-winners to Round 2
  const round1Winners = round1Matches.filter(m => m.winnerId !== null);
  round1Winners.forEach((match) => {
    if (!match.nextMatchId) return;
    const winningPlayer = shuffledPool.find(p => p.id === match.winnerId);
    const nextMatch = matches.find(m => m.id === match.nextMatchId);
    
    if (nextMatch) {
      if (!nextMatch.p1) nextMatch.p1 = winningPlayer || null;
      else if (!nextMatch.p2) nextMatch.p2 = winningPlayer || null;
    }
  });

  return matches;
}