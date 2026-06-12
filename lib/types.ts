export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";

export const STAGE_LABELS: Record<Stage, string> = {
  group: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  third: "Third-place Play-off",
  final: "Final",
};

export const STAGE_ORDER: Stage[] = [
  "group",
  "r32",
  "r16",
  "qf",
  "sf",
  "third",
  "final",
];

export type Team = {
  id: string;
  name: string;
  code: string | null;
  flag: string | null;
  flag_url: string | null;
  group_name: string | null;
};

export type Participant = {
  id: string;
  name: string;
  photo_url: string | null;
  created_at: string;
};

export type Match = {
  id: string;
  match_number: number | null;
  stage: Stage;
  group_name: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_label: string | null;
  away_label: string | null;
  kickoff_time: string;
  venue: string | null;
  home_score: number | null;
  away_score: number | null;
  status: "scheduled" | "finished";
  created_at: string;
};

export type MatchWithTeams = Match & {
  home_team: Team | null;
  away_team: Team | null;
};

export type Prediction = {
  id: string;
  match_id: string;
  participant_id: string;
  predicted_home: number;
  predicted_away: number;
  points_awarded: number;
  created_at: string;
};

export type PredictionWithParticipant = Prediction & {
  participant: Pick<Participant, "id" | "name" | "photo_url"> | null;
};

export type LeaderboardRow = {
  id: string;
  name: string;
  photo_url: string | null;
  total_points: number;
  predictions_made: number;
  exact_hits: number;
  correct_hits: number;
};
