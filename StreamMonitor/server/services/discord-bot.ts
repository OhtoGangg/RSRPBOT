// server/services/discord-bot.ts
import { Client, GatewayIntentBits, TextChannel, Role, GuildMember } from 'discord.js';
import { storage } from '../storage';
import { TwitchAPI } from './twitch-api';
import { type InsertBotSettings } from '@shared/schema';

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
    try {
      const settings = await storage.getBotSettings();
      if (!settings) return;

      const guild = this.client.guilds.cache.first();
      if (!guild) return;

      const watchedRole = guild.roles.cache.find(role => 
        role.id === process.env.WATCHED_ROLE_ID
      );
      if (!watchedRole) return console.error('Watched role not found');

      await guild.members.fetch();
      const membersWithRole = watchedRole.members;

      for (const member of membersWithRole.values()) {
        await this.checkMemberStream(member, settings);
      }
    } catch (error) {
      console.error('Error checking streamers:', error);
    }
  }

  private async checkMemberStream(member: GuildMember, settings: any) {
    try {
      let streamer = await storage.getStreamer(member.id);
      if (!streamer) {
        const twitchUsername = await this.findTwitchUsername(member);
        streamer = await storage.createStreamer({
          discordUserId: member.id,
          discordUsername: member.displayName || member.user.username,
          twitchUsername: twitchUsername,
          isLive: false,
          currentStreamTitle: null,
          currentViewers: 0,
          announcementMessageId: null,
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

  private async handleStreamStart(member: GuildMember, streamer: any, streamData: any, settings: any) {
    try {
      const liveRole = member.guild.roles.cache.find(role => 
        role.id === process.env.LIVE_ROLE_ID
      );
      if (liveRole) await member.roles.add(liveRole);

      const announceChannel = member.guild.channels.cache.get(process.env.ANNOUNCE_CHANNEL_ID!) as TextChannel;
      let announcementMessageId = null;
      if (announceChannel) {
        const message = await announceChannel.send({
          embeds: [{
            title: '🔴 LIVE: RSRP Stream!',
            description: `${streamer.discordUsername} aloitti livelähetyksen jota et halua missata!`,
            fields: [
              { name: 'Streami', value: streamData.title, inline: false },
              { name: 'Kategoria', value: streamData.game_name, inline: true },
              { name: 'Katsojia', value: streamData.viewer_count.toString(), inline: true },
            ],
            color: 0x9146FF,
            thumbnail: { url: streamData.thumbnail_url?.replace('{width}', '320').replace('{height}', '180') },
            url: `https://twitch.tv/${streamer.twitchUsername}`,
            timestamp: new Date().toISOString(),
          }],
        });
        announcementMessageId = message.id;
      }

      await storage.updateStreamer(member.id, {
        isLive: true,
        currentStreamTitle: streamData.title,
        currentViewers: streamData.viewer_count,
        announcementMessageId,
      });

      await storage.createActivity({
        type: 'stream_start',
        streamerDiscordId: member.id,
        streamerUsername: streamer.discordUsername,
        description: `aloitti RSRP striimin: ${streamData.title}`,
      });

      console.log(`Stream started: ${streamer.discordUsername}`);
    } catch (error) {
      console.error(`Error handling stream start for ${streamer.discordUsername}:`, error);
    }
  }

  private async handleStreamEnd(member: GuildMember, streamer: any, settings: any) {
    try {
      const liveRole = member.guild.roles.cache.find(role => 
        role.id === process.env.LIVE_ROLE_ID
      );
      if (liveRole) await member.roles.remove(liveRole);

      if (streamer.announcementMessageId) {
        const announceChannel = member.guild.channels.cache.get(process.env.ANNOUNCE_CHANNEL_ID!) as TextChannel;
        if (announceChannel) {
          try {
            const message = await announceChannel.messages.fetch(streamer.announcementMessageId);
            await message.delete();
          } catch (err) {
            console.error('Could not delete announcement message:', err);
          }
        }
      }

      await storage.updateStreamer(member.id, {
        isLive: false,
        currentStreamTitle: null,
        currentViewers: 0,
        announcementMessageId: null,
      });

      await storage.createActivity({
        type: 'stream_end',
        streamerDiscordId: member.id,
        streamerUsername: streamer.discordUsername,
        description: 'lopetti striimin',
      });

      console.log(`Stream ended: ${streamer.discordUsername}`);
    } catch (error) {
      console.error(`Error handling stream end for ${streamer.discordUsername}:`, error);
    }
  }

  async getStatus() {
    const settings = await storage.getBotSettings();
    return {
      isOnline: this.isInitialized && this.client.isReady(),
      isActive: settings?.isActive || false,
      guildCount: this.client.guilds.cache.size,
      uptime: this.client.uptime,
    };
  }

  async updateSettings(newSettings: InsertBotSettings) {
    await storage.updateBotSettings(newSettings);
    if (this.isInitialized) this.startStreamMonitoring();
  }
}
