// ==========================================
// react-app/src/core/services/modulePermissionsService.js
// SERVICE DE VÉRIFICATION DES PERMISSIONS PAR MODULE
// ==========================================

/**
 * 🔐 DÉFINITION DES MODULES ET PERMISSIONS
 * Source unique de vérité pour les permissions
 */
export const PERMISSION_MODULES = {
  system_admin: {
    id: 'system_admin',
    permissions: ['system_full_access', 'system_settings', 'system_users_manage', 'system_roles_manage', 'system_permissions_manage', 'system_logs_view']
  },
  analytics: {
    id: 'analytics',
    permissions: ['analytics_view_basic', 'analytics_view_detailed', 'analytics_view_team', 'analytics_view_individual', 'analytics_export', 'analytics_admin']
  },
  planning: {
    id: 'planning',
    permissions: ['planning_view_own', 'planning_view_team', 'planning_edit_own', 'planning_edit_team', 'planning_create_events', 'planning_admin']
  },
  timetracking: {
    id: 'timetracking',
    permissions: ['time_clock_own', 'time_view_own', 'time_view_team', 'time_edit_own', 'time_edit_team', 'time_validate', 'time_admin']
  },
  hr: {
    id: 'hr',
    permissions: ['hr_view_own', 'hr_view_basic', 'hr_view_contact', 'hr_view_sensitive', 'hr_edit_profiles', 'hr_manage_contracts', 'hr_admin']
  },
  tasks: {
    id: 'tasks',
    permissions: ['tasks_view_own', 'tasks_view_team', 'tasks_create', 'tasks_assign', 'tasks_validate', 'tasks_manage_xp', 'tasks_admin']
  },
  campaigns: {
    id: 'campaigns',
    permissions: ['campaigns_view', 'campaigns_participate', 'campaigns_create', 'campaigns_edit', 'campaigns_validate', 'campaigns_admin']
  },
  rewards: {
    id: 'rewards',
    permissions: ['rewards_view', 'rewards_claim', 'rewards_create', 'rewards_edit', 'rewards_validate', 'rewards_manage_stock', 'rewards_admin']
  },
  badges: {
    id: 'badges',
    permissions: ['badges_view', 'badges_view_team', 'badges_create', 'badges_assign', 'badges_admin']
  },
  gamification: {
    id: 'gamification',
    permissions: ['xp_view_own', 'xp_view_team', 'xp_grant_manual', 'xp_remove', 'xp_configure', 'xp_admin']
  },
  boosts: {
    id: 'boosts',
    permissions: ['boosts_view', 'boosts_activate', 'boosts_create', 'boosts_admin']
  },
  teampool: {
    id: 'teampool',
    permissions: ['teampool_view', 'teampool_view_details', 'teampool_contribute', 'teampool_purchase', 'teampool_configure', 'teampool_admin']
  },
  mentoring: {
    id: 'mentoring',
    permissions: ['mentoring_view', 'mentoring_be_mentee', 'mentoring_be_mentor', 'mentoring_create_content', 'mentoring_admin']
  },
  pulse: {
    id: 'pulse',
    permissions: ['pulse_view', 'pulse_participate', 'pulse_view_results', 'pulse_create', 'pulse_admin']
  },
  communication: {
    id: 'communication',
    permissions: ['infos_view', 'infos_create', 'ideas_submit', 'ideas_vote', 'ideas_manage', 'communication_admin']
  },
  customization: {
    id: 'customization',
    permissions: ['custom_own', 'custom_unlock_items', 'custom_create_items', 'custom_admin']
  },
  onboarding: {
    id: 'onboarding',
    permissions: ['onboarding_view', 'onboarding_view_team', 'onboarding_edit', 'onboarding_admin']
  },
  projects: {
    id: 'projects',
    permissions: ['projects_view', 'projects_participate', 'projects_create', 'projects_manage', 'projects_admin']
  },
  notifications: {
    id: 'notifications',
    permissions: ['notif_receive', 'notif_send_team', 'notif_send_all', 'notif_admin']
  }
};

/**
 * 🔐 SERVICE DE PERMISSIONS PAR MODULE
 */
class ModulePermissionsService {
  constructor() {
    this.adminEmail = 'alan.boehme61@gmail.com';
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param {Object} user - L'objet utilisateur
   * @param {string} moduleId - L'ID du module
   * @param {string} permissionId - L'ID de la permission
   * @returns {boolean}
   */
  hasPermission(user, moduleId, permissionId) {
    if (!user) return false;

    // L'admin principal a toutes les permissions
    if (user.email === this.adminEmail) return true;

    // Vérifier si l'utilisateur a le flag isAdmin ou role admin
    if (user.isAdmin === true || user.role === 'admin') {
      // Les admins ont accès à tout
      return true;
    }

    // Vérifier les permissions du module
    const userModulePerms = user.modulePermissions?.[moduleId] || [];

    // Si l'utilisateur a la permission système complète
    const systemPerms = user.modulePermissions?.['system_admin'] || [];
    if (systemPerms.includes('system_full_access')) {
      return true;
    }

    return userModulePerms.includes(permissionId);
  }

  /**
   * Vérifie si l'utilisateur a accès à un module (au moins une permission)
   * @param {Object} user - L'objet utilisateur
   * @param {string} moduleId - L'ID du module
   * @returns {boolean}
   */
  hasModuleAccess(user, moduleId) {
    if (!user) return false;

    // L'admin principal a accès à tout
    if (user.email === this.adminEmail) return true;

    // Les admins ont accès à tout
    if (user.isAdmin === true || user.role === 'admin') return true;

    // Vérifier si l'utilisateur a au moins une permission dans ce module
    const userModulePerms = user.modulePermissions?.[moduleId] || [];
    return userModulePerms.length > 0;
  }

  /**
   * Vérifie si l'utilisateur a des droits admin sur un module
   * @param {Object} user - L'objet utilisateur
   * @param {string} moduleId - L'ID du module
   * @returns {boolean}
   */
  hasModuleAdmin(user, moduleId) {
    if (!user) return false;

    // L'admin principal a tous les droits admin
    if (user.email === this.adminEmail) return true;

    // Les admins système ont tous les droits
    if (user.isAdmin === true || user.role === 'admin') return true;

    // Vérifier la permission admin du module
    const userModulePerms = user.modulePermissions?.[moduleId] || [];
    const adminPermId = `${moduleId.replace('_admin', '')}_admin`;

    return userModulePerms.includes(adminPermId) ||
           userModulePerms.includes(`${moduleId}_admin`) ||
           userModulePerms.some(p => p.endsWith('_admin'));
  }

  /**
   * Vérifie si l'utilisateur peut voir les infos sensibles RH
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canViewSensitiveHR(user) {
    return this.hasPermission(user, 'hr', 'hr_view_sensitive') ||
           this.hasPermission(user, 'hr', 'hr_admin');
  }

  /**
   * Vérifie si l'utilisateur peut modifier les plannings de l'équipe
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canEditTeamPlanning(user) {
    return this.hasPermission(user, 'planning', 'planning_edit_team') ||
           this.hasPermission(user, 'planning', 'planning_admin');
  }

  /**
   * Vérifie si l'utilisateur peut valider les quêtes
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canValidateTasks(user) {
    return this.hasPermission(user, 'tasks', 'tasks_validate') ||
           this.hasPermission(user, 'tasks', 'tasks_admin');
  }

  /**
   * Vérifie si l'utilisateur peut gérer les récompenses
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canManageRewards(user) {
    return this.hasPermission(user, 'rewards', 'rewards_validate') ||
           this.hasPermission(user, 'rewards', 'rewards_admin');
  }

  /**
   * Vérifie si l'utilisateur peut attribuer de l'XP
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canGrantXP(user) {
    return this.hasPermission(user, 'gamification', 'xp_grant_manual') ||
           this.hasPermission(user, 'gamification', 'xp_admin');
  }

  /**
   * Vérifie si l'utilisateur peut créer des sondages
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canCreatePulse(user) {
    return this.hasPermission(user, 'pulse', 'pulse_create') ||
           this.hasPermission(user, 'pulse', 'pulse_admin');
  }

  /**
   * Vérifie si l'utilisateur peut gérer les idées
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canManageIdeas(user) {
    return this.hasPermission(user, 'communication', 'ideas_manage') ||
           this.hasPermission(user, 'communication', 'communication_admin');
  }

  /**
   * Vérifie si l'utilisateur peut envoyer des notifications à tous
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canSendGlobalNotifications(user) {
    return this.hasPermission(user, 'notifications', 'notif_send_all') ||
           this.hasPermission(user, 'notifications', 'notif_admin');
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux paramètres système
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canAccessSystemSettings(user) {
    return this.hasPermission(user, 'system_admin', 'system_settings') ||
           this.hasPermission(user, 'system_admin', 'system_full_access');
  }

  /**
   * Vérifie si l'utilisateur peut gérer les utilisateurs
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canManageUsers(user) {
    return this.hasPermission(user, 'system_admin', 'system_users_manage') ||
           this.hasPermission(user, 'system_admin', 'system_full_access');
  }

  /**
   * Vérifie si l'utilisateur peut être parrain
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canBeMentor(user) {
    return this.hasPermission(user, 'mentoring', 'mentoring_be_mentor') ||
           this.hasPermission(user, 'mentoring', 'mentoring_admin');
  }

  /**
   * Vérifie si l'utilisateur a accès aux analytics détaillées
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canViewDetailedAnalytics(user) {
    return this.hasPermission(user, 'analytics', 'analytics_view_detailed') ||
           this.hasPermission(user, 'analytics', 'analytics_admin');
  }

  /**
   * Vérifie si l'utilisateur peut exporter des données
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  canExportData(user) {
    return this.hasPermission(user, 'analytics', 'analytics_export') ||
           this.hasPermission(user, 'analytics', 'analytics_admin');
  }

  /**
   * Vérifie si l'utilisateur a accès au menu admin
   * @param {Object} user - L'objet utilisateur
   * @returns {boolean}
   */
  hasAdminMenuAccess(user) {
    if (!user) return false;

    // Admin par email
    if (user.email === this.adminEmail) return true;

    // Admin par flag ou role
    if (user.isAdmin === true || user.role === 'admin') return true;

    // Vérifier si l'utilisateur a au moins une permission admin
    const modulePerms = user.modulePermissions || {};

    for (const [moduleId, perms] of Object.entries(modulePerms)) {
      if (perms.some(p => p.endsWith('_admin') || p.includes('_manage') || p === 'system_full_access')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtient toutes les permissions d'un utilisateur
   * @param {Object} user - L'objet utilisateur
   * @returns {Object} - Object avec moduleId: [permissionIds]
   */
  getAllUserPermissions(user) {
    if (!user) return {};

    // Admin a toutes les permissions
    if (user.email === this.adminEmail || user.isAdmin === true || user.role === 'admin') {
      const allPerms = {};
      Object.entries(PERMISSION_MODULES).forEach(([moduleId, module]) => {
        allPerms[moduleId] = [...module.permissions];
      });
      return allPerms;
    }

    return user.modulePermissions || {};
  }

  /**
   * Compte le nombre total de permissions d'un utilisateur
   * @param {Object} user - L'objet utilisateur
   * @returns {number}
   */
  countUserPermissions(user) {
    const perms = this.getAllUserPermissions(user);
    return Object.values(perms).flat().length;
  }
}

// Instance singleton
export const modulePermissionsService = new ModulePermissionsService();

// Exports individuels pour faciliter l'utilisation
export const hasPermission = (user, moduleId, permissionId) =>
  modulePermissionsService.hasPermission(user, moduleId, permissionId);

export const hasModuleAccess = (user, moduleId) =>
  modulePermissionsService.hasModuleAccess(user, moduleId);

export const hasModuleAdmin = (user, moduleId) =>
  modulePermissionsService.hasModuleAdmin(user, moduleId);

export const hasAdminMenuAccess = (user) =>
  modulePermissionsService.hasAdminMenuAccess(user);

export const canViewSensitiveHR = (user) =>
  modulePermissionsService.canViewSensitiveHR(user);

export const canEditTeamPlanning = (user) =>
  modulePermissionsService.canEditTeamPlanning(user);

export const canValidateTasks = (user) =>
  modulePermissionsService.canValidateTasks(user);

export const canManageRewards = (user) =>
  modulePermissionsService.canManageRewards(user);

export const canGrantXP = (user) =>
  modulePermissionsService.canGrantXP(user);

export const canCreatePulse = (user) =>
  modulePermissionsService.canCreatePulse(user);

export const canManageIdeas = (user) =>
  modulePermissionsService.canManageIdeas(user);

export const canManageUsers = (user) =>
  modulePermissionsService.canManageUsers(user);

export const canBeMentor = (user) =>
  modulePermissionsService.canBeMentor(user);

export const canExportData = (user) =>
  modulePermissionsService.canExportData(user);

export default modulePermissionsService;
