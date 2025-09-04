// server/services/discord-bot.ts
import { Client, GatewayIntentBits, TextChannel, GuildMember } from 'discord.js';
import { storage } from '../storage.js';
import { TwitchAPI } from './twitch-api.js';
import { Streamer, InsertBotSettings } from '../shared/schema.js';
import { randomUUID } from 'node:crypto';

export class DiscordBot {
  private client: Client;
  private twitchAPI: TwitchAPI;
  private isInitialized = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private applicationId: string;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.applicationId = process.env.DISCORD_APPLICATION_ID || '';
    this.twitchAPI = new TwitchAPI();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.isInitialized = true;
      this.startStreamMonitoring();
    });

    this.client.on('error', (error) => {
      console.error('Discord bot error:', error);
    });
  }

  async initialize(): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) throw new Error('DISCORD_BOT_TOKEN not found in environment variables');
    await this.client.login(token);
  }

  private async startStreamMonitoring() {
    const settings = await storage.getBotSettings();
    if (!settings || !settings.isActive) return;
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkInterval = setInterval(
      () => this.checkAllStreamers(),
      (settings.checkIntervalSeconds || 60) * 1000
    );

    await this.checkAllStreamers();
  }

  private async checkAllStreamers() {
    const settings = await storage.getBotSettings();
    if (!settings) return;

    const guild = this.client.guilds.cache.first();
    if (!guild) return;

    const watchedRole = guild.roles.cache.find(role =>
      role.name === 'STRIIMAAJA' || role.id === settings.watchedRoleId
    );
    if (!watchedRole) return;

    await guild.members.fetch();
    watchedRole.members.forEach(async (member) => {
      await this.checkMemberStream(member, settings);
    });
  }

  private async checkMemberStream(member: GuildMember, settings: InsertBotSettings) {
    try {
      let streamer: Streamer | null = await storage.getStreamer(member.id);

      if (!streamer) {
        const twitchUsername = await this.findTwitchUsername(member);
        streamer = await storage.createStreamer({
          id: randomUUID(),
          discordUserId: member.id,
          discordUsername: member.displayName || member.user.username,
          twitchUsername: twitchUsername || null,
          isLive: false,
          currentStreamTitle: null,
          currentViewers: 0,
          announcementMessageId: null,
          lastChecked: new Date(),
        });
      }

      if (!streamer.twitchUsername) return;

      const streamData = await this.twitchAPI.getStreamData(streamer.twitchUsername);
      const isQualifyingStream = streamData &&
        streamData.game_name === 'Grand Theft Auto V' &&
        streamData.title.toLowerCase().includes('rsrp');

      if (isQualifyingStream && !streamer.isLive) {
        await this.handleStreamStart(member, streamer, streamData, settings);
      } else if (!isQualifyingStream && streamer.isLive) {
        await this.handleStreamEnd(member, streamer, settings);
      } else if (isQualifyingStream && streamer.isLive) {
        await storage.updateStreamer(member.id, {
          currentStreamTitle: streamData.title,
          currentViewers: streamData.viewer_count,
        });
      }
    } catch (error) {
      console.error(`Error checking stream for ${member.displayName}:`, error);
    }
  }

  private async findTwitchUsername(member: GuildMember): Promise<string | null> {
    for (const activity of member.presence?.activities || []) {
      if (activity.name === 'Twitch' && activity.state) return activity.state.replace('twitch.tv/', '');
      if (activity.url && activity.url.includes('twitch.tv/')) {
        const match = activity.url.match(/twitch\.tv\/([^\/]+)/);
        return match ? match[1] : null;
      }
    }
    return member.user.username;
  }

  // handleStreamStart ja handleStreamEnd pysyvät samoina
  // ...
}
