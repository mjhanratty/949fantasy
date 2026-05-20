// @ts-nocheck
"use client"

// -nocheck

"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { PLAYERS, ROSTER_IDS } from "@/lib/mock"
import { TeamChip, PosPill, PlayerCell, TabBar } from "@/components/product/primitives"

// "Statistics" section — Performance grid + Player Trends

export function StatisticsView({ tab, setTab, onSelectPlayer }) {
  return (
    <div className="view-enter" style={{ maxWidth: 1440, margin: "0 auto", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>Season · Through Week 10</div>
          <h1 className="display" style={{ margin: 0, fontSize: 36, color: "var(--mint-soft)" }}>Statistics</h1>
          <p style={{ marginTop: 6, color: "var(--slate)", fontSize: 13 }}>Season-long performance against projection and league</p>
        </div>
        <TabBar tabs={[
          { id: "performance", label: "Performance" },
          { id: "trends",      label: "Player Trends" },
        ]} value={tab} onChange={setTab} />
      </div>

      {tab === "performance" && <PerformanceGrid />}
      {tab === "trends"      && <PlayerTrendsView onSelectPlayer={onSelectPlayer} />}
    </div>
  );
}

// ============================================================
// Performance grid (Image 8) — toggleable team / league
// ============================================================
function Legend({
  color,
  label,
  dashed,
  dotted,
  dim,
}: {
  color: string
  label: string
  dashed?: boolean
  dotted?: boolean
  dim?: boolean
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: dim ? 0.5 : 1 }}>
      <span
        style={{
          width: 18,
          height: 3,
          borderRadius: 2,
          background: dashed || dotted ? "transparent" : color,
          border: dashed ? `1.5px dashed ${color}` : dotted ? `1.5px dotted ${color}` : "none",
        }}
      />
      <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.04em" }}>
        {label}
      </span>
    </div>
  )
}

function PerformanceGrid() {
  const [scope, setScope] = useState("team");

  // Total season points by position group
  const teamData = [
    { pos: "QB",   pts: 248,  proj: 225, color: "#F2C94C", slot: 1 },
    { pos: "RB",   pts: 312,  proj: 320, color: "#95F9AE", slot: 2 },
    { pos: "WR",   pts: 388,  proj: 360, color: "#7BD9F4", slot: 2 },
    { pos: "TE",   pts: 152,  proj: 165, color: "#D9A6F4", slot: 1 },
    { pos: "FLEX", pts: 198,  proj: 220, color: "#D9FFE4", slot: 1 },
    { pos: "DST",  pts: 122,  proj: 130, color: "#FF9E5E", slot: 1 },
    { pos: "K",    pts: 134,  proj: 130, color: "#A6B7AC", slot: 1 },
  ];

  // League — your output vs league avg at that position
  const leagueData = [
    { pos: "QB",   pts: 248,  proj: 230, color: "#F2C94C", slot: 1 },
    { pos: "RB",   pts: 312,  proj: 320, color: "#95F9AE", slot: 2 },
    { pos: "WR",   pts: 388,  proj: 362, color: "#7BD9F4", slot: 2 },
    { pos: "TE",   pts: 152,  proj: 160, color: "#D9A6F4", slot: 1 },
    { pos: "FLEX", pts: 198,  proj: 218, color: "#D9FFE4", slot: 1 },
    { pos: "DST",  pts: 122,  proj: 118, color: "#FF9E5E", slot: 1 },
    { pos: "K",    pts: 134,  proj: 128, color: "#A6B7AC", slot: 1 },
  ];

  const data = scope === "team" ? teamData : leagueData;
  const compareLabel = scope === "team" ? "vs projected" : "vs league avg";

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <TabBar tabs={[
          { id: "team",   label: "vs Projection" },
          { id: "league", label: "vs League" },
        ]} value={scope} onChange={setScope} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {data.map(d => {
          const diff = ((d.pts - d.proj) / d.proj) * 100;
          const isUp = diff >= 0;
          const color = isUp ? "var(--mint)" : "var(--red)";
          return (
            <div key={d.pos} style={{
              padding: 20,
              borderRadius: 12, border: "1px solid var(--green-600)", background: "var(--green-800)",
              position: "relative", overflow: "hidden"
            }}>
              {/* color rail */}
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 3, background: d.color, opacity: 0.6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.14em" }}>{d.pos}</span>
                  <span className="mono" style={{ marginLeft: 6, fontSize: 9, color: "var(--slate-dim)", padding: "1px 4px", border: "1px solid var(--green-600)", borderRadius: 3 }}>{d.slot}× slot</span>
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600, color }}>
                  {isUp ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}%
                </span>
              </div>

              <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="num" style={{ fontSize: 36, color: "var(--mint-soft)" }}>{d.pts}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--slate-dim)" }}>pts</span>
              </div>

              <div className="mono" style={{ marginTop: 6, fontSize: 11, color: "var(--slate)", letterSpacing: "0.04em" }}>
                {compareLabel}: <span style={{ color: "var(--mint-soft)" }}>{d.proj}</span>
              </div>

              <div style={{ marginTop: 14, height: 6, background: "var(--green-600)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${Math.min(100, (d.pts / Math.max(d.pts, d.proj)) * 100)}%`,
                  background: d.color, borderRadius: 3
                }} />
                <div style={{
                  position: "absolute", top: -2, height: 10, width: 2,
                  left: `${(d.proj / Math.max(d.pts, d.proj)) * 100}%`,
                  background: "var(--mint-soft)"
                }} title="Projected"/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total at bottom */}
      <div style={{ marginTop: 14 }} className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: 0, padding: "20px 24px" }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: "var(--mint)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Season Total</div>
            <div className="num" style={{ marginTop: 6, fontSize: 36, color: "var(--mint)" }}>{data.reduce((s, d) => s + d.pts, 0)}</div>
            <div className="mono" style={{ marginTop: 4, fontSize: 11, color: "var(--slate)" }}>{compareLabel}: {data.reduce((s, d) => s + d.proj, 0)}</div>
          </div>
          <SmallStat label="Pts / Wk avg" value="127.7" delta="+2.4%" />
          <SmallStat label="Boom weeks"   value="4 / 10" delta="40% rate" />
          <SmallStat label="Best wk"      value="156.7" delta="W5" />
          <SmallStat label="Worst wk"     value="96.1"  delta="W3" />
        </div>
      </div>
    </div>
  );
}

function SmallStat({ label, value, delta }) {
  return (
    <div style={{ paddingLeft: 24, borderLeft: "1px solid var(--green-600)" }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div className="num" style={{ marginTop: 6, fontSize: 22, color: "var(--mint-soft)" }}>{value}</div>
      <div className="mono" style={{ marginTop: 4, fontSize: 11, color: "var(--slate-dim)" }}>{delta}</div>
    </div>
  );
}

// ============================================================
// Player Trends (Image 9) — weekly bars (ceiling/floor) + actual line
// ============================================================
function PlayerTrendsView({ onSelectPlayer }) {
  
  const [source, setSource] = useState("roster"); // roster / waiver
  const [pickId, setPickId] = useState("jchase");

  const roster = ROSTER_IDS.map(id => PLAYERS.find(p => p.id === id)).filter(Boolean);
  const waiver = PLAYERS.filter(p => !ROSTER_IDS.includes(p.id));
  const list = source === "roster" ? roster : waiver;
  const player = PLAYERS.find(p => p.id === pickId) || roster[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
      {/* Player picker */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ marginBottom: 12 }}>
          <TabBar tabs={[
            { id: "roster", label: "Roster" },
            { id: "waiver", label: "Waiver" },
          ]} value={source} onChange={setSource} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 540, overflowY: "auto", paddingRight: 4 }}>
          {list.map(p => {
            const active = p.id === pickId;
            return (
              <button key={p.id} onClick={() => setPickId(p.id)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "10px 12px", borderRadius: 8,
                background: active ? "rgba(149,249,174,0.06)" : "transparent",
                border: active ? "1px solid rgba(149,249,174,0.4)" : "1px solid var(--green-600)",
                cursor: "pointer", textAlign: "left",
                transition: "all 0.12s"
              }}>
                <PlayerCell player={p} mini />
                <span className="num" style={{ fontSize: 13, color: "var(--mint)" }}>{p.proj.toFixed(1)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trend chart */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "var(--mint)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Player trend</div>
            <h2 className="display" style={{ margin: 0, fontSize: 26, color: "var(--mint-soft)" }}>{player.name}</h2>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 10 }}>
              <PosPill pos={player.pos} />
              <TeamChip team={player.team} />
              <span className="mono" style={{ fontSize: 11, color: "var(--slate)" }}>POS RK #{player.rank}</span>
            </div>
          </div>
          <button className="btn outline" onClick={() => onSelectPlayer(player)}>Open profile →</button>
        </div>

        <CeilingFloorChart player={player} />

        <div style={{ marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Legend color="rgba(149,249,174,0.25)" label="Floor → Ceiling band" />
          <Legend color="#95F9AE" label="Actual / Projection" />
          <Legend color="#D9FFE4" label="Projection (future)" dashed />
        </div>
      </div>
    </div>
  );
}

function CeilingFloorChart({ player }) {
  // 12 weeks: 10 actual (from traj), 2 projected weeks
  const past = player.traj.slice(0, 10);
  const proj = [player.proj, player.proj * 0.97, player.proj * 1.02, player.proj * 0.95];
  const all = [...past, ...proj];

  const w = 700, h = 280, padL = 36, padR = 14, padT = 16, padB = 28;
  const max = (player.ceiling || Math.max(...all) + 8) + 4;
  const min = 0;
  const range = max - min;
  const stepX = (w - padL - padR) / (all.length - 1);

  function xFor(i) { return padL + i * stepX; }
  function yFor(v) { return h - padB - ((v - min) / range) * (h - padT - padB); }

  // Build bar data — floor & ceiling per week (computed as proportions)
  const bars = all.map((v, i) => {
    const isFuture = i >= 10;
    const center = isFuture ? proj[i - 10] : v;
    const floor   = isFuture ? player.floor : Math.max(0, v * 0.55);
    const ceiling = isFuture ? player.ceiling : v * 1.5;
    return { x: xFor(i), floor, ceiling, value: v, isFuture };
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id="cfBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#95F9AE" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#95F9AE" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const v = min + (1 - t) * range;
        const y = padT + t * (h - padT - padB);
        return <g key={t}>
          <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2A4A37" strokeDasharray="2,3" />
          <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7d72" fontFamily="JetBrains Mono">{v.toFixed(0)}</text>
        </g>;
      })}

      {/* future zone */}
      <rect x={xFor(9.5)} y={padT} width={w - padR - xFor(9.5)} height={h - padT - padB} fill="rgba(149,249,174,0.025)" />

      {/* bars (floor to ceiling) */}
      {bars.map((b, i) => {
        const barW = stepX * 0.55;
        return <rect
          key={i}
          x={b.x - barW/2}
          y={yFor(b.ceiling)}
          width={barW}
          height={yFor(b.floor) - yFor(b.ceiling)}
          rx={3}
          fill={b.isFuture ? "url(#cfBand)" : "url(#cfBand)"}
          stroke={b.isFuture ? "rgba(217,255,228,0.25)" : "rgba(149,249,174,0.5)"}
          strokeWidth="1"
          strokeDasharray={b.isFuture ? "3,2" : "0"}
        />;
      })}

      {/* line: actuals solid, projections dashed */}
      {(() => {
        const actualPath = bars.filter((_, i) => i < 10).map((b, i) => `${i === 0 ? "M" : "L"}${b.x},${yFor(b.value)}`).join(" ");
        const projPath = bars.filter((_, i) => i >= 9).map((b, i) => `${i === 0 ? "M" : "L"}${b.x},${yFor(b.value)}`).join(" ");
        return <g>
          <path d={actualPath} fill="none" stroke="#95F9AE" strokeWidth="2.5" />
          <path d={projPath}   fill="none" stroke="#D9FFE4" strokeWidth="2" strokeDasharray="4,3" opacity="0.8" />
        </g>;
      })()}

      {/* dots */}
      {bars.map((b, i) => (
        <circle key={i} cx={b.x} cy={yFor(b.value)} r="3.5"
                fill={b.isFuture ? "var(--black)" : "#95F9AE"}
                stroke={b.isFuture ? "#D9FFE4" : "#050807"}
                strokeWidth="1.5" />
      ))}

      {/* x-axis labels */}
      {bars.map((b, i) => (
        <text key={i} x={b.x} y={h - 8} textAnchor="middle" fontSize="10" fill={b.isFuture ? "#6b7d72" : "#A6B7AC"} fontFamily="JetBrains Mono">W{i + 1}</text>
      ))}
    </svg>
  );
}

