# Cursor Prompt: Add Draft Simulator Tab


> **Canonical source:** `/Users/matthewhanratty/Documents/New project/949fantasy-draft-simulator-cursor-prompt.md`


You are working in `/Users/matthewhanratty/Documents/New project`. Build a new Draft experience in the existing 949Fantasy prototype, matching the current dark green/mint UI system and component patterns.

## Current App Context

- Prototype entry: `prototype/index.html`
- App/nav/router: `prototype/src/app.jsx`
- Shared mock/live data: `prototype/src/data.jsx`
- Shared primitives: `prototype/src/primitives.jsx`
- Current rankings UI: `prototype/src/views/rankings.jsx`
- Start/Sit UI: `prototype/src/views/lineup.jsx`
- Live NFL team API route exists at `src/app/api/nfl/teams/route.ts`
- Prototype fetches team metadata from `http://127.0.0.1:3000/api/nfl/teams` in `prototype/src/data.jsx` via `hydrateNflTeamsFromApi()`

Keep this as a prototype build using the current browser-global React/Babel pattern. Do not convert the prototype to a bundled React app.

## User Goal

Add a new top-level nav tab called `Draft`, placed immediately to the right of `Start / Sit`. It should open a fantasy football draft simulator with:

- GM panel on the left
- Draft Board in the middle
- Your Team on the right
- Live grading/status for the user's picks at the top
- Draft mode tabs/options: `Simulator`, `Live`, and `Team`
- Only the live simulator needs to be functional now
- Up to 11 computer managers drafting against the user, for a 12-team league by default
- Clicking/drafting a player greys that player out everywhere in the simulator/live board
- The user's drafted players populate the right-side team panel
- Computer teams should build as the draft progresses
- UI/style should match the existing 949Fantasy implementation, especially the current nav, cards, chips, buttons, tabs, player rows, and dark green/mint palette

Reference layout intent from the supplied mock:

- Left GM lane: steal/reach bands from high steal through high reach, plus a GM question/feedback box
- Center: dense draft board populated with player tiles/cards
- Right: queue/live/team controls and queued/drafted player area
- Top: grading summary for user's picks

## Data Requirements

Use the existing `window.PLAYERS` data first. It already contains fields needed for a useful draft board:

- `id`
- `name`
- `pos`
- `team`
- `num`
- `proj`
- `rank`
- `ros`
- `adp`
- `round`
- `risk`
- `boom`
- `bust`
- `matchupRating`
- `notes`
- `traj`

Use existing `window.TEAMS` metadata, including team colors, for player tiles.

The user referenced external ranking/projection inputs:

- ESPN PPR: `https://fantasy.espn.com/football/players/projections`
- ESPN Non-PPR: `https://fantasy.espn.com/football/players/projections?leagueFormatId=1`
- Yahoo Top 300: `https://sports.yahoo.com/fantasy/article/fantasy-football-rankings-consensus-top-300-players-160643696.html`
- PFF 2026 PPR: `https://www.pff.com/news/fantasy-football-rankings-2026-way-too-early-top-300-ppr-big-board`
- PFF current PPR: `https://www.pff.com/news/fantasy-football-rankings-top-300-ppr-big-board`

Do not scrape these from the browser UI in this pass. Instead, structure the Draft code so ranking/projection sources can be swapped in later. For now:

- Use `window.PLAYERS` as the board source
- Use `adp` as the market price
- Use `proj` as the base fantasy points projection
- Add a scoring selector with `PPR`, `Half PPR`, and `Standard`
- Derive scoring-adjusted points in a simple, centralized helper:
  - PPR: `proj`
  - Half PPR: lower RB/WR/TE receiving-heavy player projections slightly, e.g. `proj * 0.94`
  - Standard: lower RB/WR/TE projections more, e.g. `proj * 0.88`
  - QB can remain unchanged for now
- Add clear TODO comments where future ESPN/Yahoo/PFF projection/ranking adapters should connect.

## Implementation Tasks

1. Create `prototype/src/views/draft.jsx`.
2. Add script includes for `draft-helpers.jsx`, `draft-rankings.jsx`, and `draft.jsx` in `prototype/index.html`, before `src/app.jsx`.
3. Add `{ id: "draft", label: "Draft", subs: [...] }` to the `NAV` array in `prototype/src/app.jsx`, with `Draft Board` and `Rankings (Pre-Season)`.
4. Add a route render in `App()`:
   - `view === "draft" && sub === "rankings"` renders `<DraftRankingsView onSelectPlayer={selectPlayer} />`
   - `view === "draft" && sub !== "rankings"` renders `<DraftView onSelectPlayer={selectPlayer} />`
   - Use `data-screen-label` values like `06 Draft Rankings` and `06 Draft Board`
5. Add Draft to the Footer product links if useful.
6. Reuse shared primitives where possible:
   - `PlayerCell`
   - `TeamChip`
   - `PosPill`
   - `RiskDot`
   - `Gauge`
   - `TabBar`
   - `SectionTitle`
7. Keep styling consistent with inline style patterns already used in `rankings.jsx` and `lineup.jsx`.

## Draft Simulator Behavior

Default settings:

- 12 teams total
- User team slot defaults to pick 6
- Snake draft
- 10 rounds for prototype
- Roster slots: `QB`, `RB`, `RB`, `WR`, `WR`, `TE`, `FLEX`, `FLEX`, `BENCH`, `BENCH`
- Computer managers: 11 generated teams with names that fit the existing league tone

State to maintain:

- `mode`: `simulator`, `live`, `team`
- `scoring`: `ppr`, `half`, `std`
- `teamCount`
- `userSlot`
- `rounds`
- `currentPickIndex`
- `draftedByPlayerId`
- `teams`
- `queue`
- `positionFilter`
- `search`

Core helpers:

- `buildDraftOrder(teamCount, rounds)` for snake order
- `currentTeamId` derived from `draftOrder[currentPickIndex]`
- `isUserTurn`
- `availablePlayers`
- `draftPlayer(playerId, teamId)`
- `autoPick()` for the current computer team
- `simulateToUserPick()` drafts computer picks until user's next turn
- `resetDraft()`

Computer drafting:

- Use a deterministic ranking score so behavior is stable:
  - scoring-adjusted projection
  - ADP value
  - roster need
  - small risk penalty
- Computer teams should avoid taking too many QBs/TEs early unless value is high.
- Fill starting roster needs before bench when possible.

User drafting:

- User can draft by clicking a player on their turn.
- If it is not the user's turn, clicking can either add/remove from Queue or show a subtle disabled state. Prefer:
  - Main draft button disabled unless `isUserTurn`
  - Secondary queue button always available for undrafted players
- When user drafts a player:
  - Add player to the user's roster
  - Mark player drafted globally
  - Grey player out in the board and queue/live areas
  - Advance pick
  - Computer picks should continue only when user clicks `Sim to My Pick`, not automatically.

Greyed-out behavior:

- Drafted players remain visible if filters/search match, but:
  - opacity reduced
  - card background muted
  - action disabled
  - show drafted team/pick label

## Layout Requirements

Top page shell:

- Use `maxWidth: 1440`, centered, `padding: "32px"`
- Header eyebrow: `Draft Room · 12-team PPR`
- H1: `Draft Command`
- Subcopy: short, product-like, not instructional
- Right side controls:
  - `PPR / Half / Standard` scoring `TabBar`
  - `Reset`
  - `Sim to My Pick`
  - `Auto Pick` when it is user's turn

Top grading strip:

- Horizontal card with:
  - Current pick
  - User slot
  - Team grade
  - Projected starters
  - Best value pick
  - Reach warning
- Grade can be heuristic:
  - Compare drafted player's ADP to actual pick number
  - Value pick = pick number later than ADP
- Reach = pick number earlier than ADP
- Overall grade A/B/C/D from average value and roster balance

Draft Rankings table columns:

- Rank.
- Player.
- Proj (Total).
- Bye.
- SOS.
- Risk.
- Boom / Bust.
- YOY Trend.
- Value.

Draft score/player tooltip fields:

- Band.
- Draft Stock.
- Pick Price.
- EOS Role.
- SOS.

Main grid:

- Three columns: left GM, center Draft Board, right Your Team
- Suggested CSS grid: `280px minmax(0, 1fr) 320px`
- Use responsive fallback: at narrower widths stack panels.

Left GM panel:

- Card with a compact assistant/GM header
- Show current recommendation:
  - Best available
  - Best value
  - Biggest roster need
- Add the vertical value ladder:
  - High Steal: dark blue
  - Mid Steal: blue
  - Low Steal: teal
  - Expected: green
  - Low Reach: gold
  - Mid Reach: orange
  - High Reach: red
- Map available players into these bands based on `pickNumber - adp`
- Add a small GM question box:
  - Input field/textarea
  - A canned answer area that reacts to selected player/current need
  - No external AI call yet

Center Draft Board:

- Card with controls:
  - Search input
  - Position filter tabs: `ALL`, `QB`, `RB`, `WR`, `TE`, `FLEX`
  - Mode tabs: `Simulator`, `Live`, `Team`
- Dense board layout:
  - Prefer rows or compact tiles over huge cards
  - Each player row/tile shows:
    - rank
    - `PlayerCell`
    - adjusted projection
    - ADP
    - value vs current pick
    - risk
    - draft/queue actions
- Preserve a clear "Draft Board" center feeling.

Right Your Team panel:

- Card showing:
  - User team name
  - Current roster slots
  - Drafted user players
  - Queue
- Queue behavior:
  - Users can queue players
  - Queued players show progressive visual urgency as they approach likely draft range
  - If queued player gets drafted by any team, grey it out in the queue with drafted label

Live feed:

- Add a compact pick log either in the right panel or below the board:
  - Pick number
  - Round.pick
  - Team
  - Player
  - Value/reach label

## Visual Style

Use the existing style language:

- Dark background `var(--black)`
- Card surfaces `var(--green-800)` and `var(--green-900)`
- Borders `var(--green-600)`
- Accent `var(--mint)` and `var(--mint-soft)`
- Muted copy `var(--slate)` and `var(--slate-dim)`
- Existing `.btn`, `.chip`, `.card`, `.mono`, `.display`, `.num`
- Keep border radius aligned with existing cards/buttons
- Use compact operational/dashboard UI, not a landing-page hero
- No nested cards inside cards unless they are roster slots, rows, or repeated list items

## Acceptance Criteria

- `Draft` appears in the top nav immediately after `Start / Sit`
- Clicking `Draft` opens the new Draft simulator view
- The prototype still loads from `npm run prototype` / `http://localhost:3456`
- No console errors on page load
- Draft board uses `window.PLAYERS`
- Scoring selector changes displayed projections and board order
- User can queue players
- User can draft players on their turn
- Computer managers can draft against the user up to 11 teams
- `Sim to My Pick` advances computer picks correctly
- Drafted players are greyed out globally
- User roster populates on the right
- Pick log updates
- Reset restores the initial draft state
- UI is visually consistent with the current 949Fantasy prototype

## Nice-to-Have, Only If Time Allows

- Persist draft state in `localStorage`
- Add user controls for team count, user pick slot, and rounds
- Add a selected-player preview drawer using existing player detail styling
- Add mobile stacking behavior with sticky draft controls
