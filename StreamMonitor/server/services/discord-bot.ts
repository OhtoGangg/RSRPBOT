// server/services/discord-bot.ts
import { Client, GatewayIntentBits, TextChannel, GuildMember } from 'discord.js';
import { storage } from '../storage.js';
import { TwitchAPI } from './twitch-api.js';
import { type InsertBotSettings } from '../shared/schema.js';

export class DiscordBot {
  private client: Client;
  private twitchAPI: TwitchAPI;
  private checkInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
    });
    this.twitchAPI = new TwitchAPI();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.isInitialized = true;
      this.startStreamMonitoring();
    });
  }

  async initialize(): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) throw new Error('DISCORD_BOT_TOKEN not set');
    await this.client.login(token);
  }

  private async startStreamMonitoring() {
    const settings = await storage.getBotSettings();
    if (!settings?.isActive) return;

    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => this.checkAllStreamers(), (settings.checkIntervalSeconds || 60) * 1000);

    await this.checkAllStreamers();
  }

  private async checkAllStreamers() {
    const settings = await storage.getBotSettings();
    const guild = this.client.guilds.cache.first();
    if (!guild) return;

    const watchedRole = guild.roles.cache.find(role => role.name === 'STRIIMAAJA' || role.id === settings.watchedRoleId);
    if (!watchedRole) return;

    await guild.members.fetch();
    watchedRole.members.forEach(member => this.checkMemberStream(member, settings));
  }

  private async checkMemberStream(member: GuildMember, settings: InsertBotSettings) {
    let streamer = await storage.getStreamer(member.id);
    if (!streamer) {
      streamer = await storage.createStreamer({
        discordUserId: member.id,
        discordUsername: member.displayName || member.user.username,
        twitchUsername: member.user.username,
      });
    }

    if (!streamer.twitchUsername) return;

    const streamData = await this.twitchAPI.getStreamData(streamer.twitchUsername);
    const isQualifyingStream = streamData && streamData.game_name === 'Grand Theft Auto V' && streamData.title.toLowerCase().includes('rsrp');

    if (isQualifyingStream && !streamer.isLive) await this.handleStreamStart(member, streamer, streamData, settings);
    if (!isQualifyingStream && streamer.isLive) await this.handleStreamEnd(member, streamer, settings);
    if (isQualifyingStream && streamer.isLive) {
      await storage.updateStreamer(member.id, { currentStreamTitle: streamData.title, currentViewers: streamData.viewer_count });
    }
  }

  private async handleStreamStart(member: GuildMember, streamer: any, streamData: any, settings: InsertBotSettings) {
    const liveRole = member.guild.roles.cache.find(r => r.name === 'LIVESSÄ' || r.id === settings.liveRoleId);
    if (liveRole) await member.roles.add(liveRole);

    const announceChannel = member.guild.channels.cache.find(c => c.name === 'mainostus' || c.id === settings.announceChannelId) as TextChannel;
    let announcementMessageId = null;
    if (announceChannel) {
      const message = await announceChannel.send({ content: `🔴 LIVE: ${streamer.discordUsername} on striimissä: ${streamData.title} https://twitch.tv/${streamer.twitchUsername}` });
      announcementMessageId = message.id;
    }

    await storage.updateStreamer(member.id, { isLive: true, announcementMessageId, currentStreamTitle: streamData.title, currentViewers: streamData.viewer_count });
  }

  private async handleStreamEnd(member: GuildMember, streamer: any, settings: InsertBotSettings) {
    const liveRole = member.guild.roles.cache.find(r => r.name === 'LIVESSÄ' || r.id === settings.liveRoleId);
    if (liveRole) await member.roles.remove(liveRole);

    if (streamer.announcementMessageId) {
      const announceChannel = member.guild.channels.cache.find(c => c.name === 'mainostus' || c.id === settings.announceChannelId) as TextChannel;
      if (announceChannel) {
        try { 
          const msg = await announceChannel.messages.fetch(streamer.announcementMessageId);
          await msg.delete();
        } catch {}
      }
    }

    await storage.updateStreamer(member.id, { isLive: false, announcementMessageId: null, currentStreamTitle: null, currentViewers: 0 });
  }
}
