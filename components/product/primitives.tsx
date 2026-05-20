// @ts-nocheck
"use client"

import type { Player } from "@/lib/mock"
import { TEAMS } from "@/lib/mock"

// Shared visualization primitives

// Sparkline — small inline chart for trajectory
export function Sparkline({ data, width = 80, height = 28, color, fill = true, dashed = false }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = d + ` L${width},${height} L0,${height} Z`;
  const trend = data[data.length - 1] - data[0];
  const stroke = color || (trend > 0 ? "var(--mint)" : trend < 0 ? "var(--red)" : "var(--slate)");
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray={dashed ? "3,2" : "0"} />
    </svg>
  );
}

// Trend chip with arrow + delta
export function TrendDelta({ value, suffix = "" }) {
  if (value == null) return <span className="mono" style={{ color: "var(--slate-dim)" }}>—</span>;
  const up = value > 0;
  const flat = value === 0;
  const color = flat ? "var(--slate)" : up ? "var(--mint)" : "var(--red)";
  const arrow = flat ? "—" : up ? "▲" : "▼";
  return (
    <span className="mono" style={{ color, fontSize: 12, fontWeight: 600 }}>
      {arrow} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

// Team chip — small colored block + abbr
export function TeamChip({ team, size = "md" }) {
  const meta = TEAMS[team] || { color: "#2A4A37", name: team };
  const sizes = { sm: { font: 10, pad: "2px 6px" }, md: { font: 11, pad: "3px 8px" }, lg: { font: 12, pad: "4px 10px" } };
  const s = sizes[size];
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: s.pad, borderRadius: 4, fontSize: s.font, fontWeight: 600,
      letterSpacing: "0.04em", color: "var(--mint-soft)",
      background: "rgba(255,255,255,0.04)", border: "1px solid var(--green-600)"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 1, background: meta.color, boxShadow: `0 0 0 1px rgba(255,255,255,0.1)` }} />
      {team}
    </span>
  );
}

// Position pill
export function PosPill({ pos }) {
  const colors = {
    QB: "#F2C94C", RB: "#95F9AE", WR: "#7BD9F4", TE: "#D9A6F4", K: "#A6B7AC", DST: "#FF9E5E"
  };
  const c = colors[pos] || "var(--mint)";
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 18, borderRadius: 3, fontSize: 10, fontWeight: 700,
      color: c, border: `1px solid ${c}40`, background: `${c}10`, letterSpacing: "0.05em"
    }}>{pos}</span>
  );
}

// Player row — name + meta
export function PlayerCell({ player, mini = false }) {
  const team = TEAMS[player.team] || { color: "#2A4A37" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: mini ? 32 : 38, height: mini ? 32 : 38, borderRadius: 8,
        background: `linear-gradient(135deg, ${team.color}, var(--green-800))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Space Grotesk", fontWeight: 700, fontSize: mini ? 12 : 14, color: "white",
        border: "1px solid var(--green-600)", flexShrink: 0
      }}>{player.num}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: mini ? 12 : 13, fontWeight: 600, color: "var(--mint-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <PosPill pos={player.pos} />
          <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.04em" }}>{player.team} · {player.matchup}</span>
        </div>
      </div>
    </div>
  );
}

// Matchup rating — 1-5 bars (5 best)
export function MatchupBars({ rating }) {
  return (
    <div style={{ display: "inline-flex", gap: 2, alignItems: "flex-end", height: 14 }}>
      {[1,2,3,4,5].map(i => {
        const active = i <= rating;
        const color = rating >= 4 ? "var(--mint)" : rating === 3 ? "var(--slate)" : "var(--red)";
        return (
          <span key={i} style={{
            width: 3, height: 4 + (i * 2),
            background: active ? color : "var(--green-600)",
            borderRadius: 1, opacity: active ? 1 : 0.5
          }} />
        );
      })}
    </div>
  );
}

// Risk dot
export function RiskDot({ risk }) {
  const map = { low: "var(--mint)", med: "var(--gold)", high: "var(--red)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: map[risk] || "var(--slate)" }} />
      <span className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{risk}</span>
    </span>
  );
}

// Big stat card
export function StatCard({ label, value, suffix, delta, trend, foot, accent }) {
  return (
    <div className="card" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="mono" style={{ fontSize: 11, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        {delta != null && <TrendDelta value={delta} />}
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="stat-num" style={{ fontSize: 38, color: accent || "var(--mint-soft)" }}>{value}</span>
        {suffix && <span className="mono" style={{ fontSize: 13, color: "var(--slate)" }}>{suffix}</span>}
      </div>
      {trend && (
        <div style={{ marginTop: 10, marginLeft: -4 }}>
          <Sparkline data={trend} width={180} height={32} />
        </div>
      )}
      {foot && (
        <div className="mono" style={{ marginTop: 10, fontSize: 11, color: "var(--slate-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{foot}</div>
      )}
    </div>
  );
}

// Section title with optional action
export function SectionTitle({ children, action, eyebrow }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        {eyebrow && <div className="mono" style={{ fontSize: 10, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>{eyebrow}</div>}
        <h2 className="display" style={{ margin: 0, fontSize: 22, color: "var(--mint-soft)", fontWeight: 700 }}>{children}</h2>
      </div>
      {action}
    </div>
  );
}

// Bar gauge — horizontal value
export function Gauge({ value, max = 100, color = "var(--mint)", height = 4 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: "100%", height, background: "var(--green-600)", borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: height / 2 }} />
    </div>
  );
}

// Tab bar
export function TabBar({ tabs, value, onChange }) {
  return (
    <div style={{ display: "inline-flex", padding: 4, gap: 2, background: "var(--green-900)", borderRadius: 10, border: "1px solid var(--green-600)" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
          background: value === t.id ? "var(--green-700)" : "transparent",
          color: value === t.id ? "var(--mint)" : "var(--slate)",
          fontSize: 12, fontWeight: 600, fontFamily: "Geist", letterSpacing: "0.02em",
          transition: "all 0.15s"
        }}>{t.label}{t.count != null && <span className="mono" style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>{t.count}</span>}</button>
      ))}
    </div>
  );
}

