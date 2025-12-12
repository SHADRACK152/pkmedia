import { League, Team, Standing, Match } from "../shared/schema.js";

// TheSportsDB API - Completely free, no API key required
const THE_SPORTS_DB_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// Popular league IDs from TheSportsDB
const LEAGUE_IDS = {
  PREMIER_LEAGUE: 4328,
  CHAMPIONS_LEAGUE: 4480,
  LA_LIGA: 4335,
  BUNDESLIGA: 4331,
  SERIE_A: 4332,
  LIGUE_1: 4334
};

interface TheSportsDBLeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate: string;
  intFormedYear: string;
  strCountry: string;
  strWebsite: string;
  strFacebook: string;
  strTwitter: string;
  strInstagram: string;
  strDescriptionEN: string;
  strBadge: string;
  strBanner: string;
  strLogo: string;
}

interface TheSportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort: string;
  strAlternate: string;
  intFormedYear: string;
  strSport: string;
  strLeague: string;
  strCountry: string;
  strWebsite: string;
  strFacebook: string;
  strTwitter: string;
  strInstagram: string;
  strDescriptionEN: string;
  strBadge: string;
  strBanner: string;
  strLogo: string;
}

interface TheSportsDBStanding {
  name: string;
  teamid: string;
  played: string;
  win: string;
  draw: string;
  loss: string;
  goalsfor: string;
  goalsagainst: string;
  goalsdifference: string;
  total: string;
}

interface TheSportsDBMatch {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strStatus: string;
  strLeague: string;
  idHomeTeam: string;
  idAwayTeam: string;
}

class SportsService {
  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${THE_SPORTS_DB_URL}${endpoint}`;
    const maxAttempts = 3;
    const backoffMs = 500;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        console.log(`[sports-api] Fetching (attempt ${attempt}): ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[sports-api] API Error ${response.status}: ${errorText}`);
          throw new Error(`TheSportsDB API error: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error(`[sports-api] Expected JSON but got: ${contentType}`, text.substring(0, 200));
          throw new Error(`TheSportsDB API returned non-JSON response: ${contentType}`);
        }

        return response.json();
      } catch (err: any) {
        lastError = err;
        console.warn(`[sports-api] Request attempt ${attempt} failed: ${err.message}`);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
          continue;
        }
        throw lastError;
      }
    }
  }

  async fetchLeagues(): Promise<League[]> {
    try {
      const leagues: League[] = [];

      // TheSportsDB doesn't have a leagues list endpoint, so we fetch each league individually
      for (const [leagueName, leagueId] of Object.entries(LEAGUE_IDS)) {
        try {
          const data = await this.makeRequest(`/lookupleague.php?id=${leagueId}`);
          if (data.leagues && data.leagues.length > 0) {
            const leagueData: TheSportsDBLeague = data.leagues[0];

            const league: League = {
              id: leagueData.idLeague,
              name: leagueData.strLeague,
              // Use the external id as a stable code so we don't collide on short names.
              // Many league names share prefixes which produced duplicate codes.
              code: leagueData.idLeague,
              country: leagueData.strCountry,
              season: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
              logo: leagueData.strBadge || leagueData.strLogo,
              isActive: true,
              createdAt: new Date(),
              lastUpdated: new Date()
            };

            leagues.push(league);
            console.log(`[sports-api] Fetched league: ${leagueData.strLeague}`);
          }
        } catch (error) {
          console.error(`[sports-api] Failed to fetch league ${leagueName} (${leagueId}):`, error);
        }
      }

      return leagues;
    } catch (error) {
      console.error('[sports-api] Error fetching leagues:', error);
      throw error;
    }
  }

  async fetchTeams(leagueId: string): Promise<Team[]> {
    try {
      const data = await this.makeRequest(`/lookup_all_teams.php?id=${leagueId}`);
      const teams: Team[] = (data.teams || []).map((team: TheSportsDBTeam) => ({
        // Use a composite id with the league id so teams are unique per league (avoid cross-league overwrites)
        id: `${leagueId}_${team.idTeam}`,
        name: team.strTeam,
        shortName: team.strTeamShort || team.strTeam,
        tla: team.strTeamShort || team.strTeam.substring(0, 3).toUpperCase(),
        crest: team.strBadge || team.strLogo,
        address: team.strCountry,
        website: team.strWebsite,
        founded: parseInt(team.intFormedYear) || 1900,
        clubColors: '',
        venue: '',
        leagueId: leagueId,
        apiId: parseInt(team.idTeam),
        createdAt: new Date(),
        lastUpdated: new Date()
      }));

      console.log(`[sports-api] Fetched ${teams.length} teams for league ${leagueId}`);
      return teams;
    } catch (error) {
      console.error(`[sports-api] Error fetching teams for league ${leagueId}:`, error);
      throw error;
    }
  }

  async fetchStandings(leagueId: string): Promise<Standing[]> {
    try {
      // Try current season first
      let data;
      // Build a list of seasons to try: current (2025-2026), then previous two
      const now = new Date();
      const thisYear = now.getFullYear();
      const seasonCandidates = [
        `${thisYear}/${thisYear + 1}`,
        `${thisYear - 1}/${thisYear}`,
        `${thisYear - 2}/${thisYear - 1}`,
      ];

      for (const s of seasonCandidates) {
        try {
          data = await this.makeRequest(`/lookuptable.php?l=${leagueId}&s=${s}`);
          if (data && data.table && data.table.length > 0) {
            console.log(`[sports-api] Found standings for league ${leagueId} season ${s}`);
            break;
          }
        } catch (err) {
          console.log(`[sports-api] Season ${s} not available for league ${leagueId}: ${err.message}`);
        }
      }

      if (!data) {
        console.warn(`[sports-api] No standings data returned for league ${leagueId}`);
        return [];
      }

      if (!data.table) {
        console.warn(`[sports-api] Standings response for league ${leagueId} missing 'table' property. Response keys: ${Object.keys(data).join(', ')}`);
        return [];
      }

      if (data.table.length === 0) {
        console.warn(`[sports-api] No standings rows found for league ${leagueId}`);
        return [];
      }

      const parseNum = (v: string | undefined) => {
        const parsed = parseInt(v || '0', 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      const standings: Standing[] = data.table.map((standing: any, index: number) => {
        const teamIdRaw = standing.teamid || standing.idTeam || standing.id || standing.TeamID || standing.teamId;
        // Keep external API id separately so we can map to DB ID later
        const apiTeamId = teamIdRaw ? String(teamIdRaw) : '';
        const position = parseNum(String(standing.intRank || standing.int_rank || standing.position || standing.rank || index + 1));
        const playedGames = parseNum(String(standing.intPlayed || standing.int_played || standing.played));
        const won = parseNum(String(standing.intWin || standing.int_win || standing.win));
        const draw = parseNum(String(standing.intDraw || standing.int_draw || standing.draw));
        const lost = parseNum(String(standing.intLoss || standing.int_loss || standing.loss));
        const points = parseNum(String(standing.intPoints || standing.int_points || standing.total));
        const goalsFor = parseNum(String(standing.intGoalsFor || standing.int_goals_for || standing.goalsfor));
        const goalsAgainst = parseNum(String(standing.intGoalsAgainst || standing.int_goals_against || standing.goalsagainst));
        const goalDifference = parseNum(String(standing.intGoalDifference || standing.int_goal_difference || standing.goalsdifference));
        const season = standing.strSeason || standing.season || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

        return {
          id: `${leagueId}_${apiTeamId}_${Date.now()}_${index}`,
          leagueId: leagueId,
          apiTeamId,
          teamName: standing.strTeam || standing.name || '',
          position,
          playedGames,
          form: standing.strForm || standing.form || '',
          won,
          draw,
          lost,
          points,
          goalsFor,
          goalsAgainst,
          goalDifference,
          season,
          createdAt: new Date(),
          lastUpdated: new Date(),
        } as Standing;
      });

      console.log(`[sports-api] Fetched ${standings.length} standings for league ${leagueId}`);
      return standings;
    } catch (error) {
      console.error(`[sports-api] Error fetching standings for league ${leagueId}:`, error);
      throw error;
    }
  }

  async fetchMatches(leagueId: string, limit: number = 20): Promise<Match[]> {
    try {
      // Get next 15 events (upcoming matches)
      const upcomingData = await this.makeRequest(`/eventsnextleague.php?id=${leagueId}`);
      // Get last 15 events (recent matches)
      const recentData = await this.makeRequest(`/eventspastleague.php?id=${leagueId}`);

      const allEvents = [
        ...(upcomingData.events || []),
        ...(recentData.events || [])
      ].slice(0, limit);

      const matches: Match[] = allEvents.map((match: TheSportsDBMatch) => ({
        id: match.idEvent,
        leagueId: leagueId,
        homeTeamId: match.idHomeTeam,
        awayTeamId: match.idAwayTeam,
        matchday: 1, // TheSportsDB doesn't provide matchday
        status: match.intHomeScore && match.intAwayScore ? 'FINISHED' : 'SCHEDULED',
        utcDate: new Date(`${match.dateEvent}T${match.strTime || '00:00:00'}`),
        homeScore: match.intHomeScore ? parseInt(match.intHomeScore) : null,
        awayScore: match.intAwayScore ? parseInt(match.intAwayScore) : null,
        winner: null, // Calculate winner based on scores
        season: new Date().getFullYear().toString(),
        apiId: parseInt(match.idEvent),
        lastUpdated: new Date(),
        createdAt: new Date()
      }));

      console.log(`[sports-api] Fetched ${matches.length} matches for league ${leagueId}`);
      return matches;
    } catch (error) {
      console.error(`[sports-api] Error fetching matches for league ${leagueId}:`, error);
      throw error;
    }
  }

  async syncLeagueData(league: League): Promise<{
    teams: Team[];
    standings: Standing[];
    matches: Match[];
  }> {
    try {
      console.log(`[sports-api] Starting sync for league ${league.id}`);

      // Fetch other data, with error handling for standings
      const [teams, matches] = await Promise.all([
        this.fetchTeams(league.id),
        this.fetchMatches(league.id, 50)
      ]);

      let standings: Standing[] = [];
      try {
        standings = await this.fetchStandings(league.id);
      } catch (error) {
        console.warn(`[sports-api] Failed to fetch standings for league ${league.id}, continuing without standings:`, error.message);
      }

      console.log(`[sports-api] Sync complete for league ${league.id}`);
      return {
        teams,
        standings,
        matches,
      };
    } catch (error) {
      console.error(`[sports-api] Error syncing league ${league.id}:`, error);
      throw error;
    }
  }
}

export const sportsService = new SportsService();
export { LEAGUE_IDS };