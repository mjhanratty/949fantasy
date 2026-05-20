import { latLngToMapXY } from "@/lib/map/projection"

/** Source: team stadium CSV (lat/lng). Conference + dome flag from `g` column where present. */
export type StadiumLocation = {
  team: string
  label: string
  conference: "AFC" | "NFC"
  lat: number
  lng: number
  indoor: boolean
  x: number
  y: number
}

const RAW: Omit<StadiumLocation, "x" | "y">[] = [
  { team: "TEN", label: "Nashville", conference: "AFC", lat: 36.166461, lng: -86.771289, indoor: true },
  { team: "NYG", label: "East Rutherford", conference: "NFC", lat: 40.812194, lng: -74.076983, indoor: false },
  { team: "PIT", label: "Pittsburgh", conference: "AFC", lat: 40.446786, lng: -80.015761, indoor: false },
  { team: "CAR", label: "Charlotte", conference: "NFC", lat: 35.225808, lng: -80.852861, indoor: true },
  { team: "BAL", label: "Baltimore", conference: "AFC", lat: 39.277969, lng: -76.622767, indoor: true },
  { team: "TB", label: "Tampa", conference: "NFC", lat: 27.975967, lng: -82.50335, indoor: true },
  { team: "IND", label: "Indianapolis", conference: "AFC", lat: 39.760056, lng: -86.163806, indoor: true },
  { team: "MIN", label: "Minneapolis", conference: "NFC", lat: 44.973881, lng: -93.258094, indoor: true },
  { team: "ARI", label: "Glendale", conference: "NFC", lat: 33.5277, lng: -112.262608, indoor: true },
  { team: "DAL", label: "Arlington", conference: "NFC", lat: 32.747778, lng: -97.092778, indoor: true },
  { team: "ATL", label: "Atlanta", conference: "NFC", lat: 33.757614, lng: -84.400972, indoor: true },
  { team: "NYJ", label: "East Rutherford", conference: "AFC", lat: 40.812194, lng: -74.076983, indoor: false },
  { team: "DEN", label: "Denver", conference: "AFC", lat: 39.743936, lng: -105.020097, indoor: true },
  { team: "MIA", label: "Miami Gardens", conference: "AFC", lat: 25.957919, lng: -80.238842, indoor: false },
  { team: "PHI", label: "Philadelphia", conference: "NFC", lat: 39.900775, lng: -75.167453, indoor: false },
  { team: "CHI", label: "Chicago", conference: "NFC", lat: 41.862306, lng: -87.616672, indoor: false },
  { team: "NE", label: "Foxborough", conference: "AFC", lat: 42.090925, lng: -71.26435, indoor: false },
  { team: "WAS", label: "Landover", conference: "NFC", lat: 38.907697, lng: -76.864517, indoor: false },
  { team: "GB", label: "Green Bay", conference: "NFC", lat: 44.501306, lng: -88.062167, indoor: false },
  { team: "LAC", label: "San Diego", conference: "AFC", lat: 32.783117, lng: -117.119525, indoor: false },
  { team: "NO", label: "New Orleans", conference: "NFC", lat: 29.950931, lng: -90.081364, indoor: true },
  { team: "HOU", label: "Houston", conference: "AFC", lat: 29.684781, lng: -95.410956, indoor: true },
  { team: "BUF", label: "Orchard Park", conference: "AFC", lat: 42.773739, lng: -78.786978, indoor: true },
  { team: "SF", label: "Santa Clara", conference: "NFC", lat: 37.713486, lng: -122.386256, indoor: false },
  { team: "JAX", label: "Jacksonville", conference: "AFC", lat: 30.323925, lng: -81.637356, indoor: false },
  { team: "CLE", label: "Cleveland", conference: "AFC", lat: 41.506022, lng: -81.699564, indoor: false },
  { team: "LV", label: "Las Vegas", conference: "AFC", lat: 37.751411, lng: -122.200889, indoor: true },
  { team: "KC", label: "Kansas City", conference: "AFC", lat: 39.048914, lng: -94.484039, indoor: false },
  { team: "LAR", label: "St. Louis", conference: "NFC", lat: 38.632975, lng: -90.188547, indoor: false },
  { team: "SEA", label: "Seattle", conference: "NFC", lat: 47.595153, lng: -122.331625, indoor: false },
  { team: "CIN", label: "Cincinnati", conference: "AFC", lat: 39.095442, lng: -84.516039, indoor: false },
  { team: "DET", label: "Detroit", conference: "NFC", lat: 42.340156, lng: -83.045808, indoor: true },
]

export const STADIUM_BY_TEAM: Record<string, StadiumLocation> = Object.fromEntries(
  RAW.map((row) => {
    const { x, y } = latLngToMapXY(row.lat, row.lng)
    return [row.team, { ...row, x, y }]
  })
)

/** MetLife (NYG/NYJ) and LAC/LAR use one map dot per week at the home team's coordinates. */
export const SHARED_STADIUM_GROUPS: { teams: string[] }[] = [
  { teams: ["NYG", "NYJ"] },
  { teams: ["LAC", "LAR"] },
]

/**
 * Week 11 home team at shared venues (mock). Away club travels to these coords.
 * Update when schedule ingestion exists.
 */
export const WEEK11_HOME_AT_SHARED: Record<string, string> = {
  NYG: "NYJ",
  NYJ: "NYJ",
  LAC: "LAR",
  LAR: "LAR",
}

export function stadiumForTeam(team: string, homeOverrides = WEEK11_HOME_AT_SHARED): StadiumLocation {
  const group = SHARED_STADIUM_GROUPS.find((g) => g.teams.includes(team))
  if (!group) return STADIUM_BY_TEAM[team]
  const home = homeOverrides[team] ?? team
  const siteTeam = group.teams.includes(home) ? home : team
  return STADIUM_BY_TEAM[siteTeam]
}

/** Map-visible site for a team this week (home coords for shared stadiums). */
export function mapSiteForTeam(
  team: string,
  homeOverrides = WEEK11_HOME_AT_SHARED
): StadiumLocation & { displayTeam: string } {
  const group = SHARED_STADIUM_GROUPS.find((g) => g.teams.includes(team))
  if (!group) {
    const s = STADIUM_BY_TEAM[team]
    return { ...s, displayTeam: team }
  }
  const home = homeOverrides[team] ?? team
  const site = STADIUM_BY_TEAM[home]
  return { ...site, displayTeam: home }
}

export type MapMarker = {
  /** Primary team label on the dot (home club at shared venues). */
  team: string
  city: string
  indoor: boolean
  x: number
  y: number
  lat: number
  lng: number
  /** All franchises whose stadium coords resolve to this map point. */
  teamsAtSite: string[]
}

const STATUS_RANK: Record<string, number> = {
  you: 4,
  opp: 3,
  neutral: 2,
  off: 1,
}

/**
 * One marker per map coordinate. Shared venues (NYG/NYJ, LAC/LAR) collapse to a
 * single dot at the home team's lat/lng for that week.
 */
export function buildMapMarkers(
  weekStatus: Record<string, string>,
  homeOverrides = WEEK11_HOME_AT_SHARED
): MapMarker[] {
  const byKey = new Map<string, MapMarker & { status: string }>()

  for (const team of Object.keys(STADIUM_BY_TEAM)) {
    const site = mapSiteForTeam(team, homeOverrides)
    const key = `${site.x},${site.y}`
    const status = weekStatus[team] ?? "off"
    const existing = byKey.get(key)

    if (!existing) {
      byKey.set(key, {
        team: site.displayTeam,
        city: site.label,
        indoor: site.indoor,
        x: site.x,
        y: site.y,
        lat: site.lat,
        lng: site.lng,
        teamsAtSite: [team],
        status,
      })
      continue
    }

    existing.teamsAtSite.push(team)
    if ((STATUS_RANK[status] ?? 0) > (STATUS_RANK[existing.status] ?? 0)) {
      existing.status = status
    }
    if (homeOverrides[team] === team || team === site.displayTeam) {
      existing.team = site.displayTeam
    }
  }

  return Array.from(byKey.values()).map(({ status: _s, ...m }) => m)
}
