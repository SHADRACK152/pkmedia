import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { League, Standing, Team } from "@shared/schema";

interface StandingsTableProps {
  leagueId?: string;
  showLeagueSelector?: boolean;
}

export default function StandingsTable({ leagueId, showLeagueSelector = true }: StandingsTableProps) {
  const [selectedLeagueId, setSelectedLeagueId] = useState(leagueId || "");

  const { data: leagues = [] } = useQuery<League[]>({
    queryKey: ['/api/sports/leagues'],
    enabled: showLeagueSelector,
  });

  const { data: standings = [] } = useQuery<Standing[]>({
    queryKey: ['/api/sports/leagues', selectedLeagueId, 'standings'],
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

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'D':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'L':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPositionBadgeVariant = (position: number) => {
    if (position <= 4) return "default"; // Champions League spots
    if (position <= 6) return "secondary"; // Europa League spots
    if (position >= 18) return "destructive"; // Relegation zone
    return "outline";
  };

  if (showLeagueSelector && !selectedLeagueId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            League Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select League</label>
              <Select value={selectedLeagueId} onValueChange={setSelectedLeagueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a league" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map((league) => (
                    <SelectItem key={league.id} value={league.id}>
                      {league.name} ({league.season})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            League Standings
          </CardTitle>
          {showLeagueSelector && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeagueId("")}
            >
              Change League
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {standings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No standings data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2 px-2">Team</th>
                  <th className="text-center py-2 px-2 hidden sm:table-cell">MP</th>
                  <th className="text-center py-2 px-2 hidden sm:table-cell">W</th>
                  <th className="text-center py-2 px-2 hidden sm:table-cell">D</th>
                  <th className="text-center py-2 px-2 hidden sm:table-cell">L</th>
                  <th className="text-center py-2 px-2">GF</th>
                  <th className="text-center py-2 px-2">GA</th>
                  <th className="text-center py-2 px-2">GD</th>
                  <th className="text-center py-2 px-2 font-bold">Pts</th>
                  <th className="text-center py-2 px-2 hidden md:table-cell">Form</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => {
                  const team = teamsMap[standing.teamId];
                  return (
                    <tr key={standing.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <Badge variant={getPositionBadgeVariant(standing.position)}>
                          {standing.position}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          {team?.crest && (
                            <img
                              src={team.crest}
                              alt={team.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{team?.shortName || team?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground hidden lg:block">
                              {team?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 hidden sm:table-cell">
                        {standing.playedGames}
                      </td>
                      <td className="text-center py-3 px-2 hidden sm:table-cell">
                        {standing.won}
                      </td>
                      <td className="text-center py-3 px-2 hidden sm:table-cell">
                        {standing.draw}
                      </td>
                      <td className="text-center py-3 px-2 hidden sm:table-cell">
                        {standing.lost}
                      </td>
                      <td className="text-center py-3 px-2">
                        {standing.goalsFor}
                      </td>
                      <td className="text-center py-3 px-2">
                        {standing.goalsAgainst}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={(standing.goalDifference ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {(standing.goalDifference ?? 0) > 0 ? '+' : ''}{standing.goalDifference ?? 0}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2 font-bold">
                        {standing.points}
                      </td>
                      <td className="text-center py-3 px-2 hidden md:table-cell">
                        <div className="flex justify-center gap-1">
                          {standing.form?.split('').map((result, index) => (
                            <div key={index} className="flex items-center">
                              {getFormIcon(result)}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Badge variant="default" className="w-3 h-3 p-0"></Badge>
              Champions League
            </span>
            <span className="flex items-center gap-1">
              <Badge variant="secondary" className="w-3 h-3 p-0"></Badge>
              Europa League
            </span>
            <span className="flex items-center gap-1">
              <Badge variant="destructive" className="w-3 h-3 p-0"></Badge>
              Relegation
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Win
            </span>
            <span className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-yellow-500" />
              Draw
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              Loss
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}