// ==========================================
// CONNECTEUR CALENDRIERS
// Google Calendar, Outlook, Calendly
// ==========================================

import { integrationsService } from './integrationsService.js';

class CalendarConnector {
  constructor() {
    this.connectorType = 'calendar';
  }

  // ==========================================
  // GOOGLE CALENDAR
  // ==========================================

  async googleCalendar_getCalendars(companyId, userId) {
    const tokens = await integrationsService.getTokens(companyId, 'google_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Google Calendar');

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération calendriers');
    const data = await response.json();
    return data.items || [];
  }

  async googleCalendar_createEvent(companyId, userId, calendarId, event) {
    const tokens = await integrationsService.getTokens(companyId, 'google_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Google Calendar');

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startDate,
            timeZone: event.timeZone || 'Europe/Paris'
          },
          end: {
            dateTime: event.endDate,
            timeZone: event.timeZone || 'Europe/Paris'
          },
          attendees: event.attendees?.map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 }
            ]
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur création événement: ${error}`);
    }

    return await response.json();
  }

  async googleCalendar_getEvents(companyId, userId, calendarId, startDate, endDate) {
    const tokens = await integrationsService.getTokens(companyId, 'google_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Google Calendar');

    const params = new URLSearchParams({
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime'
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération événements');
    const data = await response.json();
    return data.items || [];
  }

  async googleCalendar_deleteEvent(companyId, userId, calendarId, eventId) {
    const tokens = await integrationsService.getTokens(companyId, 'google_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Google Calendar');

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok && response.status !== 410) {
      throw new Error('Erreur suppression événement');
    }

    return { success: true };
  }

  // ==========================================
  // OUTLOOK / MICROSOFT 365
  // ==========================================

  async outlook_getCalendars(companyId, userId) {
    const tokens = await integrationsService.getTokens(companyId, 'outlook_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Outlook');

    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/calendars',
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération calendriers');
    const data = await response.json();
    return data.value || [];
  }

  async outlook_createEvent(companyId, userId, calendarId, event) {
    const tokens = await integrationsService.getTokens(companyId, 'outlook_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Outlook');

    const url = calendarId
      ? `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`
      : 'https://graph.microsoft.com/v1.0/me/events';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description || ''
        },
        start: {
          dateTime: event.startDate,
          timeZone: event.timeZone || 'Europe/Paris'
        },
        end: {
          dateTime: event.endDate,
          timeZone: event.timeZone || 'Europe/Paris'
        },
        attendees: event.attendees?.map(email => ({
          emailAddress: { address: email },
          type: 'required'
        })),
        isOnlineMeeting: event.createTeamsMeeting || false,
        onlineMeetingProvider: event.createTeamsMeeting ? 'teamsForBusiness' : null
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur création événement: ${error}`);
    }

    return await response.json();
  }

  async outlook_getEvents(companyId, userId, calendarId, startDate, endDate) {
    const tokens = await integrationsService.getTokens(companyId, 'outlook_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Outlook');

    const url = calendarId
      ? `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/calendarView`
      : 'https://graph.microsoft.com/v1.0/me/calendarView';

    const params = new URLSearchParams({
      startDateTime: new Date(startDate).toISOString(),
      endDateTime: new Date(endDate).toISOString()
    });

    const response = await fetch(`${url}?${params}`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });

    if (!response.ok) throw new Error('Erreur récupération événements');
    const data = await response.json();
    return data.value || [];
  }

  async outlook_deleteEvent(companyId, userId, eventId) {
    const tokens = await integrationsService.getTokens(companyId, 'outlook_calendar', userId);
    if (!tokens) throw new Error('Non connecté à Outlook');

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error('Erreur suppression événement');
    }

    return { success: true };
  }

  // ==========================================
  // CALENDLY
  // ==========================================

  async calendly_getUser(companyId, userId) {
    const tokens = await integrationsService.getTokens(companyId, 'calendly', userId);
    if (!tokens) throw new Error('Non connecté à Calendly');

    const response = await fetch(
      'https://api.calendly.com/users/me',
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération utilisateur');
    return await response.json();
  }

  async calendly_getEventTypes(companyId, userId) {
    const tokens = await integrationsService.getTokens(companyId, 'calendly', userId);
    if (!tokens) throw new Error('Non connecté à Calendly');

    // D'abord récupérer l'URI de l'utilisateur
    const user = await this.calendly_getUser(companyId, userId);
    const userUri = user.resource?.uri;

    const response = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}`,
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération types d\'événements');
    const data = await response.json();
    return data.collection || [];
  }

  async calendly_getScheduledEvents(companyId, userId, startDate, endDate) {
    const tokens = await integrationsService.getTokens(companyId, 'calendly', userId);
    if (!tokens) throw new Error('Non connecté à Calendly');

    const user = await this.calendly_getUser(companyId, userId);
    const userUri = user.resource?.uri;

    const params = new URLSearchParams({
      user: userUri,
      min_start_time: new Date(startDate).toISOString(),
      max_start_time: new Date(endDate).toISOString()
    });

    const response = await fetch(
      `https://api.calendly.com/scheduled_events?${params}`,
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération événements');
    const data = await response.json();
    return data.collection || [];
  }

  async calendly_cancelEvent(companyId, userId, eventUuid, reason) {
    const tokens = await integrationsService.getTokens(companyId, 'calendly', userId);
    if (!tokens) throw new Error('Non connecté à Calendly');

    const response = await fetch(
      `https://api.calendly.com/scheduled_events/${eventUuid}/cancellation`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Annulé depuis Synergia' })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur annulation: ${error}`);
    }

    return await response.json();
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  /**
   * Synchroniser un événement Synergia avec le calendrier connecté
   */
  async syncEventToCalendar(companyId, userId, synergiaEvent, calendarType) {
    const event = {
      title: synergiaEvent.title,
      description: synergiaEvent.description,
      startDate: synergiaEvent.startDate,
      endDate: synergiaEvent.endDate,
      attendees: synergiaEvent.attendees,
      timeZone: 'Europe/Paris'
    };

    switch (calendarType) {
      case 'google_calendar':
        const gcConfig = await integrationsService.getIntegrationConfig(companyId, 'google_calendar');
        const calendarId = gcConfig?.config?.defaultCalendarId || 'primary';
        return await this.googleCalendar_createEvent(companyId, userId, calendarId, event);

      case 'outlook_calendar':
        return await this.outlook_createEvent(companyId, userId, null, event);

      default:
        throw new Error('Type de calendrier non supporté');
    }
  }

  /**
   * Récupérer les disponibilités d'un utilisateur
   */
  async getAvailability(companyId, userId, calendarType, startDate, endDate) {
    let events = [];

    switch (calendarType) {
      case 'google_calendar':
        const gcConfig = await integrationsService.getIntegrationConfig(companyId, 'google_calendar');
        const calendarId = gcConfig?.config?.defaultCalendarId || 'primary';
        events = await this.googleCalendar_getEvents(companyId, userId, calendarId, startDate, endDate);
        break;

      case 'outlook_calendar':
        events = await this.outlook_getEvents(companyId, userId, null, startDate, endDate);
        break;

      default:
        throw new Error('Type de calendrier non supporté');
    }

    // Retourner les créneaux occupés
    return events.map(e => ({
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      title: e.summary || e.subject,
      busy: true
    }));
  }
}

export const calendarConnector = new CalendarConnector();
export default calendarConnector;
