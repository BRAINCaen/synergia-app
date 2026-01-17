// ==========================================
// CONNECTEUR SSO / AUTHENTIFICATION
// Google Workspace, Azure AD, Okta, SAML 2.0
// ==========================================

import { integrationsService } from './integrationsService.js';

class SsoConnector {
  constructor() {
    this.connectorType = 'sso';
  }

  // ==========================================
  // GOOGLE WORKSPACE SSO
  // ==========================================

  generateGoogleAuthUrl(companyId, redirectUri) {
    const config = integrationsService.getIntegration('google_workspace');

    const params = new URLSearchParams({
      client_id: '{CLIENT_ID}', // Remplacé à l'exécution
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: btoa(JSON.stringify({ companyId, provider: 'google_workspace' }))
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async googleWorkspace_getUserInfo(accessToken) {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération infos utilisateur');
    return await response.json();
  }

  async googleWorkspace_verifyDomain(companyId, email) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'google_workspace');
    if (!config?.enabled) return true; // Pas de restriction si non configuré

    const hostedDomain = config.config?.hostedDomain;
    if (!hostedDomain) return true;

    const emailDomain = email.split('@')[1];
    return emailDomain === hostedDomain;
  }

  // ==========================================
  // MICROSOFT AZURE AD SSO
  // ==========================================

  generateAzureAuthUrl(companyId, tenantId, redirectUri) {
    const config = integrationsService.getIntegration('azure_ad');
    const tenant = tenantId || 'common';

    const params = new URLSearchParams({
      client_id: '{CLIENT_ID}',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      response_mode: 'query',
      state: btoa(JSON.stringify({ companyId, provider: 'azure_ad' }))
    });

    return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`;
  }

  async azureAd_getUserInfo(accessToken) {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération infos utilisateur Azure');
    return await response.json();
  }

  async azureAd_getUserGroups(accessToken) {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/memberOf',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération groupes');
    const data = await response.json();
    return data.value || [];
  }

  // ==========================================
  // OKTA SSO
  // ==========================================

  generateOktaAuthUrl(companyId, domain, redirectUri) {
    const config = integrationsService.getIntegration('okta');

    const params = new URLSearchParams({
      client_id: '{CLIENT_ID}',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state: btoa(JSON.stringify({ companyId, provider: 'okta' }))
    });

    return `https://${domain}/oauth2/v1/authorize?${params}`;
  }

  async okta_getUserInfo(domain, accessToken) {
    const response = await fetch(
      `https://${domain}/oauth2/v1/userinfo`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération infos utilisateur Okta');
    return await response.json();
  }

  async okta_getUser(domain, accessToken, userId) {
    const response = await fetch(
      `https://${domain}/api/v1/users/${userId}`,
      {
        headers: { Authorization: `SSWS ${accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération utilisateur Okta');
    return await response.json();
  }

  // ==========================================
  // SAML 2.0
  // ==========================================

  /**
   * Générer les métadonnées SP (Service Provider) pour Synergia
   */
  generateSamlSpMetadata(companyId, baseUrl) {
    const entityId = `${baseUrl}/saml/metadata/${companyId}`;
    const acsUrl = `${baseUrl}/api/auth/saml/callback`;
    const sloUrl = `${baseUrl}/api/auth/saml/logout`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${entityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="true" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acsUrl}" index="0" isDefault="true"/>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${sloUrl}"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
  }

  /**
   * Générer une requête SAML AuthnRequest
   */
  generateSamlAuthnRequest(companyId, config, redirectUri) {
    const id = '_' + Math.random().toString(36).substr(2, 9);
    const issueInstant = new Date().toISOString();
    const entityId = `${redirectUri.split('/api')[0]}/saml/metadata/${companyId}`;

    const authnRequest = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    ID="${id}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${config.ssoUrl}"
    AssertionConsumerServiceURL="${redirectUri}">
  <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${entityId}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>`;

    // Encoder en base64 pour le binding HTTP-Redirect
    const encoded = btoa(authnRequest);
    const params = new URLSearchParams({
      SAMLRequest: encoded,
      RelayState: btoa(JSON.stringify({ companyId }))
    });

    return `${config.ssoUrl}?${params}`;
  }

  /**
   * Parser et valider une réponse SAML
   * Note: En production, utiliser une vraie lib SAML (saml2-js, passport-saml)
   */
  async parseSamlResponse(companyId, samlResponse) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'saml');
    if (!config?.enabled) throw new Error('SAML non configuré');

    try {
      // Décoder la réponse
      const decoded = atob(samlResponse);

      // Parser le XML (simplifié - en prod utiliser un vrai parser XML)
      const emailMatch = decoded.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/);
      const email = emailMatch ? emailMatch[1] : null;

      // Extraire les attributs selon le mapping configuré
      const attributeMapping = config.config?.attributeMapping
        ? JSON.parse(config.config.attributeMapping)
        : {};

      const attributes = {};
      for (const [synergiaAttr, samlAttr] of Object.entries(attributeMapping)) {
        const attrMatch = decoded.match(
          new RegExp(`<saml:Attribute[^>]*Name="${samlAttr}"[^>]*>\\s*<saml:AttributeValue[^>]*>([^<]+)</saml:AttributeValue>`)
        );
        if (attrMatch) {
          attributes[synergiaAttr] = attrMatch[1];
        }
      }

      return {
        email,
        attributes,
        valid: !!email
      };
    } catch (error) {
      console.error('Erreur parsing SAML:', error);
      throw new Error('Réponse SAML invalide');
    }
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  /**
   * Mapper les infos utilisateur SSO vers Synergia
   */
  mapSsoUserToSynergia(provider, userInfo) {
    switch (provider) {
      case 'google_workspace':
        return {
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          photoUrl: userInfo.picture,
          ssoProvider: 'google_workspace',
          ssoId: userInfo.sub
        };

      case 'azure_ad':
        return {
          email: userInfo.mail || userInfo.userPrincipalName,
          firstName: userInfo.givenName,
          lastName: userInfo.surname,
          displayName: userInfo.displayName,
          ssoProvider: 'azure_ad',
          ssoId: userInfo.id
        };

      case 'okta':
        return {
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          ssoProvider: 'okta',
          ssoId: userInfo.sub
        };

      case 'saml':
        return {
          email: userInfo.email,
          ...userInfo.attributes,
          ssoProvider: 'saml'
        };

      default:
        return null;
    }
  }

  /**
   * Vérifier si un provider SSO est configuré et actif
   */
  async getActiveSsoProvider(companyId) {
    const providers = ['google_workspace', 'azure_ad', 'okta', 'saml'];

    for (const provider of providers) {
      const config = await integrationsService.getIntegrationConfig(companyId, provider);
      if (config?.enabled) {
        return {
          provider,
          config: config.config
        };
      }
    }

    return null;
  }

  /**
   * Générer l'URL de connexion SSO appropriée
   */
  async getSsoLoginUrl(companyId, redirectUri) {
    const active = await this.getActiveSsoProvider(companyId);
    if (!active) return null;

    switch (active.provider) {
      case 'google_workspace':
        return this.generateGoogleAuthUrl(companyId, redirectUri);
      case 'azure_ad':
        return this.generateAzureAuthUrl(companyId, active.config?.tenantId, redirectUri);
      case 'okta':
        return this.generateOktaAuthUrl(companyId, active.config?.domain, redirectUri);
      case 'saml':
        return this.generateSamlAuthnRequest(companyId, active.config, redirectUri);
      default:
        return null;
    }
  }
}

export const ssoConnector = new SsoConnector();
export default ssoConnector;
