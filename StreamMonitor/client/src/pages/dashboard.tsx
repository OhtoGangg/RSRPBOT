import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LiveStreamsPanel } from "@/components/dashboard/live-streams-panel";
import { BotConfigPanel } from "@/components/dashboard/bot-config-panel";
import { RecentActivity } from "@/components/dashboard/recent-activity";

interface DashboardStats {
  activeStreams: number;
  totalStreamers: number;
  todayAnnouncements: number;
  uptime: number;
  botOnline: boolean;
  botActive: boolean;
}

interface LiveStream {
  id: string;
  discordUsername: string;
  twitchUsername: string;
  currentStreamTitle: string;
  currentViewers: number;
  isLive: boolean;
}

interface Activity {
  id: string;
  type: string;
  streamerDiscordId: string;
  streamerUsername: string;
  description: string;
  timestamp: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: liveStreams, isLoading: streamsLoading } = useQuery<LiveStream[]>({
    queryKey: ["/api/streams/live"],
    refetchInterval: 30000,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 30000,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground" data-testid="dashboard-container">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header stats={stats} />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="dashboard-main">
          <StatsCards stats={stats} isLoading={statsLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LiveStreamsPanel streams={liveStreams} isLoading={streamsLoading} />
            <BotConfigPanel />
          </div>

          <div className="mt-8">
            <RecentActivity activities={activities} isLoading={activitiesLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
