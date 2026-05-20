// @ts-nocheck
"use client"

// -nocheck

"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { PLAYERS, NEWS, TEAM_POSITION_WEEKS, TEAM_FUTURE_WEEKS, POSITION_PERFORMANCE, LEAGUE_POS_AVG } from "@/lib/mock"
import { SectionTitle, TabBar } from "@/components/product/primitives"

export function SnapshotView({ onNavigate, onSelectPlayer }: { onNavigate?: (v: string, s?: string | null) => void; onSelectPlayer?: (p: import("@/lib/mock").Player) => void } = {}) {
  

  const allWeeks = [
  ...TEAM_POSITION_WEEKS.map((w) => ({ ...w, played: true })),
  ...TEAM_FUTURE_WEEKS.map((w) => ({ ...w, played: false }))];


  return (
    <div className="view-enter" style={{ padding: 28, maxWidth: 1440, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>Week 11 · Analytics</div>
          <h1 className="display" style={{ margin: 0, fontSize: 36, color: "var(--mint-soft)" }}>The Vector Reapers</h1>
          <div style={{ marginTop: 6, color: "var(--slate)", fontSize: 13 }}>7–3 · 2nd in league · 1,277 PF · model edge +8.6 pts/wk</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <TabBar tabs={[{ id: "season", label: "Full Season" }, { id: "last4", label: "Last 4" }, { id: "wk11", label: "This Week" }]} value="season" onChange={() => {}} />
        </div>
      </div>

      {/* Main row: chart on left, position blocks on right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <SectionTitle eyebrow="Weekly Performance">Team points · Week over week</SectionTitle>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 14 }}>
            <Legend color="#95F9AE" label="Actual" />
            <Legend color="#D9FFE4" label="Projected" dashed />
            <Legend color="#7BD9F4" label="Expected avg" dotted />
            <Legend color="#A6B7AC" label="Opp projected" dashed dim />
          </div>
          <WoWChart weeks={allWeeks} />
        </div>

        <div className="card" style={{ padding: 22 }}>
          <SectionTitle eyebrow="Pts/Wk by Position Group" action={
          <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.1em", textTransform: "uppercase" }}>vs Expected</span>
          }>Performance</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(POSITION_PERFORMANCE).map(([key, pp]) =>
            <PositionBlock key={key} pos={key} data={pp} />
            )}
          </div>
        </div>
      </div>

      {/* Secondary row: Bench/Starters, Your vs Field, Draft Spend (3 cols) */}
      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.4fr 1.4fr", gap: 16 }}>
        <BenchStartersCard />
        <YourVsFieldCard />
        <DraftSpendCard onSelectPlayer={onSelectPlayer} />
      </div>

      {/* News strip */}
      <div className="card" style={{ padding: 22 }}>
        <SectionTitle eyebrow="Wire · Last 24h" action={<button className="btn ghost" style={{ padding: "5px 10px", fontSize: 11 }}>View all</button>}>News</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {NEWS.map((n, i) => <NewsRow key={i} item={n} />)}
        </div>
      </div>
    </div>);

}

// Legend dot
function Legend({ color, label, dashed, dotted, dim }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{
        display: "inline-block", width: 18, height: 0,
        borderTop: `2px ${dotted ? "dotted" : dashed ? "dashed" : "solid"} ${color}`,
        opacity: dim ? 0.6 : 1
      }} />
      <span className="mono" style={{ fontSize: 11, color: "var(--slate)", letterSpacing: "0.04em" }}>{label}</span>
    </div>);

}

// Week-over-week chart (Image 1 main graph)
function WoWChart({ weeks }) {
  const w = 700,h = 260,padL = 40,padR = 12,padT = 12,padB = 28;
  const max = 180;
  const min = 80;
  const range = max - min;
  const stepX = (w - padL - padR) / (weeks.length - 1);

  function yFor(v) {return h - padB - (v - min) / range * (h - padT - padB);}
  function xFor(i) {return padL + i * stepX;}

  // Build paths
  const playedActual = weeks.filter((wk) => wk.played);
  const actualPath = playedActual.map((wk, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(wk.total)}`).join(" ");
  const projPath = weeks.map((wk, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(wk.proj)}`).join(" ");
  const oppProjPath = weeks.map((wk, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(wk.oppProj)}`).join(" ");

  // Expected season average line (constant)
  const expectedAvg = 127.5;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", height: "390px" }}>
        <defs>
          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#95F9AE" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#95F9AE" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* y-axis gridlines */}
        {[80, 100, 120, 140, 160, 180].map((v) =>
        <g key={v}>
            <line x1={padL} y1={yFor(v)} x2={w - padR} y2={yFor(v)} stroke="#2A4A37" strokeWidth="1" strokeDasharray="2,3" />
            <text x={padL - 6} y={yFor(v) + 3} textAnchor="end" fontSize="9" fill="#6b7d72" fontFamily="JetBrains Mono">{v}</text>
          </g>
        )}
        {/* Future zone shade */}
        {(() => {
          const firstFuture = weeks.findIndex((w) => !w.played);
          if (firstFuture < 0) return null;
          const xStart = xFor(firstFuture - 0.5);
          return <rect x={xStart} y={padT} width={w - padR - xStart} height={h - padT - padB} fill="rgba(149,249,174,0.025)" />;
        })()}
        {/* Expected season avg */}
        <line x1={padL} y1={yFor(expectedAvg)} x2={w - padR} y2={yFor(expectedAvg)} stroke="#7BD9F4" strokeWidth="1.5" strokeDasharray="1,3" opacity="0.7" />
        <text x={w - padR - 4} y={yFor(expectedAvg) - 4} textAnchor="end" fontSize="9" fill="#7BD9F4" fontFamily="JetBrains Mono">Expected {expectedAvg}/wk</text>

        {/* Opp projected dashed */}
        <path d={oppProjPath} fill="none" stroke="#A6B7AC" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
        {/* Projected line dashed mint-soft */}
        <path d={projPath} fill="none" stroke="#D9FFE4" strokeWidth="1.8" strokeDasharray="5,3" opacity="0.75" />
        {/* Actual fill */}
        <path d={actualPath + ` L${xFor(playedActual.length - 1)},${h - padB} L${padL},${h - padB} Z`} fill="url(#actualFill)" />
        {/* Actual line */}
        <path d={actualPath} fill="none" stroke="#95F9AE" strokeWidth="2.5" />

        {/* Dots for actual + labels */}
        {playedActual.map((wk, i) =>
        <g key={i}>
            <circle cx={xFor(i)} cy={yFor(wk.total)} r="3.5" fill={wk.w ? "#95F9AE" : "#FF5E5E"} stroke="#050807" strokeWidth="1.5" />
          </g>
        )}
        {/* Future dots projection only */}
        {weeks.map((wk, i) => !wk.played &&
        <circle key={i} cx={xFor(i)} cy={yFor(wk.proj)} r="3" fill="#050807" stroke="#D9FFE4" strokeWidth="1.5" />
        )}

        {/* x-axis labels */}
        {weeks.map((wk, i) =>
        <text key={i} x={xFor(i)} y={h - 8} textAnchor="middle" fontSize="10" fill={wk.played ? "#A6B7AC" : "#6b7d72"} fontFamily="JetBrains Mono">W{wk.wk}</text>
        )}
      </svg>
    </div>);

}

// Position-group performance block (Image 1 right column)
function PositionBlock({ pos, data }) {
  const diff = (data.actual - data.expected) / data.expected * 100;
  const isUp = diff >= 0;
  const color = isUp ? "var(--mint)" : "var(--red)";
  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--green-900)",
      border: "1px solid var(--green-600)",
      borderRadius: 10,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 3, height: "100%", background: data.color, opacity: 0.5 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{data.slotLabel}</span>
        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color }}>
          {isUp ? "+" : ""}{diff.toFixed(1)}%
        </span>
      </div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="num" style={{ fontSize: 24, color: "var(--mint-soft)" }}>{data.actual.toFixed(1)}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--slate-dim)" }}>pts/wk</span>
      </div>
      <div className="mono" style={{ marginTop: 6, fontSize: 10, color: "var(--slate-dim)", letterSpacing: "0.04em" }}>
        Exp {data.expected.toFixed(1)} · {data.starters}× slot
      </div>
    </div>);

}

// Bench vs Starters card (Image 2 — Paid vs Organic replacement)
function BenchStartersCard() {
  const [pos, setPos] = useState("ALL");
  const positions = ["ALL", "QB", "RB", "WR", "TE"];
  // Mock data: starters vs bench split as % of starter points contributed
  const data = {
    ALL: { starters: 78, bench: 22, sLabel: "Starters", bLabel: "Bench potential", sPts: 1083, bPts: 305 },
    QB: { starters: 92, bench: 8, sLabel: "Starters", bLabel: "Bench potential", sPts: 244, bPts: 22 },
    RB: { starters: 71, bench: 29, sLabel: "Starters", bLabel: "Bench potential", sPts: 348, bPts: 142 },
    WR: { starters: 76, bench: 24, sLabel: "Starters", bLabel: "Bench potential", sPts: 296, bPts: 92 },
    TE: { starters: 81, bench: 19, sLabel: "Starters", bLabel: "Bench potential", sPts: 130, bPts: 31 }
  }[pos];

  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionTitle eyebrow="Roster utilization">Starters vs Bench</SectionTitle>
      <TabBar tabs={positions.map((p) => ({ id: p, label: p }))} value={pos} onChange={setPos} />

      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        <DonutChart segments={[
        { value: data.starters, color: "var(--mint)", label: data.sLabel },
        { value: data.bench, color: "var(--green-700)", label: data.bLabel }]
        } size={150} />
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <Row dot="var(--mint)" label={data.sLabel} pts={data.sPts} pct={data.starters} />
        <Row dot="var(--green-700)" label={data.bLabel} pts={data.bPts} pct={data.bench} />
      </div>
    </div>);

}

function Row({ dot, label, pts, pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--green-600)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: dot }} />
        <span style={{ fontSize: 13, color: "var(--mint-soft)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--slate)" }}>{pts} pts</span>
        <span className="num" style={{ fontSize: 14, color: "var(--mint-soft)", width: 40, textAlign: "right" }}>{pct}%</span>
      </div>
    </div>);

}

function DonutChart({ segments, size = 140 }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = size / 2 - 8;
  const inner = r - 18;
  const cx = size / 2,cy = size / 2;
  let acc = 0;
  function arcPath(start, end) {
    const a0 = start / total * Math.PI * 2 - Math.PI / 2;
    const a1 = end / total * Math.PI * 2 - Math.PI / 2;
    const large = end - start > total / 2 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0),y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1),y1 = cy + r * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0),yi0 = cy + inner * Math.sin(a0);
    const xi1 = cx + inner * Math.cos(a1),yi1 = cy + inner * Math.sin(a1);
    return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${inner},${inner} 0 ${large} 0 ${xi0},${yi0} Z`;
  }
  const pct = (segments[0].value / total * 100).toFixed(0);
  return (
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const path = arcPath(acc, acc + s.value);
        acc += s.value;
        return <path key={i} d={path} fill={s.color} />;
      })}
      <text x={cx} y={cy - 3} textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="22" fill="#D9FFE4">{pct}%</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#A6B7AC" letterSpacing="1">STARTERS</text>
    </svg>);

}

// Your players vs field (Image 2 — Sessions vs CVR replacement)
function YourVsFieldCard() {
  
  const [pos, setPos] = useState("RB");

  // build your-pos series and league-pos avg series
  const yourSeries = TEAM_POSITION_WEEKS.map((w) => {
    if (pos === "QB") return w.QB;
    if (pos === "RB") return (w.RB1 + w.RB2) / 2;
    if (pos === "WR") return (w.WR1 + w.WR2) / 2;
    if (pos === "TE") return w.TE;
    return w.FLEX;
  });
  const fieldSeries = LEAGUE_POS_AVG[pos];

  const max = Math.max(...yourSeries, ...fieldSeries) + 4;
  const min = Math.max(0, Math.min(...yourSeries, ...fieldSeries) - 4);

  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionTitle eyebrow="Position output vs league" action={
      <TabBar tabs={["QB", "RB", "WR", "TE", "FLEX"].map((p) => ({ id: p, label: p }))} value={pos} onChange={setPos} />
      }>Your players vs field</SectionTitle>

      <DualLineChart yourSeries={yourSeries} fieldSeries={fieldSeries} min={min} max={max} />

      <div style={{ marginTop: 14, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Legend color="#95F9AE" label={`Your ${pos}s`} />
        <Legend color="#A6B7AC" label="League avg" dashed />
      </div>
    </div>);

}

function DualLineChart({ yourSeries, fieldSeries, min, max }) {
  const w = 460,h = 200,padL = 32,padR = 8,padT = 8,padB = 24;
  const range = max - min;
  const stepX = (w - padL - padR) / (yourSeries.length - 1);
  function xFor(i) {return padL + i * stepX;}
  function yFor(v) {return h - padB - (v - min) / range * (h - padT - padB);}
  const yourPath = yourSeries.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(v)}`).join(" ");
  const fieldPath = fieldSeries.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      <defs>
        <linearGradient id="yvfFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#95F9AE" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#95F9AE" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const v = min + (1 - t) * range;
        const y = padT + t * (h - padT - padB);
        return <g key={t}>
          <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2A4A37" strokeDasharray="2,3" />
          <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7d72" fontFamily="JetBrains Mono">{v.toFixed(0)}</text>
        </g>;
      })}
      <path d={fieldPath} fill="none" stroke="#A6B7AC" strokeWidth="1.5" strokeDasharray="4,3" />
      <path d={yourPath + ` L${xFor(yourSeries.length - 1)},${h - padB} L${padL},${h - padB} Z`} fill="url(#yvfFill)" />
      <path d={yourPath} fill="none" stroke="#95F9AE" strokeWidth="2.5" />
      {yourSeries.map((v, i) =>
      <circle key={i} cx={xFor(i)} cy={yFor(v)} r="3" fill="#95F9AE" stroke="#050807" strokeWidth="1.5" />
      )}
      {yourSeries.map((_, i) =>
      <text key={"x" + i} x={xFor(i)} y={h - 6} textAnchor="middle" fontSize="9" fill="#A6B7AC" fontFamily="JetBrains Mono">W{i + 1}</text>
      )}
    </svg>);

}

// Draft Spend (Image 2 — Acquisition Metrics replacement) — 3 line chart
function DraftSpendCard({ onSelectPlayer }) {
  
  // Use rounds 1-6 with your player drafted that round
  const drafted = [...PLAYERS].sort((a, b) => a.adp - b.adp).slice(0, 6);
  // Round bests (mock) — points-on-year for highest scorer in that draft round
  const roundBest = [298, 268, 252, 234, 220, 198];
  // Position-group bests — highest scorer in your player's position group
  const posBest = [325, 310, 290, 264, 248, 220];

  const max = Math.max(...drafted.map((p) => p.ros), ...roundBest, ...posBest);
  const min = 100;
  const w = 460,h = 200,padL = 32,padR = 8,padT = 8,padB = 28;
  const range = max - min;
  const stepX = (w - padL - padR) / (drafted.length - 1);
  function xFor(i) {return padL + i * stepX;}
  function yFor(v) {return h - padB - (v - min) / range * (h - padT - padB);}

  const yourPath = drafted.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(p.ros)}`).join(" ");
  const roundPath = drafted.map((_, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(roundBest[i])}`).join(" ");
  const posPath = drafted.map((_, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(posBest[i])}`).join(" ");

  return (
    <div className="card" style={{ padding: 22 }}>
      <SectionTitle eyebrow="Draft retrospective" action={<span className="chip mint">+8.6 net edge</span>}>Draft spend</SectionTitle>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ marginTop: 4 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = min + (1 - t) * range;
          const y = padT + t * (h - padT - padB);
          return <g key={t}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2A4A37" strokeDasharray="2,3" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7d72" fontFamily="JetBrains Mono">{v.toFixed(0)}</text>
          </g>;
        })}
        <path d={posPath} fill="none" stroke="#7BD9F4" strokeWidth="2" strokeDasharray="3,3" />
        <path d={roundPath} fill="none" stroke="#D9FFE4" strokeWidth="2" strokeDasharray="5,3" />
        <path d={yourPath} fill="none" stroke="#95F9AE" strokeWidth="2.5" />
        {drafted.map((p, i) =>
        <g key={p.id} style={{ cursor: "pointer" }} onClick={() => onSelectPlayer && onSelectPlayer(p)}>
            <circle cx={xFor(i)} cy={yFor(p.ros)} r="4" fill="#95F9AE" stroke="#050807" strokeWidth="1.5" />
            <circle cx={xFor(i)} cy={yFor(roundBest[i])} r="2.5" fill="#D9FFE4" stroke="#050807" strokeWidth="1.5" />
            <circle cx={xFor(i)} cy={yFor(posBest[i])} r="2.5" fill="#7BD9F4" stroke="#050807" strokeWidth="1.5" />
            <text x={xFor(i)} y={h - 14} textAnchor="middle" fontSize="9" fill="#A6B7AC" fontFamily="JetBrains Mono">R{i + 1}</text>
            <text x={xFor(i)} y={h - 4} textAnchor="middle" fontSize="9" fill="#6b7d72" fontFamily="JetBrains Mono">{p.name.split(" ").map((s) => s[0]).join("")}</text>
          </g>
        )}
      </svg>
      <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Legend color="#95F9AE" label="Your pick (ROS pts)" />
        <Legend color="#D9FFE4" label="Best in round" dashed />
        <Legend color="#7BD9F4" label="Best at position" dotted />
      </div>
    </div>);

}

function NewsRow({ item }) {
  const sev = {
    warn: { c: "var(--gold)", bg: "rgba(242,201,76,0.08)" },
    info: { c: "var(--mint-soft)", bg: "rgba(217,255,228,0.04)" },
    good: { c: "var(--mint)", bg: "rgba(149,249,174,0.08)" },
    bad: { c: "var(--red)", bg: "rgba(255,94,94,0.08)" }
  }[item.severity];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 12px", borderRadius: 8, background: sev.bg, border: `1px solid ${sev.c}25` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="mono" style={{ fontSize: 9, fontWeight: 700, color: sev.c, padding: "3px 6px", borderRadius: 3, border: `1px solid ${sev.c}40`, letterSpacing: "0.05em" }}>{item.tag}</div>
        <span className="mono" style={{ fontSize: 9, color: "var(--slate-dim)" }}>{item.time}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--mint-soft)", lineHeight: 1.4 }}>{item.text}</div>
    </div>);

}

// Maintain old export name for compatibility
const DashboardView = SnapshotView;
