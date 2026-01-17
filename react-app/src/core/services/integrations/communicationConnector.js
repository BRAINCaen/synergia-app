// ==========================================
// CONNECTEUR COMMUNICATION
// Slack, Microsoft Teams, Discord
// ==========================================

import { integrationsService } from './integrationsService.js';

class CommunicationConnector {
  constructor() {
    this.connectorType = 'communication';
  }

  // ==========================================
  // SLACK
  // ==========================================

  async slack_sendMessage(companyId, channel, message, options = {}) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'slack');
    if (!config?.enabled) throw new Error('Slack non configuré');

    const tokens = await integrationsService.getTokens(companyId, 'slack', 'company');
    if (!tokens) throw new Error('Non connecté à Slack');

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel || config.config?.defaultChannel,
        text: message,
        blocks: options.blocks,
        attachments: options.attachments,
        unfurl_links: options.unfurlLinks ?? true
      })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(`Erreur Slack: ${data.error}`);
    return data;
  }

  async slack_getChannels(companyId) {
    const tokens = await integrationsService.getTokens(companyId, 'slack', 'company');
    if (!tokens) throw new Error('Non connecté à Slack');

    const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });

    const data = await response.json();
    if (!data.ok) throw new Error(`Erreur Slack: ${data.error}`);
    return data.channels || [];
  }

  async slack_getUsers(companyId) {
    const tokens = await integrationsService.getTokens(companyId, 'slack', 'company');
    if (!tokens) throw new Error('Non connecté à Slack');

    const response = await fetch('https://slack.com/api/users.list', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });

    const data = await response.json();
    if (!data.ok) throw new Error(`Erreur Slack: ${data.error}`);
    return data.members?.filter(m => !m.is_bot && !m.deleted) || [];
  }

  async slack_sendDirectMessage(companyId, userId, message) {
    const tokens = await integrationsService.getTokens(companyId, 'slack', 'company');
    if (!tokens) throw new Error('Non connecté à Slack');

    // Ouvrir une conversation DM
    const openResponse = await fetch('https://slack.com/api/conversations.open', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ users: userId })
    });

    const openData = await openResponse.json();
    if (!openData.ok) throw new Error(`Erreur Slack: ${openData.error}`);

    // Envoyer le message
    return await this.slack_sendMessage(companyId, openData.channel.id, message);
  }

  /**
   * Créer un message formaté Synergia pour Slack
   */
  slack_formatSynergiaNotification(type, data) {
    const typeConfig = {
      leave_request: {
        color: '#FFA500',
        title: 'Nouvelle demande de congé',
        emoji: ':palm_tree:'
      },
      leave_approved: {
        color: '#00FF00',
        title: 'Congé approuvé',
        emoji: ':white_check_mark:'
      },
      leave_rejected: {
        color: '#FF0000',
        title: 'Congé refusé',
        emoji: ':x:'
      },
      interview_scheduled: {
        color: '#0000FF',
        title: 'Entretien planifié',
        emoji: ':calendar:'
      },
      timesheet_reminder: {
        color: '#FFD700',
        title: 'Rappel pointage',
        emoji: ':clock3:'
      },
      feedback_requested: {
        color: '#9400D3',
        title: 'Feedback demandé',
        emoji: ':speech_balloon:'
      }
    };

    const config = typeConfig[type] || { color: '#808080', title: 'Notification', emoji: ':bell:' };

    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${config.emoji} ${config.title}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: data.message
          }
        },
        ...(data.details ? [{
          type: 'section',
          fields: Object.entries(data.details).map(([key, value]) => ({
            type: 'mrkdwn',
            text: `*${key}:*\n${value}`
          }))
        }] : []),
        ...(data.actionUrl ? [{
          type: 'actions',
          elements: [{
            type: 'button',
            text: { type: 'plain_text', text: 'Voir dans Synergia', emoji: true },
            url: data.actionUrl,
            action_id: 'open_synergia'
          }]
        }] : [])
      ],
      attachments: [{
        color: config.color
      }]
    };
  }

  // ==========================================
  // MICROSOFT TEAMS
  // ==========================================

  async teams_sendMessage(companyId, teamId, channelId, message, options = {}) {
    const tokens = await integrationsService.getTokens(companyId, 'microsoft_teams', 'company');
    if (!tokens) throw new Error('Non connecté à Teams');

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: {
            contentType: options.contentType || 'html',
            content: message
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur Teams: ${error}`);
    }

    return await response.json();
  }

  async teams_sendWebhookMessage(webhookUrl, message, options = {}) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: options.color || '0076D7',
        summary: options.summary || 'Notification Synergia',
        sections: [{
          activityTitle: options.title || 'Notification',
          activitySubtitle: options.subtitle,
          activityImage: options.imageUrl,
          facts: options.facts || [],
          markdown: true,
          text: message
        }],
        potentialAction: options.actionUrl ? [{
          '@type': 'OpenUri',
          name: 'Voir dans Synergia',
          targets: [{ os: 'default', uri: options.actionUrl }]
        }] : []
      })
    });

    if (!response.ok) {
      throw new Error('Erreur envoi webhook Teams');
    }

    return { success: true };
  }

  async teams_getTeams(companyId) {
    const tokens = await integrationsService.getTokens(companyId, 'microsoft_teams', 'company');
    if (!tokens) throw new Error('Non connecté à Teams');

    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/joinedTeams',
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération teams');
    const data = await response.json();
    return data.value || [];
  }

  async teams_getChannels(companyId, teamId) {
    const tokens = await integrationsService.getTokens(companyId, 'microsoft_teams', 'company');
    if (!tokens) throw new Error('Non connecté à Teams');

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels`,
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération channels');
    const data = await response.json();
    return data.value || [];
  }

  /**
   * Créer un message formaté Synergia pour Teams
   */
  teams_formatSynergiaNotification(type, data) {
    const typeConfig = {
      leave_request: { color: 'FFA500', title: 'Nouvelle demande de congé' },
      leave_approved: { color: '00FF00', title: 'Congé approuvé' },
      leave_rejected: { color: 'FF0000', title: 'Congé refusé' },
      interview_scheduled: { color: '0000FF', title: 'Entretien planifié' },
      timesheet_reminder: { color: 'FFD700', title: 'Rappel pointage' },
      feedback_requested: { color: '9400D3', title: 'Feedback demandé' }
    };

    const config = typeConfig[type] || { color: '808080', title: 'Notification' };

    return {
      color: config.color,
      title: config.title,
      summary: config.title,
      facts: data.details
        ? Object.entries(data.details).map(([key, value]) => ({ name: key, value }))
        : [],
      actionUrl: data.actionUrl
    };
  }

  // ==========================================
  // DISCORD
  // ==========================================

  async discord_sendMessage(companyId, channelId, message, options = {}) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'discord');
    if (!config?.enabled) throw new Error('Discord non configuré');

    const botToken = atob(config.config?.botToken || '');
    if (!botToken) throw new Error('Bot token non configuré');

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: message,
          embeds: options.embeds
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur Discord: ${error}`);
    }

    return await response.json();
  }

  async discord_sendWebhookMessage(webhookUrl, message, options = {}) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: options.content,
        username: options.username || 'Synergia',
        avatar_url: options.avatarUrl,
        embeds: options.embeds || [{
          title: options.title,
          description: message,
          color: options.color ? parseInt(options.color.replace('#', ''), 16) : 0x5865F2,
          fields: options.fields,
          footer: { text: 'Synergia HR' },
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Erreur envoi webhook Discord');
    }

    return { success: true };
  }

  async discord_getGuildChannels(companyId) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'discord');
    if (!config?.enabled) throw new Error('Discord non configuré');

    const botToken = atob(config.config?.botToken || '');
    const guildId = config.config?.guildId;

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: { Authorization: `Bot ${botToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération channels');
    const channels = await response.json();
    return channels.filter(c => c.type === 0); // Text channels only
  }

  /**
   * Créer un embed Synergia pour Discord
   */
  discord_formatSynergiaNotification(type, data) {
    const typeConfig = {
      leave_request: { color: 0xFFA500, title: 'Nouvelle demande de congé' },
      leave_approved: { color: 0x00FF00, title: 'Congé approuvé' },
      leave_rejected: { color: 0xFF0000, title: 'Congé refusé' },
      interview_scheduled: { color: 0x0000FF, title: 'Entretien planifié' },
      timesheet_reminder: { color: 0xFFD700, title: 'Rappel pointage' },
      feedback_requested: { color: 0x9400D3, title: 'Feedback demandé' }
    };

    const config = typeConfig[type] || { color: 0x808080, title: 'Notification' };

    return {
      embeds: [{
        title: config.title,
        description: data.message,
        color: config.color,
        fields: data.details
          ? Object.entries(data.details).map(([key, value]) => ({
              name: key,
              value: String(value),
              inline: true
            }))
          : [],
        footer: { text: 'Synergia HR' },
        timestamp: new Date().toISOString()
      }]
    };
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  /**
   * Envoyer une notification Synergia sur tous les canaux configurés
   */
  async broadcastNotification(companyId, type, data) {
    const results = {
      slack: null,
      teams: null,
      discord: null
    };

    // Slack
    try {
      const slackConfig = await integrationsService.getIntegrationConfig(companyId, 'slack');
      if (slackConfig?.enabled && slackConfig.config?.defaultChannel) {
        const formatted = this.slack_formatSynergiaNotification(type, data);
        results.slack = await this.slack_sendMessage(
          companyId,
          slackConfig.config.defaultChannel,
          data.message,
          formatted
        );
      }
    } catch (error) {
      results.slack = { error: error.message };
    }

    // Teams (webhook)
    try {
      const teamsConfig = await integrationsService.getIntegrationConfig(companyId, 'microsoft_teams');
      if (teamsConfig?.enabled && teamsConfig.config?.webhookUrl) {
        const formatted = this.teams_formatSynergiaNotification(type, data);
        results.teams = await this.teams_sendWebhookMessage(
          teamsConfig.config.webhookUrl,
          data.message,
          formatted
        );
      }
    } catch (error) {
      results.teams = { error: error.message };
    }

    // Discord (webhook si disponible)
    try {
      const discordConfig = await integrationsService.getIntegrationConfig(companyId, 'discord');
      if (discordConfig?.enabled && discordConfig.config?.guildId) {
        const formatted = this.discord_formatSynergiaNotification(type, data);
        const channels = await this.discord_getGuildChannels(companyId);
        if (channels.length > 0) {
          results.discord = await this.discord_sendMessage(
            companyId,
            channels[0].id,
            data.message,
            formatted
          );
        }
      }
    } catch (error) {
      results.discord = { error: error.message };
    }

    return results;
  }
}

export const communicationConnector = new CommunicationConnector();
export default communicationConnector;
