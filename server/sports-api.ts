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
    console.log(`[sports-api] Fetching: ${url}`);

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
      try {
        data = await this.makeRequest(`/lookuptable.php?l=${leagueId}&s=2024-2025`);
      } catch (error) {
        // If current season fails, try previous season
        console.log(`[sports-api] Current season failed, trying previous season for league ${leagueId}`);
        data = await this.makeRequest(`/lookuptable.php?l=${leagueId}&s=2023-2024`);
      }

      if (!data.table || data.table.length === 0) {
        console.warn(`[sports-api] No standings found for league ${leagueId}`);
        return [];
      }

      const parseNum = (v: string | undefined) => {
        const parsed = parseInt(v || '0', 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      const standings: Standing[] = data.table.map((standing: TheSportsDBStanding, index: number) => ({
        id: `${leagueId}_${standing.teamid}_${Date.now()}_${index}`,
        leagueId: leagueId,
        teamId: standing.teamid,
        position: index + 1,
        playedGames: parseNum(standing.played),
        form: '', // TheSportsDB doesn't provide form data
        won: parseNum(standing.win),
        draw: parseNum(standing.draw),
        lost: parseNum(standing.loss),
        points: parseNum(standing.total),
        goalsFor: parseNum(standing.goalsfor),
        goalsAgainst: parseNum(standing.goalsagainst),
        goalDifference: parseNum(standing.goalsdifference),
        createdAt: new Date(),
        lastUpdated: new Date()
      }));

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