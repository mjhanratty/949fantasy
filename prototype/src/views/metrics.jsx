// "Metrics" section — three sub-tabs: Weekly Points heatmap, Standings, Position Metrics donut

function MetricsView({ tab, setTab, onSelectPlayer }) {
  const tabs = [
    { id: "weekly",   label: "Weekly Points" },
    { id: "standings", label: "Standings" },
    { id: "position", label: "Position Metrics" },
  ];

  return (
    <div className="view-enter" style={{ maxWidth: 1440, margin: "0 auto", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>League · Week 11</div>
          <h1 className="display" style={{ margin: 0, fontSize: 36, color: "var(--mint-soft)" }}>Metrics</h1>
          <p style={{ marginTop: 6, color: "var(--slate)", fontSize: 13 }}>Week-by-week performance, league standings, and positional breakdowns</p>
        </div>
        <TabBar tabs={tabs} value={tab} onChange={setTab} />
      </div>

      {tab === "weekly"   && <WeeklyPointsHeatmap />}
      {tab === "standings" && <StandingsTable />}
      {tab === "position" && <PositionMetricsView />}
    </div>
  );
}

// ============================================================
// Weekly Points — heatmap by lineup slot (Image 4)
// ============================================================
function WeeklyPointsHeatmap() {
  const { TEAM_POSITION_WEEKS, LEAGUE_POS_AVG } = window;
  const [scope, setScope] = React.useState("league"); // league / team / bench

  const slotCols = [
    { key: "total", label: "Total", pos: null,  isTotal: true },
    { key: "QB",    label: "QB",   pos: "QB"   },
    { key: "RB1",   label: "RB",   pos: "RB"   },
    { key: "RB2",   label: "RB",   pos: "RB"   },
    { key: "WR1",   label: "WR",   pos: "WR"   },
    { key: "WR2",   label: "WR",   pos: "WR"   },
    { key: "FLEX",  label: "FLEX", pos: "FLEX" },
    { key: "TE",    label: "TE",   pos: "TE"   },
    { key: "DST",   label: "DST",  pos: "DST"  },
    { key: "K",     label: "K",    pos: "K"    },
  ];

  // For each week & slot, compute a score (0-1) relative to the comparison set
  function scoreCell(week, col, weekIdx) {
    const value = week[col.key];
    if (value == null) return { value, score: 0.5 };
    if (col.isTotal) {
      const ratio = value / week.proj;
      return { value, score: Math.max(0, Math.min(1, (ratio - 0.7) / 0.6)) };
    }
    if (scope === "league") {
      const avg = (LEAGUE_POS_AVG[col.pos] || [])[weekIdx];
      if (!avg) return { value, score: 0.5 };
      const ratio = value / avg;
      return { value, score: Math.max(0, Math.min(1, (ratio - 0.5) / 1.0)) };
    }
    if (scope === "team") {
      // vs opponent's matching slot — mock with 90% of league avg
      const oppAvg = ((LEAGUE_POS_AVG[col.pos] || [])[weekIdx] || 14) * 0.95;
      const ratio = value / oppAvg;
      return { value, score: Math.max(0, Math.min(1, (ratio - 0.4) / 1.0)) };
    }
    // bench — vs your bench players at that pos (mock: 75% of league avg)
    const benchAvg = ((LEAGUE_POS_AVG[col.pos] || [])[weekIdx] || 14) * 0.75;
    if (col.pos === "K" || col.pos === "DST") return { value, score: 0.5 };
    const ratio = value / benchAvg;
    return { value, score: Math.max(0, Math.min(1, (ratio - 0.4) / 1.2)) };
  }

  function cellColor(score) {
    // 0 = red, 0.5 = green-900 neutral, 1 = mint
    if (score < 0.5) {
      const t = score / 0.5;
      const r = Math.round(255 - (255 - 22) * t);
      const g = Math.round(94 + (56 - 94) * t);
      const b = Math.round(94 + (36 - 94) * t);
      const a = 0.15 + (1 - t) * 0.35;
      return `rgba(${r},${g},${b},${a.toFixed(2)})`;
    } else {
      const t = (score - 0.5) / 0.5;
      const r = Math.round(22 + (149 - 22) * t);
      const g = Math.round(56 + (249 - 56) * t);
      const b = Math.round(36 + (174 - 36) * t);
      const a = 0.15 + t * 0.45;
      return `rgba(${r},${g},${b},${a.toFixed(2)})`;
    }
  }

  function textColor(score) {
    if (score < 0.3) return "var(--mint-soft)";
    if (score > 0.7) return "var(--black)";
    return "var(--mint-soft)";
  }

  const scopeLabel = {
    league: "vs ALL starters at that slot, leaguewide",
    team:   "vs the opponent's matching slot that week",
    bench:  "vs your own bench at that position",
  }[scope];

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14,
        padding: "16px 22px", borderBottom: "1px solid var(--green-600)", background: "var(--green-900)"
      }}>
        <div>
          <div className="display" style={{ fontSize: 18, color: "var(--mint-soft)", fontWeight: 700 }}>Weekly heatmap</div>
          <div className="mono" style={{ marginTop: 4, fontSize: 11, color: "var(--slate)", letterSpacing: "0.04em" }}>{scopeLabel}</div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <TabBar tabs={[
            { id: "league", label: "League" },
            { id: "team",   label: "Opponent" },
            { id: "bench",  label: "Bench" },
          ]} value={scope} onChange={setScope} />
          <HeatmapScale />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontFamily: "JetBrains Mono", fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr>
              <th style={{ position: "sticky", left: 0, background: "var(--green-900)", textAlign: "left", padding: "12px 16px", fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em", borderRight: "1px solid var(--green-600)", borderBottom: "1px solid var(--green-600)", fontWeight: 600 }}>Week</th>
              {slotCols.map(c => (
                <th key={c.key} style={{
                  padding: "12px 6px", fontSize: 10, color: c.isTotal ? "var(--mint)" : "var(--slate)",
                  textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center",
                  borderBottom: "1px solid var(--green-600)", borderRight: c.isTotal ? "1px solid var(--green-600)" : "none",
                  background: c.isTotal ? "rgba(149,249,174,0.04)" : "transparent",
                  fontWeight: 600,
                  minWidth: 70,
                }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAM_POSITION_WEEKS.map((week, wi) => (
              <tr key={week.wk}>
                <td style={{
                  position: "sticky", left: 0, background: "var(--green-900)",
                  padding: "10px 16px", fontSize: 12, color: "var(--mint-soft)",
                  borderRight: "1px solid var(--green-600)", borderBottom: "1px solid var(--green-600)",
                  whiteSpace: "nowrap"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--slate)" }}>Wk</span>
                    <span className="num" style={{ fontSize: 14, color: "var(--mint-soft)" }}>{week.wk}</span>
                    <span className="mono" style={{ fontSize: 9, color: week.w ? "var(--mint)" : "var(--red)", padding: "1px 5px", border: `1px solid ${week.w ? "var(--mint)" : "var(--red)"}40`, borderRadius: 3 }}>{week.w ? "W" : "L"}</span>
                  </div>
                </td>
                {slotCols.map(c => {
                  const r = scoreCell(week, c, wi);
                  return (
                    <td key={c.key} style={{
                      padding: 4, textAlign: "center",
                      borderBottom: "1px solid var(--green-600)",
                      borderRight: c.isTotal ? "1px solid var(--green-600)" : "none",
                      background: c.isTotal ? "rgba(149,249,174,0.03)" : "transparent",
                    }}>
                      <div style={{
                        padding: "8px 6px", borderRadius: 6,
                        background: cellColor(r.score),
                        color: textColor(r.score),
                        fontSize: c.isTotal ? 14 : 13, fontWeight: c.isTotal ? 700 : 500,
                      }}>{r.value != null ? r.value.toFixed(1) : "—"}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeatmapScale() {
  const steps = 8;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--red)" }}>Low</span>
      <div style={{ display: "flex", borderRadius: 3, overflow: "hidden", border: "1px solid var(--green-600)" }}>
        {Array.from({ length: steps }).map((_, i) => {
          const score = i / (steps - 1);
          const t = score;
          let bg;
          if (score < 0.5) {
            const k = score / 0.5;
            bg = `rgba(${Math.round(255-(255-22)*k)},${Math.round(94+(56-94)*k)},${Math.round(94+(36-94)*k)},${(0.5 + (1-k)*0.3).toFixed(2)})`;
          } else {
            const k = (score - 0.5) / 0.5;
            bg = `rgba(${Math.round(22+(149-22)*k)},${Math.round(56+(249-56)*k)},${Math.round(36+(174-36)*k)},${(0.5 + k*0.4).toFixed(2)})`;
          }
          return <div key={i} style={{ width: 14, height: 10, background: bg }} />;
        })}
      </div>
      <span className="mono" style={{ fontSize: 10, color: "var(--mint)" }}>High</span>
    </div>
  );
}

// ============================================================
// Standings Table (Image 5)
// ============================================================
function StandingsTable() {
  const { LEAGUE_STANDINGS, TEAM_POSITION_WEEKS, TEAM_FUTURE_WEEKS } = window;

  const allWeeks = [
    ...TEAM_POSITION_WEEKS.map(w => ({ wk: w.wk, played: true, ptsFor: w.total, ptsAgainst: w.opp, proj: w.proj, oppProj: w.oppProj })),
    ...TEAM_FUTURE_WEEKS.map(w => ({ wk: w.wk, played: false, proj: w.proj, oppProj: w.oppProj })),
  ];

  // Mock weekly position ranks (within league)
  function rankFor(slot, wkIdx, isFuture) {
    // Generate plausible rank 1-12 with some variability
    const seed = (slot.charCodeAt(0) + wkIdx) * 17 + 3;
    const r = ((seed * 2654435761) >>> 0) % 12 + 1;
    return { rank: r, total: 12, projected: isFuture };
  }

  const rows = [
    { label: "Pts/Gm",       type: "pts",  data: allWeeks.map(w => w.played ? w.ptsFor : null), futureData: allWeeks.map(w => !w.played ? w.proj : null) },
    { label: "Opp Pts/Gm",   type: "pts",  data: allWeeks.map(w => w.played ? w.ptsAgainst : null), futureData: allWeeks.map(w => !w.played ? w.oppProj : null), dim: true },
    { label: "QB rank",      type: "rank", data: allWeeks.map((w, i) => rankFor("Q", i, !w.played)) },
    { label: "RB1 rank",     type: "rank", data: allWeeks.map((w, i) => rankFor("R", i, !w.played)) },
    { label: "RB2 rank",     type: "rank", data: allWeeks.map((w, i) => rankFor("S", i, !w.played)) },
    { label: "WR1 rank",     type: "rank", data: allWeeks.map((w, i) => rankFor("W", i, !w.played)) },
    { label: "WR2 rank",     type: "rank", data: allWeeks.map((w, i) => rankFor("X", i, !w.played)) },
    { label: "FLEX rank",    type: "rank", data: allWeeks.map((w, i) => rankFor("F", i, !w.played)) },
    { label: "TE rank",      type: "rank", data: allWeeks.map((w, i) => rankFor("T", i, !w.played)) },
    { label: "DST rank",     type: "rank", data: allWeeks.map((w, i) => rankFor("D", i, !w.played)) },
    { label: "K rank",       type: "rank", data: allWeeks.map((w, i) => rankFor("K", i, !w.played)) },
  ];

  function rankColor(rank, total) {
    const score = 1 - (rank - 1) / (total - 1);
    if (score < 0.5) {
      const t = score / 0.5;
      return `rgba(${Math.round(255-(255-22)*t)},${Math.round(94+(56-94)*t)},${Math.round(94+(36-94)*t)},${(0.15 + (1-t)*0.3).toFixed(2)})`;
    }
    const t = (score - 0.5) / 0.5;
    return `rgba(${Math.round(22+(149-22)*t)},${Math.round(56+(249-56)*t)},${Math.round(36+(174-36)*t)},${(0.15 + t*0.4).toFixed(2)})`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* league mini-standings */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--green-600)", background: "var(--green-900)" }}>
          <div className="display" style={{ fontSize: 18, color: "var(--mint-soft)", fontWeight: 700 }}>League standings</div>
          <div className="mono" style={{ marginTop: 4, fontSize: 11, color: "var(--slate)" }}>12-team H2H · PPR · Through Week 10</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "JetBrains Mono", fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr style={{ background: "var(--green-900)", fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>#</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Team</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Owner</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>W</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>L</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>PF</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>PA</th>
                <th style={{ padding: "10px 12px", textAlign: "center" }}>Streak</th>
              </tr>
            </thead>
            <tbody>
              {LEAGUE_STANDINGS.map(t => {
                const isYou = t.id === "you";
                return (
                  <tr key={t.id} style={{ borderTop: "1px solid var(--green-600)", background: isYou ? "rgba(149,249,174,0.06)" : "transparent" }}>
                    <td className="num" style={{ padding: "10px 12px", color: t.rank <= 3 ? "var(--mint)" : t.rank >= 10 ? "var(--red)" : "var(--mint-soft)", fontSize: 14, width: 50 }}>{t.rank}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: isYou ? "var(--mint)" : "var(--mint-soft)", fontFamily: "Sora", fontWeight: isYou ? 600 : 400 }}>{t.name}{isYou && <span style={{ marginLeft: 8, fontSize: 10, color: "var(--mint)" }}>YOU</span>}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--slate)" }}>{t.owner}</td>
                    <td className="num" style={{ padding: "10px 12px", textAlign: "center", fontSize: 13, color: "var(--mint)" }}>{t.w}</td>
                    <td className="num" style={{ padding: "10px 12px", textAlign: "center", fontSize: 13, color: "var(--slate)" }}>{t.l}</td>
                    <td className="num" style={{ padding: "10px 12px", textAlign: "right", fontSize: 13, color: "var(--mint-soft)" }}>{t.pf}</td>
                    <td className="num" style={{ padding: "10px 12px", textAlign: "right", fontSize: 13, color: "var(--slate)" }}>{t.pa}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span className="mono" style={{
                        padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 600,
                        color: t.streak.startsWith("W") ? "var(--mint)" : "var(--red)",
                        background: t.streak.startsWith("W") ? "rgba(149,249,174,0.1)" : "rgba(255,94,94,0.1)",
                        border: `1px solid ${t.streak.startsWith("W") ? "var(--mint)" : "var(--red)"}40`
                      }}>{t.streak}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Week-by-week ranks table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--green-600)", background: "var(--green-900)" }}>
          <div className="display" style={{ fontSize: 18, color: "var(--mint-soft)", fontWeight: 700 }}>Your team — week by week</div>
          <div className="mono" style={{ marginTop: 4, fontSize: 11, color: "var(--slate)" }}>Rank within league at each slot. Future weeks projected.</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontFamily: "JetBrains Mono", fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, background: "var(--green-900)", padding: "10px 14px", textAlign: "left", fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid var(--green-600)", borderRight: "1px solid var(--green-600)", minWidth: 110 }}>Metric</th>
                {allWeeks.map(w => (
                  <th key={w.wk} style={{
                    padding: "10px 6px", textAlign: "center", fontSize: 10,
                    color: w.played ? "var(--slate)" : "var(--slate-dim)",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    borderBottom: "1px solid var(--green-600)",
                    background: !w.played ? "rgba(149,249,174,0.025)" : "transparent",
                    minWidth: 56
                  }}>W{w.wk}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  <td style={{
                    position: "sticky", left: 0, background: "var(--green-900)",
                    padding: "10px 14px", fontSize: 12, color: row.dim ? "var(--slate)" : "var(--mint-soft)",
                    borderRight: "1px solid var(--green-600)", borderBottom: "1px solid var(--green-600)",
                    whiteSpace: "nowrap"
                  }}>{row.label}</td>
                  {allWeeks.map((w, wi) => {
                    if (row.type === "pts") {
                      const value = row.data[wi];
                      const future = row.futureData && row.futureData[wi];
                      const v = value != null ? value : future;
                      const isProj = value == null;
                      return (
                        <td key={wi} style={{
                          padding: "10px 6px", textAlign: "center",
                          borderBottom: "1px solid var(--green-600)",
                          background: !w.played ? "rgba(149,249,174,0.025)" : "transparent",
                          fontSize: 12,
                          color: isProj ? "var(--slate)" : row.dim ? "var(--slate)" : "var(--mint-soft)",
                          fontStyle: isProj ? "italic" : "normal"
                        }}>{v ? v.toFixed(0) : "—"}</td>
                      );
                    } else {
                      const { rank, total, projected } = row.data[wi];
                      return (
                        <td key={wi} style={{
                          padding: 4, textAlign: "center",
                          borderBottom: "1px solid var(--green-600)",
                          background: !w.played ? "rgba(149,249,174,0.025)" : "transparent"
                        }}>
                          <div style={{
                            padding: "6px 4px", borderRadius: 4,
                            background: rankColor(rank, total),
                            color: "var(--mint-soft)",
                            fontSize: 12, fontWeight: 600,
                            opacity: projected ? 0.6 : 1,
                            fontStyle: projected ? "italic" : "normal"
                          }}>
                            {rank}<span style={{ opacity: 0.5, fontSize: 9 }}>/{total}</span>
                          </div>
                        </td>
                      );
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Position Metrics — donut with toggles (Image 6)
// ============================================================
function PositionMetricsView() {
  const [scope, setScope] = React.useState("team"); // team / league / bench

  // Cumulative season points by position group
  const data = {
    team: [
      { pos: "QB",   pts: 248,  color: "#F2C94C" },
      { pos: "RB",   pts: 312, color: "#95F9AE" },
      { pos: "WR",   pts: 388, color: "#7BD9F4" },
      { pos: "TE",   pts: 152, color: "#D9A6F4" },
      { pos: "FLEX", pts: 198, color: "#D9FFE4" },
      { pos: "DST",  pts: 122, color: "#FF9E5E" },
      { pos: "K",    pts: 134, color: "#A6B7AC" },
    ],
    league: [
      { pos: "QB",   pts: 230,  color: "#F2C94C" },
      { pos: "RB",   pts: 320, color: "#95F9AE" },
      { pos: "WR",   pts: 362, color: "#7BD9F4" },
      { pos: "TE",   pts: 160, color: "#D9A6F4" },
      { pos: "FLEX", pts: 218, color: "#D9FFE4" },
      { pos: "DST",  pts: 118, color: "#FF9E5E" },
      { pos: "K",    pts: 128, color: "#A6B7AC" },
    ],
    bench: [
      { pos: "QB",   pts: 0,   color: "#F2C94C" },
      { pos: "RB",   pts: 142, color: "#95F9AE" },
      { pos: "WR",   pts: 92,  color: "#7BD9F4" },
      { pos: "TE",   pts: 31,  color: "#D9A6F4" },
      { pos: "FLEX", pts: 0,   color: "#D9FFE4" },
      { pos: "DST",  pts: 24,  color: "#FF9E5E" },
      { pos: "K",    pts: 18,  color: "#A6B7AC" },
    ],
  }[scope].filter(d => d.pts > 0);

  const total = data.reduce((s, d) => s + d.pts, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
      <div className="card" style={{ padding: 22 }}>
        <SectionTitle eyebrow="Cumulative season output">Position contribution</SectionTitle>
        <TabBar tabs={[
          { id: "team",   label: "Best Lineup" },
          { id: "league", label: "League" },
          { id: "bench",  label: "Bench" },
        ]} value={scope} onChange={setScope} />

        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
          <BigDonut data={data} total={total} />
        </div>

        <div className="mono" style={{ marginTop: 16, fontSize: 10, color: "var(--slate-dim)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center" }}>
          {scope === "team"   && "Your best lineup all year, cumulative position output"}
          {scope === "league" && "Average per league team at each slot, cumulative"}
          {scope === "bench"  && "Points left on the bench by position"}
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <SectionTitle>Breakdown</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.sort((a, b) => b.pts - a.pts).map(d => {
            const pct = (d.pts / total) * 100;
            return (
              <div key={d.pos} style={{ display: "grid", gridTemplateColumns: "50px 1fr auto auto", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "var(--green-900)", border: "1px solid var(--green-600)" }}>
                <span className="mono" style={{ fontSize: 11, color: d.color, fontWeight: 700, letterSpacing: "0.05em" }}>{d.pos}</span>
                <div style={{ height: 8, background: "var(--green-600)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 4 }} />
                </div>
                <span className="num" style={{ fontSize: 14, color: "var(--mint-soft)", width: 60, textAlign: "right" }}>{d.pts}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--slate)", width: 50, textAlign: "right" }}>{pct.toFixed(1)}%</span>
              </div>
            );
          })}
          <div style={{ marginTop: 6, paddingTop: 12, display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--green-600)" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--slate)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</span>
            <span className="num" style={{ fontSize: 18, color: "var(--mint)" }}>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BigDonut({ data, total }) {
  const size = 280;
  const r = size / 2 - 16;
  const inner = r - 36;
  const cx = size / 2, cy = size / 2;
  let acc = 0;
  function arcPath(start, end) {
    const a0 = (start / total) * Math.PI * 2 - Math.PI / 2;
    const a1 = (end   / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > total / 2 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0), yi0 = cy + inner * Math.sin(a0);
    const xi1 = cx + inner * Math.cos(a1), yi1 = cy + inner * Math.sin(a1);
    return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${inner},${inner} 0 ${large} 0 ${xi0},${yi0} Z`;
  }
  return (
    <svg width={size} height={size}>
      {data.map((s, i) => {
        const path = arcPath(acc, acc + s.pts);
        acc += s.pts;
        const labelAngle = (acc - s.pts/2) / total * Math.PI * 2 - Math.PI / 2;
        const labelR = (r + inner) / 2;
        const lx = cx + labelR * Math.cos(labelAngle);
        const ly = cy + labelR * Math.sin(labelAngle);
        const pct = s.pts / total * 100;
        return <g key={i}>
          <path d={path} fill={s.color} opacity="0.85" stroke="var(--black)" strokeWidth="1.5" />
          {pct > 8 && <text x={lx} y={ly+4} textAnchor="middle" fontFamily="Space Grotesk" fontSize="13" fontWeight="700" fill="var(--black)">{s.pos}</text>}
        </g>;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="32" fill="#D9FFE4">{total}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#A6B7AC" letterSpacing="1.5">TOTAL PTS</text>
    </svg>
  );
}

Object.assign(window, { MetricsView });
