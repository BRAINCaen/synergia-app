// ==========================================
// INDEX DES SERVICES D'INTÉGRATION
// Point d'entrée unique pour toutes les intégrations
// ==========================================

// Service central
export {
  integrationsService,
  INTEGRATION_CATEGORIES,
  INTEGRATIONS_CONFIG
} from './integrationsService.js';

// Connecteurs par catégorie
export { calendarConnector } from './calendarConnector.js';
export { communicationConnector } from './communicationConnector.js';
export { sirhConnector } from './sirhConnector.js';
export { ssoConnector } from './ssoConnector.js';
export { storageConnector } from './storageConnector.js';

// Export par défaut du service principal
export { default } from './integrationsService.js';
