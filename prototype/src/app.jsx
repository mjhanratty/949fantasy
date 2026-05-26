const { useState, useEffect, useRef } = React;

// ============================================================
// Nav menu definitions
// ============================================================
const NAV = [
  { id: "analytics", label: "Analytics" },
  { id: "lineup",    label: "Start / Sit" },
  { id: "draft",     label: "Draft", subs: [
    { id: "board",    label: "Draft Board" },
    { id: "rankings", label: "Rankings (Pre-Season)" },
  ]},
  { id: "metrics",   label: "Metrics",    subs: [
    { id: "weekly",    label: "Weekly Points" },
    { id: "standings", label: "Standings" },
    { id: "position",  label: "Position Metrics" },
  ]},
  { id: "statistics", label: "Statistics", subs: [
    { id: "performance", label: "Performance" },
    { id: "trends",      label: "Player Trends" },
  ]},
  { id: "projections", label: "Projections", subs: [
    { id: "tape",        label: "Player Tape" },
    { id: "rankings",    label: "Player Breakdown" },
    { id: "lineup-opt",  label: "Lineup Optimizer" },
  ]},
];

// ============================================================
// Top navigation
// ============================================================
function TopNav({ current, sub, onNavigate, collapsed, setCollapsed }) {
  const [openDrop, setOpenDrop] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpenDrop(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(5,8,7,0.92)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--green-600)",
    }}>
      <div style={{
        maxWidth: 1440, margin: "0 auto",
        padding: "12px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
      }}>
        {/* Brand + collapse toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => onNavigate("landing")} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "transparent", border: "none", cursor: "pointer", padding: 0
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "var(--mint)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, color: "var(--black)",
              letterSpacing: "-0.04em",
              boxShadow: "0 10px 28px rgba(149,249,174,0.18)"
            }}>949</div>
            {!collapsed && (
              <div style={{ textAlign: "left" }}>
                <div className="display" style={{ fontSize: 15, color: "var(--mint-soft)", fontWeight: 700, lineHeight: 1 }}>949Fantasy</div>
                <div style={{ fontSize: 10, color: "var(--slate)", marginTop: 3, letterSpacing: "0.04em" }}>Fantasy intelligence platform</div>
              </div>
            )}
          </button>

          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expand nav" : "Collapse nav"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 24, height: 24, marginLeft: 4,
              background: "transparent", border: "1px solid var(--green-600)", borderRadius: 6,
              color: "var(--slate)", cursor: "pointer"
            }}>
            <span style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", display: "inline-flex" }}>
              <window.IconChevron size={12} />
            </span>
          </button>
        </div>

        {/* Center nav (hidden when collapsed) */}
        {!collapsed && (
          <nav ref={dropRef} style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {NAV.map(item => {
              const active = current === item.id;
              const hasSub = !!item.subs;
              const isOpen = openDrop === item.id;
              return (
                <div key={item.id} style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      if (hasSub) {
                        setOpenDrop(isOpen ? null : item.id);
                      } else {
                        onNavigate(item.id);
                        setOpenDrop(null);
                      }
                    }}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      background: active ? "rgba(149,249,174,0.08)" : "transparent",
                      color: active ? "var(--mint)" : "var(--slate)",
                      fontSize: 13, fontWeight: 500, fontFamily: "Sora",
                      cursor: "pointer", transition: "all 0.12s",
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--mint-soft)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--slate)"; }}>
                    {item.label}
                    {hasSub && <span style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", display: "inline-flex", transition: "transform 0.15s" }}><window.IconChevron size={10} /></span>}
                  </button>

                  {hasSub && isOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 6px)", left: 0,
                      minWidth: 200, padding: 6,
                      background: "var(--green-900)",
                      border: "1px solid var(--green-600)",
                      borderRadius: 10,
                      boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                      zIndex: 50,
                      animation: "fadeIn 0.15s ease both"
                    }}>
                      {item.subs.map(s => {
                        const activeSub = active && sub === s.id;
                        return (
                          <button key={s.id} onClick={() => { onNavigate(item.id, s.id); setOpenDrop(null); }} style={{
                            display: "block", width: "100%", textAlign: "left",
                            padding: "9px 12px", borderRadius: 6, border: "none",
                            background: activeSub ? "rgba(149,249,174,0.1)" : "transparent",
                            color: activeSub ? "var(--mint)" : "var(--mint-soft)",
                            fontSize: 12, fontFamily: "Sora", cursor: "pointer", transition: "background 0.1s"
                          }}
                            onMouseEnter={e => { if (!activeSub) e.currentTarget.style.background = "rgba(149,249,174,0.04)"; }}
                            onMouseLeave={e => { if (!activeSub) e.currentTarget.style.background = "transparent"; }}>
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button title="Notifications" style={{
            background: "transparent", border: "1px solid var(--green-600)",
            borderRadius: 8, padding: 8, cursor: "pointer", color: "var(--slate)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative"
          }}>
            <window.IconBell size={15} />
            <span style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, borderRadius: "50%", background: "var(--mint)" }} />
          </button>
          <button title="Settings" style={{
            background: "transparent", border: "1px solid var(--green-600)",
            borderRadius: 8, padding: 8, cursor: "pointer", color: "var(--slate)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <window.IconSettings size={15} />
          </button>
          <button className="btn" style={{ padding: "8px 14px", fontSize: 12 }}>
            Season Pass
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// App
// ============================================================
function App() {
  const [view, setView] = useState("landing");
  const [sub, setSub] = useState(null);
  const [selected, setSelected] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  function navigate(v, s = null) {
    setView(v);
    setSub(s);
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectPlayer(p) {
    setSelected(p);
    setView("player");
    setSub(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Expose for programmatic / export navigation
  useEffect(() => {
    window.__goToView = (v, s = null) => {
      if (v === "player") {
        setSelected(window.PLAYERS.find(p => p.id === "jchase"));
        setView("player");
        setSub(null);
      } else {
        setSelected(null);
        setView(v);
        setSub(s);
      }
      window.scrollTo(0, 0);
    };
  }, []);

  useEffect(() => {
    if (typeof window.hydrateDemoDataFromApi === "function") {
      window.hydrateDemoDataFromApi();
    } else if (typeof window.hydrateNflTeamsFromApi === "function") {
      window.hydrateNflTeamsFromApi();
    }
  }, []);

  // Smart current/sub mapping for nav highlight
  const navCurrent = view === "player" ? "projections" :
                     view === "rankings" ? "projections" :
                     view;

  // Smart subtab default
  const metricsTab = (view === "metrics" && sub) || "weekly";
  const statsTab   = (view === "statistics" && sub) || "performance";

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", color: "var(--mint-soft)" }}>
      <TopNav
        current={navCurrent}
        sub={sub}
        onNavigate={navigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main>
        {view === "landing"     && <div data-screen-label="01 Landing">      <LandingView    onNavigate={navigate} onSelectPlayer={selectPlayer} /></div>}
        {view === "analytics"    && <div data-screen-label="02 Analytics">     <SnapshotView   onNavigate={navigate} onSelectPlayer={selectPlayer} /></div>}
        {view === "metrics"     && <div data-screen-label="03 Metrics">      <MetricsView    tab={metricsTab} setTab={(t) => navigate("metrics", t)} onSelectPlayer={selectPlayer} /></div>}
        {view === "statistics"  && <div data-screen-label="04 Statistics">   <StatisticsView tab={statsTab}    setTab={(t) => navigate("statistics", t)} onSelectPlayer={selectPlayer} /></div>}
        {view === "lineup"      && <div data-screen-label="05 Start Sit">    <LineupView     onSelectPlayer={selectPlayer} /></div>}
        {view === "draft" && sub === "rankings" && <div data-screen-label="06 Draft Rankings"><DraftRankingsView onSelectPlayer={selectPlayer} /></div>}
        {view === "draft" && sub !== "rankings" && <div data-screen-label="06 Draft Board"><DraftView      onSelectPlayer={selectPlayer} /></div>}
        {view === "projections" && sub === "tape" && <div data-screen-label="06 Projections Tape"><PlayerTapeView onSelectPlayer={selectPlayer} /></div>}
        {view === "projections" && sub !== "tape" && <div data-screen-label="06 Projections">  <RankingsView   onSelectPlayer={selectPlayer} /></div>}
        {view === "rankings"    && <div data-screen-label="06 Projections">  <RankingsView   onSelectPlayer={selectPlayer} /></div>}
        {view === "player"      && <div data-screen-label="07 Player">       <PlayerDetailView player={selected} onBack={() => navigate("projections")} /></div>}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer style={{ borderTop: "1px solid var(--green-600)", marginTop: 24, padding: "32px 0" }}>
      <div style={{
        maxWidth: 1440, margin: "0 auto", padding: "0 32px",
        display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 24, alignItems: "flex-start"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--mint)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 13, color: "var(--black)", letterSpacing: "-0.04em"
            }}>949</div>
            <span className="display" style={{ fontSize: 15, color: "var(--mint-soft)" }}>949Fantasy</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--slate)", maxWidth: 320, lineHeight: 1.5 }}>
            Premium fantasy football intelligence. Built by data engineers, used by managers who treat their team like a portfolio.
          </div>
          <div className="mono" style={{ marginTop: 18, fontSize: 10, color: "var(--slate-dim)", letterSpacing: "0.06em" }}>
            © 2026 · 949 Labs · Made for the long playoff push
          </div>
        </div>
        {[
          { title: "Product",   items: [
            { l: "Analytics",   n: "analytics"  },
            { l: "Metrics",     n: "metrics"    },
            { l: "Statistics",  n: "statistics" },
            { l: "Start / Sit", n: "lineup"     },
            { l: "Draft",       n: "draft", s: "board" },
            { l: "Projections", n: "projections"},
          ]},
          { title: "Resources", items: [{ l: "Methodology" }, { l: "Glossary" }, { l: "API" }, { l: "Changelog" }] },
          { title: "Company",   items: [{ l: "About" }, { l: "Pricing" }, { l: "Press" }, { l: "Contact" }] },
        ].map(col => (
          <div key={col.title}>
            <div className="mono" style={{ fontSize: 10, color: "var(--mint)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>{col.title}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {col.items.map(item => (
                <li key={item.l}>
                  <a href="#" onClick={e => { e.preventDefault(); if (item.n && onNavigate) onNavigate(item.n, item.s || null); }}
                     style={{ fontSize: 13, color: "var(--slate)", textDecoration: "none", cursor: "pointer" }}>{item.l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
