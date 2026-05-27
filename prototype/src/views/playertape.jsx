// Player Tape — candlestick chart treating player performance like stock data
// open = pre-game projection, close = actual finish
// wick = ceiling/floor projection band
// Icons annotate each candle with game conditions

function PlayerTapeView({ onSelectPlayer }) {
  const { PLAYERS, ROSTER_IDS, getGameLog, CURRENT_WEEK } = window;
  const [pickIds, setPickIds] = React.useState(["jallen"]); // multi-select up to 6
  const [scoring, setScoring] = React.useState("ppr");
  const [showProj, setShowProj] = React.useState(true);
  const [hoverWk, setHoverWk] = React.useState(null);

  const primary = PLAYERS.find(p => p.id === pickIds[0]) || PLAYERS[0];
  const log = getGameLog(primary.id);

  // Season math — baseline projection from preseason avg
  const baselineSeason = 374;
  const baselinePerWk = baselineSeason / 17; // 17 games (1 bye)
  const playedActual = log.filter(g => g.played && !g.bye).reduce((s, g) => s + g.actual, 0);
  const playedProj   = log.filter(g => g.played && !g.bye).reduce((s, g) => s + g.proj, 0);
  const delta = playedActual - playedProj;
  const remainingProj = log.filter(g => !g.played && !g.bye).reduce((s, g) => s + g.proj, 0);
  const adjustedSeasonTotal = playedActual + remainingProj;

  function toggleId(id) {
    setPickIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id).length ? prev.filter(x => x !== id) : prev;
      if (prev.length >= 6) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  return (
    <div className="view-enter" style={{ maxWidth: 1440, margin: "0 auto", padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>Projections · Player Tape</div>
          <h1 className="display" style={{ margin: 0, fontSize: 36, color: "var(--mint-soft)" }}>The 949 Ticker</h1>
          <p style={{ marginTop: 6, color: "var(--slate)", fontSize: 13 }}>Treat every player like a stock. Proj = projection. Final = points scored. Wick = floor / ceiling.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <TabBar tabs={[
            { id: "ppr",  label: "PPR" },
            { id: "half", label: "Half" },
            { id: "std",  label: "Standard" },
          ]} value={scoring} onChange={setScoring} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {/* Player picker */}
        <div className="card" style={{ padding: 18 }}>
          <SectionTitle eyebrow="Compare up to 6">Picker</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 700, overflowY: "auto" }}>
            {PLAYERS.map(p => {
              const checked = pickIds.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggleId(p.id)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  padding: "8px 10px", borderRadius: 8,
                  background: checked ? "rgba(149,249,174,0.08)" : "transparent",
                  border: checked ? "1px solid rgba(149,249,174,0.4)" : "1px solid var(--green-600)",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.12s"
                }}>
                  <PlayerCell player={p} mini />
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${checked ? "var(--mint)" : "var(--green-600)"}`, background: checked ? "var(--mint)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {checked && <window.IconCheck size={12} stroke="var(--black)" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main candle area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Player header strip */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <PlayerCell player={primary} />
                <button onClick={() => onSelectPlayer(primary)} className="btn ghost" style={{ padding: "6px 12px", fontSize: 11 }}>Player profile →</button>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <TickerStat label="ADP"        value={`#${primary.adp}`} />
                <TickerStat label="POS Rk"     value={`#${primary.rank}`} />
                <TickerStat label="ROS pts"    value={primary.ros.toFixed(0)} accent="var(--mint)" />
              </div>
            </div>
          </div>

          {/* Candlestick chart */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <SectionTitle eyebrow="Weekly tape">Proj / Final / Floor / Ceiling</SectionTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <CandleLegend color="var(--mint)" label="Up week (final > proj)" filled />
                <CandleLegend color="var(--red)" label="Down week" />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 12, height: 1, background: "var(--slate)" }} />
                  <span style={{ fontSize: 11, color: "var(--slate)" }}>Bye</span>
                </span>
              </div>
            </div>

            <CandlestickChart
              log={log}
              currentWeek={CURRENT_WEEK}
              showProj={showProj}
              hoverWk={hoverWk}
              setHoverWk={setHoverWk}
            />

            {/* Icon row underneath chart */}
            <GameConditionStrip log={log} hoverWk={hoverWk} />
          </div>

          {/* Season tracker + stat strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
            <SeasonProjectionPanel
              baselineSeason={baselineSeason}
              baselinePerWk={baselinePerWk}
              playedActual={playedActual}
              playedProj={playedProj}
              delta={delta}
              adjustedSeasonTotal={adjustedSeasonTotal}
              remainingProj={remainingProj}
              log={log}
            />
            <CandleSummaryPanel log={log} />
          </div>

          {/* If multiple players picked, show comparison line */}
          {pickIds.length > 1 && (
            <div className="card" style={{ padding: 22 }}>
              <SectionTitle eyebrow="Comparison overlay">{pickIds.length} players · weekly final vs proj</SectionTitle>
              <ComparisonLines pickIds={pickIds} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Candlestick chart
// ============================================================
function CandlestickChart({ log, currentWeek, showProj, hoverWk, setHoverWk }) {
  const w = 900, h = 360, padL = 44, padR = 16, padT = 24, padB = 26;
  // Y range from data
  const allVals = log.flatMap(g => g.bye ? [] : [g.proj, g.actual || g.proj, g.ceiling, g.floor]);
  const max = Math.max(...allVals, 36) + 4;
  const min = 0;
  const range = max - min;
  const stepX = (w - padL - padR) / (log.length);

  function xFor(i) { return padL + (i + 0.5) * stepX; }
  function yFor(v) { return h - padB - ((v - min) / range) * (h - padT - padB); }

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
        <defs>
          <pattern id="hollow" patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill="transparent" />
          </pattern>
        </defs>

        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const v = min + (1 - t) * range;
          const y = padT + t * (h - padT - padB);
          return <g key={t}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2A4A37" strokeDasharray="2,3" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7d72" fontFamily="JetBrains Mono">{v.toFixed(0)}</text>
          </g>;
        })}

        {/* Current week marker */}
        {(() => {
          const idx = log.findIndex(g => g.wk === currentWeek);
          if (idx < 0) return null;
          return <g>
            <rect x={xFor(idx) - stepX/2} y={padT} width={stepX} height={h - padT - padB} fill="rgba(149,249,174,0.04)" />
            <line x1={xFor(idx) - stepX/2} y1={padT} x2={xFor(idx) - stepX/2} y2={h - padB} stroke="rgba(149,249,174,0.3)" strokeWidth="1" strokeDasharray="2,3" />
            <text x={xFor(idx)} y={padT - 8} textAnchor="middle" fontSize="10" fill="var(--mint)" fontFamily="JetBrains Mono" letterSpacing="1">NOW</text>
          </g>;
        })()}

        {/* Future zone shade */}
        {(() => {
          const firstFuture = log.findIndex(g => !g.played && !g.bye);
          if (firstFuture < 0) return null;
          const xStart = xFor(firstFuture) - stepX/2;
          return <rect x={xStart} y={padT} width={w - padR - xStart} height={h - padT - padB} fill="rgba(149,249,174,0.015)" />;
        })()}

        {/* Candles */}
        {log.map((g, i) => {
          const x = xFor(i);
          const bodyW = Math.min(stepX * 0.5, 28);

          if (g.bye) {
            return <g key={i}>
              <text x={x} y={yFor(0) - 12} textAnchor="middle" fontSize="9" fill="var(--slate-dim)" fontFamily="JetBrains Mono">BYE</text>
              <line x1={x - bodyW/2} y1={yFor(0) - 6} x2={x + bodyW/2} y2={yFor(0) - 6} stroke="var(--slate-dim)" strokeWidth="1.5" />
            </g>;
          }

          const close = g.actual != null ? g.actual : g.proj;
          const open  = g.proj;
          const isUp  = close >= open;
          const isFuture = !g.played;
          const color = isFuture ? "var(--slate)" : isUp ? "var(--mint)" : "var(--red)";

          // Wick (low to high)
          const yHigh = yFor(Math.max(g.ceiling, open, close));
          const yLow  = yFor(Math.min(g.floor,   open, close));
          // Body (open to close)
          const yOpen  = yFor(open);
          const yClose = yFor(close);
          const yBodyTop = Math.min(yOpen, yClose);
          const yBodyBot = Math.max(yOpen, yClose);
          const bodyH = Math.max(2, yBodyBot - yBodyTop);

          return (
            <g key={i}
               onMouseEnter={() => setHoverWk && setHoverWk(g.wk)}
               onMouseLeave={() => setHoverWk && setHoverWk(null)}
               style={{ cursor: "pointer" }}>
              {/* Wick */}
              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.2" opacity={isFuture ? 0.5 : 0.7} />
              {/* Body */}
              <rect
                x={x - bodyW/2}
                y={yBodyTop}
                width={bodyW}
                height={bodyH}
                rx={2}
                fill={isUp ? color : "transparent"}
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray={isFuture ? "3,2" : "0"}
              />
              {/* Tick marks for open/close on wick */}
              {!isFuture && (
                <>
                  <line x1={x - bodyW/2 - 4} y1={yOpen}  x2={x - bodyW/2} y2={yOpen}  stroke={color} strokeWidth="1.5" />
                  <line x1={x + bodyW/2}     y1={yClose} x2={x + bodyW/2 + 4} y2={yClose} stroke={color} strokeWidth="1.5" />
                </>
              )}
              {/* Hover tooltip placement marker */}
              {hoverWk === g.wk && (
                <line x1={x} y1={padT} x2={x} y2={h - padB} stroke="var(--mint-soft)" strokeOpacity="0.2" strokeDasharray="2,2" />
              )}
            </g>
          );
        })}

        {/* x-axis labels */}
        {log.map((g, i) => (
          <text key={i} x={xFor(i)} y={h - 8} textAnchor="middle" fontSize="10"
                fill={g.bye ? "var(--slate-dim)" : g.played ? "var(--slate)" : "var(--slate-dim)"}
                fontFamily="JetBrains Mono">W{g.wk}</text>
        ))}
      </svg>

      {/* Hover details */}
      {hoverWk && (() => {
        const g = log.find(x => x.wk === hoverWk);
        if (!g || g.bye) return null;
        return (
          <div style={{
            position: "absolute", top: 8, right: 8,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(5,8,7,0.95)", border: "1px solid var(--green-600)",
            backdropFilter: "blur(6px)",
            minWidth: 220
          }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--mint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Week {g.wk}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: "var(--mint-soft)" }}>{g.home ? "vs" : "@"} {g.opp}</div>
            <div className="mono" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr auto", gap: "2px 12px", fontSize: 11 }}>
              <span style={{ color: "var(--slate)" }}>Proj</span> <span style={{ color: "var(--mint-soft)" }}>{g.proj.toFixed(1)}</span>
              <span style={{ color: "var(--slate)" }}>Final</span> <span style={{ color: g.actual != null ? (g.actual >= g.proj ? "var(--mint)" : "var(--red)") : "var(--slate-dim)" }}>{g.actual != null ? g.actual.toFixed(1) : "—"}</span>
              <span style={{ color: "var(--slate)" }}>Ceiling</span> <span style={{ color: "var(--slate)" }}>{g.ceiling.toFixed(1)}</span>
              <span style={{ color: "var(--slate)" }}>Floor</span> <span style={{ color: "var(--slate)" }}>{g.floor.toFixed(1)}</span>
            </div>
            <div className="mono" style={{ marginTop: 10, fontSize: 10, color: "var(--slate)" }}>{g.day} · {g.kickoff} · {g.indoor ? "Dome" : "Outdoor"} · {g.weather}{g.holiday === "thx" ? " · Turkey Day" : g.holiday === "xmas" ? " · Christmas" : ""}</div>
          </div>
        );
      })()}
    </div>
  );
}

// ============================================================
// Icon row under chart — H/A, indoor/outdoor, time, day, weather
// ============================================================
function GameConditionStrip({ log, hoverWk }) {
  const stepW = 100 / log.length;
  return (
    <div style={{ marginTop: 14, paddingLeft: 44, paddingRight: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${log.length}, 1fr)`, gap: 0 }}>
        {log.map((g, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "4px 2px",
            background: hoverWk === g.wk ? "rgba(149,249,174,0.06)" : "transparent",
            borderRadius: 4
          }}>
            {g.bye ? (
              <span className="mono" style={{ fontSize: 9, color: "var(--slate-dim)" }}>—</span>
            ) : (
              <>
                <HALetter home={g.home} />
                <IndoorIcon indoor={g.indoor} />
                <KickoffIcon icon={g.icon || (g.kickoff && g.kickoff.includes("pm") && parseInt(g.kickoff) >= 7 ? "moon" : g.kickoff && g.kickoff.includes("4:") ? "dusk" : "sun")} kickoff={g.kickoff} />
                <DayLetter day={g.day} />
                <WeatherIcon w={g.weather} holiday={g.holiday} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Icon components (small, monochrome)
// ============================================================
function HALetter({ home }) {
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 16, height: 14, borderRadius: 3,
      fontSize: 9, fontWeight: 700,
      color: home ? "var(--mint)" : "var(--slate)",
      background: home ? "rgba(149,249,174,0.1)" : "transparent",
      border: `1px solid ${home ? "rgba(149,249,174,0.4)" : "var(--green-600)"}`
    }}>{home ? "H" : "A"}</span>
  );
}

function IndoorIcon({ indoor }) {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke={indoor ? "var(--mint-soft)" : "var(--slate)"} strokeWidth="1.3">
      {indoor ? (
        // Dome
        <g>
          <path d="M1 8 A6 6 0 0 1 13 8" />
          <line x1="1" y1="8" x2="13" y2="8" />
        </g>
      ) : (
        // Open sky / no dome
        <g>
          <path d="M2 5 Q4 2 7 3 Q10 1 12 4" />
          <circle cx="11" cy="7" r="1.5" fill="var(--slate)" />
        </g>
      )}
    </svg>
  );
}

function KickoffIcon({ icon }) {
  // sun (day), dusk (afternoon), moon (night)
  if (icon === "moon") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12">
        <path d="M9.5 8.5 A5 5 0 1 1 6 1 A4 4 0 0 0 9.5 8.5 Z" fill="#D9FFE4" />
      </svg>
    );
  }
  if (icon === "dusk") {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10">
        <line x1="0" y1="8" x2="14" y2="8" stroke="var(--mint-soft)" strokeWidth="1" />
        <path d="M3 8 A4 4 0 0 1 11 8 Z" fill="#F2C94C" />
        {[0,1,2].map(k => <line key={k} x1={3 - k*0.6} y1={4 - k*0.7} x2={2 - k*0.6} y2={2.5 - k*0.7} stroke="#F2C94C" strokeWidth="0.8" />)}
      </svg>
    );
  }
  // sun
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="2.5" fill="#F2C94C" />
      {[0,1,2,3,4,5,6,7].map(k => {
        const a = (k * Math.PI) / 4;
        const x1 = 6 + Math.cos(a) * 3.5, y1 = 6 + Math.sin(a) * 3.5;
        const x2 = 6 + Math.cos(a) * 5,   y2 = 6 + Math.sin(a) * 5;
        return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F2C94C" strokeWidth="0.8" />;
      })}
    </svg>
  );
}

function DayLetter({ day }) {
  const map = { Sun: { l: "S", c: "var(--slate)" }, Mon: { l: "M", c: "var(--mint)" }, Thu: { l: "T", c: "var(--gold)" }, Sat: { l: "Sa", c: "var(--mint-soft)" }, Fri: { l: "F", c: "var(--slate)" } };
  const m = map[day] || { l: day[0], c: "var(--slate)" };
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 14, height: 12, padding: "0 3px", borderRadius: 3,
      fontSize: 8, fontWeight: 700, color: m.c,
      border: `1px solid ${m.c}40`, background: `${m.c}10`
    }}>{m.l}</span>
  );
}

function WeatherIcon({ w, holiday }) {
  // Holiday overrides
  if (holiday === "thx") {
    // Turkey silhouette
    return (
      <svg width="14" height="12" viewBox="0 0 14 12">
        <circle cx="9" cy="6.5" r="2.5" fill="#F2C94C" />
        <circle cx="11.5" cy="4" r="1.2" fill="#F2C94C" />
        <path d="M11.5 3 L12.5 2 M11.5 4 L13 4" stroke="#F2C94C" strokeWidth="0.8" />
        {[0,1,2,3,4].map(k => {
          const a = -Math.PI / 2 + ((k - 2) * Math.PI / 8);
          const x = 6 + Math.cos(a) * 3.5;
          const y = 6 + Math.sin(a) * 3.5;
          return <line key={k} x1="6" y1="6" x2={x} y2={y} stroke="#FF9E5E" strokeWidth="1.2" />;
        })}
      </svg>
    );
  }
  if (holiday === "xmas") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12">
        <path d="M6 1 L9 6 L4 6 Z M5 6 L8 9 L3 9 Z" fill="#95F9AE" />
        <rect x="5" y="9" width="2" height="2" fill="#163824" />
      </svg>
    );
  }
  if (w === "snow") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" stroke="#D9FFE4" strokeWidth="1">
        <line x1="6" y1="1" x2="6" y2="11" />
        <line x1="1" y1="6" x2="11" y2="6" />
        <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" />
        <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" />
      </svg>
    );
  }
  if (w === "rain") {
    return (
      <svg width="14" height="12" viewBox="0 0 14 12" fill="#7BD9F4">
        <path d="M3 5 Q3 2 7 2 Q11 2 11 5 L3 5 Z" stroke="#7BD9F4" strokeWidth="1" fill="rgba(123,217,244,0.3)" />
        <path d="M4 7 L3 10 M7 7 L6 10 M10 7 L9 10" stroke="#7BD9F4" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (w === "fog") {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" stroke="var(--slate)" strokeWidth="1.2" strokeLinecap="round">
        <line x1="2" y1="3" x2="12" y2="3" />
        <line x1="1" y1="6" x2="13" y2="6" />
        <line x1="3" y1="8" x2="11" y2="8" />
      </svg>
    );
  }
  if (w === "windy") {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" stroke="var(--slate)" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M1 3 L9 3 Q12 3 12 1.5 Q12 0 10.5 0" />
        <path d="M1 6 L11 6 Q13 6 13 4.5" />
        <path d="M1 9 L7 9 Q9 9 9 7.5 Q9 6 7.5 6" />
      </svg>
    );
  }
  // clear
  return <span style={{ width: 12, height: 12 }} />;
}

// ============================================================
// Side panels
// ============================================================
function TickerStat({ label, value, accent }) {
  return (
    <div style={{ paddingLeft: 14, borderLeft: "1px solid var(--green-600)" }}>
      <div className="mono" style={{ fontSize: 9, color: "var(--slate)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div className="num" style={{ marginTop: 4, fontSize: 18, color: accent || "var(--mint-soft)" }}>{value}</div>
    </div>
  );
}

function SeasonProjectionPanel({ baselineSeason, baselinePerWk, playedActual, playedProj, delta, adjustedSeasonTotal, remainingProj, log }) {
  const upDelta = delta >= 0;
  const totalProj = baselineSeason; // preseason baseline
  const adjDelta = adjustedSeasonTotal - totalProj;
  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionTitle eyebrow="Season tracker">Adjusted projection</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--green-600)", background: "var(--green-900)" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Preseason baseline</div>
          <div className="num" style={{ marginTop: 6, fontSize: 28, color: "var(--mint-soft)" }}>{baselineSeason}</div>
          <div className="mono" style={{ marginTop: 4, fontSize: 10, color: "var(--slate-dim)" }}>{baselinePerWk.toFixed(1)} pts/wk · 17 games</div>
        </div>

        <div style={{ padding: 14, borderRadius: 10, border: `1px solid ${adjDelta >= 0 ? "rgba(149,249,174,0.4)" : "rgba(255,94,94,0.4)"}`, background: adjDelta >= 0 ? "rgba(149,249,174,0.06)" : "rgba(255,94,94,0.06)" }}>
          <div className="mono" style={{ fontSize: 10, color: adjDelta >= 0 ? "var(--mint)" : "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Adjusted total</div>
          <div className="num" style={{ marginTop: 6, fontSize: 28, color: adjDelta >= 0 ? "var(--mint)" : "var(--red)" }}>{adjustedSeasonTotal.toFixed(0)}</div>
          <div className="mono" style={{ marginTop: 4, fontSize: 10, color: adjDelta >= 0 ? "var(--mint)" : "var(--red)" }}>
            {adjDelta >= 0 ? "+" : ""}{adjDelta.toFixed(0)} vs baseline
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: "var(--green-900)", border: "1px solid var(--green-600)" }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Played vs projected</div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span className="num" style={{ fontSize: 22, color: "var(--mint-soft)" }}>{playedActual.toFixed(1)}</span>
            <span className="mono" style={{ marginLeft: 6, fontSize: 11, color: "var(--slate)" }}>final</span>
          </div>
          <span className="mono" style={{ fontSize: 14, color: "var(--slate-dim)" }}>vs</span>
          <div>
            <span className="num" style={{ fontSize: 22, color: "var(--slate)" }}>{playedProj.toFixed(1)}</span>
            <span className="mono" style={{ marginLeft: 6, fontSize: 11, color: "var(--slate-dim)" }}>projected</span>
          </div>
          <span className="num" style={{ fontSize: 18, color: upDelta ? "var(--mint)" : "var(--red)", fontWeight: 700 }}>
            {upDelta ? "+" : ""}{delta.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mono" style={{ marginTop: 14, fontSize: 11, color: "var(--slate)", lineHeight: 1.5 }}>
        Remaining schedule projects <span style={{ color: "var(--mint-soft)" }}>{remainingProj.toFixed(1)}</span> pts across <span style={{ color: "var(--mint-soft)" }}>{log.filter(g => !g.played && !g.bye).length}</span> games. Model holds the baseline open through bye, then adjusts forward weekly based on observed delta.
      </div>
    </div>
  );
}

function CandleSummaryPanel({ log }) {
  const played = log.filter(g => g.played && !g.bye);
  const ups   = played.filter(g => g.actual >= g.proj).length;
  const downs = played.filter(g => g.actual <  g.proj).length;
  const winPct = played.length ? (ups / played.length) * 100 : 0;
  const biggestGain = played.reduce((best, g) => (g.actual - g.proj) > (best ? (best.actual - best.proj) : -Infinity) ? g : best, null);
  const biggestLoss = played.reduce((worst, g) => (g.actual - g.proj) < (worst ? (worst.actual - worst.proj) : Infinity) ? g : worst, null);

  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionTitle eyebrow="Tape summary">Candle stats</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <SummaryStat label="Up weeks" value={ups} suffix={`/${played.length}`} color="var(--mint)" />
        <SummaryStat label="Down weeks" value={downs} suffix={`/${played.length}`} color="var(--red)" />
        <SummaryStat label="Beat rate" value={`${winPct.toFixed(0)}%`} color="var(--mint-soft)" />
        <SummaryStat label="Avg delta"  value={(played.reduce((s, g) => s + g.actual - g.proj, 0) / Math.max(1, played.length)).toFixed(1)} color="var(--mint-soft)" />
      </div>

      {biggestGain && (
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(149,249,174,0.06)", border: "1px solid rgba(149,249,174,0.3)", marginBottom: 8 }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--mint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Biggest beat</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--mint-soft)" }}>W{biggestGain.wk} {biggestGain.home ? "vs" : "@"}{biggestGain.opp} · <span className="num">{biggestGain.actual.toFixed(1)}</span> on <span className="num" style={{ color: "var(--slate)" }}>{biggestGain.proj.toFixed(1)}</span> proj <span style={{ color: "var(--mint)" }}>(+{(biggestGain.actual - biggestGain.proj).toFixed(1)})</span></div>
        </div>
      )}
      {biggestLoss && (
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,94,94,0.06)", border: "1px solid rgba(255,94,94,0.3)" }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Worst miss</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--mint-soft)" }}>W{biggestLoss.wk} {biggestLoss.home ? "vs" : "@"}{biggestLoss.opp} · <span className="num">{biggestLoss.actual.toFixed(1)}</span> on <span className="num" style={{ color: "var(--slate)" }}>{biggestLoss.proj.toFixed(1)}</span> proj <span style={{ color: "var(--red)" }}>({(biggestLoss.actual - biggestLoss.proj).toFixed(1)})</span></div>
        </div>
      )}
    </div>
  );
}

function CandleLegend({ color, label, filled }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        display: "inline-block", width: 10, height: 14, borderRadius: 2,
        background: filled ? color : "transparent",
        border: `1.5px solid ${color}`
      }} />
      <span style={{ fontSize: 11, color: "var(--slate)" }}>{label}</span>
    </span>
  );
}

function SummaryStat({ label, value, suffix, color }) {  return (
    <div style={{ padding: 12, borderRadius: 8, border: "1px solid var(--green-600)", background: "var(--green-900)" }}>
      <div className="mono" style={{ fontSize: 9, color: "var(--slate)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="num" style={{ fontSize: 22, color }}>{value}</span>
        {suffix && <span className="mono" style={{ fontSize: 10, color: "var(--slate-dim)" }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ============================================================
// Multi-player comparison
// ============================================================
function ComparisonLines({ pickIds }) {
  const { PLAYERS, getGameLog } = window;
  const palette = ["#95F9AE","#7BD9F4","#F2C94C","#D9A6F4","#FF9E5E","#D9FFE4"];
  const series = pickIds.map((id, i) => {
    const p = PLAYERS.find(x => x.id === id);
    const log = getGameLog(id);
    return {
      id, name: p.name, color: palette[i],
      data: log.map(g => g.bye ? null : (g.actual != null ? g.actual : g.proj)),
      futurePoints: log.map(g => !g.played && !g.bye)
    };
  });

  const w = 900, h = 220, padL = 36, padR = 12, padT = 12, padB = 24;
  const allVals = series.flatMap(s => s.data.filter(v => v != null));
  const max = Math.max(...allVals) + 4;
  const min = 0;
  const range = max - min;
  const numWks = series[0].data.length;
  const stepX = (w - padL - padR) / (numWks - 1);
  function xFor(i) { return padL + i * stepX; }
  function yFor(v) { return h - padB - ((v - min) / range) * (h - padT - padB); }

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%">
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const v = min + (1 - t) * range;
          const y = padT + t * (h - padT - padB);
          return <g key={t}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2A4A37" strokeDasharray="2,3" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7d72" fontFamily="JetBrains Mono">{v.toFixed(0)}</text>
          </g>;
        })}
        {series.map(s => {
          // build path skipping bye (null) gaps
          let path = "";
          let inPath = false;
          s.data.forEach((v, i) => {
            if (v == null) { inPath = false; return; }
            path += `${inPath ? "L" : "M"}${xFor(i)},${yFor(v)} `;
            inPath = true;
          });
          return <path key={s.id} d={path} fill="none" stroke={s.color} strokeWidth="2" opacity="0.9" />;
        })}
        {series.map(s => s.data.map((v, i) =>
          v != null && (
            <circle key={`${s.id}-${i}`} cx={xFor(i)} cy={yFor(v)} r="3"
              fill={s.futurePoints[i] ? "var(--black)" : s.color}
              stroke={s.color} strokeWidth="1.5"
              strokeDasharray={s.futurePoints[i] ? "1,1" : "0"} />
          )
        ))}
        {Array.from({ length: numWks }).map((_, i) => (
          <text key={i} x={xFor(i)} y={h - 6} textAnchor="middle" fontSize="9" fill="#A6B7AC" fontFamily="JetBrains Mono">W{i + 1}</text>
        ))}
      </svg>
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 14 }}>
        {series.map(s => (
          <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 2, background: s.color, borderRadius: 1 }} />
            <span style={{ fontSize: 12, color: "var(--mint-soft)" }}>{s.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PlayerTapeView });
