// Shared column template & cell helpers for the Edge Board grid
const COLS = "70px minmax(220px, 1.6fr) 100px 90px 90px 100px 130px 130px 90px";

function HeadCell({ children, align = "flex-start" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: align, minWidth: 0, padding: "0 6px" }}>
      {children}
    </div>
  );
}

function Cell({ children, align = "flex-start" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: align, minWidth: 0, padding: "0 6px" }}>
      {children}
    </div>
  );
}

function RankingsView({ onSelectPlayer }) {
  const { PLAYERS } = window;
  const [pos, setPos] = React.useState("ALL");
  const [scoring, setScoring] = React.useState("ppr");
  const [search, setSearch] = React.useState("");  const filtered = PLAYERS
    .filter(p => pos === "ALL" || p.pos === pos)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.proj - a.proj);

  const tabs = [
    { id: "ALL", label: "Overall", count: PLAYERS.length },
    { id: "QB",  label: "QB",      count: PLAYERS.filter(p => p.pos === "QB").length },
    { id: "RB",  label: "RB",      count: PLAYERS.filter(p => p.pos === "RB").length },
    { id: "WR",  label: "WR",      count: PLAYERS.filter(p => p.pos === "WR").length },
    { id: "TE",  label: "TE",      count: PLAYERS.filter(p => p.pos === "TE").length },
    { id: "FLEX", label: "FLEX" },
  ];

  return (
    <div className="view-enter" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>Week 11 · {scoring.toUpperCase()}</div>
          <h1 className="display" style={{ margin: 0, fontSize: 40, color: "var(--mint-soft)" }}>The Edge Board</h1>
          <p style={{ marginTop: 8, color: "var(--slate)", fontSize: 14 }}>949's full-position rankings · refreshed 8 min ago</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 14px", borderRadius: 10,
            border: "1px solid var(--green-600)", background: "var(--green-900)",
            minWidth: 240
          }}>
            <window.IconSearch size={14} stroke="var(--slate)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player or team"
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "var(--mint-soft)", fontFamily: "Sora", fontSize: 13, width: "100%"
              }} />
          </div>
          <TabBar tabs={[
            { id: "ppr",   label: "PPR" },
            { id: "half",  label: "Half" },
            { id: "std",   label: "Standard" },
          ]} value={scoring} onChange={setScoring} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <TabBar tabs={tabs} value={pos} onChange={setPos} />
      </div>

      {/* Tier divider example & table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {/* header */}
        <div style={{
          display: "grid", gridTemplateColumns: COLS,
          padding: "14px 20px", background: "var(--green-900)",
          borderBottom: "1px solid var(--green-600)",
          fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em",
          fontFamily: "JetBrains Mono", fontWeight: 600,
          alignItems: "center"
        }}>
          <HeadCell align="center">Rank</HeadCell>
          <HeadCell align="flex-start">Player</HeadCell>
          <HeadCell align="center">Proj</HeadCell>
          <HeadCell align="center">Δ Wk</HeadCell>
          <HeadCell align="center">Match</HeadCell>
          <HeadCell align="center">Risk</HeadCell>
          <HeadCell align="center">Boom / Bust</HeadCell>
          <HeadCell align="center">10-wk Trend</HeadCell>
          <HeadCell align="flex-end">ROS</HeadCell>
        </div>

        {filtered.map((p, i) => {
          const delta = p.prev - p.rank;
          const showTier = i === 0 || i === 5 || i === 12;
          return (
            <React.Fragment key={p.id}>
              {showTier && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "10px 20px", background: "rgba(149,249,174,0.04)",
                  borderTop: i > 0 ? "1px solid var(--green-600)" : "none",
                  borderBottom: "1px solid var(--green-600)"
                }}>
                  <span className="mono" style={{
                    fontSize: 10, fontWeight: 700, color: "var(--mint)",
                    padding: "3px 8px", border: "1px solid rgba(149,249,174,0.4)",
                    borderRadius: 4, letterSpacing: "0.1em", textTransform: "uppercase"
                  }}>Tier {Math.floor(i / 5) + 1}</span>
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>
                    {i === 0 ? "Locked starters — never bench unless injury" :
                     i === 5 ? "High-end flex / borderline starters" :
                     "Streaming and waiver candidates"}
                  </span>
                  <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--green-600), transparent)" }} />
                </div>
              )}
              <button onClick={() => onSelectPlayer(p)} style={{
                display: "grid", gridTemplateColumns: COLS,
                gap: 0, padding: "14px 20px",
                background: "transparent", border: "none", borderBottom: "1px solid var(--green-600)",
                cursor: "pointer", width: "100%", textAlign: "left",
                alignItems: "center", transition: "background 0.12s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(22,56,36,0.6)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Cell align="center">
                  <span className="num" style={{ fontSize: 18, color: "var(--mint-soft)" }}>{i + 1}</span>
                </Cell>
                <Cell align="flex-start">
                  <PlayerCell player={p} />
                </Cell>
                <Cell align="center">
                  <span className="num" style={{ fontSize: 18, color: "var(--mint)" }}>{p.proj.toFixed(1)}</span>
                </Cell>
                <Cell align="center">
                  <TrendDelta value={delta} />
                </Cell>
                <Cell align="center">
                  <MatchupBars rating={p.matchupRating} />
                </Cell>
                <Cell align="center">
                  <RiskDot risk={p.risk} />
                </Cell>
                <Cell align="center">
                  <BoomBustBar boom={p.boom} bust={p.bust} />
                </Cell>
                <Cell align="center">
                  <Sparkline data={p.traj} width={110} height={28} />
                </Cell>
                <Cell align="flex-end">
                  <span className="mono" style={{ fontSize: 13, color: "var(--slate)" }}>{p.ros.toFixed(0)}</span>
                </Cell>
              </button>
            </React.Fragment>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", color: "var(--slate)", fontSize: 14 }}>
            No players match — try adjusting filters.
          </div>
        )}
      </div>
    </div>
  );
}

function BoomBustBar({ boom, bust }) {
  const total = boom + bust;
  const boomPct = (boom / 100) * 100;
  const bustPct = (bust / 100) * 100;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono", fontSize: 10 }}>
      <span style={{ color: "var(--mint)", width: 18, textAlign: "right" }}>{boom}</span>
      <span style={{ display: "inline-flex", width: 50, height: 6, background: "var(--green-600)", borderRadius: 3, overflow: "hidden" }}>
        <span style={{ width: `${boomPct / 1.6}%`, background: "var(--mint)" }} />
        <span style={{ flex: 1 }} />
        <span style={{ width: `${bustPct / 1.6}%`, background: "var(--red)" }} />
      </span>
      <span style={{ color: "var(--red)", width: 18 }}>{bust}</span>
    </div>
  );
}

Object.assign(window, { RankingsView });
