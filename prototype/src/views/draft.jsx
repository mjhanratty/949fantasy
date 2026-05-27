// Draft Command — the in-app draft room.
// Layout is dense on purpose; goal is single-viewport above the fold on a 1440px screen.

function DraftView({ onSelectPlayer }) {
  const basePlayers = React.useMemo(() => window.buildDraftPool(window.PLAYERS || []), []);
  const [mode, setMode] = React.useState("simulator");
  const [scoring, setScoring] = React.useState("ppr");
  const [pos, setPos] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [queue, setQueue] = React.useState([]);
  const [draftedByPlayerId, setDraftedByPlayerId] = React.useState({});
  const [pickIndex, setPickIndex] = React.useState(0);
  const [question, setQuestion] = React.useState("");
  const [submittedQuestion, setSubmittedQuestion] = React.useState("");
  const [teamCount, setTeamCount] = React.useState(12);
  const [userSlot, setUserSlot] = React.useState(1);
  const [platform, setPlatform] = React.useState("espn");
  const [simStarted, setSimStarted] = React.useState(false);
  const [turnSeconds, setTurnSeconds] = React.useState(90);
  const [rosterConfig, setRosterConfig] = React.useState(window.DEFAULT_ROSTER_CONFIG);
  const [leaguePrompt, setLeaguePrompt] = React.useState(null);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showDraftComplete, setShowDraftComplete] = React.useState(false);
  const boardScrollRef = React.useRef(null);

  const rosterSlots = React.useMemo(() => window.buildRosterSlots(rosterConfig), [rosterConfig]);
  const rounds = rosterSlots.length;

  const teams = React.useMemo(() => Array.from({ length: teamCount }, (_, i) => ({
    id: `t${i + 1}`,
    name: window.DRAFT_TEAM_NAMES[i],
    isUser: i + 1 === userSlot,
  })), [teamCount, userSlot]);

  React.useEffect(() => {}, [userSlot]);

  const draftOrder = React.useMemo(() => window.buildDraftOrder(teamCount, rounds), [teamCount, rounds]);
  const currentTeamNumber = draftOrder[pickIndex] || null;
  const currentTeam = teams[currentTeamNumber - 1];
  const isUserTurn = currentTeam?.isUser;
  const pickNumber = pickIndex + 1;
  const nextUserPick = window.findNextUserPick(draftOrder, pickIndex, userSlot);

  const board = React.useMemo(() => {
    const enriched = basePlayers
      .map(p => window.enrichDraftPlayer(p, scoring, draftedByPlayerId[p.id], pickNumber, nextUserPick))
      .sort((a, b) => a.adp - b.adp);
    return window.applyLiveBoardBands(enriched, pickNumber);
  }, [basePlayers, scoring, draftedByPlayerId, pickNumber, nextUserPick]);

  const availablePlayers = board.filter(p => !p.drafted);
  const filtered = board
    .filter(p => pos === "ALL" || p.pos === pos || (pos === "FLEX" && ["RB", "WR", "TE"].includes(p.pos)))
    .filter(p => !search || `${p.name} ${p.team} ${p.pos}`.toLowerCase().includes(search.toLowerCase()))
    .map((player, index) => ({ ...player, displayRank: index + 1 }));

  const rosters = React.useMemo(() => window.buildRosters(board, teams, draftedByPlayerId), [board, teams, draftedByPlayerId]);
  const userRoster = rosters[`t${userSlot}`] || [];
  const pickLog = React.useMemo(() => window.buildPickLog(board, teams, draftedByPlayerId), [board, teams, draftedByPlayerId]);
  const gm = React.useMemo(() => window.buildGmReadout(availablePlayers, userRoster, pickNumber), [availablePlayers, userRoster, pickNumber]);
  const grade = React.useMemo(() => window.gradeUserDraft(userRoster, rosterSlots), [userRoster, rosterSlots]);
  const gmBands = React.useMemo(() => window.buildBandGroups(availablePlayers, pickNumber), [availablePlayers, pickNumber]);

  React.useEffect(() => {
    if (!simStarted || !isUserTurn || mode !== "simulator" || pickIndex >= draftOrder.length) return;
    setTurnSeconds(90);
  }, [simStarted, isUserTurn, pickIndex, mode, draftOrder.length]);

  React.useEffect(() => {
    if (!simStarted || !isUserTurn || mode !== "simulator" || pickIndex >= draftOrder.length) return;
    const id = setInterval(() => setTurnSeconds(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, [simStarted, isUserTurn, mode, pickIndex, draftOrder.length]);

  React.useEffect(() => {
    if (!simStarted || isUserTurn || mode !== "simulator" || pickIndex >= draftOrder.length) return;
    const id = setTimeout(() => autoPickOne(), 650);
    return () => clearTimeout(id);
  }, [simStarted, isUserTurn, mode, pickIndex, draftOrder.length, draftedByPlayerId]);

  React.useEffect(() => {
    if (!simStarted || !isUserTurn || mode !== "simulator" || pickIndex >= draftOrder.length || turnSeconds > 0 || !gm.best) return;
    draftPlayer(gm.best.id);
  }, [simStarted, isUserTurn, mode, pickIndex, draftOrder.length, turnSeconds, gm.best?.id]);

  React.useEffect(() => {
    // Auto-scroll the board back to the top after a pick so the next available
    // row is in view.
    if (boardScrollRef.current && pickIndex > 0) {
      boardScrollRef.current.scrollTop = 0;
    }
  }, [pickIndex]);

  React.useEffect(() => {
    if (simStarted && pickIndex >= draftOrder.length && pickIndex > 0) {
      setShowDraftComplete(true);
    }
  }, [simStarted, pickIndex, draftOrder.length]);

  function reviewDraft() {
    setMode("score");
    setShowDraftComplete(false);
  }

  function resetDraft() {
    setShowDraftComplete(false);
    setDraftedByPlayerId({});
    setPickIndex(0);
    setQueue([]);
    setQuestion("");
    setSubmittedQuestion("");
    setSimStarted(false);
    setTurnSeconds(90);
    setLeaguePrompt(null);
  }

  function startSimulator() { setSimStarted(true); setTurnSeconds(90); }

  function startLeagueDraft() {
    setLeaguePrompt(platform);
    if (platform === "espn") { setSimStarted(true); setTurnSeconds(90); }
  }

  function confirmLeagueDraft() {
    setLeaguePrompt(null);
    setSimStarted(true);
    setTurnSeconds(90);
  }

  function createDraftRecord(player, teamNumber, draftPickIndex, availableAtPick = []) {
    const pick = draftPickIndex + 1;
    const enriched = player.adjusted ? player : window.enrichDraftPlayer(player, scoring, null, pick, window.findNextUserPick(draftOrder, draftPickIndex, userSlot));
    const ranked = availableAtPick
      .filter(p => !p.drafted || p.id === player.id)
      .map((p, i) => {
        const gmBand = window.gmBandForPlayer(p, pick, i + 1);
        return { ...p, valueLabel: gmBand.label, gmBandScore: gmBand.score };
      })
      .sort((a, b) => (b.gmBandScore || -999) - (a.gmBandScore || -999) || a.adp - b.adp);
    const selected = ranked.find(p => p.id === player.id) || enriched;
    const bestAvailable = ranked[0];
    const stealAvailable = ranked.find(p => p.valueLabel && p.valueLabel.includes("Steal"));
    const selectedBand = selected.valueLabel || window.gmBandForPlayer(enriched, pick).label;
    const grade = window.draftStockGradeForPick({ ...enriched, valueLabel: selectedBand }, pick);

    return {
      teamId: `t${teamNumber}`,
      pick,
      roundPick: window.formatRoundPick(draftPickIndex, teamCount),
      adpDelta: pick - enriched.adp,
      selectedBand,
      draftScore: grade.score,
      draftGrade: grade.letter,
      draftGradeColor: grade.color,
      teamCount,
      valueScore: window.seasonValueScore(enriched),
      modelScore: window.cfModelScore(enriched),
      sosScore: window.sosScore(enriched),
      bestAvailable: bestAvailable ? { id: bestAvailable.id, name: bestAvailable.name, label: bestAvailable.valueLabel, adp: bestAvailable.adp } : null,
      stealAvailable: stealAvailable ? { id: stealAvailable.id, name: stealAvailable.name, label: stealAvailable.valueLabel, adp: stealAvailable.adp } : null,
    };
  }

  function draftPlayer(playerId, forcedTeamNumber = currentTeamNumber) {
    if (!forcedTeamNumber || draftedByPlayerId[playerId]) return;
    const player = availablePlayers.find(p => p.id === playerId) || board.find(p => p.id === playerId) || basePlayers.find(p => p.id === playerId);
    if (!player) return;

    const localDrafted = { ...draftedByPlayerId, [playerId]: createDraftRecord(player, forcedTeamNumber, pickIndex, availablePlayers) };
    let localPickIndex = Math.min(pickIndex + 1, draftOrder.length);

    if (forcedTeamNumber === userSlot) {
      while (localPickIndex < draftOrder.length && draftOrder[localPickIndex] !== userSlot) {
        const teamNumber = draftOrder[localPickIndex];
        const localBoard = basePlayers
          .map(p => window.enrichDraftPlayer(p, scoring, localDrafted[p.id], localPickIndex + 1, window.findNextUserPick(draftOrder, localPickIndex, userSlot)))
          .sort((a, b) => b.draftScore - a.draftScore);
        const localRosters = window.buildRosters(localBoard, teams, localDrafted);
        const localAvailable = localBoard.filter(p => !p.drafted);
        const pick = window.chooseComputerPick(localAvailable, localRosters[`t${teamNumber}`] || [], localPickIndex + 1);
        if (!pick) break;
        localDrafted[pick.id] = createDraftRecord(pick, teamNumber, localPickIndex, localAvailable);
        localPickIndex += 1;
      }
    }

    setDraftedByPlayerId(localDrafted);
    setQueue(prev => prev.filter(id => !localDrafted[id]));
    setPickIndex(localPickIndex);
  }

  function draftLeaguePlayer(playerId) {
    if (!currentTeamNumber || draftedByPlayerId[playerId] || pickIndex >= draftOrder.length) return;
    const player = availablePlayers.find(p => p.id === playerId) || board.find(p => p.id === playerId) || basePlayers.find(p => p.id === playerId);
    if (!player) return;
    const localDrafted = { ...draftedByPlayerId, [playerId]: createDraftRecord(player, currentTeamNumber, pickIndex, availablePlayers) };
    setDraftedByPlayerId(localDrafted);
    setQueue(prev => prev.filter(id => !localDrafted[id]));
    setPickIndex(prev => Math.min(prev + 1, draftOrder.length));
  }

  function autoPickOne() {
    if (!currentTeamNumber || pickIndex >= draftOrder.length) return;
    const teamRoster = rosters[`t${currentTeamNumber}`] || [];
    const pick = window.chooseComputerPick(availablePlayers, teamRoster, pickNumber);
    if (pick) draftPlayer(pick.id, currentTeamNumber);
  }

  function simToUserPick() {
    let localPickIndex = pickIndex;
    const localDrafted = { ...draftedByPlayerId };
    while (localPickIndex < draftOrder.length && draftOrder[localPickIndex] !== userSlot) {
      const teamNumber = draftOrder[localPickIndex];
      const localBoard = basePlayers
        .map(p => window.enrichDraftPlayer(p, scoring, localDrafted[p.id], localPickIndex + 1, window.findNextUserPick(draftOrder, localPickIndex, userSlot)))
        .sort((a, b) => b.draftScore - a.draftScore);
      const localRosters = window.buildRosters(localBoard, teams, localDrafted);
      const localAvailable = localBoard.filter(p => !p.drafted);
      const pick = window.chooseComputerPick(localAvailable, localRosters[`t${teamNumber}`] || [], localPickIndex + 1);
      if (!pick) break;
      localDrafted[pick.id] = createDraftRecord(pick, teamNumber, localPickIndex, localAvailable);
      localPickIndex += 1;
    }
    setDraftedByPlayerId(localDrafted);
    setPickIndex(localPickIndex);
    setQueue(prev => prev.filter(id => !localDrafted[id]));
  }

  function toggleQueue(playerId) {
    if (draftedByPlayerId[playerId]) return;
    setQueue(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
  }

  function addToQueue(playerId) {
    if (draftedByPlayerId[playerId]) return;
    setQueue(prev => prev.includes(playerId) ? prev : [...prev, playerId]);
  }

  const answer = window.buildGmAnswer(submittedQuestion, gm, userRoster);
  const queuedPlayers = queue.map(id => board.find(p => p.id === id)).filter(Boolean);
  const showClock = simStarted && isUserTurn && mode === "simulator";
  const clockLabel = mode === "league"
    ? (simStarted ? "Live entry" : "Not started")
    : simStarted ? (isUserTurn ? "Your clock" : "CPU pick") : "Not started";

  return (
    <div className="view-enter" style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 24px 28px" }}>

      {/* ───── Compact hero ───── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
            Draft Room · {teamCount}-team {scoring.toUpperCase()} · {platform.toUpperCase()}
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 30, color: "var(--mint-soft)", lineHeight: 1 }}>Draft Command</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {mode === "simulator" && !simStarted && <button className="btn" onClick={startSimulator}>Start Draft</button>}
          {mode === "league" && !simStarted && <button className="btn" onClick={startLeagueDraft}>Live Draft</button>}
          {mode === "simulator" && (
            <>
              <button className="btn ghost" onClick={simToUserPick} disabled={!simStarted || isUserTurn || pickIndex >= draftOrder.length} style={{ opacity: !simStarted || isUserTurn ? 0.45 : 1 }}>Sim to My Pick</button>
              <button className="btn" onClick={() => isUserTurn ? draftPlayer(gm.best?.id) : autoPickOne()} disabled={!gm.best}>
                <window.IconBolt size={14} stroke="var(--black)" />
                {isUserTurn ? "Take GM Pick" : "Auto Pick"}
              </button>
            </>
          )}
          <button className="btn ghost" onClick={resetDraft} style={{ padding: "8px 12px", fontSize: 12 }}>Reset</button>
        </div>
      </div>

      {/* ───── Sticky top: settings bar + active roster band ───── */}
      <div style={{
        position: "sticky", top: 64, zIndex: 30,
        marginLeft: -24, marginRight: -24, padding: "10px 24px 4px",
        background: "rgba(5,8,7,0.92)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--green-600)",
      }}>
        <SettingsBar
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          currentTeam={currentTeam}
          simStarted={simStarted}
          isUserTurn={isUserTurn}
          pickNumber={pickNumber}
          nextUserPick={nextUserPick}
          teamCount={teamCount}
          setTeamCount={setTeamCount}
          userSlot={userSlot}
          setUserSlot={setUserSlot}
          scoring={scoring}
          setScoring={setScoring}
          platform={platform}
          setPlatform={setPlatform}
          rosterConfig={rosterConfig}
          setRosterConfig={setRosterConfig}
          rosterSlots={rosterSlots}
          turnSeconds={turnSeconds}
          clockLabel={clockLabel}
          showClock={showClock}
          grade={grade}
        />

        <RosterBand userRoster={userRoster} rosterSlots={rosterSlots} />
      </div>

      {/* ───── Main 2-column grid: GM column (bands + Ask GM + Watch List) | Board ───── */}
      <div style={{ display: "grid", gridTemplateColumns: "272px minmax(0, 1fr)", gap: 14, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <GmPanel gm={gm} bands={gmBands} onQueue={toggleQueue} />
          <GmInteractionBox
            question={question} setQuestion={setQuestion}
            onSubmit={() => setSubmittedQuestion(question)}
            answer={answer}
            gm={gm}
            userRoster={userRoster}
            pickNumber={pickNumber}
            onQueueDrop={addToQueue}
            rosterSlots={rosterSlots}
          />
          <QueuedGradePanel queue={queuedPlayers} pickNumber={pickNumber} onQueue={toggleQueue} onQueueDrop={addToQueue} />
        </div>

        <BoardCard
          boardScrollRef={boardScrollRef}
          mode={mode} setMode={setMode}
          pos={pos} setPos={setPos}
          search={search} setSearch={setSearch}
          players={filtered}
          teams={teams}
          rosters={rosters}
          pickLog={pickLog}
          userRoster={userRoster}
          grade={grade}
          gm={gm}
          draftOrder={draftOrder}
          teamCount={teamCount}
          rounds={rounds}
          queue={queue}
          isUserTurn={isUserTurn}
          simStarted={simStarted}
          onDraft={mode === "league" ? draftLeaguePlayer : draftPlayer}
          onQueue={toggleQueue}
          onQueueDrop={addToQueue}
          onSelectPlayer={onSelectPlayer}
          rosterSlots={rosterSlots}
        />
      </div>

      {leaguePrompt && (
        <LeagueConnectModal platform={leaguePrompt} onClose={() => setLeaguePrompt(null)} onConfirm={confirmLeagueDraft} />
      )}
      {showDraftComplete && (
        <DraftCompleteModal
          grade={grade}
          onReview={reviewDraft}
          onClose={() => setShowDraftComplete(false)}
          onReset={resetDraft}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Settings bar — always-on info strip + collapsible draft-settings card.
// Always visible: status · clock · pick context (info during the draft)
// Collapsed: chevron + summary chip line
// Expanded: 4 selects + 8 roster steppers + ranking source caption
// ────────────────────────────────────────────────────────────────────────────
function SettingsBar({
  showSettings, setShowSettings,
  currentTeam, simStarted, isUserTurn, pickNumber, nextUserPick,
  teamCount, setTeamCount, userSlot, setUserSlot, scoring, setScoring, platform, setPlatform,
  rosterConfig, setRosterConfig, rosterSlots,
  turnSeconds, clockLabel, showClock, grade,
}) {
  const statusValue = !simStarted ? "Not Started"
    : !currentTeam ? "Complete"
    : currentTeam.isUser ? "You're on the clock"
    : `${currentTeam.name} picking`;

  return (
    <div className="card" style={{ padding: 10, marginBottom: 10 }}>
      {/* Always-on info strip: status · draft grade · clock · pick context · settings toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1.1fr) minmax(160px, 1.1fr) auto auto minmax(0, 1fr) auto", gap: 8, alignItems: "stretch" }}>
        <StatusPill label={simStarted ? "On clock" : "Status"} value={statusValue} active={showClock} foot={
          !simStarted ? "Click Start Draft when ready"
          : currentTeam ? `Pick ${pickNumber} · next yours ${nextUserPick || "done"}`
          : "Draft complete"
        } />
        <DraftGradePill grade={grade} />
        <ClockChip seconds={showClock ? turnSeconds : 90} active={showClock} label={clockLabel} />
        <PickContextChip pickNumber={pickNumber} teamCount={teamCount} />

        {!showSettings && (
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--mint-soft)", fontSize: 11, letterSpacing: "0.04em", paddingLeft: 4, flexWrap: "wrap" }}>
            <span style={{ color: "var(--slate)" }}>Teams<span style={{ color: "var(--mint)", marginLeft: 4 }}>{teamCount}</span></span>
            <span style={{ color: "var(--slate)" }}>Pos<span style={{ color: "var(--mint)", marginLeft: 4 }}>{userSlot}</span></span>
            <span style={{ color: "var(--slate)" }}>{scoring.toUpperCase()}</span>
            <span style={{ color: "var(--slate)" }}>{platform.toUpperCase()}</span>
            <span style={{ color: "var(--slate-dim)", padding: "0 6px" }}>·</span>
            {["QB", "RB", "WR", "TE", "FLEX", "DST", "K", "BENCH"].map(slot => rosterConfig[slot] > 0 && (
              <span key={slot} style={{ color: "var(--slate)" }}>
                {slot}<span style={{ color: "var(--mint)", marginLeft: 4 }}>{rosterConfig[slot]}</span>
              </span>
            ))}
          </div>
        )}
        {showSettings && <div />}

        <button
          onClick={() => setShowSettings(o => !o)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 12px", borderRadius: 8,
            background: "var(--green-900)", border: "1px solid var(--green-600)",
            color: "var(--mint-soft)", cursor: "pointer",
            fontFamily: "Sora", fontSize: 11,
            alignSelf: "center"
          }}>
          <span className="mono" style={{ color: "var(--mint)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9 }}>Settings</span>
          <span style={{ transform: showSettings ? "rotate(90deg)" : "rotate(0deg)", display: "inline-flex", transition: "transform 0.15s" }}>
            <window.IconChevron size={10} />
          </span>
        </button>
      </div>

      {/* Expanded settings panel */}
      {showSettings && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--green-600)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
            <CompactSelect label="Teams" value={teamCount} onChange={v => setTeamCount(Number(v))} options={[8, 10, 12, 14].map(n => ({ value: n, label: `${n}` }))} />
            <CompactSelect label="Your Pos" value={userSlot} onChange={v => setUserSlot(Number(v))} options={Array.from({ length: teamCount }, (_, i) => ({ value: i + 1, label: `${i + 1}` }))} />
            <CompactSelect label="Scoring" value={scoring} onChange={setScoring} options={[{ value: "ppr", label: "PPR" }, { value: "half", label: "Half" }, { value: "std", label: "Std" }]} />
            <CompactSelect label="Platform" value={platform} onChange={setPlatform} options={[{ value: "espn", label: "ESPN" }, { value: "yahoo", label: "Yahoo" }, { value: "sleeper", label: "Sleeper" }, { value: "cbs", label: "CBS" }]} />
          </div>

          <div className="mono" style={{ marginTop: 10, color: "var(--mint)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>Roster Layout</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(72px, 1fr))", gap: 6, marginTop: 6 }}>
            {["QB", "RB", "WR", "TE", "FLEX", "DST", "K", "BENCH"].map(slot => (
              <RosterStepper
                key={slot}
                label={slot}
                value={rosterConfig[slot]}
                min={0}
                max={slot === "BENCH" ? 12 : slot === "FLEX" ? 3 : slot === "DST" || slot === "K" ? 2 : 4}
                onChange={value => setRosterConfig(prev => ({ ...prev, [slot]: value }))}
              />
            ))}
          </div>

          <div className="mono" style={{ marginTop: 10, color: "var(--slate-dim)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Ranking source · {platform.toUpperCase()} testing board · {teamCount}-team snake · {scoring.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Roster band — horizontal active-roster strip above the board.
// One pill per slot; "Open" until a player is drafted into it.
// ────────────────────────────────────────────────────────────────────────────
function RosterBand({ userRoster, rosterSlots }) {
  const assigned = window.assignRosterSlots(userRoster, rosterSlots);
  return (
    <div className="card" style={{ padding: 10, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span className="mono" style={{ fontSize: 9, color: "var(--mint)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Active Roster</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--slate-dim)" }}>{userRoster.length}/{rosterSlots.length}</span>
        <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, var(--green-600), transparent)" }} />
        <span className="mono" style={{ fontSize: 9, color: "var(--slate-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Other teams: open Live tab</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${rosterSlots.length}, minmax(0, 1fr))`, gap: 5 }}>
        {rosterSlots.map((slot, i) => {
          const player = assigned[i];
          const posColor = player ? window.positionColor(player.pos) : "var(--slate-dim)";
          return (
            <div key={`${slot}-${i}`} style={{
              padding: "6px 8px", borderRadius: 6,
              background: player ? "var(--green-900)" : "rgba(12,26,19,0.55)",
              border: `1px solid ${player ? `${posColor}55` : "var(--green-600)"}`,
              minWidth: 0,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                <span className="mono" style={{ fontSize: 9, color: posColor, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>{slot}</span>
                {player && <span className="mono" style={{ fontSize: 9, color: window.seasonValueGrade(player).color, fontWeight: 900 }}>{window.seasonValueGrade(player).letter}</span>}
              </div>
              <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.15, color: player ? "var(--mint-soft)" : "var(--slate-dim)", fontWeight: player ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {player ? player.name : "Open"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DraftGradePill({ grade }) {
  const hasPicks = grade && grade.letter !== "—";
  const color = hasPicks ? grade.color : "var(--slate-dim)";
  return (
    <div style={{
      padding: "8px 12px", borderRadius: 9,
      background: "var(--green-900)",
      border: `1px solid ${hasPicks ? color + "55" : "var(--green-600)"}`,
      display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0
    }}>
      <div className="mono" style={{ fontSize: 9, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Draft Grade</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
        <span className="num" style={{ color, fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em" }}>{hasPicks ? grade.letter : "—"}</span>
        <span className="mono" style={{ color: "var(--slate)", fontSize: 10, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
          {hasPicks ? grade.note : "Awaiting first pick"}
        </span>
      </div>
    </div>
  );
}

function StatusPill({ label, value, foot, active }) {
  return (
    <div style={{
      padding: "8px 12px", borderRadius: 9,
      background: "var(--green-900)",
      border: `1px solid ${active ? "var(--mint)" : "var(--green-600)"}`,
      display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0
    }}>
      <div className="mono" style={{ fontSize: 9, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
      <div className="num" style={{ marginTop: 4, fontSize: 16, color: active ? "var(--mint)" : "var(--mint-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.1 }}>{value}</div>
      {foot && <div className="mono" style={{ marginTop: 3, fontSize: 9, color: "var(--slate-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{foot}</div>}
    </div>
  );
}

function CompactSelect({ label, value, onChange, options }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", padding: "8px 10px", borderRadius: 9, background: "var(--green-900)", border: "1px solid var(--green-600)", minWidth: 0, cursor: "pointer" }}>
      <span className="mono" style={{ fontSize: 9, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        marginTop: 2, width: "100%", background: "transparent", border: "none",
        color: "var(--mint-soft)", fontFamily: "Space Grotesk", fontWeight: 700,
        fontSize: 18, outline: "none", appearance: "none", padding: 0, lineHeight: 1.1
      }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: "var(--green-900)" }}>{o.label}</option>)}
      </select>
    </label>
  );
}

function ClockChip({ seconds, active, label }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "6px 12px", borderRadius: 9,
      background: "var(--green-900)",
      border: `1px solid ${active ? "var(--mint)" : "var(--green-600)"}`,
      boxShadow: active ? "0 0 18px rgba(149,249,174,0.12)" : "none",
      minWidth: 96
    }}>
      <span className="mono" style={{ color: active ? "var(--mint)" : "var(--slate)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
      <span className="num" style={{ color: active ? "var(--mint)" : "var(--mint-soft)", fontSize: 20, lineHeight: 1, marginTop: 3 }}>{window.formatClock(seconds)}</span>
    </div>
  );
}

function PickContextChip({ pickNumber, teamCount }) {
  const round = Math.floor((pickNumber - 1) / teamCount) + 1;
  const pick = ((pickNumber - 1) % teamCount) + 1;
  return (
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 3,
      padding: "6px 12px", borderRadius: 9,
      background: "var(--green-900)", border: "1px solid var(--green-600)",
    }}>
      <span className="mono" style={{ color: "var(--slate)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pick context</span>
      <span style={{ display: "flex", gap: 10 }}>
        <span className="mono" style={{ color: "var(--slate)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>R<strong style={{ color: "var(--mint-soft)", fontSize: 12 }}> {round}</strong></span>
        <span className="mono" style={{ color: "var(--slate)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>P<strong style={{ color: "var(--mint-soft)", fontSize: 12 }}> {pick}</strong></span>
        <span className="mono" style={{ color: "var(--slate)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>OA<strong style={{ color: "var(--mint-soft)", fontSize: 12 }}> {pickNumber}</strong></span>
      </span>
    </div>
  );
}

function RosterStepper({ label, value, min, max, onChange }) {
  return (
    <div style={{ padding: 7, borderRadius: 8, background: "var(--green-900)", border: "1px solid var(--green-600)" }}>
      <div className="mono" style={{ color: "var(--slate)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "22px 1fr 22px", alignItems: "center", gap: 4, marginTop: 5 }}>
        <button onClick={() => onChange(Math.max(min, value - 1))} style={stepBtn}>−</button>
        <span className="num" style={{ color: "var(--mint-soft)", fontSize: 18, textAlign: "center" }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} style={stepBtn}>+</button>
      </div>
    </div>
  );
}

const stepBtn = {
  width: 22, height: 22, borderRadius: 6, border: "1px solid var(--green-600)",
  background: "rgba(149,249,174,0.08)", color: "var(--mint)", cursor: "pointer",
  fontFamily: "Space Grotesk", fontWeight: 800, lineHeight: 1,
};

// ────────────────────────────────────────────────────────────────────────────
// GM Pick Bands — vertical sidebar with all 7 bands.
// ────────────────────────────────────────────────────────────────────────────
function GmPanel({ gm, bands, onQueue }) {
  return (
    <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ marginBottom: 8, flex: "0 0 auto" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.16em" }}>GM</div>
        <div className="display" style={{ fontSize: 15, color: "var(--mint-soft)", marginTop: 2 }}>Pick Bands</div>
      </div>
      <div style={{ display: "grid", gap: 6, overflow: "auto", maxHeight: 520, paddingRight: 4 }}>
        {bands.map(band => (
          <div key={band.label} style={{ padding: 7, borderRadius: 7, background: "var(--green-900)", border: "1px solid var(--green-600)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--mint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{band.label}</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--slate-dim)" }}>{band.players.length}</span>
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {band.players.length ? band.players.slice(0, 3).map(p => (
                <button key={p.id} draggable onDragStart={e => e.dataTransfer.setData("text/plain", p.id)} onClick={() => onQueue(p.id)} style={{
                  display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) 28px", gap: 6, alignItems: "center",
                  padding: "4px 6px", borderRadius: 5, border: `1px solid ${window.positionColor(p.pos)}55`,
                  background: window.positionBg(p.pos), color: "inherit", cursor: "pointer", textAlign: "left",
                }}>
                  <span className="mono" style={{ color: window.positionColor(p.pos), fontSize: 9, fontWeight: 700 }}>{p.pos}</span>
                  <span style={{ color: "var(--mint-soft)", fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span className="mono" style={{ color: "var(--slate)", fontSize: 9, textAlign: "right" }}>{p.adp}</span>
                </button>
              )) : (
                <span style={{ color: "var(--slate-dim)", fontSize: 10, padding: "2px 0" }}>No players in range</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Board card — search + mode/pos tabs + the board itself.
// ────────────────────────────────────────────────────────────────────────────
function BoardCard({
  boardScrollRef,
  mode, setMode, pos, setPos, search, setSearch,
  players, teams, rosters, pickLog, userRoster, grade, gm,
  draftOrder, teamCount, rounds, queue, isUserTurn, simStarted,
  onDraft, onQueue, onQueueDrop, onSelectPlayer, rosterSlots,
}) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--green-600)", display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.16em" }}>
            {mode === "league" ? "League Draft" : mode === "live" ? "Live League" : mode === "score" ? "Draft Grade" : mode === "picks" ? "Round Grid" : "Simulator"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <TabBar tabs={[{ id: "simulator", label: "Simulator" }, { id: "league", label: "League" }, { id: "live", label: "Live" }, { id: "picks", label: "Picks" }, { id: "score", label: "Score" }]} value={mode} onChange={setMode} />
          <TabBar tabs={[{ id: "ALL", label: "All" }, { id: "QB", label: "QB" }, { id: "RB", label: "RB" }, { id: "WR", label: "WR" }, { id: "TE", label: "TE" }, { id: "FLEX", label: "Flex" }, { id: "DST", label: "DST" }, { id: "K", label: "K" }]} value={pos} onChange={setPos} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: "var(--green-900)", border: "1px solid var(--green-600)" }}>
          <window.IconSearch size={13} stroke="var(--slate)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search draft board" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--mint-soft)", fontFamily: "Sora", fontSize: 12 }} />
        </div>
      </div>
      <DraftBoardMode
        boardScrollRef={boardScrollRef}
        mode={mode}
        players={players}
        teams={teams}
        rosters={rosters}
        pickLog={pickLog}
        userRoster={userRoster}
        grade={grade}
        gm={gm}
        draftOrder={draftOrder}
        teamCount={teamCount}
        rounds={rounds}
        queue={queue}
        isUserTurn={isUserTurn}
        simStarted={simStarted}
        onDraft={onDraft}
        onQueue={onQueue}
        onQueueDrop={onQueueDrop}
        onSelectPlayer={onSelectPlayer}
        rosterSlots={rosterSlots}
      />
    </div>
  );
}

const DRAFT_TILE_MIN_WIDTH = 132;
const DRAFT_TILE_GAP = 6;

function DraftBoardMode({ boardScrollRef, mode, players, teams, rosters, pickLog, userRoster, grade, gm, draftOrder, teamCount, rounds, queue, isUserTurn, simStarted, onDraft, onQueue, onQueueDrop, onSelectPlayer, rosterSlots }) {
  const boardGridRef = React.useRef(null);
  const [boardColumnCount, setBoardColumnCount] = React.useState(1);

  React.useEffect(() => {
    const grid = boardGridRef.current;
    if (!grid) return;

    function syncColumnCount() {
      const width = grid.clientWidth || DRAFT_TILE_MIN_WIDTH;
      const nextCount = Math.max(1, Math.floor((width + DRAFT_TILE_GAP) / (DRAFT_TILE_MIN_WIDTH + DRAFT_TILE_GAP)));
      setBoardColumnCount(prev => prev === nextCount ? prev : nextCount);
    }

    syncColumnCount();
    const observer = new ResizeObserver(syncColumnCount);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [mode]);

  const visiblePlayers = React.useMemo(() => collapseFullyDraftedRows(players, boardColumnCount), [players, boardColumnCount]);
  const clearedCount = players.length - visiblePlayers.length;
  const isLeagueMode = mode === "league";

  if (mode === "live") return <LiveLeagueBoard teams={teams} rosters={rosters} />;
  if (mode === "picks") return <PicksRoundBoard pickLog={pickLog} draftOrder={draftOrder} teams={teams} teamCount={teamCount} rounds={rounds} />;
  if (mode === "score") return <ScoreCardBoard userRoster={userRoster} grade={grade} gm={gm} pickLog={pickLog} rosterSlots={rosterSlots} teamCount={teamCount} />;

  return (
    <div
      ref={boardScrollRef}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) onQueueDrop(id); }}
      style={{ padding: 12, maxHeight: 780, overflow: "auto", overscrollBehavior: "contain" }}
    >
      {clearedCount > 0 && (
        <div className="mono" style={{ marginBottom: 8, fontSize: 9, color: "var(--slate-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Cleared {clearedCount} taken player{clearedCount === 1 ? "" : "s"} from completed board row{clearedCount === boardColumnCount ? "" : "s"}
        </div>
      )}
      <div ref={boardGridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))", gap: 6 }}>
        {visiblePlayers.map(player => (
          <DraftPlayerTile
            key={player.id}
            player={player}
            queued={queue.includes(player.id)}
            canDraft={isLeagueMode ? simStarted : simStarted && isUserTurn}
            onDraft={() => onDraft(player.id)}
            onQueue={(event) => { event.stopPropagation(); onQueue(player.id); }}
            onSelect={() => onSelectPlayer && !player.synthetic && onSelectPlayer(player)}
            teamCount={teamCount}
          />
        ))}
      </div>
    </div>
  );
}

function collapseFullyDraftedRows(players, columnCount) {
  if (!players.length || columnCount <= 1) return players;
  let visible = players;
  let changed = true;

  while (changed) {
    changed = false;
    const next = [];

    for (let i = 0; i < visible.length; i += columnCount) {
      const row = visible.slice(i, i + columnCount);
      const isFullRow = row.length === columnCount;
      const allTaken = isFullRow && row.every(player => !!player.drafted);
      if (allTaken) {
        changed = true;
      } else {
        next.push(...row);
      }
    }

    visible = next;
  }

  return visible;
}

function DraftPlayerTile({ player, queued, canDraft = true, onDraft, onQueue, onSelect, teamCount = 12 }) {
  const team = window.TEAMS[player.team] || { color: "#2A4A37", name: player.team };
  const isGone = !!player.drafted;
  const posColor = window.positionColor(player.pos);
  const jerseyLabel = player.pos === "DST" ? "DST" : player.num;
  const riskColor = player.risk === "high" ? "var(--red)" : player.risk === "med" ? "var(--gold)" : "var(--mint)";

  return (
    <button
      draggable={!isGone}
      onDragStart={e => e.dataTransfer.setData("text/plain", player.id)}
      onClick={isGone || !canDraft ? undefined : onDraft}
      onDoubleClick={onSelect}
      style={{
        position: "relative", overflow: "hidden",
        minHeight: 96, padding: "8px 9px",
        borderRadius: 8,
        border: `1px solid ${posColor}40`,
        background: "var(--green-900)",
        color: "var(--mint-soft)", textAlign: "left",
        cursor: isGone ? "not-allowed" : canDraft ? "pointer" : "grab",
        opacity: isGone ? 0.38 : 1,
        boxShadow: queued && !isGone ? `inset 0 0 0 2px ${posColor}` : "none",
        transition: "transform 0.12s, box-shadow 0.12s",
      }}
    >
      {/* Position-colored top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: posColor }} />

      {/* Top row: pos pill · team chip · rank */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
        <span className="mono" style={{
          color: posColor, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
          padding: "2px 5px", borderRadius: 3, border: `1px solid ${posColor}66`,
          background: `${posColor}14`,
        }}>{player.pos}</span>
        <span className="mono" style={{ color: "var(--slate-dim)", fontSize: 8, letterSpacing: "0.04em" }}>#{player.displayRank || player.boardRank || player.adp}</span>
      </div>

      {/* Middle: jersey badge + name + meta */}
      <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 7, marginTop: 6 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: `linear-gradient(135deg, ${team.color}, #050807)`,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Space Grotesk", fontWeight: 800,
          fontSize: player.pos === "DST" ? 10 : 14,
          color: "white", lineHeight: 1,
        }}>{jerseyLabel}</div>

        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{
            fontSize: 11, lineHeight: 1.15, fontWeight: 800, color: "var(--mint-soft)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{player.name}</div>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, fontSize: 8, color: "var(--slate)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: team.color, boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }} />
            <span style={{ color: "var(--mint-soft)", fontWeight: 600, letterSpacing: "0.04em" }}>{player.team}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: riskColor, marginLeft: 2 }} />
            <span style={{ color: riskColor, letterSpacing: "0.06em", textTransform: "uppercase" }}>{player.risk}</span>
          </div>
        </div>
      </div>

      {/* Bottom row: ADP · proj · queue */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 7 }}>
        <span className="mono" style={{ color: "var(--slate)", fontSize: 9, letterSpacing: "0.04em" }}>
          ADP <span style={{ color: "var(--mint-soft)" }}>{window.formatAdpPick(player.adp, teamCount)}</span>
          <span style={{ color: "var(--slate-dim)", margin: "0 4px" }}>·</span>
          <span style={{ color: "var(--mint)" }}>{player.adjusted.toFixed(1)}</span>
        </span>
        {!isGone && (
          <span
            onClick={onQueue}
            className="mono"
            style={{
              color: queued ? "var(--mint)" : "var(--slate)", fontSize: 8,
              padding: "2px 6px", borderRadius: 4,
              border: `1px solid ${queued ? "var(--mint)" : "var(--green-600)"}`,
              background: queued ? "rgba(149,249,174,0.12)" : "transparent",
              letterSpacing: "0.08em", fontWeight: 700,
            }}>
            {queued ? "QUEUED" : "QUEUE"}
          </span>
        )}
      </div>

      {isGone && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,8,7,0.55)" }}>
          <span className="chip">Taken {player.drafted.roundPick}</span>
        </div>
      )}
    </button>
  );
}

function LiveLeagueBoard({ teams, rosters }) {
  return (
    <div style={{ padding: 14, maxHeight: 560, overflow: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {teams.map(team => (
          <div key={team.id} style={{ minHeight: 160, padding: 10, borderRadius: 8, background: "var(--green-900)", border: team.isUser ? "1px solid var(--mint)" : "1px solid var(--green-600)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--mint-soft)", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
              <span className="mono" style={{ color: team.isUser ? "var(--mint)" : "var(--slate)", fontSize: 10 }}>{(rosters[team.id] || []).length}</span>
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              {(rosters[team.id] || []).slice(0, 10).map(p => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr) 22px", gap: 6, alignItems: "center" }}>
                  <span className="mono" style={{ color: window.positionColor(p.pos), fontSize: 9 }}>{p.pos}</span>
                  <span style={{ color: "var(--slate)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span className="mono" style={{ color: window.draftStockGrade(p).color, fontSize: 9, fontWeight: 800, textAlign: "right" }}>{window.draftStockGrade(p).letter}</span>
                </div>
              ))}
              {!(rosters[team.id] || []).length && <span style={{ color: "var(--slate-dim)", fontSize: 11 }}>No picks yet</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreCardBoard({ userRoster, grade, gm, pickLog, rosterSlots, teamCount }) {
  const [hoveredId, setHoveredId] = React.useState(null);
  const lineup = window.buildScoredLineup(userRoster, rosterSlots);
  const starters = lineup.filter(i => i.slot !== "BENCH").map(i => i.player);
  const bench = lineup.filter(i => i.slot === "BENCH").map(i => i.player);
  const starterGrade = window.gradeLineupDraft(starters);
  const starterCounts = window.countPositions(starters);
  const strongestPos = Object.keys(starterCounts).sort((a, b) => starterCounts[b] - starterCounts[a] || window.bestPositionScore(starters, b) - window.bestPositionScore(starters, a))[0] || "skill";
  const bestStarter = starters.filter(p => p.pos === strongestPos).sort((a, b) => (b.draft?.draftScore || 0) - (a.draft?.draftScore || 0))[0]
    || starters.slice().sort((a, b) => (b.draft?.draftScore || 0) - (a.draft?.draftScore || 0))[0];
  const weakestStarter = starters.slice().sort((a, b) => (a.draft?.draftScore || 100) - (b.draft?.draftScore || 100))[0];
  const starterBuckets = window.countDraftBuckets(starters);
  const benchBuckets = window.countDraftBuckets(bench);
  const missed = starters.find(p => p.draft?.stealAvailable && p.draft?.selectedBand?.includes("Reach"));
  const benchSummary = bench.length
    ? `Bench: ${benchBuckets.steals} steals, ${benchBuckets.expected} expected, ${benchBuckets.reaches} reaches.`
    : "Bench: no bench picks yet.";
  const summary = userRoster.length
    ? `Starting lineup grades as a ${starterGrade.letter}. The strongest starter group is ${strongestPos}${bestStarter ? `, led by ${bestStarter.name}` : ""}. ${missed ? `At ${missed.draft.roundPick}, you took ${missed.name} while ${missed.draft.stealAvailable.name} was still flagged as ${missed.draft.stealAvailable.label}.` : weakestStarter && weakestStarter.draft?.selectedBand?.includes("Reach") ? `${weakestStarter.name} is the main starting-lineup reach to monitor.` : "No major starting-lineup reach is controlling the build."} ${benchSummary}`
    : "Start the simulator or enter live picks to generate a draft score.";

  return (
    <div style={{ padding: 14, maxHeight: 780, overflow: "auto", position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.55fr 1.45fr", gap: 14 }}>
        <div style={{ padding: 18, borderRadius: 10, background: "var(--green-900)", border: "1px solid var(--green-600)", minHeight: 200 }}>
          <div className="mono" style={{ color: "var(--slate)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>Starting Lineup Grade</div>
          <div className="num" style={{ color: starterGrade.color, fontSize: 68, marginTop: 10, lineHeight: 0.9 }}>{starterGrade.letter}</div>
          <div style={{ color: "var(--mint-soft)", fontSize: 15, fontWeight: 800, marginTop: 14 }}>{starterGrade.note}</div>
          <div className="mono" style={{ color: "var(--slate)", fontSize: 10, marginTop: 6 }}>{starters.length} starters · {(starterGrade.score || 0).toFixed(1)} avg draft score</div>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: "var(--green-900)", border: "1px solid var(--green-600)" }}>
          <div className="mono" style={{ color: "var(--mint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em" }}>Draft Summary</div>
          <p style={{ color: "var(--mint-soft)", fontSize: 13, lineHeight: 1.55, marginTop: 10 }}>{summary}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 14 }}>
            <EvidenceChip label="Starter Steals" value={starterBuckets.steals} />
            <EvidenceChip label="Expected" value={starterBuckets.expected} />
            <EvidenceChip label="Starter Reaches" value={starterBuckets.reaches} />
            <EvidenceChip label="Bench Reaches" value={benchBuckets.reaches} />
            <EvidenceChip label="Picks" value={userRoster.length} />
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginTop: 12 }}>
        {userRoster.map(p => (
          <div key={p.id}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ position: "relative", padding: 11, borderRadius: 8, background: window.positionBg(p.pos), border: `1px solid ${window.positionColor(p.pos)}66`, cursor: "help" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: "var(--mint-soft)", fontSize: 12, fontWeight: 800 }}>{p.name}</span>
              <span className="mono" style={{ color: window.draftStockGrade(p).color, fontSize: 11, fontWeight: 900 }}>{window.draftStockGrade(p).letter}</span>
            </div>
            <div className="mono" style={{ color: "var(--slate)", fontSize: 9, marginTop: 4 }}>{p.draft?.roundPick} · {p.draft?.selectedBand || p.valueLabel}</div>
            <div className="mono" style={{ color: "var(--slate-dim)", fontSize: 9, marginTop: 3 }}>
              Stock {Math.round(p.draft?.draftScore || window.draftStockGrade(p).score)} · {formatPickPrice(p.draft?.adpDelta || 0, p.draft?.selectedBand || p.valueLabel)} · {window.roleProjectionLabel(p)} · SOS {window.scheduleEaseRank(p)}
            </div>
            {hoveredId === p.id && <ScorePlayerTooltip player={p} teamCount={teamCount} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScorePlayerTooltip({ player, teamCount = player.draft?.teamCount || 12 }) {
  const draftGrade = window.draftStockGrade(player);
  const adpDelta = player.draft?.adpDelta || 0;
  const deltaLabel = adpDelta > 0
    ? `${adpDelta} after ADP (discount)`
    : adpDelta < 0
      ? `${Math.abs(adpDelta)} before ADP (overpay)`
      : "at ADP";
  const role = window.roleProjectionLabel(player);
  const stock = Math.round(player.draft?.draftScore || draftGrade.score);
  const sos = window.scheduleEaseRank(player);
  const sosNote = window.scheduleStrengthNote(player);
  const band = player.draft?.selectedBand || player.valueLabel || "Expected";
  const pickPrice = formatPickPrice(adpDelta, band);
  const valueGrade = window.seasonValueGrade(player);
  const valueIndex = player.valueIndex ? player.valueIndex.toFixed(2) : null;
  const actualPick = player.draft?.pick || null;
  const actualPickLabel = actualPick ? `#${actualPick} (${player.draft?.roundPick || window.formatRoundPick(actualPick - 1, teamCount)})` : "—";
  const adpLabel = `#${Math.round(player.adp)} (${window.formatAdpPick(player.adp, teamCount)})`;
  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 8,
      padding: "9px 11px", borderRadius: 8,
      background: "rgba(5,8,7,0.97)", border: "1px solid var(--green-600)",
      backdropFilter: "blur(6px)",
      width: 260, maxWidth: 260,
      boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
      pointerEvents: "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "var(--mint-soft)", fontSize: 12, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
          <div className="mono" style={{ marginTop: 2, color: window.positionColor(player.pos), fontSize: 9 }}>{player.pos} · ADP {window.formatAdpPick(player.adp, teamCount)}</div>
        </div>
        <span className="num" style={{ color: draftGrade.color, fontSize: 18, lineHeight: 1 }}>{draftGrade.letter}</span>
      </div>
      <div className="mono" style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr auto", gap: "3px 10px", fontSize: 10 }}>
        <span style={{ color: "var(--slate)" }}>Band</span><span style={{ color: window.valueToneForChip(band) }}>{band}</span>
        <span style={{ color: "var(--slate)" }}>Pick</span><span style={{ color: "var(--mint-soft)" }}>{actualPickLabel}</span>
        <span style={{ color: "var(--slate)" }}>ADP</span><span style={{ color: "var(--mint-soft)" }}>{adpLabel}</span>
        <span style={{ color: "var(--slate)" }}>949 Value</span><span style={{ color: valueGrade.color }}>{valueGrade.letter}{valueIndex ? ` · ${valueIndex}` : ""}</span>
        <span style={{ color: "var(--slate)" }}>Draft Stock</span><span style={{ color: "var(--mint-soft)" }}>{stock}</span>
        <span style={{ color: "var(--slate)" }}>Pick Price</span><span style={{ color: adpDelta >= 0 ? "var(--mint)" : "var(--gold)" }}>{pickPrice}</span>
        <span style={{ color: "var(--slate)" }}>EOS Role</span><span style={{ color: "var(--mint-soft)" }}>{role}</span>
        <span style={{ color: "var(--slate)" }}>SOS</span><span style={{ color: "var(--mint-soft)" }}>{sos}/32</span>
      </div>
      <div style={{ marginTop: 8, paddingTop: 7, borderTop: "1px solid rgba(149,249,174,0.16)", color: "var(--slate)", fontSize: 9, lineHeight: 1.4 }}>
        {deltaLabel} · {sosNote} · SOS 1–32 (1 = hardest)
      </div>
    </div>
  );
}

function formatPickPrice(adpDelta, band = "Expected") {
  if (band === "Expected") return "Expected";
  if (Math.abs(adpDelta) > 12) return band;
  if (adpDelta > 0) return `${band} +${adpDelta}`;
  if (adpDelta < 0) return `${band} ${adpDelta}`;
  return band;
}

function PicksRoundBoard({ pickLog, draftOrder, teams, teamCount, rounds }) {
  const byPick = Object.fromEntries(pickLog.map(item => [item.draft.pick, item]));
  return (
    <div style={{ padding: 14, maxHeight: 560, overflow: "auto" }}>
      <div style={{ display: "grid", gap: 8 }}>
        {Array.from({ length: rounds }, (_, r) => (
          <div key={r} style={{ display: "grid", gridTemplateColumns: `48px repeat(${teamCount}, minmax(74px, 1fr))`, gap: 5, alignItems: "stretch" }}>
            <div className="mono" style={{ color: "var(--mint)", fontSize: 11, display: "flex", alignItems: "center" }}>R{r + 1}</div>
            {Array.from({ length: teamCount }, (_, p) => {
              const roundPickIndex = r % 2 === 1 ? teamCount - 1 - p : p;
              const pick = r * teamCount + roundPickIndex + 1;
              const item = byPick[pick];
              const teamNumber = draftOrder[pick - 1];
              const team = teams[teamNumber - 1];
              return (
                <div key={pick} style={{ minHeight: 50, padding: 6, borderRadius: 6, border: "1px solid var(--green-600)", background: item ? window.positionBg(item.player.pos) : "var(--green-900)" }}>
                  <div className="mono" style={{ color: team?.isUser ? "var(--mint)" : "var(--slate)", fontSize: 9 }}>{window.formatRoundPick(pick - 1, teamCount)}</div>
                  <div style={{ marginTop: 4, color: item ? "var(--mint-soft)" : "var(--slate-dim)", fontSize: 10, lineHeight: 1.15, fontWeight: item ? 700 : 500, overflow: "hidden" }}>{item ? item.player.name : team?.name}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// GM Q&A box + Queue
// ────────────────────────────────────────────────────────────────────────────
function GmInteractionBox({ question, setQuestion, onSubmit, answer, gm, userRoster, pickNumber, onQueueDrop, rosterSlots }) {
  return (
    <div className="card"
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) onQueueDrop(id); }}
      style={{ padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.16em" }}>GM Interaction</div>
          <div className="display" style={{ fontSize: 14, color: "var(--mint-soft)", marginTop: 2 }}>Ask the GM</div>
        </div>
        <span className="mono" style={{ color: "var(--slate-dim)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase" }}>Pick {pickNumber} · {gm.biggestNeed || "—"}</span>
      </div>
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
        placeholder="Safe pick? Upside? Need? Player name?"
        style={{ width: "100%", minHeight: 56, resize: "vertical", background: "var(--green-900)", border: "1px solid var(--green-600)", borderRadius: 7, color: "var(--mint-soft)", padding: 8, fontFamily: "Sora", fontSize: 12, outline: "none" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 7, gap: 8 }}>
        <button className="btn" onClick={onSubmit} style={{ padding: "6px 12px", fontSize: 11 }}>Ask GM</button>
        <span className="mono" style={{ color: "var(--slate-dim)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase" }}>Roster {userRoster.length}/{rosterSlots.length}</span>
      </div>
      <div style={{ marginTop: 8, padding: 9, borderRadius: 7, background: "var(--green-900)", border: "1px solid var(--green-600)" }}>
        <div className="mono" style={{ color: "var(--mint)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" }}>Answer</div>
        <div style={{ marginTop: 5, color: "var(--mint-soft)", fontSize: 12, lineHeight: 1.45 }}>{answer}</div>
      </div>
    </div>
  );
}

function EvidenceChip({ label, value }) {
  return (
    <div style={{ padding: 8, borderRadius: 7, background: "rgba(149,249,174,0.06)", border: "1px solid var(--green-600)" }}>
      <div className="mono" style={{ color: "var(--slate)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div className="num" style={{ color: "var(--mint-soft)", fontSize: 15, lineHeight: 1, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function QueuedGradePanel({ queue, pickNumber, onQueue, onQueueDrop }) {
  return (
    <div className="card"
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) onQueueDrop(id); }}
      style={{ padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--mint)", textTransform: "uppercase", letterSpacing: "0.16em" }}>Queue</div>
          <div className="display" style={{ fontSize: 14, color: "var(--mint-soft)", marginTop: 2 }}>Watch List</div>
        </div>
        <span className="mono" style={{ color: "var(--slate-dim)", fontSize: 9 }}>{queue.length} player{queue.length === 1 ? "" : "s"}</span>
      </div>
      <div style={{ display: "grid", gap: 6, maxHeight: 200, overflow: "auto", paddingRight: 4 }}>
        {queue.length ? queue.map(p => {
          const dg = window.draftStockGradeForPick(p, pickNumber);
          return (
            <button key={p.id} onClick={() => onQueue(p.id)} style={{
              display: "grid", gridTemplateColumns: "22px minmax(0, 1fr) 26px", gap: 6, alignItems: "center",
              padding: "6px 8px", borderRadius: 6,
              border: `1px solid ${dg.color}55`, background: "var(--green-900)",
              color: "inherit", cursor: "pointer", textAlign: "left"
            }}>
              <span className="mono" style={{ color: window.positionColor(p.pos), fontSize: 9, fontWeight: 700 }}>{p.pos}</span>
              <span style={{ color: "var(--mint-soft)", fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              <span className="mono" style={{ color: dg.color, fontSize: 10, fontWeight: 800, textAlign: "right" }}>{dg.letter}</span>
            </button>
          );
        }) : (
          <div style={{ color: "var(--slate)", fontSize: 11, lineHeight: 1.5, padding: "4px 2px" }}>
            Drop players here or tap <span style={{ color: "var(--mint)" }}>Queue</span> on the board. Grades shift as the draft moves.
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// League platform-connect modal
// ────────────────────────────────────────────────────────────────────────────
function LeagueConnectModal({ platform, onClose, onConfirm }) {
  const platformName = ({ espn: "ESPN", yahoo: "Yahoo", sleeper: "Sleeper", cbs: "CBS" })[platform] || platform.toUpperCase();
  const hasApi = platform === "yahoo" || platform === "sleeper";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, background: "rgba(5,8,7,0.72)", backdropFilter: "blur(8px)"
    }}>
      <div className="card" style={{ width: "min(560px, 100%)", padding: 24, boxShadow: "0 24px 70px rgba(0,0,0,0.45)" }}>
        <div className="mono" style={{ color: "var(--mint)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          League Draft · {platformName}
        </div>
        <h2 className="display" style={{ margin: "8px 0 0", color: "var(--mint-soft)", fontSize: 26 }}>
          {hasApi ? `Connect ${platformName} league` : `${platformName} manual league entry`}
        </h2>
        <p style={{ color: "var(--slate)", fontSize: 13, lineHeight: 1.55, marginTop: 12 }}>
          {hasApi
            ? `${platformName} league connection will let 949 pull draft picks directly when the API integration is enabled. For now, use the live-entry board to record each pick as it happens.`
            : `${platformName} league sync is manual for this testing phase. Record every draft pick as it happens so the rest of the dashboard stays current.`}
        </p>
        <div style={{ display: "grid", gap: 6, marginTop: 14 }}>
          {[
            "1. Confirm teams, draft position, scoring, platform, and roster layout above.",
            "2. Click each drafted player on the board in real draft order.",
            "3. Use Live, Picks, and Score to audit the league and your draft as it fills.",
          ].map(line => (
            <div key={line} style={{ padding: 9, borderRadius: 8, border: "1px solid var(--green-600)", background: "var(--green-900)", color: "var(--mint-soft)", fontSize: 12 }}>{line}</div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          {hasApi && <button className="btn ghost" onClick={onConfirm}>Continue Manual Entry</button>}
          <button className="btn" onClick={onConfirm}>{hasApi ? `Connect ${platformName} TBD` : "Start Live Entry"}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Draft Complete — surfaces once the simulator/league fills every pick.
function DraftCompleteModal({ grade, onReview, onClose, onReset }) {
  const hasPicks = grade && grade.letter !== "—";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, background: "rgba(5,8,7,0.78)", backdropFilter: "blur(8px)"
    }}>
      <div className="card" style={{ width: "min(480px, 100%)", padding: 24, boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
        <div className="mono" style={{ color: "var(--mint)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>Draft Complete</div>
        <h2 className="display" style={{ margin: "8px 0 12px", color: "var(--mint-soft)", fontSize: 26, lineHeight: 1.1 }}>Your draft has concluded</h2>
        <p style={{ color: "var(--slate)", fontSize: 13, lineHeight: 1.55 }}>
          Every pick is in. Open Review to see the starting-lineup grade, pick-by-pick band, and missed value calls.
        </p>
        {hasPicks && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "var(--green-900)", border: `1px solid ${grade.color}55`, display: "flex", alignItems: "center", gap: 14 }}>
            <span className="num" style={{ color: grade.color, fontSize: 44, lineHeight: 1, fontWeight: 900 }}>{grade.letter}</span>
            <div>
              <div className="mono" style={{ color: "var(--slate)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Current Grade</div>
              <div style={{ color: "var(--mint-soft)", fontSize: 13, marginTop: 4 }}>{grade.note}</div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button className="btn ghost" onClick={onReset}>Reset Draft</button>
          <button className="btn ghost" onClick={onClose}>Stay on Board</button>
          <button className="btn" onClick={onReview}>Review Draft</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DraftView });
