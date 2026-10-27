require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://v3.football.api-sports.io';
const SEASON = 2023;
const PREMIER_LEAGUE_ID = 39;
const DELAY_MS = 600;

// Premier League team IDs (2023 season)
const TEAMS = [
  { id: 50, name: 'Manchester City' },
  { id: 33, name: 'Manchester United' },
  { id: 40, name: 'Liverpool' },
  { id: 42, name: 'Arsenal' },
  { id: 49, name: 'Chelsea' },
  { id: 47, name: 'Tottenham' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTeamPlayers(teamId, teamName) {
  const url = `${API_BASE}/players?team=${teamId}&season=${SEASON}`;
  const response = await fetch(url, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching team ${teamName} (id=${teamId})`);
  }

  const json = await response.json();

  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(
      `API error for team ${teamName}: ${JSON.stringify(json.errors)}`
    );
  }

  return json.response ?? [];
}

function extractPlayer(entry) {
  const plStats = (entry.statistics ?? []).find(
    (s) => s.league && s.league.id === PREMIER_LEAGUE_ID
  );

  // Skip players with no PL statistics
  if (!plStats) return null;

  const { player } = entry;

  return {
    name:        player.name,
    photo:       player.photo,
    position:    plStats.games ? plStats.games.position : null,
    age:         player.age,
    citizenship: player.nationality,
    height:      player.height
                   ? parseInt(player.height.replace(/\D/g, ''), 10) || null
                   : null,
    club:        plStats.team ? plStats.team.name : null,
    rating:      plStats.games && plStats.games.rating != null
                   ? parseFloat(plStats.games.rating)
                   : null,
  };
}

async function main() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    console.error('ERROR: API_FOOTBALL_KEY is not set. Check your .env file.');
    process.exit(1);
  }

  // Ensure output directory exists
  const dataDir = path.resolve('src/data');
  fs.mkdirSync(dataDir, { recursive: true });

  const allPlayers = [];

  for (let i = 0; i < TEAMS.length; i++) {
    const team = TEAMS[i];
    console.log(`Fetching players for ${team.name} (team id=${team.id})…`);
    try {
      const entries = await fetchTeamPlayers(team.id, team.name);
      console.log(`  → ${entries.length} player entries received`);
      for (const entry of entries) {
        const player = extractPlayer(entry);
        if (player) allPlayers.push(player);
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }

    // Respect rate limit between requests (skip delay after last team)
    if (i < TEAMS.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nTotal players fetched (with PL stats): ${allPlayers.length}`);

  // Deduplicate by name — keep first occurrence
  const seen = new Set();
  const unique = allPlayers.filter(({ name }) => {
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });

  console.log(`After removing duplicates: ${unique.length} players`);

  const outPath = path.join(dataDir, 'players.json');
  fs.writeFileSync(outPath, JSON.stringify(unique, null, 2));
  console.log(`\n✓ Saved ${unique.length} players to ${outPath}`);
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(1);
});
