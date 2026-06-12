import type { MatchWithTeams, Team } from "./types";

export type SideDisplay = {
  name: string;
  flag: string | null;
  flagUrl: string | null;
  isTbd: boolean;
};

/** Resolve a match side to a display name + flag, falling back to the label. */
export function sideDisplay(
  team: Team | null,
  label: string | null
): SideDisplay {
  if (team) {
    return {
      name: team.name,
      flag: team.flag,
      flagUrl: team.flag_url,
      isTbd: false,
    };
  }
  return {
    name: label || "TBD",
    flag: null,
    flagUrl: null,
    isTbd: true,
  };
}

export function homeSide(m: MatchWithTeams) {
  return sideDisplay(m.home_team, m.home_label);
}

export function awaySide(m: MatchWithTeams) {
  return sideDisplay(m.away_team, m.away_label);
}

export const MATCH_SELECT = `
  *,
  home_team:teams!matches_home_team_id_fkey (id, name, code, flag, flag_url, group_name),
  away_team:teams!matches_away_team_id_fkey (id, name, code, flag, flag_url, group_name)
`;
