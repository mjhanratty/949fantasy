// @ts-nocheck
"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import {
  PLAYERS,
  ROSTER_IDS,
  NFL_MAP_MARKERS,
  WEEK11_GAMES,
  US_MAP_PATHS,
  mapSiteForTeam,
  WEEK11_HOME_AT_SHARED,
} from "@/lib/mock"
import { TeamChip, SectionTitle } from "@/components/product/primitives"

// Stadium map — embedded in Start/Sit. Shows NFL cities + this week's games.
// Hover any city to see game time, opponent, weather, and your players in that game.

export function StadiumMap({ onSelectPlayer }) {
  
  const [hoverCity, setHoverCity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Build city game data — opponent, weather, players-of-interest
  // Match cities up with games this week (Week 11)
  const statusRank = { you: 4, opp: 3, neutral: 2, off: 1 };

  const cityGameData = useMemo(() => {
    const map = {};
    NFL_MAP_MARKERS.forEach((marker) => {
      const teams = marker.teamsAtSite;
      let status = "off";
      for (const t of teams) {
        const s = WEEK11_GAMES[t] || "off";
        if ((statusRank[s] ?? 0) > (statusRank[status] ?? 0)) status = s;
      }
      const homePlayers = PLAYERS.filter(
        (p) => teams.includes(p.team) && ROSTER_IDS.includes(p.id)
      );
      const labelTeam = marker.team;
      const sameTeamPlayer = PLAYERS.find((p) => p.team === labelTeam);
      let opponent = sameTeamPlayer
        ? sameTeamPlayer.matchup.replace("@", "").replace("vs ", "").trim()
        : null;
      const sharedNote =
        teams.length > 1
          ? ` · Home: ${WEEK11_HOME_AT_SHARED[labelTeam] ?? labelTeam}`
          : "";
      map[labelTeam] = {
        ...marker,
        city: marker.city,
        status,
        homePlayers,
        opponent,
        teamsAtSite: teams,
        kickoff: "Sun 1:00pm ET",
        weather: marker.indoor
          ? "Dome · 72°F"
          : [
              "Clear · 38°F · 6mph wind",
              "Partly cloudy · 52°F",
              "Rain · 44°F · 12mph wind",
              "Snow · 28°F · 8mph wind",
              "Clear · 64°F",
            ][labelTeam.charCodeAt(0) % 5] + sharedNote,
      };
    });
    return map;
  }, []);

  const statusColor = {
    you:     "var(--mint)",       // your player
    opp:     "#7BD9F4",           // opponent's player
    neutral: "var(--gold)",        // game w/o either
    off:     "var(--slate-dim)",   // bye / no game
  };

  const statusLabel = {
    you: "Your player",
    opp: "Opponent's player",
    neutral: "No fantasy stake",
    off: "Bye / no game",
  };

  return (
    <div className="card" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
        <SectionTitle eyebrow="Week 11 · Around the league">Stadium map</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
          {Object.entries(statusLabel).map(([k, v]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[k], boxShadow: k !== "off" ? `0 0 8px ${statusColor[k]}80` : "none" }} />
              <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{v}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", aspectRatio: "2000 / 1200", background: "linear-gradient(135deg, var(--green-900), var(--black))", borderRadius: 16, overflow: "hidden", border: "1px solid var(--green-600)" }}>
        <svg viewBox="0 0 2000 1200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: "block" }}>
          {/* faint lat/lng grid */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={"v" + i} x1={i * 200} y1="0" x2={i * 200} y2="1200" stroke="rgba(149,249,174,0.04)" strokeWidth="2" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={"h" + i} x1="0" y1={i * 200} x2="2000" y2={i * 200} stroke="rgba(149,249,174,0.04)" strokeWidth="2" />
          ))}

          {/* US outline + state boundaries from user-provided SVG */}
          {US_MAP_PATHS && (
            <g>
              <path d={US_MAP_PATHS.outline}
                    fill="rgba(217,255,228,0.08)"
                    stroke="rgba(149,249,174,0.28)"
                    strokeWidth="2"
                    strokeLinejoin="round" />
              <path d={US_MAP_PATHS.boundaries}
                    fill="none"
                    stroke="rgba(42,74,55,0.7)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round" />
            </g>
          )}

          {/* City dots */}
          {NFL_MAP_MARKERS.map((marker) => {
            const cg = cityGameData[marker.team];
            if (!cg) return null;
            const c = statusColor[cg.status];
            const active = cg.status !== "off";
            const isHover = hoverCity === marker.team;
            const r = active ? (isHover ? 18 : 14) : 8;
            return (
              <g key={marker.team}
                 onMouseEnter={() => { setHoverCity(marker.team); setTooltipPos({ x: marker.x, y: marker.y }); }}
                 onMouseLeave={() => setHoverCity(null)}
                 style={{ cursor: active ? "pointer" : "default" }}>
                {active && (
                  <circle cx={marker.x} cy={marker.y} r={r + 12} fill={c} opacity="0.15" />
                )}
                <circle cx={marker.x} cy={marker.y} r={r}
                        fill={active ? c : "transparent"}
                        stroke={c}
                        strokeWidth={active ? 3 : 2}
                        opacity={active ? 1 : 0.6} />
                {(isHover || cg.status === "you") && (
                  <text x={marker.x} y={marker.y - 28} textAnchor="middle" fontSize="22" fontFamily="JetBrains Mono" fill={c} fontWeight="700">{marker.team}</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoverCity && (() => {
          const cg = cityGameData[hoverCity];
          if (!cg) return null;
          const leftPct = (tooltipPos.x / 2000) * 100;
          const topPct  = (tooltipPos.y / 1200) * 100;
          const flipRight = leftPct > 70;
          const flipUp    = topPct > 60;
          return (
            <div style={{
              position: "absolute",
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: `translate(${flipRight ? "-110%" : "20px"}, ${flipUp ? "-110%" : "10px"})`,
              padding: 14,
              background: "rgba(5,8,7,0.96)",
              border: "1px solid var(--green-600)",
              borderRadius: 12,
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              minWidth: 240, maxWidth: 280,
              backdropFilter: "blur(8px)",
              zIndex: 10,
              pointerEvents: "none"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, color: statusColor[cg.status], letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {statusLabel[cg.status]}
                  </div>
                  <div className="display" style={{ marginTop: 2, fontSize: 18, color: "var(--mint-soft)" }}>{cg.city}</div>
                </div>
                <TeamChip team={cg.team} size="sm" />
              </div>

              {cg.status !== "off" && cg.opponent && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--mint-soft)" }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--slate)" }}>Matchup</span>
                  <div style={{ marginTop: 3 }}>{cg.team} vs {cg.opponent}</div>
                </div>
              )}

              {cg.status !== "off" && (
                <div className="mono" style={{ marginTop: 8, fontSize: 11, color: "var(--slate)", letterSpacing: "0.02em" }}>
                  {cg.kickoff} · {cg.weather}
                </div>
              )}

              {cg.homePlayers && cg.homePlayers.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--green-600)" }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--mint)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Your players ({cg.homePlayers.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {cg.homePlayers.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--mint-soft)" }}>{p.name}</span>
                        <span className="mono" style={{ fontSize: 10, color: "var(--mint)" }}>{p.pos} · {p.proj.toFixed(1)} proj</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cg.status === "off" && (
                <div className="mono" style={{ marginTop: 8, fontSize: 11, color: "var(--slate-dim)" }}>
                  Team is on bye this week.
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Bottom strip — your players' game contexts */}
      <YourGamesStrip cityGameData={cityGameData} onSelectPlayer={onSelectPlayer} />
    </div>
  );
}

function YourGamesStrip({ cityGameData, onSelectPlayer }) {
  
  // For each roster player, get their game context
  const games = ROSTER_IDS.map(id => {
    const p = PLAYERS.find(x => x.id === id);
    if (!p) return null;
    const site = mapSiteForTeam(p.team, WEEK11_HOME_AT_SHARED);
    const cg = cityGameData[site.displayTeam];
    return { player: p, ctx: cg };
  }).filter(Boolean);

  return (
    <div style={{ marginTop: 18 }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--mint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Your players this week</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
        {games.map(({ player, ctx }) => (
          <button key={player.id} onClick={() => onSelectPlayer && onSelectPlayer(player)} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
            padding: 10, borderRadius: 8,
            background: "var(--green-900)", border: "1px solid var(--green-600)",
            cursor: "pointer", textAlign: "left",
            transition: "border-color 0.12s"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--mint)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--green-600)"}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "var(--mint-soft)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--slate)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {player.pos} · {ctx ? ctx.city : player.team} · {ctx && !ctx.indoor ? "Outdoor" : "Dome"}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="num" style={{ fontSize: 14, color: "var(--mint)" }}>{player.proj.toFixed(1)}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--slate-dim)" }}>proj</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

