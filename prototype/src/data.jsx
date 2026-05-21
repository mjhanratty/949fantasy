// Week 10, 2025 QC snapshot
// Mock-backed fantasy data scoped through NFL Week 10, 2025 (actuals wk 1–10; forward from wk 11).
// Not production ingestion — numbers are best-effort for review.

const SEASON_YEAR = 2025;

const TEAMS = {
  KC:  { name: "Kansas City", color: "#E31837" },
  BUF: { name: "Buffalo", color: "#00338D" },
  PHI: { name: "Philadelphia", color: "#004C54" },
  SF:  { name: "San Francisco", color: "#AA0000" },
  DAL: { name: "Dallas", color: "#003594" },
  MIA: { name: "Miami", color: "#008E97" },
  CIN: { name: "Cincinnati", color: "#FB4F14" },
  BAL: { name: "Baltimore", color: "#241773" },
  DET: { name: "Detroit", color: "#0076B6" },
  GB:  { name: "Green Bay", color: "#203731" },
  MIN: { name: "Minnesota", color: "#4F2683" },
  LAR: { name: "L.A. Rams", color: "#003594" },
  HOU: { name: "Houston", color: "#03202F" },
  NYJ: { name: "N.Y. Jets", color: "#125740" },
  ATL: { name: "Atlanta", color: "#A71930" },
  CHI: { name: "Chicago", color: "#0B162A" },
  TB:  { name: "Tampa Bay", color: "#D50A0A" },
  IND: { name: "Indianapolis", color: "#002C5F" },
  NO:  { name: "New Orleans", color: "#D3BC8D" },
  SEA: { name: "Seattle", color: "#002244" },
  WAS: { name: "Washington", color: "#5A1414" },
  NE:  { name: "New England", color: "#002244" },
  PIT: { name: "Pittsburgh", color: "#FFB612" },
  CLE: { name: "Cleveland", color: "#311D00" },
  TEN: { name: "Tennessee", color: "#4B92DB" },
  CAR: { name: "Carolina", color: "#0085CA" },
  JAX: { name: "Jacksonville", color: "#006778" },
  DEN: { name: "Denver", color: "#FB4F14" },
  LV:  { name: "Las Vegas", color: "#000000" },
  LAC: { name: "L.A. Chargers", color: "#0080C6" },
  ARI: { name: "Arizona", color: "#972235" },
  NYG: { name: "N.Y. Giants", color: "#0B2265" },
};

const NFL_DATA_ENDPOINT = "http://127.0.0.1:3000/api/nfl/teams";
const ROSTER_STATS_ENDPOINT = `http://127.0.0.1:3000/api/nfl/roster-stats?season=${SEASON_YEAR}&throughWeek=10&scoring=ppr`;
const ROSTER_PERSONA_IDS = ["jallen", "cmcaff", "saquon", "jchase", "puka", "amon", "kelce", "henry", "smith"];

function normalizePrototypeTeam(team) {
  const abbreviation = team.abbreviation || team.id;
  if (!abbreviation) return null;

  return {
    abbreviation,
    name: team.city || team.name || team.displayName || abbreviation,
    displayName: team.displayName || [team.city, team.name].filter(Boolean).join(" ") || abbreviation,
    conference: team.conference,
    division: team.division,
  };
}

async function hydrateNflTeamsFromApi() {
  window.NFL_DATA_STATUS = {
    status: "loading",
    source: "rapidapi_nfl_api_data",
    message: "Loading NFL team data",
    teamsLoaded: 0,
    updatedAt: null,
  };
  window.dispatchEvent(new CustomEvent("nfl-data-status", { detail: window.NFL_DATA_STATUS }));

  try {
    const response = await fetch(NFL_DATA_ENDPOINT);
    const payload = await response.json();

    if (!payload.ok) {
      throw new Error(payload.error || "NFL data request failed");
    }

    const liveTeams = {};
    (payload.teams || []).forEach(team => {
      const normalized = normalizePrototypeTeam(team);
      if (!normalized) return;

      liveTeams[normalized.abbreviation] = {
        ...(TEAMS[normalized.abbreviation] || {}),
        name: normalized.name,
        displayName: normalized.displayName,
        conference: normalized.conference,
        division: normalized.division,
      };
    });

    Object.assign(TEAMS, liveTeams);

    window.NFL_DATA_STATUS = {
      status: "live",
      source: payload.provider || "rapidapi_nfl_api_data",
      message: "Live NFL teams loaded",
      teamsLoaded: Object.keys(liveTeams).length,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    window.NFL_DATA_STATUS = {
      status: "mock",
      source: "prototype_mock",
      message: error instanceof Error ? error.message : "Using prototype mock data",
      teamsLoaded: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  window.dispatchEvent(new CustomEvent("nfl-data-status", { detail: window.NFL_DATA_STATUS }));
}

async function hydrateRosterStatsFromApi() {
  const status = window.NFL_DATA_STATUS || { status: "mock" };

  try {
    const response = await fetch(ROSTER_STATS_ENDPOINT);
    const payload = await response.json();

    if (!payload.ok) {
      throw new Error(payload.error || "Roster stats request failed");
    }

    let merged = 0;

    ROSTER_PERSONA_IDS.forEach((id) => {
      const stats = payload.players?.[id];
      const player = PLAYERS.find((p) => p.id === id);
      if (!stats || !player) return;

      if (Array.isArray(stats.traj) && stats.traj.length) {
        player.traj = stats.traj;
        player.liveStats = true;
      }
      if (stats.actual != null) {
        player.actual = stats.actual;
      }
      merged += 1;
    });

    (payload.teamWeeks || []).forEach((tw) => {
      const row = TEAM_POSITION_WEEKS.find((r) => r.wk === tw.wk);
      if (!row) return;

      ["QB", "RB1", "RB2", "WR1", "WR2", "FLEX", "TE"].forEach((slot) => {
        if (tw[slot] != null) row[slot] = tw[slot];
      });

      if (tw.total != null) {
        row.total = +(tw.total + (row.DST || 0) + (row.K || 0)).toFixed(1);
      }
    });

    clearGameLogCache();

    window.NFL_DATA_STATUS = {
      ...status,
      rosterStats: "live",
      rosterMerged: merged,
      statsSeason: payload.season,
      statsThroughWeek: payload.throughWeek,
      message: `Live ${payload.season} stats on demo roster (${merged} players)`,
    };
  } catch (error) {
    window.NFL_DATA_STATUS = {
      ...status,
      rosterStats: "mock",
      rosterMerged: 0,
      message: error instanceof Error ? error.message : "Roster stats unavailable — mock points",
    };
  }

  window.dispatchEvent(new CustomEvent("nfl-data-status", { detail: window.NFL_DATA_STATUS }));
}

async function hydrateDemoDataFromApi() {
  await hydrateNflTeamsFromApi();
  await hydrateRosterStatsFromApi();
}

function traj(seed, base, vol, trend = 0) {
  const out = [];
  let v = base;
  let rng = seed;
  for (let i = 0; i < 10; i++) {
    rng = (rng * 9301 + 49297) % 233280;
    const r = rng / 233280;
    v = v + (r - 0.5) * vol + trend;
    out.push(Math.max(0, +v.toFixed(1)));
  }
  return out;
}

const PLAYERS = [
  // QBs — 2025 mid-season; actual = Week 10, proj/matchup = Week 11 lookahead
  { id: "jallen",  name: "Josh Allen",       pos: "QB", team: "BUF", num: 17, age: 29, proj: 25.4, actual: 18.4, rank: 1,  prev: 1,  ros: 248.2, own: 99.8, trend: "flat", risk: "low",   adp: 14,  round: 2,  matchup: "vs MIA", matchupRating: 4, traj: [24.2, 28.1, 17.4, 26.5, 31.8, 19.6, 25.6, 22.0, 29.4, 18.4], notes: "Rushing floor stable; home vs Miami in Week 11.", boom: 61, bust: 13, snap: 100, tgt: 0, rush: 8.8, news: "Full participant all week.", ceiling: 35, floor: 17 },
  { id: "lamar",   name: "Lamar Jackson",    pos: "QB", team: "BAL", num: 8,  age: 28, proj: 23.8, actual: 22.6, rank: 2,  prev: 3,  ros: 241.5, own: 99.6, trend: "up",   risk: "low",   adp: 18,  round: 2,  matchup: "@CLE", matchupRating: 4, traj: [19.2, 21.4, 24.8, 18.6, 27.2, 20.4, 23.0, 19.8, 26.4, 22.6], notes: "Dual-threat ceiling; Cleveland road spot next.", boom: 57, bust: 14, snap: 100, tgt: 0, rush: 10.2, news: "No injury designation.", ceiling: 34, floor: 16 },
  { id: "burrow",  name: "Joe Burrow",       pos: "QB", team: "CIN", num: 9,  age: 28, proj: 22.4, actual: 21.8, rank: 3,  prev: 4,  ros: 235.8, own: 98.8, trend: "up",   risk: "med",   adp: 28,  round: 3,  matchup: "@PIT", matchupRating: 3, traj: [20.8, 22.2, 19.4, 25.1, 23.6, 18.2, 24.4, 21.0, 27.8, 21.8], notes: "Volume steady through ten weeks.", boom: 53, bust: 17, snap: 100, tgt: 0, rush: 1.2, news: "Wrist monitored; expected to play.", ceiling: 32, floor: 15 },
  { id: "hurts",   name: "Jalen Hurts",      pos: "QB", team: "PHI", num: 1,  age: 27, proj: 23.2, actual: 19.2, rank: 4,  prev: 2,  ros: 228.4, own: 99.5, trend: "down", risk: "low",   adp: 22,  round: 2,  matchup: "vs GB",  matchupRating: 4, traj: [22.4, 24.0, 21.6, 23.8, 26.2, 20.8, 24.6, 22.2, 25.8, 19.2], notes: "Rush TDs buoy floor; Green Bay at home Week 11.", boom: 50, bust: 12, snap: 100, tgt: 0, rush: 9.4, news: "Healthy.", ceiling: 33, floor: 16 },

  // RBs
  { id: "cmcaff",  name: "Christian McCaffrey", pos: "RB", team: "SF",  num: 23, age: 29, proj: 21.8, actual: 17.4, rank: 1, prev: 1, ros: 198.6, own: 100, trend: "flat", risk: "med",   adp: 2,   round: 1,  matchup: "@ARI", matchupRating: 4, traj: [19.8, 22.4, 16.2, 20.6, 24.0, 14.8, 21.2, 18.6, 23.8, 17.4], notes: "Workhorse after return; Arizona next.", boom: 52, bust: 15, snap: 76, tgt: 5.2, rush: 17.4, news: "Limited Wed, full Thu/Fri.", ceiling: 31, floor: 12 },
  { id: "bijan",   name: "Bijan Robinson",   pos: "RB", team: "ATL", num: 7,  age: 23, proj: 20.6, actual: 22.8, rank: 2,  prev: 3,  ros: 192.4, own: 99.9, trend: "up",   risk: "low",   adp: 5,   round: 1,  matchup: "@NO",  matchupRating: 5, traj: [14.2, 16.8, 18.4, 17.6, 21.0, 19.2, 20.4, 18.8, 22.6, 22.8], notes: "Touch share elite in 2025.", boom: 55, bust: 11, snap: 84, tgt: 4.6, rush: 18.2, news: "No designation.", ceiling: 30, floor: 12 },
  { id: "saquon",  name: "Saquon Barkley",   pos: "RB", team: "PHI", num: 26, age: 28, proj: 19.8, actual: 14.2, rank: 3,  prev: 2,  ros: 186.2, own: 100, trend: "down", risk: "med",   adp: 4,   round: 1,  matchup: "vs GB",  matchupRating: 4, traj: [18.6, 20.2, 15.4, 19.0, 22.4, 13.8, 18.2, 16.4, 21.0, 14.2], notes: "Eagles run game peaking; shares dip in blowouts.", boom: 47, bust: 21, snap: 72, tgt: 3.0, rush: 16.8, news: "Full practice Thursday.", ceiling: 28, floor: 9 },
  { id: "henry",   name: "Derrick Henry",    pos: "RB", team: "BAL", num: 22, age: 31, proj: 17.2, actual: 19.6, rank: 4,  prev: 5,  ros: 168.8, own: 99.4, trend: "up",   risk: "med",   adp: 11,  round: 2,  matchup: "@CLE", matchupRating: 4, traj: [12.4, 14.8, 16.2, 15.6, 18.8, 11.2, 17.4, 14.0, 20.2, 19.6], notes: "Goal-line volume in Baltimore.", boom: 46, bust: 19, snap: 62, tgt: 1.0, rush: 20.8, news: "Healthy.", ceiling: 27, floor: 8 },
  { id: "jacobs",  name: "Josh Jacobs",      pos: "RB", team: "GB",  num: 8,  age: 27, proj: 16.8, actual: 15.4, rank: 6,  prev: 6,  ros: 154.2, own: 98.2, trend: "up",   risk: "med",   adp: 24,  round: 3,  matchup: "@PHI", matchupRating: 3, traj: [11.8, 13.2, 14.6, 12.8, 16.4, 10.6, 15.0, 13.8, 17.2, 15.4], notes: "Lead back in Green Bay.", boom: 42, bust: 22, snap: 70, tgt: 2.4, rush: 16.2, news: "Probable tag cleared.", ceiling: 25, floor: 7 },
  { id: "kamara",  name: "Alvin Kamara",     pos: "RB", team: "NO",  num: 41, age: 30, proj: 13.8, actual: 11.8, rank: 9,  prev: 8,  ros: 142.6, own: 94.6, trend: "flat", risk: "med",   adp: 32,  round: 4,  matchup: "vs ATL", matchupRating: 2, traj: [10.2, 12.4, 11.0, 13.6, 14.2, 9.8, 12.8, 10.4, 13.0, 11.8], notes: "Receiving floor; tough vs Bijan.", boom: 34, bust: 28, snap: 68, tgt: 5.4, rush: 11.2, news: "Limited in practice early week.", ceiling: 21, floor: 5 },

  // WRs
  { id: "jchase",  name: "Ja'Marr Chase",    pos: "WR", team: "CIN", num: 1,  age: 25, proj: 20.4, actual: 24.6, rank: 1,  prev: 1,  ros: 198.4, own: 100, trend: "up",   risk: "low",   adp: 3,   round: 1,  matchup: "@PIT", matchupRating: 4, traj: [16.8, 18.4, 14.2, 22.6, 24.8, 17.2, 21.4, 19.6, 26.2, 24.6], notes: "Alpha target share; Steelers rematch.", boom: 63, bust: 12, snap: 94, tgt: 11.2, rush: 0, news: "Healthy.", ceiling: 33, floor: 10 },
  { id: "jjeff",   name: "Justin Jefferson", pos: "WR", team: "MIN", num: 18, age: 27, proj: 17.8, actual: 16.4, rank: 2,  prev: 2,  ros: 186.2, own: 99.8, trend: "flat", risk: "low",   adp: 6,   round: 1,  matchup: "@BAL", matchupRating: 3, traj: [15.4, 16.2, 12.8, 18.0, 20.4, 14.6, 17.2, 15.8, 19.4, 16.4], notes: "QB volatility caps spike weeks.", boom: 54, bust: 17, snap: 93, tgt: 9.8, rush: 0, news: "Full practice.", ceiling: 29, floor: 8 },
  { id: "ceeded",  name: "CeeDee Lamb",      pos: "WR", team: "DAL", num: 88, age: 26, proj: 17.2, actual: 11.2, rank: 4,  prev: 3,  ros: 172.8, own: 99.6, trend: "down", risk: "med",   adp: 7,   round: 1,  matchup: "@PHI", matchupRating: 2, traj: [16.2, 14.8, 13.4, 15.6, 18.2, 12.4, 14.0, 13.2, 16.8, 11.2], notes: "Road division game at Philly.", boom: 48, bust: 21, snap: 92, tgt: 10.4, rush: 0.2, news: "Expected to play.", ceiling: 27, floor: 6 },
  { id: "amon",    name: "Amon-Ra St. Brown", pos: "WR", team: "DET", num: 14, age: 26, proj: 17.6, actual: 19.8, rank: 3,  prev: 5,  ros: 178.6, own: 99.7, trend: "up",   risk: "low",   adp: 10,  round: 2,  matchup: "@MIN", matchupRating: 4, traj: [13.6, 15.2, 14.8, 16.4, 18.6, 15.0, 17.8, 16.2, 20.4, 19.8], notes: "Consistent PPR floor in Detroit.", boom: 51, bust: 15, snap: 90, tgt: 9.6, rush: 0, news: "Healthy.", ceiling: 28, floor: 9 },
  { id: "puka",    name: "Puka Nacua",       pos: "WR", team: "LAR", num: 17, age: 24, proj: 18.2, actual: 21.4, rank: 5,  prev: 6,  ros: 168.4, own: 99.5, trend: "up",   risk: "low",   adp: 12,  round: 2,  matchup: "vs MIA", matchupRating: 4, traj: [14.2, 16.8, 13.6, 17.4, 19.2, 12.8, 18.6, 15.4, 22.0, 21.4], notes: "Target hog when active.", boom: 55, bust: 13, snap: 91, tgt: 10.6, rush: 0, news: "Healthy.", ceiling: 30, floor: 9 },
  { id: "hill",    name: "Tyreek Hill",      pos: "WR", team: "MIA", num: 10, age: 31, proj: 12.4, actual: 6.8,  rank: 14, prev: 8,  ros: 118.2, own: 97.2, trend: "down", risk: "high",  adp: 18,  round: 2,  matchup: "@LAR", matchupRating: 3, traj: [14.8, 16.2, 12.4, 15.0, 17.6, 9.2, 11.4, 8.6, 12.0, 6.8],  notes: "Limited role after early-season injury.", boom: 38, bust: 38, snap: 62, tgt: 6.2, rush: 0.4, news: "Snap count managed.", ceiling: 24, floor: 4 },
  { id: "drake",   name: "Drake London",     pos: "WR", team: "ATL", num: 5,  age: 25, proj: 15.2, actual: 14.6, rank: 7,  prev: 9,  ros: 156.8, own: 98.4, trend: "up",   risk: "med",   adp: 20,  round: 3,  matchup: "@NO",  matchupRating: 4, traj: [11.2, 12.8, 10.4, 13.6, 15.8, 11.6, 14.2, 12.4, 15.0, 14.6], notes: "Falcons passing funnel.", boom: 40, bust: 22, snap: 91, tgt: 8.8, rush: 0, news: "Healthy.", ceiling: 23, floor: 7 },
  { id: "smith",   name: "DeVonta Smith",    pos: "WR", team: "PHI", num: 6,  age: 27, proj: 13.6, actual: 10.4, rank: 11, prev: 10, ros: 142.4, own: 95.8, trend: "flat", risk: "med",   adp: 36,  round: 4,  matchup: "vs GB",  matchupRating: 3, traj: [10.8, 11.4, 9.6, 12.2, 14.0, 8.8, 11.2, 10.6, 13.8, 10.4], notes: "TD-dependent but steady routes.", boom: 35, bust: 28, snap: 85, tgt: 7.2, rush: 0, news: "Healthy.", ceiling: 22, floor: 5 },

  // TEs
  { id: "kelce",   name: "Travis Kelce",     pos: "TE", team: "KC",  num: 87, age: 35, proj: 10.8, actual: 11.6, rank: 2,  prev: 1,  ros: 118.6, own: 98.8, trend: "flat", risk: "med",   adp: 38,  round: 4,  matchup: "@BUF", matchupRating: 3, traj: [8.4, 9.6, 7.8, 11.2, 12.4, 9.0, 10.6, 9.8, 12.2, 11.6], notes: "Red-zone looks vs Buffalo.", boom: 38, bust: 24, snap: 82, tgt: 7.4, rush: 0, news: "Healthy.", ceiling: 20, floor: 4 },
  { id: "lakers",  name: "Sam LaPorta",      pos: "TE", team: "DET", num: 87, age: 24, proj: 11.2, actual: 13.4, rank: 1,  prev: 2,  ros: 124.8, own: 98.2, trend: "up",   risk: "low",   adp: 42,  round: 5,  matchup: "vs MIN", matchupRating: 4, traj: [9.2, 10.4, 8.6, 11.8, 13.0, 9.4, 11.6, 10.2, 12.8, 13.4], notes: "RZ role steady in 2025.", boom: 40, bust: 20, snap: 84, tgt: 6.4, rush: 0, news: "Healthy.", ceiling: 19, floor: 4 },
  { id: "andrews", name: "Mark Andrews",     pos: "TE", team: "BAL", num: 89, age: 30, proj: 8.8,  actual: 7.2,  rank: 6,  prev: 5,  ros: 98.4,  own: 94.2, trend: "down", risk: "med",   adp: 54,  round: 6,  matchup: "@CLE", matchupRating: 3, traj: [9.8, 8.4, 10.2, 7.6, 11.4, 6.8, 9.2, 7.4, 9.6, 7.2],  notes: "Split with Likely caps ceiling.", boom: 28, bust: 30, snap: 58, tgt: 4.8, rush: 0, news: "Limited snaps.", ceiling: 16, floor: 3 },
];

const ROSTER_IDS = ["jallen", "cmcaff", "saquon", "jchase", "puka", "amon", "kelce", "henry", "smith"];
const STARTER_IDS = ["jallen", "cmcaff", "saquon", "jchase", "puka", "amon", "kelce"];
const BENCH_IDS = ["henry", "smith"];

const LEAGUE_SLOTS = ["QB", "RB", "RB", "WR", "WR", "FLEX", "TE", "DST", "K"];

// Your team — weeks 1–10 played (2025); totals sum to ~1277 PF through Week 10
const TEAM_POSITION_WEEKS = [
  { wk: 1,  QB: 24.2, RB1: 22.1, RB2: 14.8, WR1: 18.4, WR2: 12.0, FLEX: 11.2, TE: 13.5, DST: 7.5, K: 4.7, total: 128.4, opp: 112.3, w: true,  proj: 124.0, oppProj: 118.0 },
  { wk: 2,  QB: 28.1, RB1: 25.4, RB2: 16.2, WR1: 21.8, WR2: 14.4, FLEX: 12.8, TE: 11.0, DST: 8.0, K: 5.1, total: 142.8, opp: 98.2,  w: true,  proj: 126.0, oppProj: 119.0 },
  { wk: 3,  QB: 17.4, RB1: 16.8, RB2: 12.4, WR1: 14.2, WR2:  8.6, FLEX:  9.2, TE:  8.8, DST: 5.0, K: 3.7, total: 96.1,  opp: 118.0, w: false, proj: 128.0, oppProj: 115.0 },
  { wk: 4,  QB: 26.5, RB1: 19.2, RB2: 18.6, WR1: 17.4, WR2: 13.2, FLEX: 12.0, TE: 16.1, DST: 6.0, K: 5.2, total: 134.2, opp: 121.5, w: true,  proj: 122.0, oppProj: 117.0 },
  { wk: 5,  QB: 31.8, RB1: 28.0, RB2: 19.4, WR1: 22.6, WR2: 17.8, FLEX: 15.4, TE: 12.4, DST: 4.5, K: 4.8, total: 156.7, opp: 132.0, w: true,  proj: 128.0, oppProj: 121.0 },
  { wk: 6,  QB: 19.6, RB1: 14.2, RB2: 11.0, WR1: 16.8, WR2:  9.4, FLEX: 10.8, TE: 17.0, DST: 6.5, K: 4.1, total: 109.4, opp: 124.6, w: false, proj: 127.0, oppProj: 118.0 },
  { wk: 7,  QB: 25.6, RB1: 24.8, RB2: 15.4, WR1: 19.4, WR2: 12.8, FLEX: 13.6, TE: 14.2, DST: 7.5, K: 4.7, total: 138.0, opp: 105.1, w: true,  proj: 125.0, oppProj: 119.0 },
  { wk: 8,  QB: 22.0, RB1: 21.6, RB2: 13.8, WR1: 18.2, WR2: 11.0, FLEX: 11.4, TE: 11.6, DST: 6.5, K: 5.1, total: 121.2, opp: 119.8, w: true,  proj: 126.0, oppProj: 118.0 },
  { wk: 9,  QB: 29.4, RB1: 26.2, RB2: 17.6, WR1: 22.4, WR2: 15.6, FLEX: 14.0, TE: 13.4, DST: 4.5, K: 4.8, total: 147.9, opp: 110.4, w: true,  proj: 124.0, oppProj: 117.0 },
  { wk: 10, QB: 18.4, RB1: 12.0, RB2:  9.6, WR1: 24.6, WR2:  6.0, FLEX:  8.0, TE: 12.0, DST: 7.0, K: 5.0, total: 102.6, opp: 128.4, w: false, proj: 127.0, oppProj: 120.0 },
];

// Forward from Week 10 snapshot (Weeks 11–14 projections only)
const TEAM_FUTURE_WEEKS = [
  { wk: 11, proj: 131.0, oppProj: 119.0 },
  { wk: 12, proj: 133.5, oppProj: 117.0 },
  { wk: 13, proj: 127.0, oppProj: 121.0 },
  { wk: 14, proj: 130.0, oppProj: 118.0 },
];

// Per-week positional averages through 10 weeks (from TEAM_POSITION_WEEKS)
const POSITION_PERFORMANCE = {
  QB:   { expected: 24.0, actual: 24.3, starters: 1, slotLabel: "QB",   color: "#F2C94C" },
  RB:   { expected: 18.2, actual: 18.8, starters: 2, slotLabel: "RB",   color: "#95F9AE" },
  WR:   { expected: 16.2, actual: 16.1, starters: 2, slotLabel: "WR",   color: "#7BD9F4" },
  TE:   { expected: 12.2, actual: 12.9, starters: 1, slotLabel: "TE",   color: "#D9A6F4" },
  FLEX: { expected: 12.0, actual: 12.2, starters: 1, slotLabel: "FLEX", color: "#D9FFE4" },
  DST:  { expected:  6.5, actual:  6.3, starters: 1, slotLabel: "DST",  color: "#FF9E5E" },
  K:    { expected:  4.8, actual:  4.7, starters: 1, slotLabel: "K",    color: "#A6B7AC" },
};

const LEAGUE_POS_AVG = {
  QB:  [20.4, 22.6, 18.2, 21.8, 23.8, 19.4, 22.2, 20.2, 23.6, 20.8],
  RB:  [14.8, 16.0, 13.2, 15.2, 17.4, 13.6, 15.4, 14.6, 16.2, 14.4],
  WR:  [13.2, 14.6, 12.6, 14.2, 15.8, 12.4, 14.0, 13.4, 14.8, 13.6],
  TE:  [ 9.4, 10.0,  8.6,  9.8, 11.0,  8.8,  9.6,  9.2, 10.2,  9.4],
  FLEX:[11.8, 13.2, 10.6, 12.2, 13.8, 11.2, 12.0, 11.6, 12.8, 11.4],
  DST: [ 6.2,  6.8,  5.6,  6.4,  6.8,  6.0,  6.6,  6.2,  6.4,  6.2],
  K:   [ 6.8,  7.4,  6.0,  7.0,  7.6,  6.4,  7.0,  6.6,  7.2,  6.6],
};

const LEAGUE_STANDINGS = [
  { id: "you",   name: "The Vector Reapers",       owner: "You",        w: 7, l: 3, pf: 1277, pa: 1168, streak: "L1", rank: 2 },
  { id: "t01",   name: "Dynasty Warriors",         owner: "Mike S.",    w: 8, l: 2, pf: 1314, pa: 1142, streak: "W3", rank: 1 },
  { id: "t02",   name: "Saquon Family Robinson",   owner: "Alex P.",    w: 6, l: 4, pf: 1224, pa: 1198, streak: "W1", rank: 3 },
  { id: "t03",   name: "Bijan Mustard",            owner: "Jamie L.",   w: 6, l: 4, pf: 1198, pa: 1184, streak: "W2", rank: 4 },
  { id: "t04",   name: "Allen Wrenches",           owner: "Sam T.",     w: 5, l: 5, pf: 1196, pa: 1212, streak: "L2", rank: 5 },
  { id: "t05",   name: "Multiple Scorgasms",       owner: "Chris D.",   w: 5, l: 5, pf: 1184, pa: 1206, streak: "W1", rank: 6 },
  { id: "t06",   name: "Lamb Chops",               owner: "Pat M.",     w: 5, l: 5, pf: 1172, pa: 1196, streak: "L1", rank: 7 },
  { id: "t07",   name: "Mahomies & Co.",           owner: "Tay R.",     w: 4, l: 6, pf: 1148, pa: 1224, streak: "L3", rank: 8 },
  { id: "t08",   name: "Justifiably Jefferson",    owner: "Quinn K.",   w: 4, l: 6, pf: 1142, pa: 1232, streak: "W1", rank: 9 },
  { id: "t09",   name: "Hurts So Good",            owner: "Robin V.",   w: 3, l: 7, pf: 1102, pa: 1248, streak: "L4", rank: 10 },
  { id: "t10",   name: "Punt God",                 owner: "Casey N.",   w: 3, l: 7, pf: 1088, pa: 1264, streak: "L2", rank: 11 },
  { id: "t11",   name: "Last Place Lizards",       owner: "Drew H.",    w: 2, l: 8, pf: 1042, pa: 1296, streak: "L5", rank: 12 },
];

const NEWS = [
  { tag: "INJ",     team: "MIA", text: "Tyreek Hill limited in practice but expected to play at Rams in Week 11.", time: "18m ago", severity: "warn" },
  { tag: "USAGE",   team: "PHI", text: "Saquon Barkley at 68% snaps in Week 10 — Eagles leaned pass-heavy in second half.", time: "42m ago", severity: "info" },
  { tag: "WEATHER", team: "BUF", text: "Chiefs @ Bills Week 11: lake-effect risk, 15–20 mph gusts possible.", time: "1h ago",  severity: "info" },
  { tag: "TARGET",  team: "CIN", text: "Ja'Marr Chase 31% target share over last three games — still the offense hub.", time: "2h ago",  severity: "good" },
  { tag: "OUT",     team: "MIN", text: "Jordan Addison ruled out; Jefferson remains the clear WR1.", time: "3h ago",  severity: "bad"  },
];

const NFL_CITIES = [
  { team: "BUF", city: "Buffalo",       indoor: false, x: 1660, y: 310  },
  { team: "NE",  city: "Foxborough",    indoor: false, x: 1830, y: 340  },
  { team: "NYJ", city: "E. Rutherford", indoor: false, x: 1760, y: 420  },
  { team: "PHI", city: "Philadelphia",  indoor: false, x: 1680, y: 440  },
  { team: "WAS", city: "Landover",      indoor: false, x: 1640, y: 470  },
  { team: "BAL", city: "Baltimore",     indoor: false, x: 1660, y: 460  },
  { team: "PIT", city: "Pittsburgh",    indoor: false, x: 1550, y: 430  },
  { team: "CLE", city: "Cleveland",     indoor: false, x: 1500, y: 390  },
  { team: "CIN", city: "Cincinnati",    indoor: false, x: 1440, y: 480  },
  { team: "IND", city: "Indianapolis",  indoor: true,  x: 1380, y: 470  },
  { team: "DET", city: "Detroit",       indoor: true,  x: 1440, y: 340  },
  { team: "GB",  city: "Green Bay",     indoor: false, x: 1290, y: 280  },
  { team: "CHI", city: "Chicago",       indoor: false, x: 1320, y: 400  },
  { team: "MIN", city: "Minneapolis",   indoor: true,  x: 1170, y: 290  },
  { team: "KC",  city: "Kansas City",   indoor: false, x: 1140, y: 540  },
  { team: "TEN", city: "Nashville",     indoor: false, x: 1380, y: 590  },
  { team: "DAL", city: "Dallas",        indoor: true,  x: 1040, y: 810  },
  { team: "HOU", city: "Houston",       indoor: true,  x: 1090, y: 940  },
  { team: "NO",  city: "New Orleans",   indoor: true,  x: 1250, y: 940  },
  { team: "ATL", city: "Atlanta",       indoor: true,  x: 1450, y: 740  },
  { team: "CAR", city: "Charlotte",     indoor: false, x: 1550, y: 650  },
  { team: "JAX", city: "Jacksonville",  indoor: false, x: 1570, y: 890  },
  { team: "MIA", city: "Miami",         indoor: false, x: 1710, y: 1110 },
  { team: "TB",  city: "Tampa",         indoor: false, x: 1610, y: 980  },
  { team: "DEN", city: "Denver",        indoor: false, x: 740,  y: 540  },
  { team: "LV",  city: "Las Vegas",     indoor: true,  x: 410,  y: 640  },
  { team: "LAR", city: "Inglewood",     indoor: true,  x: 330,  y: 690  },
  { team: "LAC", city: "Inglewood",     indoor: true,  x: 350,  y: 710  },
  { team: "SF",  city: "Santa Clara",   indoor: false, x: 190,  y: 570  },
  { team: "SEA", city: "Seattle",       indoor: false, x: 400,  y: 180  },
  { team: "ARI", city: "Glendale",      indoor: true,  x: 560,  y: 720  },
];

// Week 10, 2025-style slate (export name kept for stadium-map.jsx)
const WEEK11_GAMES = {
  BUF: "you",   KC: "you",   BAL: "you",   CIN: "you",   ATL: "you",
  SF:  "you",   LAR: "you",   PHI: "opp",   DAL: "opp",
  DET: "neutral", MIN: "neutral", GB: "neutral", CHI: "neutral",
  MIA: "neutral", HOU: "neutral", NO: "neutral", SEA: "neutral",
  CLE: "off",   PIT: "off",   IND: "off",   LV: "off",   LAC: "off",
  DEN: "off",   CAR: "off",   JAX: "off",   TEN: "off",   TB: "off",
  NE:  "off",   NYJ: "off",   ARI: "off",   WAS: "off",
};

const SHARED_STADIUM_GROUPS = [
  { teams: ["NYG", "NYJ"] },
  { teams: ["LAC", "LAR"] },
];

const WEEK11_HOME_AT_SHARED = {
  NYG: "NYJ",
  NYJ: "NYJ",
  LAC: "LAR",
  LAR: "LAR",
};

const NFL_CITIES_BY_TEAM = Object.fromEntries(NFL_CITIES.map((c) => [c.team, c]));

function mapSiteForTeam(team, homeOverrides) {
  const group = SHARED_STADIUM_GROUPS.find((g) => g.teams.includes(team));
  if (!group) {
    const c = NFL_CITIES_BY_TEAM[team];
    return c ? { ...c, displayTeam: team } : null;
  }
  const home = homeOverrides[team] || team;
  const siteTeam = group.teams.includes(home) ? home : team;
  const site = NFL_CITIES_BY_TEAM[siteTeam];
  return site ? { ...site, displayTeam: siteTeam } : null;
}

function buildMapMarkers(weekStatus, homeOverrides) {
  const statusRank = { you: 4, opp: 3, neutral: 2, off: 1 };
  const byKey = new Map();

  NFL_CITIES.forEach((city) => {
    const team = city.team;
    const site = mapSiteForTeam(team, homeOverrides);
    if (!site) return;
    const key = `${site.x},${site.y}`;
    const status = weekStatus[team] || "off";
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        team: site.displayTeam,
        city: site.city,
        indoor: site.indoor,
        x: site.x,
        y: site.y,
        teamsAtSite: [team],
        _status: status,
      });
      return;
    }
    existing.teamsAtSite.push(team);
    if ((statusRank[status] || 0) > (statusRank[existing._status] || 0)) {
      existing._status = status;
      existing.team = site.displayTeam;
    }
    if (homeOverrides[team] === team || team === site.displayTeam) {
      existing.team = site.displayTeam;
    }
  });

  return Array.from(byKey.values()).map(({ _status, ...m }) => m);
}

const NFL_MAP_MARKERS = buildMapMarkers(WEEK11_GAMES, WEEK11_HOME_AT_SHARED);

Object.assign(window, {
  TEAMS, PLAYERS, NEWS,
  ROSTER_IDS, STARTER_IDS, BENCH_IDS, LEAGUE_SLOTS,
  TEAM_POSITION_WEEKS, TEAM_FUTURE_WEEKS,
  POSITION_PERFORMANCE, LEAGUE_POS_AVG, LEAGUE_STANDINGS,
  NFL_CITIES, WEEK11_GAMES,
  NFL_MAP_MARKERS, mapSiteForTeam, WEEK11_HOME_AT_SHARED,
  NFL_DATA_ENDPOINT, ROSTER_STATS_ENDPOINT,
  hydrateNflTeamsFromApi, hydrateRosterStatsFromApi, hydrateDemoDataFromApi,
});

const CURRENT_WEEK = 10;

const OPP_POOL = ["KC","BUF","PHI","SF","DAL","MIA","CIN","BAL","DET","GB","MIN","LAR","HOU","NYJ","ATL","CHI","TB","IND","NO","SEA","CLE","PIT","WAS"];
const INDOOR_TEAMS = new Set(["MIN","DET","NO","ATL","IND","DAL","HOU","ARI","LV","LAC"]);
const COLD_LATE_TEAMS = new Set(["BUF","GB","CHI","DEN","CLE","PIT","BAL","NYJ","NE","CIN","KC"]);

function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function makeGameLog(player) {
  const r = rng(player.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 17 + 41);
  const byeWeek = 6 + Math.floor(r() * 4);
  const log = [];
  let opponentsUsed = new Set([player.team]);

  for (let wk = 1; wk <= 18; wk++) {
    if (wk === byeWeek) {
      log.push({ wk, bye: true, played: wk < CURRENT_WEEK, proj: 0, actual: 0, ceiling: 0, floor: 0 });
      continue;
    }

    let opp;
    let tries = 0;
    do {
      opp = OPP_POOL[Math.floor(r() * OPP_POOL.length)];
      tries++;
    } while ((opp === player.team || opponentsUsed.has(opp)) && tries < 8);
    if (tries === 8) { opp = OPP_POOL[Math.floor(r() * OPP_POOL.length)]; }
    opponentsUsed.add(opp);

    const home = r() > 0.5;
    const homeTeam = home ? player.team : opp;
    const indoor = INDOOR_TEAMS.has(homeTeam);
    const kr = r();
    let day = "Sun", kickoff = "1pm", icon = "sun";
    if (wk === 1 && kr < 0.2) { day = "Thu"; kickoff = "8:20pm"; icon = "moon"; }
    else if (kr < 0.55) { day = "Sun"; kickoff = "1pm"; icon = "sun"; }
    else if (kr < 0.78) { day = "Sun"; kickoff = "4:25pm"; icon = "dusk"; }
    else if (kr < 0.9)  { day = "Sun"; kickoff = "8:20pm"; icon = "moon"; }
    else if (kr < 0.96) { day = "Mon"; kickoff = "8:15pm"; icon = "moon"; }
    else { day = "Thu"; kickoff = "8:20pm"; icon = "moon"; }
    if (wk >= 15 && r() < 0.15) { day = "Sat"; kickoff = "8:15pm"; icon = "moon"; }

    let weather = "clear";
    if (!indoor) {
      const wr = r();
      if (wk >= 13 && COLD_LATE_TEAMS.has(homeTeam) && wr < 0.18) weather = "snow";
      else if (wk >= 10 && COLD_LATE_TEAMS.has(homeTeam) && wr < 0.28) weather = "windy";
      else if (wr < 0.10) weather = "rain";
      else if (wr < 0.14) weather = "fog";
    }

    let holiday = null;
    if (wk === 12 && day === "Thu") holiday = "thx";
    if (wk === 16 && day === "Sat") holiday = "xmas";

    const base = player.proj;
    const projVar = (r() - 0.5) * 4;
    const proj = Math.max(2, base + projVar);
    const ceiling = proj * (1.4 + r() * 0.2);
    const floor = Math.max(0, proj * (0.45 + r() * 0.15));
    let actual = null;
    if (wk < CURRENT_WEEK) {
      const trajIdx = wk - 1;
      if (player.liveStats && player.traj && player.traj[trajIdx] != null) {
        actual = player.traj[trajIdx];
      } else {
        const base2 = (player.traj && player.traj[Math.min(player.traj.length - 1, trajIdx)]) || proj;
        actual = Math.max(0, base2 + (r() - 0.5) * 2);
      }
    } else if (wk === CURRENT_WEEK) {
      actual = player.actual;
    }

    log.push({
      wk, opp, home, indoor, kickoff, day, weather, holiday,
      proj: +proj.toFixed(2),
      actual: actual != null ? +actual.toFixed(2) : null,
      ceiling: +ceiling.toFixed(2),
      floor: +floor.toFixed(2),
      played: wk < CURRENT_WEEK,
      bye: false,
    });
  }
  return log;
}

const _logCache = {};
function clearGameLogCache() {
  Object.keys(_logCache).forEach((key) => delete _logCache[key]);
}
function getGameLog(playerId) {
  if (!_logCache[playerId]) {
    const p = PLAYERS.find((x) => x.id === playerId);
    if (!p) return [];
    _logCache[playerId] = makeGameLog(p);
  }
  return _logCache[playerId];
}

Object.assign(window, { CURRENT_WEEK, getGameLog, makeGameLog, clearGameLogCache });
