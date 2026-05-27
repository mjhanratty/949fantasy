// Draft Rankings — pre-season player breakdown grouped by 949 Value tier.
// Reuses the table format from the projections Edge Board, but the dividers
// are Value tiers (A+, A, B, C, D, F) instead of statistical ranks.

const DR_COLS = "60px minmax(220px, 1.6fr) 110px 70px 100px 96px 130px 130px 80px";

// Deterministic per-team bye-week assignment (real seasons run W5–W14).
const TEAM_BYE_WEEK = {
  ARI: 8,  ATL: 12, BAL: 14, BUF: 7,  CAR: 11, CHI: 7,  CIN: 10, CLE: 9,
  DAL: 7,  DEN: 12, DET: 8,  GB: 5,   HOU: 6,  IND: 14, JAX: 8,  KC: 10,
  LAC: 12, LAR: 6,  LV: 8,   MIA: 6,  MIN: 6,  NE: 14,  NO: 11,  NYG: 14,
  NYJ: 9,  PHI: 9,  PIT: 5,  SEA: 8,  SF: 14,  TB: 9,   TEN: 10, WAS: 12,
};

function byeWeekFor(player) {
  return TEAM_BYE_WEEK[player.team] || 9;
}

// Years in league for the player. Real PLAYERS data carries `age`; synthetic
// supplemental rankings don't, so fall back to a stable hash.
function playerTenure(player) {
  if (player.pos === "DST" || player.pos === "K") return 5;
  if (player.age) return Math.max(0, player.age - 22);
  const seed = (player.id || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return seed % 9;
}

// 4-point YoY trend: [Y–3, Y–2, Y–1, Proj]. Truncated for younger players;
// returns null for rookies (no trend to draw).
function yoyTrendLine(player) {
  const tenure = playerTenure(player);
  if (tenure < 1) return null;
  const seed = (player.id || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = (player.adjusted || player.proj || 10) * 17;
  const rng = (n) => ((seed * (n + 7) * 9301 + 49297) % 233280) / 233280;
  const points = [];
  if (tenure >= 3) points.push(base * (0.55 + rng(1) * 0.45));
  if (tenure >= 2) points.push(base * (0.68 + rng(2) * 0.42));
  if (tenure >= 1) points.push(base * (0.78 + rng(3) * 0.36));
  points.push(base);
  return points;
}

// Mint = consistently up, Red = consistently down, Gold = mixed.
function yoyTrendColor(data) {
  if (!data || data.length < 2) return "var(--slate-dim)";
  let ups = 0, downs = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i] > data[i - 1] * 1.03) ups += 1;
    else if (data[i] < data[i - 1] * 0.97) downs += 1;
  }
  if (downs === 0 && ups > 0) return "var(--mint)";
  if (ups === 0 && downs > 0) return "var(--red)";
  return "var(--gold)";
}

const VALUE_TIER_META = {
  "A+": { color: "var(--mint)",      label: "Tier 1", multiplier: "1.25\u00d7+",   note: "Elite value · 1.25\u00d7+ projected return vs draft cost. Anchor every build around these." },
  "A":  { color: "var(--mint)",      label: "Tier 2", multiplier: "1.10\u20131.25\u00d7", note: "Strong value · 1.10\u20131.25\u00d7 projected return. Early-round cornerstones with clean profiles." },
  "B":  { color: "var(--mint-soft)", label: "Tier 3", multiplier: "0.95\u20131.10\u00d7", note: "Fair value · 0.95\u20131.10\u00d7 projected return. Reliable starters at expected cost." },
  "C":  { color: "var(--gold)",      label: "Tier 4", multiplier: "0.80\u20130.95\u00d7", note: "Slight reach · 0.80\u20130.95\u00d7 return. Volatile flex starters and high-upside swings." },
  "D":  { color: "var(--gold)",      label: "Tier 5", multiplier: "0.60\u20130.80\u00d7", note: "Reach · 0.60\u20130.80\u00d7 return. Bench depth and late-round darts." },
  "F":  { color: "var(--red)",       label: "Tier 6", multiplier: "<0.60\u00d7",        note: "Avoid · below 0.60\u00d7 return. Profile or risk doesn't justify the cost." },
};
const TIER_ORDER = ["A+", "A", "B", "C", "D", "F"];

// Column-header definitions surfaced via the HelpTip hover.
const DR_COL_HELP = {
  Rank:        "Overall player rank for this scoring format.",
  Player:      "Player name, position, team, and weekly matchup.",
  "Proj (Total)": "Projected fantasy points for the full season.",
  Bye:         "The player's NFL bye week.",
  SOS:         "Strength of schedule rank based on opponents' combined record. 1 is hardest, 32 is easiest, and each NFL team occupies one rank.",
  Risk:        "How much uncertainty is built into the player's outlook.",
  "Boom / Bust": "Upside vs. downside range based on projected weekly outcomes. The remaining percentage is the neutral or expected outcome range.",
  "YOY Trend": "Compares the player's recent seasons against this year's projection. Mint = trending up, gold = inconsistent, red = trending down. Rookies have no trend.",
  Value:       "949 value grade based on projected return versus expected draft cost.",
};

// Inline hover-tooltip used on column headers and the tier badge.
// Uses CSS :hover (not React state) so the popup stays visible while the
// cursor moves from the trigger onto the tooltip itself.
function HelpTip({ label, children, side = "bottom", align = "start" }) {
  const cls = `help-tip${align === "end" ? " align-end" : ""}${side === "top" ? " side-top" : ""}`;
  return (
    <span className={cls}>
      {label}
      <span style={{ fontSize: 10, color: "var(--mint)", opacity: 0.7, lineHeight: 1 }}>ⓘ</span>
      <span className="help-pop">{children}</span>
    </span>
  );
}

function DrHead({ children, align = "flex-start" }) {
  const help = DR_COL_HELP[children];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: align, minWidth: 0, padding: "0 6px" }}>
      {help
        ? <HelpTip label={children} align={align === "flex-end" ? "end" : "start"}>{help}</HelpTip>
        : children}
    </div>
  );
}

function DrCell({ children, align = "flex-start" }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: align, minWidth: 0, padding: "0 6px" }}>{children}</div>;
}

function DraftRankingsView({ onSelectPlayer }) {
  const basePlayers = React.useMemo(() => window.buildDraftPool(window.PLAYERS || []), []);
  const [pos, setPos] = React.useState("ALL");
  const [scoring, setScoring] = React.useState("ppr");
  const [search, setSearch] = React.useState("");

  const enriched = React.useMemo(() => {
    return basePlayers.map(p => {
      const adjusted = window.scoringProjection(p, scoring);
      return { ...p, adjusted, tier: window.seasonValueGrade({ ...p, adjusted }).letter };
    });
  }, [basePlayers, scoring]);

  const filtered = enriched
    .filter(p => pos === "ALL" || p.pos === pos || (pos === "FLEX" && ["RB", "WR", "TE"].includes(p.pos)))
    .filter(p => !search || `${p.name} ${p.team} ${p.pos}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.adp - b.adp);

  const byTier = Object.fromEntries(TIER_ORDER.map(t => [t, []]));
  filtered.forEach(p => { if (byTier[p.tier]) byTier[p.tier].push(p); });

  const totalCount = filtered.length;

  return (
    <div className="view-enter" style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 24px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>
            Draft · Pre-Season Rankings
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 32, color: "var(--mint-soft)", lineHeight: 1 }}>Player Breakdown</h1>
          <p style={{ marginTop: 6, color: "var(--slate)", fontSize: 13 }}>949 Value tiers · {totalCount} players · {scoring.toUpperCase()}</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", borderRadius: 10,
            border: "1px solid var(--green-600)", background: "var(--green-900)",
            minWidth: 240,
          }}>
            <window.IconSearch size={13} stroke="var(--slate)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player, team, position"
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--mint-soft)", fontFamily: "Sora", fontSize: 13, width: "100%" }} />
          </div>
          <TabBar tabs={[{ id: "ppr", label: "PPR" }, { id: "half", label: "Half" }, { id: "std", label: "Standard" }]} value={scoring} onChange={setScoring} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <TabBar tabs={[
          { id: "ALL",  label: "Overall", count: enriched.length },
          { id: "QB",   label: "QB",      count: enriched.filter(p => p.pos === "QB").length },
          { id: "RB",   label: "RB",      count: enriched.filter(p => p.pos === "RB").length },
          { id: "WR",   label: "WR",      count: enriched.filter(p => p.pos === "WR").length },
          { id: "TE",   label: "TE",      count: enriched.filter(p => p.pos === "TE").length },
          { id: "FLEX", label: "FLEX" },
          { id: "DST",  label: "DST",     count: enriched.filter(p => p.pos === "DST").length },
          { id: "K",    label: "K",       count: enriched.filter(p => p.pos === "K").length },
        ]} value={pos} onChange={setPos} />
      </div>

      <div className="card" style={{ overflow: "visible" }}>
        <div style={{
          display: "grid", gridTemplateColumns: DR_COLS,
          padding: "12px 18px", background: "var(--green-900)",
          borderBottom: "1px solid var(--green-600)",
          fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em",
          fontFamily: "JetBrains Mono", fontWeight: 600, alignItems: "center"
        }}>
          <DrHead align="center">Rank</DrHead>
          <DrHead align="flex-start">Player</DrHead>
          <DrHead align="center">Proj (Total)</DrHead>
          <DrHead align="center">Bye</DrHead>
          <DrHead align="center">SOS</DrHead>
          <DrHead align="center">Risk</DrHead>
          <DrHead align="center">Boom / Bust</DrHead>
          <DrHead align="center">YOY Trend</DrHead>
          <DrHead align="flex-end">Value</DrHead>
        </div>

        {TIER_ORDER.map(tier => {
          const tierPlayers = byTier[tier];
          if (!tierPlayers || !tierPlayers.length) return null;
          const meta = VALUE_TIER_META[tier];
          return (
            <React.Fragment key={tier}>
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 18px",
                background: "rgba(149,249,174,0.04)",
                borderBottom: "1px solid var(--green-600)",
              }}>
                <HelpTip
                  align="start"
                  label={
                    <span className="num" style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 36, height: 28, borderRadius: 6,
                      background: meta.color === "var(--mint)" ? "rgba(149,249,174,0.14)"
                        : meta.color === "var(--mint-soft)" ? "rgba(217,255,228,0.10)"
                        : meta.color === "var(--gold)" ? "rgba(242,201,76,0.12)"
                        : "rgba(255,94,94,0.10)",
                      border: `1px solid ${meta.color}55`,
                      fontSize: 14, color: meta.color, fontWeight: 900
                    }}>{tier}</span>
                  }>
                  <strong style={{ color: meta.color, display: "block", marginBottom: 4 }}>
                    {meta.label} · Grade {tier} · {meta.multiplier}
                  </strong>
                  Players grouped by similar value, projection, and draft profile. {meta.note}
                </HelpTip>
                <span className="mono" style={{ fontSize: 10, color: meta.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
                  {meta.label} · {meta.multiplier}
                </span>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>{meta.note}</span>
                <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--green-600), transparent)" }} />
                <span className="mono" style={{ fontSize: 10, color: "var(--slate-dim)" }}>{tierPlayers.length} player{tierPlayers.length === 1 ? "" : "s"}</span>
              </div>

              {tierPlayers.map((p, i) => {
                const projTotal = (p.adjusted || p.proj || 0) * 17;
                const sos = window.scheduleEaseRank(p);
                const yoy = yoyTrendLine(p);
                const yoyColor = yoyTrendColor(yoy);
                const valueGrade = window.seasonValueGrade(p);
                return (
                  <button key={p.id} onClick={() => onSelectPlayer && !p.synthetic && onSelectPlayer(p)} style={{
                    display: "grid", gridTemplateColumns: DR_COLS, gap: 0, padding: "12px 18px",
                    background: "transparent", border: "none", borderBottom: "1px solid var(--green-600)",
                    cursor: p.synthetic ? "default" : "pointer", width: "100%", textAlign: "left",
                    alignItems: "center", transition: "background 0.12s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(22,56,36,0.55)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <DrCell align="center">
                      <span className="num" style={{ fontSize: 17, color: "var(--mint-soft)" }}>{p.adp}</span>
                    </DrCell>
                    <DrCell align="flex-start">
                      <PlayerCell player={p} />
                    </DrCell>
                    <DrCell align="center">
                      <span className="num" style={{ fontSize: 16, color: "var(--mint)" }}>{projTotal.toFixed(0)}</span>
                    </DrCell>
                    <DrCell align="center">
                      <span className="mono" style={{ fontSize: 12, color: "var(--slate)" }}>W{byeWeekFor(p)}</span>
                    </DrCell>
                    <DrCell align="center">
                      <SosBadge rank={sos} />
                    </DrCell>
                    <DrCell align="center">
                      <RiskDot risk={p.risk} />
                    </DrCell>
                    <DrCell align="center">
                      <DrBoomBust boom={p.boom} bust={p.bust} />
                    </DrCell>
                    <DrCell align="center">
                      {yoy && yoy.length >= 2
                        ? <Sparkline data={yoy} width={96} height={28} color={yoyColor} />
                        : <span className="mono" style={{ fontSize: 9, color: "var(--slate-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Rookie</span>}
                    </DrCell>
                    <DrCell align="flex-end">
                      <span className="num" style={{ fontSize: 18, color: valueGrade.color, fontWeight: 900, letterSpacing: "-0.02em" }}>{valueGrade.letter}</span>
                    </DrCell>
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}

        {!totalCount && (
          <div style={{ padding: 60, textAlign: "center", color: "var(--slate)", fontSize: 14 }}>
            No players match — try adjusting filters.
          </div>
        )}
      </div>
    </div>
  );
}

function DrBoomBust({ boom, bust }) {
  const neutral = Math.max(0, 100 - boom - bust);
  return (
    <div title={`${boom}% boom chance, ${bust}% bust chance, ${neutral}% neutral/expected range over projected weekly outcomes.`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono", fontSize: 10, cursor: "help" }}>
      <span style={{ color: "var(--mint)", width: 18, textAlign: "right" }}>{boom}</span>
      <span style={{ display: "inline-flex", width: 50, height: 6, background: "var(--green-600)", borderRadius: 3, overflow: "hidden" }}>
        <span style={{ width: `${boom / 1.6}%`, background: "var(--mint)" }} />
        <span style={{ flex: 1 }} />
        <span style={{ width: `${bust / 1.6}%`, background: "var(--red)" }} />
      </span>
      <span style={{ color: "var(--red)", width: 18 }}>{bust}</span>
    </div>
  );
}

function SosBadge({ rank }) {
  // 1 = hardest schedule, 32 = easiest. Color shifts toward mint as it gets easier.
  const t = (rank - 1) / 31;
  const color = t > 0.66 ? "var(--mint)" : t > 0.33 ? "var(--gold)" : "var(--red)";
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span className="mono" style={{ color, fontSize: 12, fontWeight: 700 }}>
        {rank}<span style={{ color: "var(--slate-dim)", marginLeft: 2 }}>/32</span>
      </span>
      <span style={{ display: "inline-flex", width: 60, height: 4, background: "var(--green-600)", borderRadius: 2, overflow: "hidden" }}>
        <span style={{ width: `${t * 100}%`, background: color, borderRadius: 2 }} />
      </span>
    </div>
  );
}

Object.assign(window, { DraftRankingsView });
