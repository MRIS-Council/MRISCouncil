"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const teamStatFields = ["played", "won", "drawn", "lost", "goals_for", "goals_against", "goal_difference", "points"] as const;
type TeamStatField = (typeof teamStatFields)[number];

const normaliseTeam = (team: any) => ({
  ...team,
  played: Number(team?.played ?? 0),
  won: Number(team?.won ?? 0),
  drawn: Number(team?.drawn ?? 0),
  lost: Number(team?.lost ?? 0),
  goals_for: Number(team?.goals_for ?? 0),
  goals_against: Number(team?.goals_against ?? 0),
  goal_difference: Number(team?.goal_difference ?? 0),
  points: Number(team?.points ?? 0),
});

const computeStandings = (teamList: any[], fixtureList: any[]) => {
  const rows = (teamList ?? []).map(normaliseTeam);
  const byId = new Map(rows.map((team) => [team.id, team]));

  for (const fixture of fixtureList ?? []) {
    if (fixture.status !== "completed") continue;
    if (!fixture.home_team_id || !fixture.away_team_id) continue;

    const homeScore = Number(fixture.home_score ?? 0);
    const awayScore = Number(fixture.away_score ?? 0);
    const homeTeam = byId.get(fixture.home_team_id);
    const awayTeam = byId.get(fixture.away_team_id);

    if (!homeTeam || !awayTeam) continue;

    homeTeam.played += 1;
    awayTeam.played += 1;
    homeTeam.goals_for += homeScore;
    homeTeam.goals_against += awayScore;
    awayTeam.goals_for += awayScore;
    awayTeam.goals_against += homeScore;

    if (homeScore > awayScore) {
      homeTeam.won += 1;
      homeTeam.points += 3;
      awayTeam.lost += 1;
    } else if (awayScore > homeScore) {
      awayTeam.won += 1;
      awayTeam.points += 3;
      homeTeam.lost += 1;
    } else {
      homeTeam.drawn += 1;
      awayTeam.drawn += 1;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }

    homeTeam.goal_difference = homeTeam.goals_for - homeTeam.goals_against;
    awayTeam.goal_difference = awayTeam.goals_for - awayTeam.goals_against;
  }

  return rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    return a.name.localeCompare(b.name);
  });
};

export default function ActivitiesPanel() {
  const supabase = supabaseBrowser();
  const [activities, setActivities] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Record<string, any[]>>({});
  const [fixtures, setFixtures] = useState<Record<string, any[]>>({});
  const [newActivity, setNewActivity] = useState({ title: "", type: "", description: "" });
  const [newTeam, setNewTeam] = useState({ name: "", group_name: "" });
  const [newFixture, setNewFixture] = useState({ home_team_id: "", away_team_id: "", match_date: "", location: "" });
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});

  const refresh = async () => {
    const { data } = await supabase.from("activities").select("*").order("created_at", { ascending: false });
    setActivities(data ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const updateTeamTable = (activityId: string, teamList: any[] = [], fixtureList: any[] = []) => {
    setTeams((prev) => ({ ...prev, [activityId]: computeStandings(teamList, fixtureList) }));
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: newActivity.title.trim(),
      type: newActivity.type.trim(),
      description: newActivity.description.trim(),
      status: "upcoming",
    };

    const { error } = await supabase.from("activities").insert(payload);
    if (error) {
      console.error("Add activity failed:", error);
      alert(error.message);
      return;
    }

    setNewActivity({ title: "", type: "", description: "" });
    refresh();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("activities").update({ status }).eq("id", id);
    if (error) {
      console.error("Update status failed:", error);
      alert(error.message);
      return;
    }
    refresh();
  };
  const removeActivity = async (id: string) => {
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) {
      console.error("Delete activity failed:", error);
      alert(error.message);
      return;
    }
    refresh();
  };

  const loadDetail = async (activityId: string) => {
    if (openId === activityId) { setOpenId(null); return; }
    setOpenId(activityId);
    const { data: t } = await supabase.from("teams").select("*").eq("activity_id", activityId).order("name");
    const { data: f } = await supabase.from("fixtures").select("*").eq("activity_id", activityId).order("match_date");
    updateTeamTable(activityId, t ?? [], f ?? []);
    setFixtures((prev) => ({ ...prev, [activityId]: f ?? [] }));
  };

  const reloadTeams = async (activityId: string) => {
    const { data } = await supabase.from("teams").select("*").eq("activity_id", activityId).order("name");
    updateTeamTable(activityId, data ?? [], fixtures[activityId] ?? []);
  };

  const reloadFixtures = async (activityId: string) => {
    const { data } = await supabase.from("fixtures").select("*").eq("activity_id", activityId).order("match_date");
    setFixtures((prev) => ({ ...prev, [activityId]: data ?? [] }));
    updateTeamTable(activityId, teams[activityId] ?? [], data ?? []);
  };

  const addTeam = async (e: React.FormEvent, activityId: string) => {
    e.preventDefault();
    await supabase.from("teams").insert({
      activity_id: activityId,
      name: newTeam.name,
      group_name: newTeam.group_name || null,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    });
    setNewTeam({ name: "", group_name: "" });
    reloadTeams(activityId);
  };

  const updateTeamStat = async (teamId: string, activityId: string, field: TeamStatField, value: string) => {
    const numericValue = Number(value || 0);
    await supabase.from("teams").update({ [field]: numericValue }).eq("id", teamId);
    reloadTeams(activityId);
  };

  const removeTeam = async (teamId: string, activityId: string) => { await supabase.from("teams").delete().eq("id", teamId); reloadTeams(activityId); };

  const addFixture = async (e: React.FormEvent, activityId: string) => {
    e.preventDefault();
    if (!newFixture.home_team_id || !newFixture.away_team_id) return;
    await supabase.from("fixtures").insert({ ...newFixture, activity_id: activityId, status: "scheduled" });
    setNewFixture({ home_team_id: "", away_team_id: "", match_date: "", location: "" });
    reloadFixtures(activityId);
  };

  const saveResult = async (fixtureId: string, activityId: string) => {
    const s = scores[fixtureId];
    if (!s || s.home === "" || s.away === "") return;

    const homeScore = Number(s.home);
    const awayScore = Number(s.away);

    const { error } = await supabase
      .from("fixtures")
      .update({ home_score: homeScore, away_score: awayScore, status: "completed" })
      .eq("id", fixtureId);

    if (error) {
      console.error("Save fixture result failed:", error);
      alert(error.message);
      return;
    }

    const nextFixtureList = (fixtures[activityId] ?? []).map((fixture) =>
      fixture.id === fixtureId ? { ...fixture, home_score: homeScore, away_score: awayScore, status: "completed" } : fixture
    );

    const nextStandings = computeStandings(teams[activityId] ?? [], nextFixtureList);
    setTeams((prev) => ({ ...prev, [activityId]: nextStandings }));

    await Promise.all(
      nextStandings.map((team) =>
        supabase.from("teams").update({
          played: team.played,
          won: team.won,
          drawn: team.drawn,
          lost: team.lost,
          goals_for: team.goals_for,
          goals_against: team.goals_against,
          goal_difference: team.goal_difference,
          points: team.points,
        }).eq("id", team.id)
      )
    );

    setScores((prev) => ({ ...prev, [fixtureId]: { home: "", away: "" } }));
    reloadFixtures(activityId);
  };

  const teamName = (activityId: string, teamId: string) => teams[activityId]?.find((t) => t.id === teamId)?.name ?? "—";

  return (
    <div className="space-y-8">
      <form onSubmit={addActivity} className="card p-6 space-y-3">
        <h3 className="font-black uppercase text-sm">Add activity</h3>
        <input placeholder="Title (e.g. Inter-house Football Tournament)" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 bg-transparent" />
        <input placeholder="Type (football, basketball, chess...)" value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })} className="w-full border rounded-xl px-3 py-2 bg-transparent" />
        <input placeholder="Description (optional)" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} className="w-full border rounded-xl px-3 py-2 bg-transparent" />
        <button className="bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Add</button>
      </form>

      <div className="space-y-4">
        {activities.map((a) => (
          <div key={a.id} className="card p-6">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <p className="font-bold">{a.title}</p>
                <p className="text-xs text-blue-700/70 uppercase tracking-widest">{a.type}</p>
              </div>
              <div className="flex gap-2 items-center">
                <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} className="text-xs border rounded-lg px-2 py-1 bg-transparent">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => loadDetail(a.id)} className="text-xs font-bold border rounded-lg px-3 py-1.5">
                  {openId === a.id ? "Hide" : "Manage"}
                </button>
                <button onClick={() => removeActivity(a.id)} className="text-xs font-bold text-bad">Delete</button>
              </div>
            </div>

            {openId === a.id && (
              <div className="mt-4 space-y-6">
                <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-xl p-4">
                  <h4 className="font-black uppercase text-xs mb-3">Teams & table</h4>
                  <form onSubmit={(e) => addTeam(e, a.id)} className="flex gap-2 mb-4">
                    <input placeholder="Team name" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} className="flex-1 border rounded-lg px-2 py-1.5 text-sm bg-transparent" />
                    <input placeholder="Group (optional)" value={newTeam.group_name} onChange={(e) => setNewTeam({ ...newTeam, group_name: e.target.value })} className="w-32 border rounded-lg px-2 py-1.5 text-sm bg-transparent" />
                    <button className="bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Add team</button>
                  </form>

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-blue-700/60 dark:text-blue-300/60 uppercase tracking-widest">
                        <th className="py-1.5">Team</th><th>Group</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams[a.id]?.map((t) => (
                        <tr key={t.id} className="border-t border-blue-100 dark:border-blue-900">
                          <td className="py-1.5 font-bold">{t.name}</td>
                          <td className="text-blue-700/70">{t.group_name ?? "—"}</td>
                          {teamStatFields.map((field) => (
                            <td key={field}>
                              <input type="number" defaultValue={t[field] ?? 0} onBlur={(e) => updateTeamStat(t.id, a.id, field, e.target.value)}
                                className="w-12 border rounded px-1 py-0.5 bg-transparent" />
                            </td>
                          ))}
                          <td><button onClick={() => removeTeam(t.id, a.id)} className="text-bad font-bold">×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!teams[a.id]?.length && <p className="text-xs text-blue-700/70">No teams yet — add some above.</p>}
                </div>

                <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-xl p-4">
                  <h4 className="font-black uppercase text-xs mb-3">Fixtures</h4>
                  <form onSubmit={(e) => addFixture(e, a.id)} className="grid grid-cols-2 gap-2 mb-4">
                    <select value={newFixture.home_team_id} onChange={(e) => setNewFixture({ ...newFixture, home_team_id: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm bg-transparent">
                      <option value="">Home team</option>
                      {teams[a.id]?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select value={newFixture.away_team_id} onChange={(e) => setNewFixture({ ...newFixture, away_team_id: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm bg-transparent">
                      <option value="">Away team</option>
                      {teams[a.id]?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="datetime-local" value={newFixture.match_date} onChange={(e) => setNewFixture({ ...newFixture, match_date: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm bg-transparent" />
                    <input placeholder="Pitch / location" value={newFixture.location} onChange={(e) => setNewFixture({ ...newFixture, location: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm bg-transparent" />
                    <button className="col-span-2 bg-blue-900 text-white rounded-lg py-1.5 text-sm font-bold">Add fixture</button>
                  </form>

                  {fixtures[a.id]?.map((f) => (
                    <div key={f.id} className="border-t border-blue-100 dark:border-blue-900 pt-3 pb-2">
                      <p className="text-sm font-bold">{teamName(a.id, f.home_team_id)} vs {teamName(a.id, f.away_team_id)}</p>
                      <p className="text-xs text-blue-700/70">{new Date(f.match_date).toLocaleString()}{f.location ? ` · ${f.location}` : ""}</p>
                      {f.status === "completed" ? (
                        <p className="text-sm font-black text-blue-600 mt-1">{f.home_score} – {f.away_score}</p>
                      ) : (
                        <div className="flex gap-2 items-center mt-2">
                          <input type="number" placeholder="Home" className="w-16 border rounded-lg px-2 py-1 text-xs bg-transparent"
                            onChange={(e) => setScores({ ...scores, [f.id]: { ...scores[f.id], home: e.target.value } })} />
                          <span className="text-xs">–</span>
                          <input type="number" placeholder="Away" className="w-16 border rounded-lg px-2 py-1 text-xs bg-transparent"
                            onChange={(e) => setScores({ ...scores, [f.id]: { ...scores[f.id], away: e.target.value } })} />
                          <button onClick={() => saveResult(f.id, a.id)} className="text-xs font-bold bg-blue-900 text-white px-3 py-1 rounded-lg">Save result</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {!fixtures[a.id]?.length && <p className="text-xs text-blue-700/70">No fixtures yet.</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}