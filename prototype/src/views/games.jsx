// Games — stadium map (CSV lat/lng, shared-venue home override)

function GamesView({ onSelectPlayer }) {
  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "28px 32px 48px" }}>
      <StadiumMap onSelectPlayer={onSelectPlayer} />
    </div>
  );
}

Object.assign(window, { GamesView });
