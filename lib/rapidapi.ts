export type NormalizedNflTeam = {
  id: string;
  name: string;
  abbreviation?: string;
  city?: string;
  displayName: string;
  conference?: string;
  division?: string;
  color?: string;
  alternateColor?: string;
  raw: unknown;
};

type RapidApiTeamRecord = Record<string, unknown>;

function requireEnv(name: string) {
  const value = process.env[name]?.trim().replace(/^["']|["']$/g, "");

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readString(record: RapidApiTeamRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

function getTeamArray(payload: unknown): RapidApiTeamRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is RapidApiTeamRecord => typeof item === "object" && item !== null);
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const likelyKeys = ["data", "teams", "response", "results", "body"];

  for (const key of likelyKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is RapidApiTeamRecord => typeof item === "object" && item !== null);
    }
  }

  return [];
}

export function normalizeNflTeams(payload: unknown): NormalizedNflTeam[] {
  return getTeamArray(payload).map((team, index) => {
    const teamRecord =
      typeof team.team === "object" && team.team !== null
        ? (team.team as RapidApiTeamRecord)
        : team;
    const id =
      readString(teamRecord, ["teamId", "id", "TeamID", "team_id", "key", "slug"]) ??
      `team-${index + 1}`;
    const abbreviation = readString(teamRecord, ["abbreviation", "abbr", "teamAbv", "Team", "key"]);
    const displayNameFromProvider = readString(teamRecord, ["displayName", "fullName", "teamDisplayName"]);
    const shortName = readString(teamRecord, ["shortDisplayName", "nickname", "name", "teamName", "Name"]);
    const location = readString(teamRecord, ["location", "city", "market", "City"]);
    const name = shortName ?? displayNameFromProvider ?? abbreviation ?? "Unknown Team";
    const city = location;
    const conference = readString(teamRecord, ["conference", "Conference"]);
    const division = readString(teamRecord, ["division", "Division"]);
    const color = readString(teamRecord, ["color"]);
    const alternateColor = readString(teamRecord, ["alternateColor"]);
    const displayName =
      displayNameFromProvider ??
      [city, name].filter(Boolean).join(" ") ??
      name;

    return {
      id,
      name,
      abbreviation,
      city,
      displayName,
      conference,
      division,
      color: color ? `#${color.replace(/^#/, "")}` : undefined,
      alternateColor: alternateColor ? `#${alternateColor.replace(/^#/, "")}` : undefined,
      raw: team,
    };
  });
}

export async function fetchRapidApiNflTeams() {
  const baseUrl = requireEnv("RAPIDAPI_NFL_API_BASE_URL").replace(/\/$/, "");
  const endpoint = process.env.RAPIDAPI_NFL_TEAMS_ENDPOINT ?? "/nfl-team-listing/v1/data";
  const host = requireEnv("RAPIDAPI_NFL_API_HOST");
  const apiKey = requireEnv("RAPIDAPI_NFL_API_KEY");

  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey,
    },
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { rawText: text };
  }

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      error: "RapidAPI request failed",
      payload,
    };
  }

  return {
    ok: true as const,
    status: response.status,
    teams: normalizeNflTeams(payload),
    provider: "rapidapi_nfl_api_data",
  };
}
