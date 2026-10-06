export type ActivityStatus = "upcoming" | "ongoing" | "completed";
export type FixtureStatus = "scheduled" | "completed" | "postponed" | "cancelled";

export interface Activity { id: string; title: string; type: string; description: string | null; status: ActivityStatus; created_at: string; }
export interface Team {
  id: string;
  activity_id: string;
  name: string;
  group_name: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
export interface Fixture { id: string; activity_id: string; home_team_id: string; away_team_id: string; home_score: number | null; away_score: number | null; match_date: string; location: string | null; status: FixtureStatus; }