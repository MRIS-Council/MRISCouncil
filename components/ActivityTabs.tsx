"use client";
import { useState } from "react";

export default function ActivityTabs({ teams, upcoming, past }: { teams: any[]; upcoming: any[]; past: any[] }) {
  const [tab, setTab] = useState<"results" | "fixtures" | "table">("fixtures");
  const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? "—";
  const groups = [...new Set(teams.map((t) => t.group_name).filter(Boolean))];
  const hasGroups = groups.length > 0;

  const standingsTable = (rows: any[]) => (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-blue-700/60 dark:text-blue-300/60 text-[.68rem] uppercase tracking-widest border-b-2 border-blue-100 dark:border-blue-900">
          <th className="py-2">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {[...rows].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if ((b.goal_difference ?? 0) !== (a.goal_difference ?? 0)) return (b.goal_difference ?? 0) - (a.goal_difference ?? 0);
          if ((b.goals_for ?? 0) !== (a.goals_for ?? 0)) return (b.goals_for ?? 0) - (a.goals_for ?? 0);
          return (a.name ?? "").localeCompare(b.name ?? "");
        }).map((t) => (
          <tr key={t.id} className="border-b border-blue-100 dark:border-blue-900">
            <td className="py-2 font-bold">{t.name}</td><td>{t.played}</td><td>{t.won}</td><td>{t.drawn}</td><td>{t.lost}</td>
            <td>{t.goals_for ?? 0}</td><td>{t.goals_against ?? 0}</td><td>{t.goal_difference ?? 0}</td>
            <td className="font-black text-blue-600">{t.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="mt-10">
      <div className="flex gap-2 mb-6">
        {(["fixtures", "results", "table"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg ${tab === t ? "bg-blue-900 text-white" : "border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300"}`}>
            {t === "table" ? "Points table" : t}
          </button>
        ))}
      </div>

      {tab === "fixtures" && (
        <div className="space-y-3">
          {upcoming.map((f) => (
            <div key={f.id} className="card p-4">
              <p className="font-bold text-sm">{teamName(f.home_team_id)} vs {teamName(f.away_team_id)}</p>
              <p className="text-xs text-blue-700/70">{new Date(f.match_date).toLocaleString()}{f.location ? ` · ${f.location}` : ""}</p>
            </div>
          ))}
          {!upcoming.length && <p className="text-sm text-blue-700/70">No upcoming fixtures.</p>}
        </div>
      )}

      {tab === "results" && (
        <div className="space-y-3">
          {past.map((f) => (
            <div key={f.id} className="card p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{teamName(f.home_team_id)} vs {teamName(f.away_team_id)}</p>
                <p className="text-xs text-blue-700/70">{new Date(f.match_date).toLocaleDateString()}</p>
              </div>
              <p className="font-black text-blue-600">{f.home_score} – {f.away_score}</p>
            </div>
          ))}
          {!past.length && <p className="text-sm text-blue-700/70">No results yet.</p>}
        </div>
      )}

      {tab === "table" && (
        hasGroups
          ? groups.map((g) => (
              <div key={g} className="mb-8">
                <h4 className="font-black uppercase text-sm mb-2 text-blue-900 dark:text-blue-100">{g}</h4>
                {standingsTable(teams.filter((t) => t.group_name === g))}
              </div>
            ))
          : standingsTable(teams)
      )}
    </div>
  );
}