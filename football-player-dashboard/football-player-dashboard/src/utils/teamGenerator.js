/**
 * @typedef {Object} Player
 * @property {string}      name        - Player's display name.
 * @property {string}      [photo]     - URL of the player's photo.
 * @property {string}      [position]  - Playing position (Goalkeeper | Defender | Midfielder | Attacker).
 * @property {number}      [age]       - Player's age.
 * @property {string}      [citizenship] - Player's nationality.
 * @property {number|null} [height]    - Height in centimetres.
 * @property {string}      [club]      - Current club name.
 * @property {number|null} [rating]    - Form rating.
 */

/** Fisher-Yates in-place shuffle (mutates the array). */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Pick `n` players from the top-rated candidates in `pool`.
 *
 * The pool is sorted by rating (descending, nulls last), then the first
 * `candidateWindow` entries form the shortlist. `n` players are drawn
 * randomly from that shortlist, giving high-rated players a better chance
 * while still producing variety across multiple generations.
 *
 * `candidateWindow` is clamped so it is always at least `n` and never
 * larger than the pool itself.
 *
 * @param {Player[]} pool
 * @param {number}   n               - How many players to return.
 * @param {number}   [candidateWindow=5] - Size of the top-rated shortlist to draw from.
 */
function pickFromTopRated(pool, n, candidateWindow = 5) {
  const sorted = [...pool].sort((a, b) => {
    const ra = a.rating ?? -Infinity;
    const rb = b.rating ?? -Infinity;
    return rb - ra;
  });
  const window = Math.max(n, Math.min(candidateWindow, sorted.length));
  const shortlist = sorted.slice(0, window);
  shuffle(shortlist);
  return shortlist.slice(0, n);
}

/**
 * Maps each formation row label to the matching `position` value in players.json.
 * AMF and DMF are both midfielders; FWD maps to Attacker.
 */
const LABEL_TO_POSITION = {
  GK:  'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  DMF: 'Midfielder',
  AMF: 'Midfielder',
  FWD: 'Attacker',
};

/**
 * Builds a realistic 11-player team for the given formation by selecting
 * players from the correct position groups.
 *
 * Each row in `formationRows` describes how many players are needed and which
 * row label they belong to (e.g. { label: 'DEF', count: 4 }).
 * Players are returned ordered attack → defence (same order as formationRows),
 * so the board can assign them row-by-row directly.
 *
 * If a position pool runs short the remainder is filled from all leftover
 * players, so the board is always fully populated.
 *
 * @param {Player[]} allPlayers    - Full list of available players.
 * @param {Array<{label: string, count: number}>} formationRows
 *   - Row descriptors from the FORMATIONS constant in FormationBoard.
 * @returns {Player[]} Up to 11 players ordered by formation row.
 */
export function generateTeamByFormation(allPlayers, formationRows) {
  // Build a pool per position
  const pools = {};
  for (const pos of Object.values(LABEL_TO_POSITION)) {
    pools[pos] = allPlayers.filter((p) => p.position === pos);
  }

  const selected = [];
  const usedNames = new Set();

  for (const row of formationRows) {
    const position = LABEL_TO_POSITION[row.label];
    const available = (pools[position] || []).filter((p) => !usedNames.has(p.name));

    // Draw randomly from the top 3–5 rated players in this position pool.
    // candidateWindow is 3 when only 3 slots are needed (e.g. GK), up to 5 otherwise.
    const candidateWindow = Math.max(3, Math.min(5, available.length));
    const picked = pickFromTopRated(available, row.count, candidateWindow);
    picked.forEach((p) => usedNames.add(p.name));
    selected.push(...picked);

    // If the position pool was short, fill remaining slots from any unused player
    const shortage = row.count - picked.length;
    if (shortage > 0) {
      const fallback = allPlayers.filter((p) => !usedNames.has(p.name));
      const extra = pickFromTopRated(fallback, shortage, Math.min(5, fallback.length));
      extra.forEach((p) => usedNames.add(p.name));
      selected.push(...extra);
    }
  }

  return selected;
}

/**
 * Returns 11 randomly selected players from `allPlayers` (no position logic).
 * Kept for backwards-compatibility; prefer generateTeamByFormation.
 *
 * @param {Player[]} allPlayers
 * @returns {Player[]}
 */
export function generateRandomTeam(allPlayers) {
  const shuffled = [...allPlayers];
  shuffle(shuffled);
  return shuffled.slice(0, 11);
}
