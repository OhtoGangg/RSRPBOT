import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BotConfigPanel } from "@/components/dashboard/bot-config-panel";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground" data-testid="settings-container">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header stats={stats} />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="settings-main">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Bot Asetukset</h1>
            <p className="text-muted-foreground">
              Konfiguroi Discord-botin toimintaa ja seurannan asetuksia
            </p>
          </div>

          <div className="max-w-2xl">
            <BotConfigPanel />
          </div>
        </main>
      </div>
    </div>
  );
}