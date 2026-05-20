/**
 * SVG lockup aligned to the splash in `949Fantasy.html` (viewBox 1200×800):
 * surface #050807, "949" #95F9AE, "FANTASY" #D9FFE4.
 */
export function HeroMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="949Fantasy"
    >
      <title>949Fantasy</title>
      <rect width="1200" height="800" fill="#050807" />
      <text
        x="600"
        y="430"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="900"
        fontSize="280"
        fill="#95F9AE"
        letterSpacing="-12"
      >
        949
      </text>
      <text
        x="600"
        y="540"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="42"
        fill="#D9FFE4"
        letterSpacing="6"
      >
        FANTASY
      </text>
    </svg>
  );
}
