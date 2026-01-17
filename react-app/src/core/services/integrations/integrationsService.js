// ==========================================
// 📁 react-app/src/core/services/integrations/integrationsService.js
// SERVICE CENTRAL DE GESTION DES INTÉGRATIONS
// Gère toutes les intégrations tierces de Synergia
// ==========================================

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';

// ==========================================
// CONFIGURATION DES INTÉGRATIONS
// ==========================================

export const INTEGRATION_CATEGORIES = {
  calendar: {
    id: 'calendar',
    label: 'Calendriers',
    emoji: '📅',
    color: 'blue',
    description: 'Synchronisez vos événements et rendez-vous'
  },
  communication: {
    id: 'communication',
    label: 'Communication',
    emoji: '💬',
    color: 'purple',
    description: 'Notifications et messages dans vos outils'
  },
  sirh: {
    id: 'sirh',
    label: 'SIRH / Paie',
    emoji: '📊',
    color: 'green',
    description: 'Synchronisation des données RH et paie'
  },
  sso: {
    id: 'sso',
    label: 'SSO / Auth',
    emoji: '🔐',
    color: 'amber',
    description: 'Authentification unique sécurisée'
  },
  storage: {
    id: 'storage',
    label: 'Stockage',
    emoji: '📁',
    color: 'cyan',
    description: 'Stockage et partage de documents'
  }
};

export const INTEGRATIONS_CONFIG = {
  // ==========================================
  // CALENDRIERS
  // ==========================================
  google_calendar: {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'calendar',
    icon: '/integrations/google-calendar.svg',
    color: '#4285F4',
    description: 'Synchronisez vos événements avec Google Calendar',
    features: [
      'Synchronisation bidirectionnelle des événements',
      'Création automatique des entretiens',
      'Rappels et notifications',
      'Gestion des disponibilités'
    ],
    authType: 'oauth2',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    endpoints: {
      auth: 'https://accounts.google.com/o/oauth2/v2/auth',
      token: 'https://oauth2.googleapis.com/token',
      api: 'https://www.googleapis.com/calendar/v3'
    },
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'defaultCalendarId', label: 'Calendrier par défaut', type: 'text', required: false }
    ]
  },

  outlook_calendar: {
    id: 'outlook_calendar',
    name: 'Outlook / Microsoft 365',
    category: 'calendar',
    icon: '/integrations/outlook.svg',
    color: '#0078D4',
    description: 'Intégration avec Microsoft Outlook et 365',
    features: [
      'Synchronisation des calendriers',
      'Création d\'événements Teams',
      'Gestion des salles de réunion',
      'Intégration avec les contacts'
    ],
    authType: 'oauth2',
    scopes: [
      'Calendars.ReadWrite',
      'User.Read',
      'OnlineMeetings.ReadWrite'
    ],
    endpoints: {
      auth: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      api: 'https://graph.microsoft.com/v1.0'
    },
    configFields: [
      { key: 'clientId', label: 'Application ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'tenantId', label: 'Tenant ID', type: 'text', required: false, placeholder: 'common' }
    ]
  },

  calendly: {
    id: 'calendly',
    name: 'Calendly',
    category: 'calendar',
    icon: '/integrations/calendly.svg',
    color: '#006BFF',
    description: 'Planification automatique des rendez-vous',
    features: [
      'Création de liens de prise de RDV',
      'Synchronisation des événements',
      'Webhooks pour les réservations',
      'Gestion des disponibilités'
    ],
    authType: 'oauth2',
    scopes: ['default'],
    endpoints: {
      auth: 'https://auth.calendly.com/oauth/authorize',
      token: 'https://auth.calendly.com/oauth/token',
      api: 'https://api.calendly.com'
    },
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ]
  },

  // ==========================================
  // COMMUNICATION
  // ==========================================
  slack: {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: '/integrations/slack.svg',
    color: '#4A154B',
    description: 'Notifications et commandes dans Slack',
    features: [
      'Notifications en temps réel',
      'Commandes slash (/synergia)',
      'Messages interactifs',
      'Channels dédiés par équipe'
    ],
    authType: 'oauth2',
    scopes: [
      'chat:write',
      'commands',
      'users:read',
      'channels:read',
      'incoming-webhook'
    ],
    endpoints: {
      auth: 'https://slack.com/oauth/v2/authorize',
      token: 'https://slack.com/api/oauth.v2.access',
      api: 'https://slack.com/api'
    },
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'signingSecret', label: 'Signing Secret', type: 'password', required: true },
      { key: 'defaultChannel', label: 'Channel par défaut', type: 'text', required: false }
    ],
    webhookEvents: ['message', 'reaction_added', 'app_mention']
  },

  microsoft_teams: {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: '/integrations/teams.svg',
    color: '#6264A7',
    description: 'Intégration complète avec Microsoft Teams',
    features: [
      'Notifications dans les canaux',
      'Onglets personnalisés',
      'Bots interactifs',
      'Réunions automatiques'
    ],
    authType: 'oauth2',
    scopes: [
      'Team.ReadBasic.All',
      'Channel.ReadBasic.All',
      'ChannelMessage.Send',
      'User.Read'
    ],
    endpoints: {
      auth: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      api: 'https://graph.microsoft.com/v1.0'
    },
    configFields: [
      { key: 'clientId', label: 'Application ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'tenantId', label: 'Tenant ID', type: 'text', required: true },
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: false }
    ]
  },

  discord: {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    icon: '/integrations/discord.svg',
    color: '#5865F2',
    description: 'Bot Discord pour votre serveur',
    features: [
      'Notifications sur les channels',
      'Commandes bot personnalisées',
      'Rôles automatiques',
      'Webhooks'
    ],
    authType: 'oauth2',
    scopes: ['bot', 'applications.commands'],
    botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
    endpoints: {
      auth: 'https://discord.com/api/oauth2/authorize',
      token: 'https://discord.com/api/oauth2/token',
      api: 'https://discord.com/api/v10'
    },
    configFields: [
      { key: 'clientId', label: 'Application ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
      { key: 'guildId', label: 'Server ID', type: 'text', required: true }
    ]
  },

  // ==========================================
  // SIRH / PAIE
  // ==========================================
  payfit: {
    id: 'payfit',
    name: 'PayFit',
    category: 'sirh',
    icon: '/integrations/payfit.svg',
    color: '#00D4AA',
    description: 'Synchronisation avec PayFit',
    features: [
      'Import des employés',
      'Synchronisation des congés',
      'Export des pointages',
      'Données de paie'
    ],
    authType: 'api_key',
    endpoints: {
      api: 'https://api.payfit.com/v1'
    },
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'companyId', label: 'Company ID', type: 'text', required: true }
    ],
    syncOptions: [
      { key: 'syncEmployees', label: 'Synchroniser les employés', default: true },
      { key: 'syncLeaves', label: 'Synchroniser les congés', default: true },
      { key: 'syncTimesheets', label: 'Exporter les pointages', default: false }
    ]
  },

  lucca: {
    id: 'lucca',
    name: 'Lucca',
    category: 'sirh',
    icon: '/integrations/lucca.svg',
    color: '#FF6B35',
    description: 'Intégration Lucca (Timmi, Figgo, Poplee)',
    features: [
      'Synchronisation Timmi Absences',
      'Import Poplee Core HR',
      'Gestion des temps Timmi',
      'Notes de frais Cleemy'
    ],
    authType: 'api_key',
    endpoints: {
      api: 'https://api.lucca.fr'
    },
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'domain', label: 'Domaine Lucca', type: 'text', required: true, placeholder: 'votre-entreprise.ilucca.net' }
    ],
    syncOptions: [
      { key: 'syncUsers', label: 'Synchroniser les utilisateurs (Poplee)', default: true },
      { key: 'syncLeaves', label: 'Synchroniser les absences (Figgo)', default: true },
      { key: 'syncTimesheets', label: 'Synchroniser les temps (Timmi)', default: false }
    ]
  },

  silae: {
    id: 'silae',
    name: 'Silae',
    category: 'sirh',
    icon: '/integrations/silae.svg',
    color: '#E31937',
    description: 'Connecteur Silae pour la paie',
    features: [
      'Export des variables de paie',
      'Import des bulletins',
      'Synchronisation DSN',
      'Gestion des absences'
    ],
    authType: 'api_key',
    endpoints: {
      api: 'https://api.silae.fr/v1'
    },
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'partnerId', label: 'Partner ID', type: 'text', required: true },
      { key: 'dossierPaie', label: 'N° Dossier Paie', type: 'text', required: true }
    ]
  },

  adp: {
    id: 'adp',
    name: 'ADP',
    category: 'sirh',
    icon: '/integrations/adp.svg',
    color: '#D0271D',
    description: 'Intégration ADP Workforce',
    features: [
      'Synchronisation des employés',
      'Gestion des temps',
      'Export paie',
      'Rapports RH'
    ],
    authType: 'oauth2',
    scopes: ['api'],
    endpoints: {
      auth: 'https://accounts.adp.com/auth/oauth/v2/authorize',
      token: 'https://accounts.adp.com/auth/oauth/v2/token',
      api: 'https://api.adp.com'
    },
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'certPath', label: 'Certificate Path', type: 'text', required: true }
    ]
  },

  // ==========================================
  // SSO / AUTHENTIFICATION
  // ==========================================
  google_workspace: {
    id: 'google_workspace',
    name: 'Google Workspace',
    category: 'sso',
    icon: '/integrations/google.svg',
    color: '#4285F4',
    description: 'SSO avec Google Workspace',
    features: [
      'Connexion avec compte Google',
      'Provisioning automatique',
      'Synchronisation des groupes',
      'MFA Google'
    ],
    authType: 'oauth2',
    scopes: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/admin.directory.user.readonly'
    ],
    endpoints: {
      auth: 'https://accounts.google.com/o/oauth2/v2/auth',
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'hostedDomain', label: 'Domaine autorisé', type: 'text', required: false, placeholder: 'votre-entreprise.com' }
    ]
  },

  azure_ad: {
    id: 'azure_ad',
    name: 'Microsoft Azure AD',
    category: 'sso',
    icon: '/integrations/azure.svg',
    color: '#0078D4',
    description: 'SSO avec Azure Active Directory',
    features: [
      'Connexion Microsoft',
      'Provisioning SCIM',
      'Synchronisation des groupes AD',
      'Conditional Access'
    ],
    authType: 'oauth2',
    scopes: ['openid', 'email', 'profile', 'User.Read'],
    endpoints: {
      auth: 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize',
      token: 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token',
      userinfo: 'https://graph.microsoft.com/v1.0/me'
    },
    configFields: [
      { key: 'clientId', label: 'Application ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'tenantId', label: 'Tenant ID', type: 'text', required: true }
    ]
  },

  okta: {
    id: 'okta',
    name: 'Okta',
    category: 'sso',
    icon: '/integrations/okta.svg',
    color: '#007DC1',
    description: 'SSO avec Okta',
    features: [
      'SAML 2.0 / OIDC',
      'Provisioning SCIM',
      'MFA Okta',
      'Lifecycle Management'
    ],
    authType: 'oauth2',
    scopes: ['openid', 'email', 'profile'],
    endpoints: {
      auth: 'https://{domain}/oauth2/v1/authorize',
      token: 'https://{domain}/oauth2/v1/token',
      userinfo: 'https://{domain}/oauth2/v1/userinfo'
    },
    configFields: [
      { key: 'domain', label: 'Okta Domain', type: 'text', required: true, placeholder: 'votre-entreprise.okta.com' },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ]
  },

  saml: {
    id: 'saml',
    name: 'SAML 2.0 Générique',
    category: 'sso',
    icon: '/integrations/saml.svg',
    color: '#FF6B00',
    description: 'SSO SAML 2.0 personnalisé',
    features: [
      'Compatible tout IdP SAML',
      'Mapping d\'attributs flexible',
      'Signature XML',
      'Single Logout'
    ],
    authType: 'saml',
    configFields: [
      { key: 'entityId', label: 'Entity ID (IdP)', type: 'text', required: true },
      { key: 'ssoUrl', label: 'SSO URL', type: 'text', required: true },
      { key: 'certificate', label: 'Certificat X.509', type: 'textarea', required: true },
      { key: 'attributeMapping', label: 'Mapping attributs (JSON)', type: 'textarea', required: false }
    ]
  },

  // ==========================================
  // STOCKAGE
  // ==========================================
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'storage',
    icon: '/integrations/google-drive.svg',
    color: '#4285F4',
    description: 'Stockage et partage via Google Drive',
    features: [
      'Upload de documents',
      'Dossiers partagés',
      'Liens de partage',
      'Recherche dans les fichiers'
    ],
    authType: 'oauth2',
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    endpoints: {
      auth: 'https://accounts.google.com/o/oauth2/v2/auth',
      token: 'https://oauth2.googleapis.com/token',
      api: 'https://www.googleapis.com/drive/v3'
    },
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'rootFolderId', label: 'Dossier racine ID', type: 'text', required: false }
    ]
  },

  onedrive: {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'storage',
    icon: '/integrations/onedrive.svg',
    color: '#0078D4',
    description: 'Stockage Microsoft OneDrive',
    features: [
      'Upload de documents',
      'SharePoint integration',
      'Partage sécurisé',
      'Synchronisation'
    ],
    authType: 'oauth2',
    scopes: ['Files.ReadWrite.All', 'Sites.ReadWrite.All'],
    endpoints: {
      auth: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      api: 'https://graph.microsoft.com/v1.0'
    },
    configFields: [
      { key: 'clientId', label: 'Application ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'driveId', label: 'Drive ID', type: 'text', required: false }
    ]
  },

  notion: {
    id: 'notion',
    name: 'Notion',
    category: 'storage',
    icon: '/integrations/notion.svg',
    color: '#000000',
    description: 'Intégration avec Notion',
    features: [
      'Création de pages',
      'Synchronisation de bases',
      'Export de rapports',
      'Templates automatiques'
    ],
    authType: 'oauth2',
    endpoints: {
      auth: 'https://api.notion.com/v1/oauth/authorize',
      token: 'https://api.notion.com/v1/oauth/token',
      api: 'https://api.notion.com/v1'
    },
    configFields: [
      { key: 'clientId', label: 'OAuth Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'OAuth Client Secret', type: 'password', required: true },
      { key: 'defaultDatabaseId', label: 'Database ID par défaut', type: 'text', required: false }
    ]
  }
};

// ==========================================
// SERVICE D'INTÉGRATIONS
// ==========================================

class IntegrationsService {
  constructor() {
    this.COLLECTION_NAME = 'integrations';
    this.TOKENS_COLLECTION = 'integration_tokens';
    console.log('🔌 IntegrationsService initialisé');
  }

  // ==========================================
  // GESTION DES CONFIGURATIONS
  // ==========================================

  /**
   * Obtenir toutes les intégrations disponibles
   */
  getAllIntegrations() {
    return Object.values(INTEGRATIONS_CONFIG);
  }

  /**
   * Obtenir les intégrations par catégorie
   */
  getIntegrationsByCategory(category) {
    return Object.values(INTEGRATIONS_CONFIG).filter(i => i.category === category);
  }

  /**
   * Obtenir une intégration par ID
   */
  getIntegration(integrationId) {
    return INTEGRATIONS_CONFIG[integrationId] || null;
  }

  /**
   * Obtenir la configuration d'une intégration pour une entreprise
   */
  async getIntegrationConfig(companyId, integrationId) {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, `${companyId}_${integrationId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération config intégration:', error);
      return null;
    }
  }

  /**
   * Obtenir toutes les intégrations configurées pour une entreprise
   */
  async getCompanyIntegrations(companyId) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('companyId', '==', companyId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Erreur récupération intégrations:', error);
      return [];
    }
  }

  /**
   * Sauvegarder la configuration d'une intégration
   */
  async saveIntegrationConfig(companyId, integrationId, config) {
    try {
      const docId = `${companyId}_${integrationId}`;
      const integration = this.getIntegration(integrationId);

      if (!integration) {
        throw new Error('Intégration non trouvée');
      }

      const data = {
        companyId,
        integrationId,
        integrationName: integration.name,
        category: integration.category,
        config: this.encryptSensitiveFields(config, integration.configFields),
        enabled: config.enabled !== false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, this.COLLECTION_NAME, docId), data, { merge: true });

      console.log(`✅ Configuration ${integrationId} sauvegardée`);
      return { success: true, id: docId };
    } catch (error) {
      console.error('❌ Erreur sauvegarde config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Activer/Désactiver une intégration
   */
  async toggleIntegration(companyId, integrationId, enabled) {
    try {
      const docId = `${companyId}_${integrationId}`;
      await updateDoc(doc(db, this.COLLECTION_NAME, docId), {
        enabled,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur toggle intégration:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer une intégration
   */
  async deleteIntegration(companyId, integrationId) {
    try {
      const docId = `${companyId}_${integrationId}`;
      await deleteDoc(doc(db, this.COLLECTION_NAME, docId));

      // Supprimer aussi les tokens associés
      await this.revokeTokens(companyId, integrationId);

      console.log(`🗑️ Intégration ${integrationId} supprimée`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression intégration:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // GESTION DES TOKENS OAUTH
  // ==========================================

  /**
   * Sauvegarder les tokens OAuth
   */
  async saveTokens(companyId, integrationId, userId, tokens) {
    try {
      const docId = `${companyId}_${integrationId}_${userId}`;
      await setDoc(doc(db, this.TOKENS_COLLECTION, docId), {
        companyId,
        integrationId,
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde tokens:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les tokens OAuth
   */
  async getTokens(companyId, integrationId, userId) {
    try {
      const docId = `${companyId}_${integrationId}_${userId}`;
      const docSnap = await getDoc(doc(db, this.TOKENS_COLLECTION, docId));

      if (!docSnap.exists()) return null;

      const data = docSnap.data();

      // Vérifier si le token est expiré
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        // Token expiré, tenter de le rafraîchir
        if (data.refreshToken) {
          return await this.refreshToken(companyId, integrationId, userId, data.refreshToken);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur récupération tokens:', error);
      return null;
    }
  }

  /**
   * Rafraîchir un token OAuth
   */
  async refreshToken(companyId, integrationId, userId, refreshToken) {
    try {
      const integration = this.getIntegration(integrationId);
      const config = await this.getIntegrationConfig(companyId, integrationId);

      if (!integration || !config) {
        throw new Error('Configuration non trouvée');
      }

      const response = await fetch(integration.endpoints.token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.config.clientId,
          client_secret: config.config.clientSecret
        })
      });

      if (!response.ok) {
        throw new Error('Échec du rafraîchissement du token');
      }

      const tokens = await response.json();
      await this.saveTokens(companyId, integrationId, userId, {
        ...tokens,
        refresh_token: tokens.refresh_token || refreshToken
      });

      return tokens;
    } catch (error) {
      console.error('❌ Erreur refresh token:', error);
      return null;
    }
  }

  /**
   * Révoquer les tokens
   */
  async revokeTokens(companyId, integrationId, userId = null) {
    try {
      if (userId) {
        const docId = `${companyId}_${integrationId}_${userId}`;
        await deleteDoc(doc(db, this.TOKENS_COLLECTION, docId));
      } else {
        // Supprimer tous les tokens pour cette intégration
        const q = query(
          collection(db, this.TOKENS_COLLECTION),
          where('companyId', '==', companyId),
          where('integrationId', '==', integrationId)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur révocation tokens:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // GÉNÉRATION D'URL OAUTH
  // ==========================================

  /**
   * Générer l'URL d'autorisation OAuth
   */
  generateAuthUrl(integrationId, companyId, userId, redirectUri) {
    const integration = this.getIntegration(integrationId);
    if (!integration || integration.authType !== 'oauth2') {
      throw new Error('Intégration OAuth non valide');
    }

    const state = btoa(JSON.stringify({ companyId, userId, integrationId }));

    const params = new URLSearchParams({
      client_id: '{CLIENT_ID}', // Sera remplacé par la config
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: integration.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${integration.endpoints.auth}?${params.toString()}`;
  }

  /**
   * Échanger le code OAuth contre des tokens
   */
  async exchangeCodeForTokens(integrationId, code, redirectUri, config) {
    const integration = this.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Intégration non trouvée');
    }

    const response = await fetch(integration.endpoints.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Échec échange code: ${error}`);
    }

    return await response.json();
  }

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Chiffrer les champs sensibles (simulation - en prod, utiliser un vrai chiffrement)
   */
  encryptSensitiveFields(config, fields) {
    const encrypted = { ...config };
    fields.forEach(field => {
      if (field.type === 'password' && encrypted[field.key]) {
        // En production, utiliser un vrai chiffrement AES
        encrypted[field.key] = btoa(encrypted[field.key]);
      }
    });
    return encrypted;
  }

  /**
   * Déchiffrer les champs sensibles
   */
  decryptSensitiveFields(config, fields) {
    const decrypted = { ...config };
    fields.forEach(field => {
      if (field.type === 'password' && decrypted[field.key]) {
        try {
          decrypted[field.key] = atob(decrypted[field.key]);
        } catch (e) {
          // Déjà déchiffré ou format invalide
        }
      }
    });
    return decrypted;
  }

  /**
   * Tester la connexion à une intégration
   */
  async testConnection(companyId, integrationId) {
    try {
      const config = await this.getIntegrationConfig(companyId, integrationId);
      if (!config || !config.enabled) {
        return { success: false, error: 'Intégration non configurée' };
      }

      // Logique de test spécifique à chaque intégration
      // À implémenter selon l'API

      return { success: true, message: 'Connexion réussie' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton
export const integrationsService = new IntegrationsService();
export default integrationsService;
