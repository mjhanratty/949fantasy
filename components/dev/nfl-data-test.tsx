"use client";

import { useState } from "react";

type NflTeam = {
  id: string;
  name: string;
  abbreviation?: string;
  city?: string;
  displayName: string;
  conference?: string;
  division?: string;
};

type TeamsResponse =
  | {
      ok: true;
      status: number;
      teams: NflTeam[];
      provider: string;
    }
  | {
      ok: false;
      status?: number;
      error: string;
    };

export function NflDataTest() {
  const [data, setData] = useState<TeamsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadTeams() {
    setIsLoading(true);
    setData(null);

    try {
      const response = await fetch("/api/nfl/teams");
      const body = (await response.json()) as TeamsResponse;
      setData(body);
    } catch (error) {
      setData({
        ok: false,
        error: error instanceof Error ? error.message : "Unable to load NFL teams",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const teams = data?.ok ? data.teams : [];

  return (
    <section className="rounded-lg border border-divider bg-green-900/80 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-white-mint">NFL Data Test</h2>
          <p className="text-sm text-slate-text">
            Server route: <code className="text-mint">/api/nfl/teams</code>
          </p>
        </div>
        <button
          type="button"
          onClick={loadTeams}
          disabled={isLoading}
          className="min-h-10 rounded-md border border-mint/50 bg-mint px-3.5 font-semibold text-deep-green disabled:cursor-wait disabled:opacity-65"
        >
          {isLoading ? "Loading..." : "Load Teams"}
        </button>
      </div>

      {data && !data.ok ? (
        <div className="mb-4 flex flex-wrap justify-between gap-3 rounded-md border border-signal-red/35 bg-signal-red/10 p-3 text-slate-text">
          <strong className="text-white-mint">Connection failed</strong>
          <span>{data.error}</span>
        </div>
      ) : null}

      {data?.ok ? (
        <div className="mb-4 flex flex-wrap justify-between gap-3 rounded-md border border-divider bg-mint/10 p-3 text-slate-text">
          <strong className="text-white-mint">{teams.length} teams loaded</strong>
          <span>Provider: {data.provider}</span>
        </div>
      ) : null}

      <div className="grid gap-2">
        {teams.map((team) => (
          <article
            className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-divider bg-surface/80 p-3"
            key={team.id}
          >
            <div>
              <strong className="block text-white-mint">{team.displayName}</strong>
              <span className="text-sm text-slate-text">
                {[team.city, team.name].filter(Boolean).join(" ")}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {team.abbreviation ? (
                <span className="rounded-full border border-divider px-2 py-1 text-xs text-white-mint">
                  {team.abbreviation}
                </span>
              ) : null}
              {team.conference ? (
                <span className="rounded-full border border-divider px-2 py-1 text-xs text-white-mint">
                  {team.conference}
                </span>
              ) : null}
              {team.division ? (
                <span className="rounded-full border border-divider px-2 py-1 text-xs text-white-mint">
                  {team.division}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
