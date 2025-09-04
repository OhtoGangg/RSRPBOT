import { Bot, Gauge, Users, Settings, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  return (
    <div className={cn("w-64 bg-card border-r border-border flex-shrink-0", className)} data-testid="sidebar">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="text-primary-foreground w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">RSRP Bot</h1>
            <p className="text-xs text-muted-foreground">Stream Monitor</p>
          </div>
        </div>
      </div>
      
      <nav className="px-6 pb-6">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                location === "/" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              data-testid="nav-dashboard"
            >
              <Gauge className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/streamers" 
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                location === "/streamers" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              data-testid="nav-streamers"
            >
              <Users className="w-4 h-4" />
              <span>Streamaarit</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/settings" 
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                location === "/settings" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              data-testid="nav-settings"
            >
              <Settings className="w-4 h-4" />
              <span>Asetukset</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/logs" 
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                location === "/logs" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              data-testid="nav-logs"
            >
              <History className="w-4 h-4" />
              <span>Loki</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
