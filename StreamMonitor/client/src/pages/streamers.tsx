import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Satellite, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Streamer {
  id: string;
  discordUserId: string;
  discordUsername: string;
  twitchUsername: string | null;
  isLive: boolean;
  currentStreamTitle: string | null;
  currentViewers: number;
  lastChecked: Date | null;
  announcementMessageId: string | null;
}

export default function Streamers() {
  const { data: streamers, isLoading } = useQuery<Streamer[]>({
    queryKey: ["/api/streamers"],
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  const openTwitchProfile = (twitchUsername: string) => {
    window.open(`https://twitch.tv/${twitchUsername}`, '_blank');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground" data-testid="streamers-container">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header stats={stats} />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="streamers-main">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Seuratut Streamaarit</h1>
            <p className="text-muted-foreground">
              Kaikki STRIIMAAJA-roolin omaavat käyttäjät ja heidän stream-tilansa
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !streamers || streamers.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ei seurattavia streamaareja
                </h3>
                <p className="text-muted-foreground">
                  Anna Discord-käyttäjille STRIIMAAJA-rooli aloittaaksesi seurannan
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streamers.map((streamer) => (
                <Card 
                  key={streamer.id} 
                  className={`bg-card border-border transition-all ${
                    streamer.isLive ? 'ring-2 ring-green-500 shadow-lg' : ''
                  }`}
                  data-testid={`streamer-card-${streamer.discordUsername}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={`https://unavatar.io/discord/${streamer.discordUserId}`}
                          alt={`${streamer.discordUsername} avatar`}
                          className="w-12 h-12 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(streamer.discordUsername)}&background=6366f1&color=fff`;
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg text-foreground">
                            {streamer.discordUsername}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {streamer.twitchUsername ? `twitch.tv/${streamer.twitchUsername}` : 'Ei Twitch-käyttäjänimeä'}
                          </p>
                        </div>
                      </div>
                      {streamer.isLive && (
                        <Badge className="bg-green-500 text-white animate-pulse">
                          <Satellite className="w-3 h-3 mr-1" />
                          LIVESSÄ
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {streamer.isLive && streamer.currentStreamTitle ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            Nykyinen stream:
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {streamer.currentStreamTitle}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {streamer.currentViewers} katsojaa
                          </span>
                          {streamer.twitchUsername && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTwitchProfile(streamer.twitchUsername!)}
                              className="text-purple-500 border-purple-500 hover:bg-purple-500 hover:text-white"
                              data-testid={`button-open-twitch-${streamer.twitchUsername}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Avaa Twitch
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            Offline
                          </Badge>
                          {streamer.twitchUsername && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTwitchProfile(streamer.twitchUsername!)}
                              className="text-muted-foreground hover:text-foreground"
                              data-testid={`button-open-twitch-${streamer.twitchUsername}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Profiili
                            </Button>
                          )}
                        </div>
                        {streamer.lastChecked && (
                          <p className="text-xs text-muted-foreground">
                            Viimeksi tarkistettu: {new Date(streamer.lastChecked).toLocaleString('fi-FI')}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}