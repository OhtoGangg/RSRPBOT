import { Client, GatewayIntentBits, TextChannel, Role, GuildMember } from 'discord.js';
import { storage } from '../storage.js';
import { TwitchAPI } from './twitch-api.js';

export class DiscordBot {
  private client: Client;
  private twitchAPI: TwitchAPI;
  private isInitialized = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
      ],
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

    this.client.on('error', (error) => {
      console.error('Discord bot error:', error);
    });
  }

  async initialize(): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
    if (!token) throw new Error('DISCORD_BOT_TOKEN missing');
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
        role.name === 'STRIIMAAJA' || role.id === settings.watchedRoleId
      );
      if (!watchedRole) return;

      await guild.members.fetch();
      watchedRole.members.forEach(async (member) => {
        await this.checkMemberStream(member, settings);
      });
    } catch (error) {
      console.error('Error checking streamers:', error);
    }
  }

  private async checkMemberStream(member: GuildMember, settings: any) {
    try {
      let streamer = await storage.getStreamer(member.id);
      if (!streamer) {
        const twitchUsername = member.user.username; // fallback
        streamer = await storage.createStreamer({
          discordUserId: member.id,
          discordUsername: member.displayName || member.user.username,
          twitchUsername,
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

  private async handleStreamStart(member: GuildMember, streamer: any, streamData: any, settings: any) {
    try {
      const liveRole = member.guild.roles.cache.find(role =>
        role.name === 'LIVESSÄ' || role.id === settings.liveRoleId
      );
      if (liveRole) await member.roles.add(liveRole);

      const announceChannel = member.guild.channels.cache.find(channel =>
        (channel.name === 'mainostus' || channel.id === settings.announceChannelId)
      ) as TextChannel;

      let announcementMessageId = null;
      if (announceChannel) {
        const message = await announceChannel.send({
          embeds: [{
            title: '🔴 LIVE: RSRP Stream!',
            description: `${streamer.discordUsername} aloitti striimin!`,
            url: `https://twitch.tv/${streamer.twitchUsername}`,
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
    } catch (error) {
      console.error(`Error starting stream for ${streamer.discordUsername}:`, error);
    }
  }

  private async handleStreamEnd(member: GuildMember, streamer: any, settings: any) {
    try {
      const liveRole = member.guild.roles.cache.find(role =>
        role.name === 'LIVESSÄ' || role.id === settings.liveRoleId
      );
      if (liveRole) await member.roles.remove(liveRole);

      if (streamer.announcementMessageId) {
        const announceChannel = member.guild.channels.cache.find(channel =>
          channel.name === 'mainostus' || channel.id === settings.announceChannelId
        ) as TextChannel;

        if (announceChannel) {
          try {
            const message = await announceChannel.messages.fetch(streamer.announcementMessageId);
            await message.delete();
          } catch {}
        }
      }

      await storage.updateStreamer(member.id, {
        isLive: false,
        currentStreamTitle: null,
        currentViewers: 0,
        announcementMessageId: null,
      });
    } catch (error) {
      console.error(`Error ending stream for ${streamer.discordUsername}:`, error);
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
}
