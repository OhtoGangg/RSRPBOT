export interface Streamer {
  discordUserId: string;
  discordUsername: string;
  twitchUsername: string | null;
  isLive: boolean;
  currentStreamTitle: string | null;
  currentViewers: number;
  announcementMessageId: string | null;
}

interface BotSettings {
  watchedRoleId: string;
  liveRoleId: string;
  announceChannelId: string;
  checkIntervalSeconds: number;
  isActive: boolean;
}

class MemStorage {
  private streamers: Map<string, Streamer> = new Map();
  private botSettings: BotSettings = {
    watchedRoleId: 'STRIIMAAJA_ROLE_ID',
    liveRoleId: 'LIVESSÄ_ROLE_ID',
    announceChannelId: 'MAINOSTUS_CHANNEL_ID',
    checkIntervalSeconds: 60,
    isActive: true,
  };

  async getBotSettings() { return this.botSettings; }
  async updateBotSettings(settings: Partial<BotSettings>) {
    this.botSettings = { ...this.botSettings, ...settings };
  }

  async getStreamer(discordUserId: string) { return this.streamers.get(discordUserId) || null; }
  async createStreamer(streamer: Streamer) { this.streamers.set(streamer.discordUserId, streamer); return streamer; }
  async updateStreamer(discordUserId: string, updates: Partial<Streamer>) {
    const existing = this.streamers.get(discordUserId);
    if (!existing) return;
    this.streamers.set(discordUserId, { ...existing, ...updates });
  }
}

export const storage = new MemStorage();
