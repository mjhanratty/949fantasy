// Hand-crafted small icon set (24x24, stroke-based)
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.6, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IconDashboard = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>;
const IconRanking = (p) => <Icon {...p}><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M22 20H2"/></Icon>;
const IconPlayer = (p) => <Icon {...p}><circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7"/></Icon>;
const IconLineup = (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="7"  cy="6"  r="1.5" fill="currentColor"/><circle cx="14" cy="12" r="1.5" fill="currentColor"/><circle cx="9"  cy="18" r="1.5" fill="currentColor"/></Icon>;
const IconTrade = (p) => <Icon {...p}><path d="M4 8l4-4 4 4"/><path d="M8 4v16"/><path d="M20 16l-4 4-4-4"/><path d="M16 20V4"/></Icon>;
const IconInsight = (p) => <Icon {...p}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2v.3h6V17c0-.8.4-1.5 1-2A7 7 0 0012 2z"/></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 004 0"/></Icon>;
const IconChevron = (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
const IconArrowUp = (p) => <Icon {...p}><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></Icon>;
const IconArrowDown = (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Icon>;
const IconFilter = (p) => <Icon {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconClose = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>;
const IconTrend = (p) => <Icon {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></Icon>;
const IconSwap = (p) => <Icon {...p}><path d="M7 16H3l4-4M3 16l4 4"/><path d="M17 8h4l-4-4M21 8l-4 4"/></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></Icon>;
const IconBolt = (p) => <Icon {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></Icon>;

Object.assign(window, {
  Icon, IconDashboard, IconRanking, IconPlayer, IconLineup, IconTrade, IconInsight,
  IconSearch, IconBell, IconChevron, IconArrowUp, IconArrowDown, IconSettings,
  IconCalendar, IconFilter, IconPlus, IconClose, IconCheck, IconTrend, IconSwap, IconLock, IconBolt
});
