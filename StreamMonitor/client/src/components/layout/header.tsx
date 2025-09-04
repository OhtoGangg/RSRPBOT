import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  stats?: any;
}

export function Header({ stats }: HeaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/refresh"),
    onSuccess: () => {
      toast({
        title: "Päivitys aloitettu",
        description: "Bot tarkistaa kaikki streamit uudelleen",
      });
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Päivitys epäonnistui",
        variant: "destructive",
      });
    },
  });

  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stream Monitor Dashboard</h2>
          <p className="text-muted-foreground">RSRP GTA V streamin seuranta</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2" data-testid="bot-status">
            <div className={`w-3 h-3 rounded-full ${stats?.botOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-foreground">
              {stats?.botOnline ? 'Bot Online' : 'Bot Offline'}
            </span>
          </div>
          <Button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Päivitä
          </Button>
        </div>
      </div>
    </header>
  );
}
