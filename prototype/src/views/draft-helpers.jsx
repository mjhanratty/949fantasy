// Draft helpers: constants, pure functions, scoring & grading logic.
// All exported via window so draft.jsx can pick them up across <script> scopes.

const DRAFT_SUPPLEMENTAL_RANKINGS = [
  ["jgibbs", "Jahmyr Gibbs", "RB", "DET", 26, 21.4, 2, 2, "low", 60, 13],
  ["achane", "De'Von Achane", "RB", "MIA", 28, 19.2, 7, 8, "med", 58, 22],
  ["btj", "Brian Thomas Jr.", "WR", "JAX", 7, 17.8, 9, 10, "low", 55, 17],
  ["nabers", "Malik Nabers", "WR", "NYG", 1, 17.6, 10, 11, "med", 57, 20],
  ["breece", "Breece Hall", "RB", "NYJ", 20, 18.1, 13, 14, "med", 51, 21],
  ["jtaylor", "Jonathan Taylor", "RB", "IND", 28, 17.7, 15, 16, "med", 49, 22],
  ["ajbrown", "A.J. Brown", "WR", "PHI", 11, 17.1, 16, 17, "low", 50, 16],
  ["ladd", "Ladd McConkey", "WR", "LAC", 15, 15.9, 20, 21, "low", 46, 17],
  ["jsn", "Jaxon Smith-Njigba", "WR", "SEA", 11, 15.8, 22, 23, "low", 48, 16],
  ["kyren", "Kyren Williams", "RB", "LAR", 23, 16.2, 24, 25, "med", 43, 24],
  ["mahomes", "Patrick Mahomes", "QB", "KC", 15, 21.8, 27, 28, "low", 47, 13],
  ["love", "Jordan Love", "QB", "GB", 10, 19.4, 54, 55, "med", 39, 22],
  ["stroud", "C.J. Stroud", "QB", "HOU", 7, 19.0, 59, 60, "med", 37, 23],
  ["bowers", "Brock Bowers", "TE", "LV", 89, 14.3, 18, 19, "low", 50, 14],
  ["mcbride", "Trey McBride", "TE", "ARI", 85, 12.9, 38, 39, "low", 41, 18],
  ["laporta", "Sam LaPorta", "TE", "DET", 87, 11.6, 48, 49, "med", 38, 23],
  ["walker", "Kenneth Walker III", "RB", "SEA", 9, 14.8, 42, 43, "med", 43, 27],
  ["cook", "James Cook", "RB", "BUF", 4, 15.0, 36, 37, "med", 42, 24],
  ["monty", "David Montgomery", "RB", "DET", 5, 12.8, 70, 71, "med", 33, 26],
  ["swift", "D'Andre Swift", "RB", "CHI", 4, 12.2, 82, 83, "high", 32, 31],
  ["metcalf", "DK Metcalf", "WR", "SEA", 14, 14.6, 45, 46, "med", 43, 24],
  ["olave", "Chris Olave", "WR", "NO", 12, 14.2, 50, 51, "med", 40, 26],
  ["wilson", "Garrett Wilson", "WR", "NYJ", 17, 15.4, 31, 32, "low", 45, 19],
  ["evans", "Mike Evans", "WR", "TB", 13, 13.6, 62, 63, "med", 39, 27],
  ["worthy", "Xavier Worthy", "WR", "KC", 1, 12.8, 76, 77, "high", 44, 34],
  ["flowers", "Zay Flowers", "WR", "BAL", 4, 13.0, 72, 73, "med", 38, 25],
  ["kincaid", "Dalton Kincaid", "TE", "BUF", 86, 10.6, 78, 79, "med", 34, 26],
  ["pitts", "Kyle Pitts", "TE", "ATL", 8, 9.8, 92, 93, "high", 36, 34],
  ["daniels", "Jayden Daniels", "QB", "WAS", 5, 22.2, 26, 27, "med", 55, 21],
  ["richardson", "Anthony Richardson", "QB", "IND", 5, 20.2, 68, 69, "high", 55, 39],
  ["prescott", "Dak Prescott", "QB", "DAL", 4, 18.6, 86, 87, "med", 34, 25],
  ["mayfield", "Baker Mayfield", "QB", "TB", 6, 18.0, 102, 103, "med", 30, 27],
  ["njoku", "David Njoku", "TE", "CLE", 85, 8.9, 106, 107, "med", 27, 28],
  ["engram", "Evan Engram", "TE", "JAX", 17, 8.6, 114, 115, "med", 25, 29],
  ["pollard", "Tony Pollard", "RB", "TEN", 20, 11.6, 96, 97, "med", 29, 29],
  ["rwhite", "Rachaad White", "RB", "TB", 1, 11.2, 104, 105, "med", 28, 30],
  ["ridley", "Calvin Ridley", "WR", "TEN", 0, 11.8, 110, 111, "high", 31, 33],
  ["reed", "Jayden Reed", "WR", "GB", 11, 12.0, 88, 89, "med", 35, 27],
  ["addison", "Jordan Addison", "WR", "MIN", 3, 11.4, 116, 117, "high", 29, 34],
  ["downs", "Josh Downs", "WR", "IND", 1, 10.8, 128, 129, "med", 24, 29],
  ["mclaurin", "Terry McLaurin", "WR", "WAS", 17, 12.6, 80, 81, "med", 34, 25],
  ["deebo", "Deebo Samuel Sr.", "WR", "WAS", 1, 11.7, 94, 95, "high", 35, 33],
  ["moore", "DJ Moore", "WR", "CHI", 2, 13.8, 56, 57, "med", 38, 24],
  ["odunze", "Rome Odunze", "WR", "CHI", 15, 12.4, 84, 85, "med", 39, 28],
  ["pickens", "George Pickens", "WR", "DAL", 3, 12.5, 90, 91, "high", 41, 34],
  ["sutton", "Courtland Sutton", "WR", "DEN", 14, 12.1, 98, 99, "med", 32, 27],
  ["aiyuk", "Brandon Aiyuk", "WR", "SF", 11, 11.6, 108, 109, "high", 34, 35],
  ["kupp", "Cooper Kupp", "WR", "SEA", 10, 11.5, 112, 113, "high", 32, 36],
  ["godwin", "Chris Godwin", "WR", "TB", 14, 10.9, 118, 119, "high", 29, 34],
  ["shakir", "Khalil Shakir", "WR", "BUF", 10, 10.6, 132, 133, "med", 24, 28],
  ["coleman", "Keon Coleman", "WR", "BUF", 0, 10.4, 140, 141, "high", 30, 36],
  ["waddle", "Jaylen Waddle", "WR", "MIA", 17, 13.4, 64, 65, "med", 39, 27],
  ["rice", "Rashee Rice", "WR", "KC", 4, 13.5, 66, 67, "high", 42, 35],
  ["johnston", "Quentin Johnston", "WR", "LAC", 1, 9.8, 150, 151, "high", 24, 38],
  ["meyers", "Jakobi Meyers", "WR", "LV", 16, 10.5, 136, 137, "med", 22, 27],
  ["pearce", "Alec Pierce", "WR", "IND", 14, 9.2, 170, 171, "high", 23, 39],
  ["mitchell", "Adonai Mitchell", "WR", "IND", 10, 9.1, 178, 179, "high", 27, 42],
  ["doubs", "Romeo Doubs", "WR", "GB", 87, 9.9, 156, 157, "med", 23, 31],
  ["watson", "Christian Watson", "WR", "GB", 9, 10.1, 146, 147, "high", 31, 41],
  ["shaheed", "Rashid Shaheed", "WR", "NO", 22, 9.7, 160, 161, "high", 30, 40],
  ["leggette", "Xavier Legette", "WR", "CAR", 17, 9.6, 164, 165, "high", 26, 37],
  ["thielen", "Adam Thielen", "WR", "CAR", 19, 9.3, 188, 189, "high", 18, 35],
  ["dhop", "DeAndre Hopkins", "WR", "BAL", 10, 8.8, 194, 195, "high", 21, 39],
  ["douglas", "Demario Douglas", "WR", "NE", 3, 8.9, 196, 197, "med", 18, 32],
  ["jeudy", "Jerry Jeudy", "WR", "CLE", 3, 11.1, 122, 123, "med", 28, 29],
  ["tillman", "Cedric Tillman", "WR", "CLE", 19, 9.4, 176, 177, "high", 24, 38],
  ["judkins", "Quinshon Judkins", "RB", "CLE", 10, 13.9, 58, 59, "med", 40, 27],
  ["henderson", "TreVeyon Henderson", "RB", "NE", 32, 13.2, 74, 75, "med", 43, 31],
  ["omarion", "Omarion Hampton", "RB", "LAC", 8, 14.6, 44, 45, "med", 45, 27],
  ["conner", "James Conner", "RB", "ARI", 6, 13.0, 78, 80, "med", 31, 28],
  ["chuba", "Chuba Hubbard", "RB", "CAR", 30, 12.7, 86, 88, "med", 28, 27],
  ["najee", "Najee Harris", "RB", "LAC", 22, 11.9, 100, 101, "med", 27, 30],
  ["brob", "Brian Robinson Jr.", "RB", "WAS", 8, 11.4, 120, 121, "med", 26, 31],
  ["javonte", "Javonte Williams", "RB", "DAL", 33, 10.2, 142, 143, "high", 24, 36],
  ["bucky", "Bucky Irving", "RB", "TB", 7, 13.7, 60, 61, "low", 38, 22],
  ["spears", "Tyjae Spears", "RB", "TEN", 2, 9.8, 152, 153, "high", 25, 39],
  ["benson", "Trey Benson", "RB", "ARI", 33, 9.7, 158, 159, "high", 29, 40],
  ["allgeier", "Tyler Allgeier", "RB", "ATL", 25, 8.6, 190, 191, "med", 18, 34],
  ["charbonnet", "Zach Charbonnet", "RB", "SEA", 26, 9.5, 166, 167, "med", 24, 34],
  ["mason", "Jordan Mason", "RB", "MIN", 27, 8.9, 184, 185, "high", 22, 37],
  ["ekeler", "Austin Ekeler", "RB", "WAS", 30, 8.4, 204, 205, "high", 17, 38],
  ["roschon", "Roschon Johnson", "RB", "CHI", 23, 8.2, 214, 215, "high", 18, 40],
  ["tua", "Tua Tagovailoa", "QB", "MIA", 1, 17.6, 130, 131, "high", 27, 34],
  ["herbert", "Justin Herbert", "QB", "LAC", 10, 18.4, 96, 98, "med", 34, 25],
  ["purdy", "Brock Purdy", "QB", "SF", 13, 17.8, 124, 125, "med", 26, 27],
  ["goff", "Jared Goff", "QB", "DET", 16, 17.7, 126, 127, "med", 24, 28],
  ["caleb", "Caleb Williams", "QB", "CHI", 18, 18.8, 106, 108, "med", 39, 28],
  ["murray", "Kyler Murray", "QB", "ARI", 1, 19.2, 90, 92, "med", 43, 27],
  ["lawrence", "Trevor Lawrence", "QB", "JAX", 16, 16.6, 154, 155, "med", 24, 32],
  ["darnold", "Sam Darnold", "QB", "SEA", 14, 15.8, 198, 199, "high", 21, 39],
  ["hock", "T.J. Hockenson", "TE", "MIN", 87, 9.2, 134, 135, "high", 27, 34],
  ["goedert", "Dallas Goedert", "TE", "PHI", 88, 8.4, 172, 173, "high", 21, 36],
  ["ferguson", "Jake Ferguson", "TE", "DAL", 87, 8.8, 148, 149, "med", 24, 30],
  ["likely", "Isaiah Likely", "TE", "BAL", 80, 7.8, 206, 207, "high", 23, 42],
  ["muth", "Pat Freiermuth", "TE", "PIT", 88, 7.9, 200, 201, "med", 18, 34],
  ["kraft", "Tucker Kraft", "TE", "GB", 85, 8.1, 182, 183, "med", 22, 35],
  ["otton", "Cade Otton", "TE", "TB", 88, 7.2, 224, 225, "med", 16, 35],
  ["ertz", "Zach Ertz", "TE", "WAS", 86, 6.9, 232, 233, "high", 14, 38],
  ["kmitchell", "Keaton Mitchell", "RB", "BAL", 34, 10.0, 125, 125, "high", 31, 40],
  ["rhamondre", "Rhamondre Stevenson", "RB", "NE", 38, 9.7, 127, 127, "med", 25, 31],
  ["mgolden", "Matthew Golden", "WR", "GB", 22, 9.8, 128, 128, "med", 29, 34],
  ["dobbins", "J.K. Dobbins", "RB", "FA", 27, 9.8, 129, 129, "high", 27, 42],
  ["braelon", "Braelon Allen", "RB", "NYJ", 0, 9.4, 132, 132, "med", 28, 34],
  ["hhenry", "Hunter Henry", "TE", "NE", 85, 7.8, 133, 133, "med", 18, 31],
  ["strange", "Brenton Strange", "TE", "JAX", 85, 7.7, 134, 134, "med", 20, 33],
  ["vidal", "Kimani Vidal", "RB", "LAC", 30, 9.2, 136, 136, "high", 26, 39],
  ["jbrooks", "Jonathon Brooks", "RB", "CAR", 24, 9.0, 138, 138, "high", 28, 43],
  ["barner", "A.J. Barner", "TE", "SEA", 88, 7.6, 139, 139, "med", 19, 34],
  ["jcoker", "Jalen Coker", "WR", "CAR", 18, 9.3, 140, 140, "med", 24, 33],
  ["tuten", "Bhayshul Tuten", "RB", "JAX", 33, 9.1, 142, 142, "high", 28, 41],
  ["tdell", "Tank Dell", "WR", "HOU", 3, 9.2, 143, 143, "high", 27, 42],
  ["kmiller", "Kendre Miller", "RB", "NO", 25, 8.9, 144, 144, "high", 25, 40],
  ["stucker", "Sean Tucker", "RB", "TB", 44, 8.8, 147, 147, "med", 22, 36],
  ["ewilson", "Emanuel Wilson", "RB", "GB", 31, 8.7, 150, 150, "med", 20, 35],
  ["rdavis", "Ray Davis", "RB", "BUF", 22, 8.6, 151, 151, "med", 22, 36],
  ["pwashington", "Parker Washington", "WR", "JAX", 11, 8.8, 153, 153, "med", 21, 34],
  ["bigsby", "Tank Bigsby", "RB", "PHI", 4, 8.6, 154, 154, "med", 20, 35],
  ["jhiggins", "Jayden Higgins", "WR", "HOU", 81, 8.7, 155, 155, "high", 26, 39],
  ["thorton", "Tory Horton", "WR", "SEA", 14, 8.6, 156, 156, "high", 24, 38],
  ["mixon", "Joe Mixon", "RB", "HOU", 28, 8.8, 157, 157, "high", 20, 38],
  ["treharris", "Tre' Harris", "WR", "LAC", 9, 8.7, 158, 158, "high", 25, 40],
  ["pbryant", "Pat Bryant", "WR", "DEN", 13, 8.5, 159, 159, "high", 24, 39],
  ["ttracy", "Tyrone Tracy Jr.", "RB", "NYG", 29, 8.7, 160, 160, "med", 22, 35],
  ["cdike", "Chimere Dike", "WR", "TEN", 15, 8.4, 161, 161, "high", 23, 39],
  ["tfranklin", "Troy Franklin", "WR", "DEN", 16, 8.4, 162, 162, "high", 23, 38],
  ["jmcmillan", "Jalen McMillan", "WR", "TB", 15, 8.5, 166, 166, "high", 24, 38],
  ["jwright", "Jaylen Wright", "RB", "MIA", 25, 8.3, 167, 167, "high", 24, 39],
  ["kallen", "Keenan Allen", "WR", "FA", 13, 8.6, 168, 168, "high", 18, 34],
  ["ogordon", "Ollie Gordon II", "RB", "MIA", 22, 8.3, 169, 169, "high", 25, 40],
  ["teslaa", "Isaac TeSlaa", "WR", "DET", 18, 8.2, 170, 170, "high", 24, 39],
  ["dvele", "Devaughn Vele", "WR", "NO", 81, 8.1, 172, 172, "med", 18, 33],
  ["idavis", "Isaiah Davis", "RB", "NYJ", 32, 8.0, 173, 173, "med", 19, 35],
  ["tez", "Tez Johnson", "WR", "TB", 83, 8.0, 175, 175, "high", 23, 39],
  ["dschultz", "Dalton Schultz", "TE", "HOU", 86, 7.6, 176, 176, "med", 17, 33],
  ["ttucker", "Tre Tucker", "WR", "LV", 11, 7.9, 178, 178, "med", 19, 34],
  ["elic", "Elic Ayomanor", "WR", "TEN", 15, 7.9, 179, 179, "high", 23, 39],
  ["wshipley", "Will Shipley", "RB", "PHI", 28, 7.8, 180, 180, "med", 20, 35],
  ["mooney", "Darnell Mooney", "WR", "ATL", 1, 7.9, 181, 181, "high", 17, 35],
  ["kwilliams", "Kyle Williams", "WR", "NE", 10, 7.8, 182, 182, "high", 22, 38],
  ["dneal", "Devin Neal", "RB", "NO", 23, 7.7, 183, 183, "high", 22, 39],
  ["pacheco", "Isiah Pacheco", "RB", "FA", 10, 8.0, 185, 185, "high", 18, 38],
  ["bateman", "Rashod Bateman", "WR", "BAL", 7, 7.8, 186, 186, "med", 17, 34],
  ["perine", "Samaje Perine", "RB", "CIN", 34, 7.5, 187, 187, "med", 15, 33],
  ["flournoy", "Ryan Flournoy", "WR", "DAL", 80, 7.5, 188, 188, "high", 21, 38],
  ["bsmith", "Brashard Smith", "RB", "KC", 26, 7.6, 189, 189, "high", 22, 39],
  ["ravensdst", "Ravens DST", "DST", "BAL", 0, 7.6, 210, 211, "low", 18, 18],
  ["steelersdst", "Steelers DST", "DST", "PIT", 0, 7.4, 218, 219, "low", 17, 18],
  ["cowboysdst", "Cowboys DST", "DST", "DAL", 0, 7.2, 226, 227, "med", 16, 20],
  ["ninersdst", "49ers DST", "DST", "SF", 0, 7.1, 230, 231, "med", 16, 20],
  ["aubrey", "Brandon Aubrey", "K", "DAL", 17, 8.5, 212, 213, "low", 15, 15],
  ["tucker", "Justin Tucker", "K", "BAL", 9, 7.8, 240, 241, "med", 12, 17],
  ["butker", "Harrison Butker", "K", "KC", 7, 7.9, 236, 237, "med", 13, 17],
  ["moody", "Jake Moody", "K", "SF", 4, 7.5, 248, 249, "med", 11, 18],
];

const DEFAULT_ROSTER_CONFIG = { QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 2, DST: 0, K: 0, BENCH: 2 };

const DRAFT_TEAM_NAMES = [
  "The Vector Reapers", "Dynasty Warriors", "Saquon Family Robinson", "Bijan Mustard",
  "Allen Wrenches", "Multiple Scorgasms", "Lamb Chops", "Mahomies & Co.",
  "Justifiably Jefferson", "Hurts So Good", "Punt God", "Last Place Lizards"
];

const VALUE_BANDS = [
  { label: "High Steal", color: "#123E7C", tone: "var(--mint-soft)", min: 24 },
  { label: "Mid Steal",  color: "#2F9BEA", tone: "var(--black)",     min: 16 },
  { label: "Low Steal",  color: "#58C9BE", tone: "var(--black)",     min: 8  },
  { label: "Expected",   color: "#5DD36D", tone: "var(--black)",     min: -6 },
  { label: "Low Reach",  color: "#F2C94C", tone: "var(--black)",     min: -18 },
  { label: "Mid Reach",  color: "#FF9E3D", tone: "var(--black)",     min: -32 },
  { label: "High Reach", color: "#F0442A", tone: "white",            min: -999 },
];

function buildDraftPool(players) {
  const seen = new Set(players.map(p => p.id));
  const supplemental = DRAFT_SUPPLEMENTAL_RANKINGS
    .filter(([id]) => !seen.has(id))
    .map(([id, name, pos, team, num, proj, rank, adp, risk, boom, bust]) => ({
      id, name, pos, team, num, proj, actual: 0, rank, prev: rank, ros: proj * 17,
      own: 90, trend: "flat", risk, adp, round: Math.ceil(adp / 12), matchup: "TBD",
      matchupRating: 3, traj: [proj * .82, proj * .92, proj, proj * 1.05, proj * .96, proj * 1.1],
      notes: "Draft ranking placeholder for GM simulator testing.", boom, bust,
      snap: 0, tgt: pos === "WR" || pos === "TE" ? 7 : 2, rush: pos === "RB" ? 14 : 0,
      news: "Draft board testing profile.", ceiling: proj * 1.55, floor: proj * .52, synthetic: true
    }));
  return [...players, ...supplemental].map((p, i) => ({
    ...p,
    adp: p.adp || i + 1,
    rank: p.rank || i + 1,
    boardRank: Math.min(p.adp || i + 1, p.rank || i + 1),
  }));
}

function buildDraftOrder(teamCount, rounds) {
  const order = [];
  for (let r = 0; r < rounds; r++) {
    const row = Array.from({ length: teamCount }, (_, i) => i + 1);
    if (r % 2 === 1) row.reverse();
    order.push(...row);
  }
  return order;
}

function buildRosterSlots(config) {
  return ["QB", "RB", "WR", "TE", "FLEX", "DST", "K", "BENCH"].flatMap(slot => (
    Array.from({ length: config[slot] || 0 }, () => slot)
  ));
}

function assignRosterSlots(roster, rosterSlots) {
  const used = new Set();
  return rosterSlots.map(slot => {
    const eligible = roster.find(p => {
      if (used.has(p.id)) return false;
      if (slot === "FLEX") return ["RB", "WR", "TE"].includes(p.pos);
      if (slot === "BENCH") return true;
      return p.pos === slot;
    });
    if (eligible) used.add(eligible.id);
    return eligible || null;
  });
}

function scoringProjection(player, scoring) {
  if (player.pos === "QB") return player.proj;
  if (scoring === "half") return player.proj * 0.94;
  if (scoring === "std") return player.proj * 0.88;
  return player.proj;
}

function valueBand(score) {
  return VALUE_BANDS.find(b => score >= b.min) || VALUE_BANDS[VALUE_BANDS.length - 1];
}

function enrichDraftPlayer(player, scoring, drafted, pickNumber, nextUserPick) {
  const adjusted = scoringProjection(player, scoring);
  const marketDelta = pickNumber - player.adp;
  const nextDelta = nextUserPick ? nextUserPick - player.adp : marketDelta;
  const riskPenalty = player.risk === "high" ? 4 : player.risk === "med" ? 1.8 : 0;
  const scarcity = ["RB", "WR"].includes(player.pos) ? 1.8 : player.pos === "TE" ? 1.1 : 0.4;
  const vona = Math.max(-4, Math.min(9, nextDelta / 5)) * scarcity;
  const draftScore = (150 - player.adp) + adjusted * 1.5 + marketDelta * 2 + vona - riskPenalty;
  const band = valueBand(marketDelta);
  return { ...player, adjusted, drafted, marketDelta, draftScore, valueLabel: band.label, valueColor: band.color, valueTone: band.tone };
}

function applyLiveBoardBands(players, pickNumber) {
  let availableRank = 0;
  return players.map(player => {
    if (player.drafted) return player;
    availableRank += 1;
    const gm = gmBandForPlayer(player, pickNumber, availableRank);
    return { ...player, gmBandScore: gm.score, valueLabel: gm.label, valueColor: gm.color, valueTone: gm.tone };
  });
}

function gmBandForPlayer(player, pickNumber, availableRank = null) {
  const pickWindowDelta = pickNumber - player.adp;
  const boardDelta = availableRank == null ? 0 : player.adp - availableRank;
  const value = seasonValueGrade(player);
  const valueBoost = ({ "A+": 7, "A": 5, "B": 2.5, "C": 0, "D": -3, "F": -7 })[value.letter] || 0;
  const riskPenalty = player.risk === "high" ? 6 : player.risk === "med" ? 2.5 : 0;
  const lifecyclePenalty = (player.age && player.age >= 34 ? 4 : 0) + (player.id === "richardson" ? 5 : 0);
  const futureWindow = pickNumber <= 30 ? 12 : pickNumber <= 80 ? 24 : 46;
  const nearPickWindow = player.adp <= pickNumber + futureWindow;
  const boardOpportunity = nearPickWindow && !["K", "DST"].includes(player.pos) && !["D", "F"].includes(value.letter)
    ? Math.min(12, Math.max(0, boardDelta * 0.16)) : 0;
  let score = pickWindowDelta + boardOpportunity + valueBoost - riskPenalty - lifecyclePenalty;
  if (pickNumber >= 60 && availableRank != null && !["K", "DST"].includes(player.pos) && !["F"].includes(value.letter)) {
    score = Math.max(score, 8 - availableRank * 2.8);
  } else if (pickNumber >= 40 && availableRank != null && !["K", "DST"].includes(player.pos) && !["F"].includes(value.letter)) {
    score = Math.max(score, 2 - availableRank * 2.4);
  }
  if (pickNumber <= 12) {
    score = pickWindowDelta >= 9 && value.letter === "A+" ? 8 : Math.min(score, 5);
  }
  const band = valueBand(score);
  return { ...band, score };
}

function buildRosters(board, teams, draftedByPlayerId) {
  const rosters = Object.fromEntries(teams.map(t => [t.id, []]));
  board.forEach(p => {
    const draft = draftedByPlayerId[p.id];
    if (draft && rosters[draft.teamId]) rosters[draft.teamId].push({ ...p, draft });
  });
  Object.values(rosters).forEach(list => list.sort((a, b) => a.draft.pick - b.draft.pick));
  return rosters;
}

function chooseComputerPick(available, roster, pickNumber) {
  const counts = countPositions(roster);
  return available
    .map(p => ({ ...p, computerScore: p.draftScore + rosterNeedBonus(p, counts, pickNumber) }))
    .sort((a, b) => b.computerScore - a.computerScore)[0];
}

function rosterNeedBonus(player, counts, pickNumber) {
  const starters = { QB: 1, RB: 2, WR: 2, TE: 1 };
  const count = counts[player.pos] || 0;
  if (player.pos === "QB" && count >= 1 && pickNumber < 80) return -14;
  if (player.pos === "TE" && count >= 1 && pickNumber < 80) return -10;
  if (starters[player.pos] && count < starters[player.pos]) return 8 - count * 2;
  if (["RB", "WR"].includes(player.pos) && count < 4) return 3;
  return 0;
}

function countPositions(roster) {
  return roster.reduce((acc, p) => { acc[p.pos] = (acc[p.pos] || 0) + 1; return acc; }, {});
}

function buildGmReadout(available, userRoster, pickNumber) {
  const counts = countPositions(userRoster);
  const needOrder = ["RB", "WR", "QB", "TE"].sort((a, b) => rosterNeedScore(b, counts) - rosterNeedScore(a, counts));
  const biggestNeed = needOrder[0];
  const gmRanked = available.slice().sort((a, b) => (b.gmBandScore || -999) - (a.gmBandScore || -999) || a.adp - b.adp);
  const best = gmRanked[0];
  const value = gmRanked.filter(p => p.marketDelta >= 4)[0] || best;
  const safe = gmRanked.filter(p => p.risk === "low")[0] || best;
  const upside = available.slice().sort((a, b) => (b.boom || 0) - (a.boom || 0))[0];
  const reach = available.find(p => p.marketDelta < -9);
  const needPick = gmRanked.find(p => p.pos === biggestNeed) || best;
  return { best, value, safe, upside, reach, needPick, biggestNeed, counts };
}

function buildBandGroups(available, pickNumber) {
  const labels = VALUE_BANDS.map(b => b.label);
  let availableRank = 0;
  const ranked = available.map(player => {
    availableRank += 1;
    return { ...player, gmBand: gmBandForPlayer(player, pickNumber, availableRank) };
  });
  return labels.map(label => ({
    label,
    players: ranked
      .filter(p => p.gmBand.label === label)
      .sort((a, b) => b.gmBand.score - a.gmBand.score || a.adp - b.adp)
      .slice(0, 4),
  }));
}

function rosterNeedScore(pos, counts) {
  const targets = { QB: 1, RB: 3, WR: 3, TE: 1 };
  return (targets[pos] || 1) - (counts[pos] || 0);
}

function gradeUserDraft(roster) {
  if (!roster.length) return { letter: "—", color: "var(--slate)", note: "No picks yet", core: 0 };
  const avgDraftScore = roster.reduce((s, p) => s + (p.draft?.draftScore || draftStockGrade(p).score || 60), 0) / roster.length;
  const counts = countPositions(roster);
  const balance = Math.min(counts.RB || 0, 2) + Math.min(counts.WR || 0, 2) + Math.min(counts.QB || 0, 1) + Math.min(counts.TE || 0, 1);
  const score = avgDraftScore + balance * 1.2;
  const core = roster.reduce((s, p) => s + p.adjusted, 0);
  const buckets = countDraftBuckets(roster);
  const note = `${buckets.steals} steals · ${buckets.expected} expected · ${buckets.reaches} reaches`;
  if (score >= 91) return { letter: "A", color: "var(--mint)",      note, core, score, buckets };
  if (score >= 80) return { letter: "B", color: "var(--mint-soft)", note, core, score, buckets };
  if (score >= 68) return { letter: "C", color: "var(--gold)",      note, core, score, buckets };
  return { letter: "D", color: "var(--red)", note, core, score, buckets };
}

function countDraftBuckets(roster) {
  return roster.reduce((acc, player) => {
    const label = player.draft?.selectedBand || player.valueLabel || "";
    if (label.includes("Steal")) acc.steals += 1;
    else if (label === "Expected") acc.expected += 1;
    else acc.reaches += 1;
    return acc;
  }, { steals: 0, expected: 0, reaches: 0 });
}

function buildScoredLineup(roster, rosterSlots = buildRosterSlots(DEFAULT_ROSTER_CONFIG)) {
  const used = new Set();
  const lineup = rosterSlots.map(slot => {
    const player = roster.find(p => {
      if (used.has(p.id)) return false;
      if (slot === "FLEX") return ["RB", "WR", "TE"].includes(p.pos);
      if (slot === "BENCH") return true;
      return p.pos === slot;
    });
    if (player) used.add(player.id);
    return { slot, player };
  }).filter(item => item.player);
  roster.forEach(player => {
    if (!used.has(player.id)) lineup.push({ slot: "BENCH", player });
  });
  return lineup;
}

function gradeLineupDraft(starters) {
  if (!starters.length) return { letter: "—", color: "var(--slate)", note: "No starters drafted", score: 0 };
  const avg = starters.reduce((sum, p) => sum + (p.draft?.draftScore || draftStockGrade(p).score || 60), 0) / starters.length;
  const buckets = countDraftBuckets(starters);
  const note = `${buckets.steals} starter steals · ${buckets.expected} expected · ${buckets.reaches} reaches`;
  if (avg >= 91) return { letter: "A", color: "var(--mint)",      note, score: avg, buckets };
  if (avg >= 80) return { letter: "B", color: "var(--mint-soft)", note, score: avg, buckets };
  if (avg >= 68) return { letter: "C", color: "var(--gold)",      note, score: avg, buckets };
  return { letter: "D", color: "var(--red)", note, score: avg, buckets };
}

function bestPositionScore(roster, pos) {
  return roster
    .filter(p => p.pos === pos)
    .reduce((best, p) => Math.max(best, p.draft?.draftScore || draftStockGrade(p).score || 0), 0);
}

function buildPickLog(board, teams, draftedByPlayerId) {
  return board
    .filter(p => draftedByPlayerId[p.id])
    .map(p => ({ player: p, draft: draftedByPlayerId[p.id], team: teams.find(t => t.id === draftedByPlayerId[p.id].teamId) }))
    .sort((a, b) => a.draft.pick - b.draft.pick);
}

function findNextUserPick(order, pickIndex, userSlot) {
  const idx = order.findIndex((team, i) => i >= pickIndex && team === userSlot);
  return idx >= 0 ? idx + 1 : null;
}

function formatRoundPick(pickIndex, teamCount) {
  const round = Math.floor(pickIndex / teamCount) + 1;
  const pick = (pickIndex % teamCount) + 1;
  return `${round}.${String(pick).padStart(2, "0")}`;
}

function formatAdpPick(adp, teamCount = 12) {
  const safeAdp = Math.max(1, Math.round(adp || 1));
  const round = Math.floor((safeAdp - 1) / teamCount) + 1;
  const pick = ((safeAdp - 1) % teamCount) + 1;
  return `${round}.${String(pick).padStart(2, "0")}`;
}

function formatClock(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function buildGmAnswer(question, gm, roster) {
  if (!question) {
    return gm.best
      ? `GM likes ${gm.best.name}: ${gm.best.valueLabel.toLowerCase()}, ${gm.best.adjusted.toFixed(1)} adjusted points, and fits the current ${gm.biggestNeed} pressure.`
      : "GM is waiting for available players.";
  }
  const q = question.toLowerCase();
  if (q.includes("safe")) return gm.safe ? `${gm.safe.name} is the safest profile on this board: low risk with ${gm.safe.adjusted.toFixed(1)} adjusted points.` : "No safe profile is standing out.";
  if (q.includes("upside") || q.includes("ceiling")) return gm.upside ? `${gm.upside.name} has the best upside signal with a ${gm.upside.boom}% boom rate.` : "No upside edge yet.";
  if (q.includes("need")) return gm.needPick ? `Biggest roster pressure is ${gm.biggestNeed}. Best need-aware pick is ${gm.needPick.name}.` : "Roster need is still neutral.";
  return gm.value
    ? `${gm.value.name} is the cleanest market answer right now: ${gm.value.valueLabel}, ADP ${gm.value.adp}, current pick context favors patience only if you can tolerate losing the tier.`
    : "No value answer yet.";
}

function positionColor(pos) {
  return ({ QB: "#FFE45C", RB: "#57FF8A", WR: "#42D9FF", TE: "#D58BFF", DST: "#FF5E5E", K: "#FFAE45" })[pos] || "var(--mint)";
}

function positionBg(pos) {
  return `${positionColor(pos)}2B`;
}

function valueToneForChip(label) {
  if (label.includes("Steal")) return "var(--mint)";
  if (label === "Expected") return "var(--mint-soft)";
  if (label.includes("Low Reach")) return "var(--gold)";
  return "var(--red)";
}

function draftStockGrade(player) {
  if (player.draft?.draftGrade) {
    return { letter: player.draft.draftGrade, color: player.draft.draftGradeColor || gradeColor(player.draft.draftGrade), score: player.draft.draftScore };
  }
  return draftStockGradeForPick(player, player.draft?.pick || player.draft?.pickNumber || player.adp || 1);
}

function draftStockGradeForPick(player, pickNumber) {
  const adpDelta = pickNumber - player.adp;
  const value = seasonValueScore(player);
  const adpScore = Math.max(28, Math.min(100, 72 + adpDelta * 1.55));
  const model = cfModelScore(player);
  const schedule = sosScore(player);
  const riskPenalty = player.risk === "high" ? 3.5 : player.risk === "med" ? 1.5 : 0;
  let score = Math.max(30, Math.min(100, value * 0.42 + adpScore * 0.30 + model * 0.18 + schedule * 0.10 - riskPenalty));
  if (pickNumber <= 12 && player.adp <= 6) score = Math.max(score, 88);
  if (pickNumber <= player.adp + 1 && player.adp <= 6) score = Math.max(score, 88);
  const letter = scoreToLetter(score, value, adpDelta);
  return { letter, color: gradeColor(letter), score };
}

function scoreToLetter(score, valueScore, adpDelta) {
  if (score >= 94) return "A+";
  if (score >= 86) return "A";
  if (score >= 76) return "B";
  if (score >= 64) return "C";
  if (score >= 52) return "D";
  if (valueScore < 55 && adpDelta < -25) return "F";
  if (adpDelta < -75) return "F";
  return "D";
}

function gradeColor(letter) {
  if (letter === "A+" || letter === "A") return "var(--mint)";
  if (letter === "B") return "var(--mint-soft)";
  if (letter === "C" || letter === "D") return "var(--gold)";
  return "var(--red)";
}

function seasonValueScore(player) {
  const grade = seasonValueGrade(player).letter;
  const gradeBase = ({ "A+": 96, "A": 88, "B": 78, "C": 67, "D": 56, "F": 42 })[grade] || 60;
  const projectionBonus = Math.max(-5, Math.min(8, ((player.adjusted || player.proj || 0) - 10) * 0.6));
  return Math.max(35, Math.min(100, gradeBase + projectionBonus));
}

function cfModelScore(player) {
  const adjusted = player.adjusted || player.proj || 0;
  const boom = player.boom || 25;
  const bust = player.bust || 30;
  const positionBaseline = ({ QB: 17, RB: 10.5, WR: 10.5, TE: 7.5, DST: 6.5, K: 7 })[player.pos] || 9;
  const score = 62 + (adjusted - positionBaseline) * 4 + (boom - bust) * 0.25;
  return Math.max(35, Math.min(100, score));
}

function sosScore(player) {
  const rating = player.matchupRating || 3;
  return Math.max(35, Math.min(100, 45 + rating * 11));
}

function scheduleEaseRank(player) {
  const raw = player.draft?.sosScore || sosScore(player);
  return Math.max(1, Math.min(32, Math.round(1 + ((raw - 35) / 65) * 31)));
}

function seasonValueGrade(player) {
  if (player.pos === "DST" || player.pos === "K") {
    if (player.adp <= 220) return { letter: "B", color: "var(--mint-soft)" };
    if (player.adp <= 245) return { letter: "C", color: "var(--gold)" };
    return { letter: "D", color: "var(--gold)" };
  }
  const rank = player.adp || player.boardRank || 999;
  const adjusted = player.adjusted || player.proj || 0;
  const starterCut = { QB: 36, RB: 72, WR: 96, TE: 60 };
  const usefulProjection = adjusted >= ({ QB: 16, RB: 9.5, WR: 9.5, TE: 7 }[player.pos] || 8);

  if (rank <= 12) return { letter: "A+", color: "var(--mint)" };
  if (rank <= 30) return { letter: "A", color: "var(--mint)" };
  if (rank <= 72) return { letter: "B", color: "var(--mint-soft)" };
  if (rank <= starterCut[player.pos]) return { letter: usefulProjection ? "B" : "C", color: usefulProjection ? "var(--mint-soft)" : "var(--gold)" };
  if (rank <= 150) return { letter: usefulProjection ? "C" : "D", color: "var(--gold)" };
  if (rank <= 220) return { letter: usefulProjection && player.risk !== "high" ? "C" : "D", color: "var(--gold)" };
  return { letter: player.risk === "high" && !usefulProjection ? "F" : "D", color: player.risk === "high" && !usefulProjection ? "var(--red)" : "var(--gold)" };
}

Object.assign(window, {
  DRAFT_SUPPLEMENTAL_RANKINGS, DEFAULT_ROSTER_CONFIG, DRAFT_TEAM_NAMES, VALUE_BANDS,
  buildDraftPool, buildDraftOrder, buildRosterSlots, assignRosterSlots,
  scoringProjection, valueBand, enrichDraftPlayer, applyLiveBoardBands, gmBandForPlayer,
  buildRosters, chooseComputerPick, rosterNeedBonus, countPositions,
  buildGmReadout, buildBandGroups, rosterNeedScore, gradeUserDraft,
  countDraftBuckets, buildScoredLineup, gradeLineupDraft, bestPositionScore, buildPickLog,
  findNextUserPick, formatRoundPick, formatAdpPick, formatClock, buildGmAnswer,
  positionColor, positionBg, valueToneForChip,
  draftStockGrade, draftStockGradeForPick, scoreToLetter, gradeColor,
  seasonValueScore, cfModelScore, sosScore, scheduleEaseRank, seasonValueGrade
});
