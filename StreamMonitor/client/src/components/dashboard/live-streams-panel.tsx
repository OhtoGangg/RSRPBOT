import { ExternalLink, Satellite } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveStream {
  id: string;
  discordUsername: string;
  twitchUsername: string;
  currentStreamTitle: string;
  currentViewers: number;
  isLive: boolean;
}

interface LiveStreamsPanelProps {
  streams?: LiveStream[];
  isLoading: boolean;
}

export function LiveStreamsPanel({ streams = [], isLoading }: LiveStreamsPanelProps) {
  const liveStreams = streams.filter(stream => stream.isLive);

  const openTwitchStream = (twitchUsername: string) => {
    window.open(`https://twitch.tv/${twitchUsername}`, '_blank');
  };

  return (
    <Card className="bg-card border-border" data-testid="live-streams-panel">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <Satellite className="mr-2 text-green-500 w-5 h-5" />
          Live Streamit
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : liveStreams.length === 0 ? (
          <div className="text-center py-8">
            <Satellite className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ei aktiivisia streamejä</p>
          </div>
        ) : (
          <div className="space-y-4">
            {liveStreams.map((stream) => (
              <div 
                key={stream.id} 
                className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg"
                data-testid={`stream-card-${stream.twitchUsername}`}
              >
                <img 
                  src={`https://unavatar.io/twitch/${stream.twitchUsername}`}
                  alt={`${stream.discordUsername} profiilikuva`}
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(stream.discordUsername)}&background=6366f1&color=fff`;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground" data-testid={`streamer-name-${stream.twitchUsername}`}>
                      {stream.discordUsername}
                    </span>
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      LIVESSÄ
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid={`stream-title-${stream.twitchUsername}`}>
                    {stream.currentStreamTitle}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                    <span>Grand Theft Auto V</span>
                    <span data-testid={`stream-viewers-${stream.twitchUsername}`}>
                      {stream.currentViewers} katsojaa
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openTwitchStream(stream.twitchUsername)}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid={`button-open-stream-${stream.twitchUsername}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
