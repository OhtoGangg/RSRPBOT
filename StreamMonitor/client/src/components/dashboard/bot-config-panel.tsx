import { Settings as SettingsIcon, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface BotSettings {
  id: string;
  watchedRoleId: string;
  liveRoleId: string;
  announceChannelId: string;
  checkIntervalSeconds: number;
  isActive: boolean;
}

export function BotConfigPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: settings } = useQuery<BotSettings>({
    queryKey: ["/api/bot/settings"],
  });

  const [formData, setFormData] = useState({
    watchedRoleId: '',
    liveRoleId: '',
    announceChannelId: '',
    checkIntervalSeconds: 60,
    isActive: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        watchedRoleId: settings.watchedRoleId,
        liveRoleId: settings.liveRoleId,
        announceChannelId: settings.announceChannelId,
        checkIntervalSeconds: settings.checkIntervalSeconds,
        isActive: settings.isActive,
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/bot/settings", data),
    onSuccess: () => {
      toast({
        title: "Asetukset tallennettu",
        description: "Bot asetukset on päivitetty onnistuneesti",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
    },
    onError: () => {
      toast({
        title: "Virhe",
        description: "Asetusten tallentaminen epäonnistui",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  return (
    <Card className="bg-card border-border" data-testid="bot-config-panel">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <SettingsIcon className="mr-2 text-primary w-5 h-5" />
          Bot Asetukset
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Seurattava rooli
            </Label>
            <div className="flex items-center space-x-3">
              <Input
                value="STRIIMAAJA"
                className="flex-1 bg-input border-border text-foreground"
                readOnly
                data-testid="input-watched-role"
              />
              <span className="px-3 py-2 bg-green-500/20 text-green-500 rounded-md text-sm">
                Aktiivinen
              </span>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Live rooli
            </Label>
            <div className="flex items-center space-x-3">
              <Input
                value="LIVESSÄ"
                className="flex-1 bg-input border-border text-foreground"
                readOnly
                data-testid="input-live-role"
              />
              <span className="px-3 py-2 bg-green-500/20 text-green-500 rounded-md text-sm">
                Aktiivinen
              </span>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Ilmoituskanava
            </Label>
            <div className="flex items-center space-x-3">
              <Input
                value="#MAINOSTUS"
                className="flex-1 bg-input border-border text-foreground"
                readOnly
                data-testid="input-announce-channel"
              />
              <span className="px-3 py-2 bg-green-500/20 text-green-500 rounded-md text-sm">
                Yhdistetty
              </span>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Suodattimet
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Kategoria: Grand Theft Auto V
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Vain GTA V streamit hyväksytään
                  </p>
                </div>
                <Switch checked={true} disabled data-testid="switch-gta-filter" />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Otsikko sisältää: "RSRP"
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Vain RSRP sisältävät otsikot
                  </p>
                </div>
                <Switch checked={true} disabled data-testid="switch-rsrp-filter" />
              </div>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Tarkistusväli
            </Label>
            <Select 
              value={formData.checkIntervalSeconds.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, checkIntervalSeconds: parseInt(value) }))}
            >
              <SelectTrigger className="bg-input border-border text-foreground" data-testid="select-check-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 sekuntia</SelectItem>
                <SelectItem value="60">1 minuutti</SelectItem>
                <SelectItem value="120">2 minuuttia</SelectItem>
                <SelectItem value="300">5 minuuttia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            Tallenna asetukset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
