function LineupView({ onSelectPlayer }) {
  const { PLAYERS, ROSTER_IDS } = window;
  const roster = ROSTER_IDS.map(id => PLAYERS.find(p => p.id === id)).filter(Boolean);

  // Lineup slots
  const SLOTS = [
    { id: "qb",   label: "QB",   accept: ["QB"] },
    { id: "rb1",  label: "RB",   accept: ["RB"] },
    { id: "rb2",  label: "RB",   accept: ["RB"] },
    { id: "wr1",  label: "WR",   accept: ["WR"] },
    { id: "wr2",  label: "WR",   accept: ["WR"] },
    { id: "te",   label: "TE",   accept: ["TE"] },
    { id: "flex", label: "FLEX", accept: ["RB", "WR", "TE"] },
  ];

  // Initial fill
  const initial = {
    qb: "jallen", rb1: "cmcaff", rb2: "saquon", wr1: "jchase", wr2: "puka", te: "kelce", flex: "amon",
  };
  const [lineup, setLineup] = React.useState(initial);
  const [optimized, setOptimized] = React.useState(false);
  const [openSlot, setOpenSlot] = React.useState(null);

  const usedIds = new Set(Object.values(lineup));
  const bench = roster.filter(p => !usedIds.has(p.id));

  const total = Object.values(lineup).reduce((s, id) => {
    const p = PLAYERS.find(x => x.id === id);
    return s + (p ? p.proj : 0);
  }, 0);
  const ceiling = Object.values(lineup).reduce((s, id) => {
    const p = PLAYERS.find(x => x.id === id);
    return s + (p ? p.proj * 1.5 : 0);
  }, 0);
  const floor = Object.values(lineup).reduce((s, id) => {
    const p = PLAYERS.find(x => x.id === id);
    return s + (p ? p.proj * 0.55 : 0);
  }, 0);

  function optimize() {
    // Swap saquon -> bijan ... wait bijan isn't in roster. Try henry for rb2; amon for flex stays.
    // Real heuristic: pick highest proj per slot from owned players
    const owned = roster.slice();
    const used = new Set();
    const newLineup = {};
    for (const slot of SLOTS) {
      const eligible = owned
        .filter(p => slot.accept.includes(p.pos) && !used.has(p.id))
        .sort((a, b) => b.proj - a.proj);
      if (eligible[0]) {
        newLineup[slot.id] = eligible[0].id;
        used.add(eligible[0].id);
      }
    }
    setLineup(newLineup);
    setOptimized(true);
  }

  function reset() { setLineup(initial); setOptimized(false); }

  function swap(slotId, newPlayerId) {
    setLineup(prev => {
      const next = { ...prev };
      // if the new player is already in another slot, move the current slot's player there
      const otherSlot = Object.keys(next).find(k => next[k] === newPlayerId && k !== slotId);
      if (otherSlot) next[otherSlot] = prev[slotId];
      next[slotId] = newPlayerId;
      return next;
    });
    setOpenSlot(null);
  }

  return (
    <div className="view-enter" style={{ maxWidth: 1280, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>Week 11 · Lineup builder</div>
          <h1 className="display" style={{ margin: 0, fontSize: 40, color: "var(--mint-soft)" }}>Start / Sit Studio</h1>
          <p style={{ marginTop: 8, color: "var(--slate)", fontSize: 14 }}>Drag players, tap to swap, or hit Auto-optimize. Locks Sunday 1pm ET.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn ghost" onClick={reset}>Reset</button>
          <button className="btn" onClick={optimize}>
            <window.IconBolt size={14} stroke="var(--black)" />
            Auto-optimize
          </button>
        </div>
      </div>

      {/* Projection bar */}
      <div className="card" style={{ padding: 24, marginBottom: 20, position: "relative", overflow: "hidden" }}>
        {optimized && (
          <div style={{ position: "absolute", top: 18, right: 18, padding: "6px 12px", borderRadius: 999, background: "rgba(149,249,174,0.1)", border: "1px solid rgba(149,249,174,0.4)", color: "var(--mint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Optimized</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32, alignItems: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Projected total</div>
            <div className="num" style={{ marginTop: 8, fontSize: 56, color: "var(--mint)", lineHeight: 0.95 }}>{total.toFixed(1)}</div>
            <div className="mono" style={{ marginTop: 6, fontSize: 11, color: "var(--slate-dim)" }}>PPR scoring · vs opp proj 118.4</div>
          </div>
          <RangeStat label="Floor"   value={floor.toFixed(1)}    color="var(--slate)" sub="5th percentile" />
          <RangeStat label="Median"  value={total.toFixed(1)}    color="var(--mint-soft)" sub="50th percentile" />
          <RangeStat label="Ceiling" value={ceiling.toFixed(1)}  color="var(--mint)" sub="95th percentile" />
        </div>

        {/* Distribution bar */}
        <div style={{ marginTop: 24 }}>
          <div style={{ position: "relative", height: 6, background: "var(--green-600)", borderRadius: 3 }}>
            <div style={{ position: "absolute", left: "30%", right: "20%", height: "100%", borderRadius: 3, background: "linear-gradient(to right, var(--slate), var(--mint))", opacity: 0.7 }} />
            <div style={{ position: "absolute", left: "50%", top: -4, width: 2, height: 14, background: "var(--mint)", borderRadius: 1 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--slate)" }}>50 pts</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--slate)" }}>250 pts</span>
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <SectionTitle eyebrow="Starting Lineup">Active roster</SectionTitle>
        <div style={{ display: "grid", gap: 8 }}>
          {SLOTS.map(slot => {
            const p = PLAYERS.find(x => x.id === lineup[slot.id]);
            return (
              <LineupSlot
                key={slot.id}
                slot={slot}
                player={p}
                onClick={() => onSelectPlayer(p)}
                onSwapClick={() => setOpenSlot(slot.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Bench */}
      <div className="card" style={{ padding: 24 }}>
        <SectionTitle eyebrow="Bench" action={<span className="chip">{bench.length} players</span>}>Bench & reserves</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {bench.map(p => (
            <button key={p.id} onClick={() => onSelectPlayer(p)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              padding: "10px 12px", borderRadius: 10,
              background: "var(--green-900)", border: "1px solid var(--green-600)",
              cursor: "pointer", textAlign: "left", transition: "border-color 0.12s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--mint)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--green-600)"}>
              <PlayerCell player={p} mini />
              <div style={{ textAlign: "right" }}>
                <div className="num" style={{ fontSize: 14, color: "var(--mint-soft)" }}>{p.proj.toFixed(1)}</div>
                <div style={{ marginTop: 2 }}><MatchupBars rating={p.matchupRating} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stadium map */}
      <div style={{ marginTop: 20 }}>
        <StadiumMap onSelectPlayer={onSelectPlayer} />
      </div>

      {/* Swap dialog */}
      {openSlot && (
        <SwapDialog
          slot={SLOTS.find(s => s.id === openSlot)}
          current={PLAYERS.find(p => p.id === lineup[openSlot])}
          options={[...roster.filter(p => SLOTS.find(s => s.id === openSlot).accept.includes(p.pos))].sort((a, b) => b.proj - a.proj)}
          onSelect={(pid) => swap(openSlot, pid)}
          onClose={() => setOpenSlot(null)}
        />
      )}
    </div>
  );
}

function RangeStat({ label, value, color, sub }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div className="num" style={{ marginTop: 6, fontSize: 28, color }}>{value}</div>
      <div className="mono" style={{ marginTop: 4, fontSize: 10, color: "var(--slate-dim)", letterSpacing: "0.03em" }}>{sub}</div>
    </div>
  );
}

function LineupSlot({ slot, player, onClick, onSwapClick }) {
  if (!player) return null;
  const advice = player.matchupRating >= 4 ? "Start" : player.matchupRating <= 2 ? "Risk" : "Lean";
  const adviceColor = advice === "Start" ? "var(--mint)" : advice === "Risk" ? "var(--red)" : "var(--gold)";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "70px 1.4fr 1fr 100px 100px 110px",
      gap: 16, alignItems: "center",
      padding: "12px 16px", borderRadius: 12,
      background: "var(--green-900)", border: "1px solid var(--green-600)",
      transition: "border-color 0.12s",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 44, borderRadius: 8,
        background: slot.id === "flex" ? "rgba(149,249,174,0.08)" : "var(--green-800)",
        border: slot.id === "flex" ? "1px dashed rgba(149,249,174,0.4)" : "1px solid var(--green-600)",
        color: slot.id === "flex" ? "var(--mint)" : "var(--mint-soft)",
        fontSize: 12, fontWeight: 700, fontFamily: "Space Grotesk", letterSpacing: "0.05em"
      }}>{slot.label}</div>

      <button onClick={onClick} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
        <PlayerCell player={player} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Sparkline data={player.traj.slice(-8)} width={70} height={26} fill={false} />
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Last 8 wks</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mint-soft)", marginTop: 2 }}>avg {(player.traj.slice(-8).reduce((a, b) => a + b, 0) / 8).toFixed(1)}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        <span className="mono" style={{ fontSize: 9, color: "var(--slate)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Matchup</span>
        <MatchupBars rating={player.matchupRating} />
      </div>

      <div>
        <div className="mono" style={{ fontSize: 9, color: "var(--slate)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Proj</div>
        <div className="num" style={{ fontSize: 22, color: "var(--mint)" }}>{player.proj.toFixed(1)}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6 }}>
        <span style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
          textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase",
          color: adviceColor, background: `${adviceColor}12`, border: `1px solid ${adviceColor}40`,
          fontFamily: "JetBrains Mono"
        }}>{advice}</span>
        <button onClick={onSwapClick} className="btn ghost" style={{ padding: "5px 8px", fontSize: 11, justifyContent: "center" }}>
          <window.IconSwap size={12} /> Swap
        </button>
      </div>
    </div>
  );
}

function SwapDialog({ slot, current, options, onSelect, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(5,8,7,0.7)",
      backdropFilter: "blur(6px)", zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, maxWidth: "90vw", maxHeight: "80vh", overflow: "auto",
        background: "var(--green-900)", border: "1px solid var(--green-600)",
        borderRadius: 16, padding: 24, boxShadow: "0 30px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "var(--mint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Swap {slot.label}</div>
            <div className="display" style={{ marginTop: 4, fontSize: 22, color: "var(--mint-soft)" }}>Choose player</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--slate)", cursor: "pointer", padding: 4 }}><window.IconClose size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map(p => {
            const active = p.id === current.id;
            return (
              <button key={p.id} onClick={() => onSelect(p.id)} style={{
                display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 12,
                padding: 12, borderRadius: 10,
                background: active ? "rgba(149,249,174,0.06)" : "transparent",
                border: active ? "1px solid rgba(149,249,174,0.4)" : "1px solid var(--green-600)",
                cursor: "pointer", textAlign: "left"
              }}>
                <PlayerCell player={p} mini />
                <MatchupBars rating={p.matchupRating} />
                <div className="num" style={{ fontSize: 18, color: "var(--mint)" }}>{p.proj.toFixed(1)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LineupView });
