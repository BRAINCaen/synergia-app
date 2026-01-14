// ==========================================
// 📁 react-app/src/hooks/index.js
// INDEX DES HOOKS - VERSION CORRIGÉE SANS DUPLICATION
// ==========================================

// Export direct des hooks sans re-déclaration
export {
  useTeam,
  useRoles,
  useTeamStats,
  useTeamSearch,
  useRoleStats,
  useRoleHistory,
  useMember,
  useTeamCleanup
} from './useTeam.js';

// Hooks HR
export { default as useLeaves } from './useLeaves.js';
export { default as useTimesheet } from './useTimesheet.js';
