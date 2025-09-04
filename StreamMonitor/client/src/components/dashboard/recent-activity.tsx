import { History as HistoryIcon, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fi } from "date-fns/locale";

interface Activity {
  id: string;
  type: string;
  streamerDiscordId: string;
  streamerUsername: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities?: Activity[];
  isLoading: boolean;
}

export function RecentActivity({ activities = [], isLoading }: RecentActivityProps) {
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

  return (
    <Card className="bg-card border-border" data-testid="recent-activity-panel">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <HistoryIcon className="mr-2 text-accent w-5 h-5" />
          Viimeisimmät aktiviteetit
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ei viimeaikaista aktiviteettia</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0"
                data-testid={`activity-${activity.id}`}
              >
                <Circle className={`w-2 h-2 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium" data-testid={`activity-username-${activity.id}`}>
                      {activity.streamerUsername}
                    </span>{' '}
                    <span data-testid={`activity-description-${activity.id}`}>
                      {activity.description}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
