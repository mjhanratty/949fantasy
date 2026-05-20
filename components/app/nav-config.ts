export type NavItem = {
  href: string
  label: string
}

/** Primary authenticated top nav (page content spec). GM + Coach: see docs/ia-routes.md — wire when routes exist. */
export const primaryNav: NavItem[] = [
  { href: "/snapshot", label: "Snapshot" },
  { href: "/metrics", label: "Metrics" },
  { href: "/performance", label: "Performance" },
  { href: "/rankings", label: "Rankings" },
  { href: "/lineup", label: "Lineup" },
  { href: "/games", label: "Games" },
  { href: "/players", label: "Players" },
  { href: "/draft-data", label: "Draft Data" },
  // { href: "/gm", label: "GM" },
  // { href: "/coach", label: "Coach" },
  { href: "/settings", label: "Settings" },
]

export type SubNavItem = {
  href: string
  label: string
  /** Parent path prefix; subnav shown when pathname starts with this. */
  prefix: string
  /** If true, only active on exact `href` match (hub row). */
  exact?: boolean
}

export const subNavItems: SubNavItem[] = [
  { prefix: "/metrics", href: "/metrics", label: "Overview", exact: true },
  {
    prefix: "/metrics",
    href: "/metrics/weekly-points",
    label: "Weekly points",
  },
  {
    prefix: "/metrics",
    href: "/metrics/position-metrics",
    label: "Position metrics",
  },
  { prefix: "/performance", href: "/performance", label: "Overview", exact: true },
  {
    prefix: "/performance",
    href: "/performance/trends",
    label: "Player trends",
  },
  { prefix: "/performance", href: "/playertape", label: "Player tape" },
  { prefix: "/games", href: "/games", label: "Map", exact: true },
  { prefix: "/games", href: "/games/players", label: "Conditions" },
  { prefix: "/games", href: "/games/trends", label: "Trends" },
  { prefix: "/settings", href: "/settings", label: "Preferences", exact: true },
  {
    prefix: "/settings",
    href: "/settings/leagues",
    label: "League connections",
  },
]

export function isSubNavActive(pathname: string, item: SubNavItem): boolean {
  if (item.exact) return pathname === item.href
  if (item.href === "/playertape") return pathname === "/playertape"
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
