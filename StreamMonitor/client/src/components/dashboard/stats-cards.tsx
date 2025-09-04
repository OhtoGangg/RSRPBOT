import { Video, Users, Megaphone, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: {
    activeStreams: number;
    totalStreamers: number;
    todayAnnouncements: number;
    uptime: number;
  };
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const statsData = [
    {
      label: "Aktiiviset streamit",
      value: stats?.activeStreams || 0,
      icon: Video,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-500",
      testId: "stat-active-streams",
    },
    {
      label: "Seuratut streamaarit",
      value: stats?.totalStreamers || 0,
      icon: Users,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      testId: "stat-total-streamers",
    },
    {
      label: "Tänään ilmoituksia",
      value: stats?.todayAnnouncements || 0,
      icon: Megaphone,
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      testId: "stat-today-announcements",
    },
    {
      label: "Uptime (päivää)",
      value: stats?.uptime || 0,
      icon: Heart,
      iconBg: "bg-chart-1/20",
      iconColor: "text-chart-1",
      testId: "stat-uptime",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-cards">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground" data-testid={stat.testId}>
                    {stat.value}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} w-6 h-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
