function LandingView({ onNavigate, onSelectPlayer }) {
  const { PLAYERS } = window;
  const top5 = [...PLAYERS].sort((a, b) => b.proj - a.proj).slice(0, 5);

  return (
    <div className="view-enter" style={{ position: "relative" }}>
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: -260, left: "50%", transform: "translateX(-50%)",
        width: 640, height: 640, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(149,249,174,0.12), transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: "absolute", top: 420, right: -200,
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(22,56,36,0.7), transparent 70%)",
        filter: "blur(20px)", pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        {/* HERO */}
        <section style={{
          display: "grid", gridTemplateColumns: "1.05fr 0.95fr",
          gap: 56, padding: "72px 0 96px", alignItems: "center"
        }}>
          {/* Hero copy */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 999,
              border: "1px solid var(--green-600)", background: "rgba(22,56,36,0.6)",
              fontSize: 13, color: "var(--mint-soft)", marginBottom: 28
            }}>
              <window.IconBolt size={14} stroke="var(--mint)" />
              Built for serious fantasy players
            </div>

            <h1 className="display" style={{
              fontSize: "clamp(44px, 5.6vw, 78px)",
              lineHeight: 1.02,
              color: "var(--mint-soft)",
              margin: 0,
              maxWidth: 720,
            }}>
              Win with better data,<br />not louder opinions.
            </h1>

            <p style={{
              marginTop: 24, maxWidth: 540,
              fontSize: 18, lineHeight: 1.55, color: "var(--slate)"
            }}>
              Premium weekly rankings, projections, player trends, and start/sit intelligence designed to help every starter in your lineup hit.
            </p>

            <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 14 }}>
              <button className="btn" onClick={() => onNavigate("analytics")} style={{ padding: "16px 22px", fontSize: 15 }}>
                Start for $9.49
                <span style={{ marginLeft: 4, transform: "rotate(-45deg)", display: "inline-flex" }}>
                  <window.IconArrowUp size={16} stroke="var(--black)" />
                </span>
              </button>
              <button className="btn outline" onClick={() => onNavigate("rankings")} style={{ padding: "16px 22px", fontSize: 15 }}>
                View rankings preview
              </button>
            </div>

            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 24, color: "var(--slate)", fontSize: 14 }}>
              {["Weekly rankings", "Player projections", "Start/sit tools"].map(t => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <window.IconCheck size={16} stroke="var(--mint)" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Live Edge Board */}
          <div style={{
            borderRadius: 28, border: "1px solid var(--green-600)",
            background: "rgba(22,56,36,0.7)", padding: 16,
            boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(149,249,174,0.04) inset",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{
              borderRadius: 20, border: "1px solid var(--green-600)",
              background: "var(--black)", padding: 22
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div className="display" style={{ fontSize: 20, color: "var(--mint-soft)", letterSpacing: "-0.02em" }}>Week 11 Edge Board</div>
                  <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 2 }}>Live model · updated 2m ago</div>
                </div>
                <span className="chip mint"><span className="live-dot"></span>Live</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {top5.map((p, i) => (
                  <button key={p.id} onClick={() => onSelectPlayer(p)} style={{
                    display: "grid", gridTemplateColumns: "36px 1fr auto", alignItems: "center", gap: 12,
                    background: "rgba(22,56,36,0.5)", border: "1px solid rgba(42,74,55,0.8)",
                    borderRadius: 14, padding: 10, cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(149,249,174,0.5)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(42,74,55,0.8)"}>
                    <div className="num" style={{
                      height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 10, background: "var(--mint)", color: "var(--black)",
                      fontSize: 15, fontWeight: 700
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--mint-soft)", fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 2 }}>{p.pos} · {p.team} · {p.matchup}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="num" style={{ fontSize: 16, color: "var(--mint-soft)" }}>{p.proj.toFixed(1)}</div>
                      <TrendDelta value={p.actual - p.proj} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Mini chart */}
              <div style={{ position: "relative", marginTop: 20, height: 160, overflow: "hidden",
                borderRadius: 16, border: "1px solid var(--green-600)", padding: 18 }}>
                <svg viewBox="0 0 500 150" style={{ position: "relative", width: "100%", height: "100%" }} preserveAspectRatio="none">
                  {[0.25, 0.5, 0.75].map(t => (
                    <line key={t} x1="0" y1={150 * t} x2="500" y2={150 * t} stroke="#2A4A37" strokeDasharray="2,4" />
                  ))}
                  <path d="M0 128 C70 126 94 112 144 114 C208 117 228 82 276 84 C332 87 364 65 405 67 C448 69 462 53 500 50"
                    fill="none" stroke="#D9FFE4" strokeWidth="2" strokeDasharray="6,5" opacity="0.45" strokeLinecap="round" />
                  <path d="M0 115 C55 108 78 88 126 92 C180 97 191 52 242 58 C296 65 303 31 354 38 C405 45 420 19 500 24"
                    fill="none" stroke="#95F9AE" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div style={{
                  position: "absolute", top: 14, left: 14,
                  padding: "5px 12px", borderRadius: 999,
                  border: "1px solid rgba(149,249,174,0.3)", background: "rgba(149,249,174,0.1)",
                  fontSize: 11, fontWeight: 600, color: "var(--mint)"
                }}>Projection edge +18.4%</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingBottom: 80 }}>
          {[
            { label: "Projected lineup lift",  value: "18.4%", icon: <window.IconTrend size={16} stroke="var(--mint)" />, sub: "Avg edge over consensus" },
            { label: "Weekly rank updates",    value: "4×",    icon: <window.IconInsight size={16} stroke="var(--mint)" />, sub: "Wed · Fri · Sat · Sun AM" },
            { label: "Season pass",            value: "$9.49", icon: <window.IconBolt size={16} stroke="var(--mint)" />, sub: "Whole season · no upsells" },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <span style={{ fontSize: 13, color: "var(--slate)" }}>{c.label}</span>
                {c.icon}
              </div>
              <div className="num" style={{ fontSize: 38, color: "var(--mint-soft)" }}>{c.value}</div>
              <div className="mono" style={{ marginTop: 8, fontSize: 11, color: "var(--slate-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.sub}</div>
            </div>
          ))}
        </section>

        {/* Why 949 section */}
        <section style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 32, paddingBottom: 96 }}>
          <div style={{
            borderRadius: 24, border: "1px solid var(--green-600)",
            background: "rgba(22,56,36,0.7)", padding: 36
          }}>
            <span style={{
              display: "inline-flex", padding: "5px 12px", borderRadius: 999,
              background: "rgba(149,249,174,0.1)", color: "var(--mint)",
              fontSize: 12, fontWeight: 600, marginBottom: 18
            }}>Why 949 wins</span>
            <h2 className="display" style={{ fontSize: 38, color: "var(--mint-soft)", margin: 0, lineHeight: 1.1 }}>
              A cleaner edge for every roster decision.
            </h2>
            <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.6, color: "var(--slate)" }}>
              949Fantasy blends high-conviction rankings, player usage trends, projections, and matchup intelligence into a fast premium dashboard. Built for managers who treat their lineup like a portfolio.
            </p>
            <div style={{ marginTop: 28, display: "grid", gap: 14 }}>
              {[
                ["+18.4%", "Avg projection edge vs consensus"],
                ["4×/wk", "Rankings refresh cadence"],
                ["+2.7", "Avg pts/wk delta over ECR"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 12, borderBottom: "1px solid var(--green-600)" }}>
                  <span className="num" style={{ fontSize: 22, color: "var(--mint)", width: 90 }}>{k}</span>
                  <span style={{ fontSize: 13, color: "var(--slate)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              [<window.IconRanking size={20} stroke="var(--mint)" />, "Trustworthy rankings", "Clear weekly and rest-of-season rankings without sportsbook noise or hot-take volatility."],
              [<window.IconInsight size={20} stroke="var(--mint)" />, "Data-first player pages", "Usage, trends, historical splits, and projection context in one premium view."],
              [<window.IconBolt size={20} stroke="var(--mint)" />, "Fast start/sit calls", "Confidence-graded lineup decisions in one click — without juggling five tabs."],
              [<window.IconLock size={20} stroke="var(--mint)" />, "Premium dashboard", "Free users get teaser value. Premium unlocks full board, full season."],
            ].map(([icon, title, body]) => (
              <div key={title} className="card" style={{
                padding: 24, background: "var(--black)",
                transition: "transform 0.15s, border-color 0.15s",
                cursor: "default"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(149,249,174,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--green-600)"; }}>
                <div style={{ marginBottom: 18 }}>{icon}</div>
                <h3 className="display" style={{ fontSize: 18, color: "var(--mint-soft)", margin: 0, fontWeight: 700 }}>{title}</h3>
                <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "var(--slate)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing CTA */}
        <section style={{ paddingBottom: 96 }}>
          <div style={{
            borderRadius: 28, border: "1px solid var(--green-600)",
            background: "linear-gradient(135deg, var(--green-800), var(--green-900))",
            padding: "48px 48px",
            position: "relative", overflow: "hidden"
          }}>
            {/* decorative grid */}
            <svg style={{ position: "absolute", top: 0, right: 0, opacity: 0.18, pointerEvents: "none" }} width="320" height="220" viewBox="0 0 320 220">
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={"h" + i} x1="0" y1={i * 22} x2="320" y2={i * 22} stroke="#95F9AE" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={"v" + i} x1={i * 22} y1="0" x2={i * 22} y2="220" stroke="#95F9AE" strokeWidth="0.5" />
              ))}
            </svg>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center", position: "relative", zIndex: 1
            }}>
              <div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "var(--mint)", textTransform: "uppercase" }}>Season Pass</div>
                <h2 className="display" style={{ marginTop: 10, fontSize: 40, color: "var(--mint-soft)", lineHeight: 1.05 }}>
                  Full fantasy intelligence for $9.49.
                </h2>
                <p style={{ marginTop: 14, maxWidth: 640, fontSize: 15, lineHeight: 1.55, color: "var(--slate)" }}>
                  Unlock full rankings, projections, tiers, matchup grades, unlimited start/sit, and premium player insights for the entire season. No tiered upsells, no ads.
                </p>
              </div>
              <button className="btn" onClick={() => onNavigate("analytics")} style={{ padding: "18px 26px", fontSize: 15 }}>Claim season pass</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

Object.assign(window, { LandingView });
