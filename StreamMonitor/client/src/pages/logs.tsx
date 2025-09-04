import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon, Circle, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { fi } from "date-fns/locale";
import { useState } from "react";

interface Activity {
  id: string;
  type: string;
  streamerDiscordId: string;
  streamerUsername: string;
  description: string;
  timestamp: string;
}

export default function Logs() {
  const [filterType, setFilterType] = useState<string>("all");
  
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'stream_start':
        return 'bg-green-500';
      case 'stream_end':
        return 'bg-red-500';
      case 'role_added':
      case 'role_removed':
        return 'bg-blue-500';
      case 'announcement':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'stream_start':
        return 'Stream alkoi';
      case 'stream_end':
        return 'Stream loppui';
      case 'role_added':
        return 'Rooli lisätty';
      case 'role_removed':
        return 'Rooli poistettu';
      case 'announcement':
        return 'Ilmoitus';
      default:
        return type;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: fi 
      });
    } catch {
      return 'tuntematon aika';
    }
  };

  const filteredActivities = activities?.filter(activity => 
    filterType === "all" || activity.type === filterType
  ) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground" data-testid="logs-container">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header stats={stats} />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="logs-main">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Aktiviteettiloki</h1>
            <p className="text-muted-foreground">
              Seuraa botin toimintaa ja kaikki stream-aktiviteetit
            </p>
          </div>

          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  <HistoryIcon className="mr-2 text-accent w-5 h-5" />
                  Viimeisimmät Aktiviteetit
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48 bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Kaikki aktiviteetit</SelectItem>
                      <SelectItem value="stream_start">Stream alkoi</SelectItem>
                      <SelectItem value="stream_end">Stream loppui</SelectItem>
                      <SelectItem value="role_added">Rooli lisätty</SelectItem>
                      <SelectItem value="role_removed">Rooli poistettu</SelectItem>
                      <SelectItem value="announcement">Ilmoitukset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {filterType === "all" ? "Ei aktiviteettia" : "Ei aktiviteettia valitulle tyypille"}
                  </h3>
                  <p className="text-muted-foreground">
                    {filterType === "all" 
                      ? "Aktiviteetit näkyvät täällä kun botti alkaa seurata streamaareja"
                      : "Kokeile eri suodatinta tai odota lisää aktiviteettia"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center space-x-4 py-4 border-b border-border last:border-b-0 hover:bg-muted/20 rounded-lg px-3 transition-colors"
                      data-testid={`activity-${activity.id}`}
                    >
                      <Circle className={`w-3 h-3 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground" data-testid={`activity-username-${activity.id}`}>
                            {activity.streamerUsername}
                          </span>
                          <span className="text-sm text-muted-foreground" data-testid={`activity-description-${activity.id}`}>
                            {activity.description}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className={`${getActivityColor(activity.type)} text-white border-0`}
                      >
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}