import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  stroke?: string
}

function Icon({
  d,
  size = 16,
  stroke = "currentColor",
  fill = "none",
  strokeWidth = 1.6,
  children,
  style,
  ...rest
}: IconProps & { d?: string; children?: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      {...rest}
    >
      {d ? <path d={d} /> : children}
    </svg>
  )
}

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
)
export const IconBell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10 21a2 2 0 004 0" />
  </Icon>
)
export const IconChevron = (p: IconProps) => <Icon {...p} d="M9 6l6 6-6 6" />
export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
  </Icon>
)
export const IconLock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </Icon>
)
export const IconClose = (p: IconProps) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />
export const IconPlus = (p: IconProps) => <Icon {...p} d="M12 5v14M5 12h14" />
export const IconCheck = (p: IconProps) => <Icon {...p} d="M20 6L9 17l-5-5" />
export const IconArrowUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </Icon>
)
export const IconArrowDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12l7 7 7-7" />
  </Icon>
)
export const IconBolt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </Icon>
)
export const IconSwap = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 16H3l4-4M3 16l4 4" />
    <path d="M17 8h4l-4-4M21 8l-4 4" />
  </Icon>
)
