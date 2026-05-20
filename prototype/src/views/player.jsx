function PlayerDetailView({ player, onBack }) {
  const { PLAYERS, TEAMS } = window;
  if (!player) return null;
  const team = TEAMS[player.team] || { color: "#2A4A37", name: player.team };

  // Comparable players in same position
  const peers = PLAYERS
    .filter(p => p.pos === player.pos && p.id !== player.id)
    .sort((a, b) => Math.abs(a.proj - player.proj) - Math.abs(b.proj - player.proj))
    .slice(0, 3);

  return (
    <div className="view-enter" style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px 48px" }}>
      {/* Breadcrumb */}
      <button onClick={onBack} style={{
        background: "transparent", border: "none", color: "var(--slate)",
        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, padding: 0, marginBottom: 20
      }}>
        <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><window.IconChevron size={14} /></span>
        Back to rankings
      </button>

      {/* Hero */}
      <div className="card" style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${team.color}30, var(--green-800) 50%, var(--green-900))`,
        padding: 32,
      }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 360, height: 360, borderRadius: "50%",
          background: `radial-gradient(closest-side, ${team.color}40, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, position: "relative" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div style={{
              width: 92, height: 92, borderRadius: 16,
              background: `linear-gradient(135deg, ${team.color}, var(--green-900))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 36, color: "white",
              border: "1px solid var(--green-600)",
            }}>{player.num}</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <PosPill pos={player.pos} />
                <TeamChip team={player.team} size="md" />
                <RiskDot risk={player.risk} />
                {player.news && player.news.toLowerCase().includes("questionable") && (
                  <span className="chip gold">Questionable</span>
                )}
              </div>
              <h1 className="display" style={{ margin: 0, fontSize: 44, color: "var(--mint-soft)", lineHeight: 1 }}>{player.name}</h1>
              <div style={{ marginTop: 10, color: "var(--slate)", fontSize: 14 }}>
                Age {player.age} · ADP #{player.adp} · {player.matchup} · Ownership {player.own}%
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn ghost"><window.IconPlus size={14} /> Watchlist</button>
            <button className="btn outline"><window.IconSwap size={14} /> Trade</button>
            <button className="btn"><window.IconBolt size={14} stroke="var(--black)" /> Start</button>
          </div>
        </div>

        {/* Big stat row */}
        <div style={{
          marginTop: 32, display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
          gap: 0, border: "1px solid var(--green-600)", borderRadius: 16, overflow: "hidden",
          background: "rgba(5,8,7,0.4)"
        }}>
          {[
            { l: "Wk 11 Proj", v: player.proj.toFixed(1), d: "PPR" },
            { l: "Last Wk",    v: player.actual.toFixed(1), d: ((player.actual - player.proj) >= 0 ? "+" : "") + (player.actual - player.proj).toFixed(1) + " vs proj" },
            { l: "Position Rk", v: `#${player.rank}`, d: `Prev #${player.prev}` },
            { l: "ROS Points",  v: player.ros.toFixed(0), d: "Rest-of-season" },
            { l: "Matchup",     v: ["—","Hard","Hard","Avg","Good","Elite"][player.matchupRating], d: player.matchup, accent: player.matchupRating >= 4 ? "var(--mint)" : player.matchupRating <= 2 ? "var(--red)" : "var(--mint-soft)" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "20px 22px",
              borderRight: i < 4 ? "1px solid var(--green-600)" : "none"
            }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.l}</div>
              <div className="num" style={{ marginTop: 6, fontSize: 28, color: s.accent || "var(--mint)" }}>{s.v}</div>
              <div className="mono" style={{ marginTop: 4, fontSize: 11, color: "var(--slate-dim)", letterSpacing: "0.03em" }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* Trajectory big chart */}
        <div className="card" style={{ padding: 24 }}>
          <SectionTitle eyebrow="Performance">12-week trajectory</SectionTitle>
          <BigTrajectoryChart data={player.traj} proj={player.proj} />

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <UsageStat label="Snap %"     value={player.snap} max={100} suffix="%" />
            <UsageStat label="Tgt/Game"   value={player.tgt}  max={14} />
            <UsageStat label="Rush/Game"  value={player.rush} max={22} />
          </div>
        </div>

        {/* Outlook + news */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <SectionTitle eyebrow="949 Take">Outlook</SectionTitle>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--mint-soft)" }}>{player.notes}</p>

            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <ConfidenceCard label="Boom" value={player.boom} accent="var(--mint)" />
              <ConfidenceCard label="Bust" value={player.bust} accent="var(--red)" />
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <SectionTitle eyebrow="Wire">Latest news</SectionTitle>
            <div style={{
              padding: 14, borderRadius: 10,
              border: "1px solid var(--green-600)", background: "var(--green-900)"
            }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--mint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Practice report</div>
              <div style={{ fontSize: 13, color: "var(--mint-soft)", lineHeight: 1.5 }}>{player.news}</div>
              <div className="mono" style={{ marginTop: 8, fontSize: 10, color: "var(--slate-dim)" }}>Sourced from team report · 1h ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Peers comparison */}
      <div className="card" style={{ marginTop: 24, padding: 24 }}>
        <SectionTitle eyebrow="Compare">Closest comparables</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {peers.map(peer => (
            <PeerCard key={peer.id} player={player} peer={peer} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BigTrajectoryChart({ data, proj }) {
  const w = 600, h = 220, pad = 24;
  const max = Math.max(...data, proj) + 4;
  const min = Math.max(0, Math.min(...data, proj) - 4);
  const range = max - min;
  const stepX = (w - pad * 2) / (data.length - 1);

  const path = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  const area = path + ` L${pad + (data.length - 1) * stepX},${h - pad} L${pad},${h - pad} Z`;
  const projY = h - pad - ((proj - min) / range) * (h - pad * 2);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h + 28}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="bigFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#95F9AE" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#95F9AE" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={pad} y1={pad + t * (h - pad * 2)} x2={w - pad} y2={pad + t * (h - pad * 2)} stroke="#2A4A37" strokeWidth="1" strokeDasharray="2,3" />
        ))}
        {/* Projection horizontal */}
        <line x1={pad} y1={projY} x2={w - pad} y2={projY} stroke="#D9FFE4" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
        <text x={w - pad - 4} y={projY - 6} textAnchor="end" fontSize="10" fill="#D9FFE4" opacity="0.7" fontFamily="JetBrains Mono">Proj {proj.toFixed(1)}</text>

        <path d={area} fill="url(#bigFill)" />
        <path d={path} fill="none" stroke="#95F9AE" strokeWidth="2.5" />
        {data.map((v, i) => {
          const x = pad + i * stepX;
          const y = h - pad - ((v - min) / range) * (h - pad * 2);
          return <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="#95F9AE" stroke="#050807" strokeWidth="1.5" />
            <text x={x} y={h + 14} textAnchor="middle" fontSize="9" fill="#A6B7AC" fontFamily="JetBrains Mono">W{i + 1}</text>
          </g>;
        })}
      </svg>
    </div>
  );
}

function UsageStat({ label, value, max, suffix = "" }) {
  return (
    <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--green-600)", background: "var(--green-900)" }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="num" style={{ fontSize: 22, color: "var(--mint-soft)" }}>{value}{suffix}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--slate-dim)" }}>/ {max}{suffix}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <Gauge value={value} max={max} />
      </div>
    </div>
  );
}

function ConfidenceCard({ label, value, accent }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10,
      border: `1px solid ${accent}40`, background: `${accent}08`,
    }}>
      <div className="mono" style={{ fontSize: 10, color: accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div className="num" style={{ marginTop: 6, fontSize: 28, color: accent }}>{value}%</div>
    </div>
  );
}

function PeerCard({ player, peer }) {
  const diff = peer.proj - player.proj;
  return (
    <div style={{
      padding: 16, borderRadius: 12,
      border: "1px solid var(--green-600)", background: "var(--green-900)"
    }}>
      <PlayerCell player={peer} mini />
      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="num" style={{ fontSize: 22, color: "var(--mint)" }}>{peer.proj.toFixed(1)}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Wk 11 proj</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 16, color: diff > 0 ? "var(--mint)" : "var(--red)" }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--slate-dim)" }}>vs {player.name.split(" ").slice(-1)[0]}</div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Sparkline data={peer.traj} width={250} height={32} />
      </div>
    </div>
  );
}

Object.assign(window, { PlayerDetailView });
