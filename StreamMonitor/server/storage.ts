// server/storage.ts
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.resolve('./data.json');

export const storage = {
  async read() {
    try {
      const data = await fs.promises.readFile(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { botSettings: {}, streamers: [], activities: [] };
    }
  },

  async write(data: any) {
    await fs.promises.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  },

  async getBotSettings() {
    const data = await this.read();
    return data.botSettings || null;
  },

  async updateBotSettings(settings: any) {
    const data = await this.read();
    data.botSettings = { ...data.botSettings, ...settings };
    await this.write(data);
  },

  async getStreamer(discordUserId: string) {
    const data = await this.read();
    return data.streamers.find((s: any) => s.discordUserId === discordUserId) || null;
  },

  async createStreamer(streamer: any) {
    const data = await this.read();
    data.streamers.push(streamer);
    await this.write(data);
    return streamer;
  },

  async updateStreamer(discordUserId: string, updates: any) {
    const data = await this.read();
    const streamer = data.streamers.find((s: any) => s.discordUserId === discordUserId);
    if (!streamer) return;
    Object.assign(streamer, updates);
    await this.write(data);
  },

  async createActivity(activity: any) {
    const data = await this.read();
    data.activities.push(activity);
    await this.write(data);
  }
};
