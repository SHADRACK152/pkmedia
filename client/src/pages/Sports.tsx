import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users } from "lucide-react";
import StandingsTable from "@/components/sports/StandingsTable";
import { League, Match, Team } from "@shared/schema";

export default function Sports() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");

  const { data: leagues = [] } = useQuery<League[]>({
    queryKey: ['/api/sports/leagues'],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['/api/sports/matches', selectedLeagueId],
    enabled: !!selectedLeagueId,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/sports/leagues', selectedLeagueId, 'teams'],
    enabled: !!selectedLeagueId,
  });

  // Create a map of team ID to team data for easy lookup
  const teamsMap = teams.reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {} as Record<string, Team>);

  const formatMatchDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatusBadge = (status: string, utcDate: Date) => {
    const matchDate = utcDate;
    const now = new Date();

    if (status === 'FINISHED') {
      return <Badge variant="secondary">FT</Badge>;
    } else if (status === 'IN_PLAY') {
      return <Badge variant="default" className="animate-pulse">LIVE</Badge>;
    } else if (matchDate < now) {
      return <Badge variant="outline">PP</Badge>; // Postponed
    } else {
      return <Badge variant="outline">SCH</Badge>; // Scheduled
    }
  };

  const recentMatches = matches
    .filter(match => match.status === 'FINISHED')
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
    .slice(0, 10);

  const upcomingMatches = matches
    .filter(match => match.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sports</h1>
        <p className="text-muted-foreground">
          Live football league standings and match results
        </p>
      </div>

      <Tabs defaultValue="standings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Standings
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="space-y-6">
          <StandingsTable showLeagueSelector={true} />
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentMatches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent matches available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMatchStatusBadge(match.status, match.utcDate)}
                          <div className="text-sm">
                            <div className="font-medium">{teamsMap[match.homeTeamId]?.shortName || teamsMap[match.homeTeamId]?.name || 'Unknown'}</div>
                            <div className="text-muted-foreground">vs {teamsMap[match.awayTeamId]?.shortName || teamsMap[match.awayTeamId]?.name || 'Unknown'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {match.homeScore ?? '-'} - {match.awayScore ?? '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatMatchDate(match.utcDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMatches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming matches available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMatches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMatchStatusBadge(match.status, match.utcDate)}
                          <div className="text-sm">
                            <div className="font-medium">{teamsMap[match.homeTeamId]?.shortName || teamsMap[match.homeTeamId]?.name || 'Unknown'}</div>
                            <div className="text-muted-foreground">vs {teamsMap[match.awayTeamId]?.shortName || teamsMap[match.awayTeamId]?.name || 'Unknown'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {formatMatchDate(match.utcDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                League Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select League</label>
                  <select
                    value={selectedLeagueId}
                    onChange={(e) => setSelectedLeagueId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a league</option>
                    {leagues.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.name} ({league.season})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLeagueId && (
                  <div className="text-center py-8 text-muted-foreground">
                    Teams list will be displayed here when data is available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}