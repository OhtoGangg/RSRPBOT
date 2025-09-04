// server/storage.ts
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.resolve('./data.json');

interface Streamer {
  id: string;
  discordUserId: string;
  discordUsername: string;
  twitchUsername: string | null;
  isLive: boolean | null;
  currentStreamTitle: string | null;
  currentViewers: number | null;
  lastChecked: Date | null;
  announcementMessageId: string | null;
}

interface BotSettings {
  isActive: boolean;
  watchedRoleId: string;
  liveRoleId: string;
  announceChannelId: string;
  checkIntervalSeconds: number;
}

interface Activity {
  type: string;
  streamerDiscordId: string;
  streamerUsername: string;
  description: string;
  timestamp?: Date;
}

const defaultData = { botSettings: {}, streamers: [], activities: [] };

export const storage = {
  async read() {
    try {
      const data = await fs.promises.readFile(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed;
    } catch {
      return { ...defaultData };
    }
  },

  async write(data: any) {
    await fs.promises.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  },

  async getBotSettings(): Promise<BotSettings | null> {
    const data = await this.read();
    return data.botSettings || null;
  },

  async updateBotSettings(settings: Partial<BotSettings>) {
    const data = await this.read();
    data.botSettings = { ...data.botSettings, ...settings };
    await this.write(data);
  },

  async getStreamer(discordUserId: string): Promise<Streamer | null> {
    const data = await this.read();
    return data.streamers.find((s: any) => s.discordUserId === discordUserId) || null;
  },

  async createStreamer(streamer: Streamer): Promise<Streamer> {
    const data = await this.read();
    data.streamers.push(streamer);
    await this.write(data);
    return streamer;
  },

  async updateStreamer(discordUserId: string, updates: Partial<Streamer>) {
    const data = await this.read();
    const streamer = data.streamers.find((s: any) => s.discordUserId === discordUserId);
    if (!streamer) return;
    Object.assign(streamer, updates);
    await this.write(data);
  },

  async createActivity(activity: Activity) {
    const data = await this.read();
    data.activities.push({ ...activity, timestamp: new Date() });
    await this.write(data);
  },

  async getAllStreamers(): Promise<Streamer[]> {
    const data = await this.read();
    return data.streamers;
  }
};
