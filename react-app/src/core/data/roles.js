// ==========================================
// 📁 react-app/src/core/data/roles.js
// DÉFINITION COMPLÈTE DES RÔLES SYNERGIA
// ==========================================

/**
 * 🎭 RÔLES SYNERGIA COMPLETS
 * Basés sur les 1000+ tâches CSV et la structure de l'entreprise
 */
export const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-orange-600',
    description: 'Maintenance technique et matériel',
    difficulty: 'Facile',
    taskCount: 85,
    xpReward: 10,
    permissions: ['maintenance_access', 'repair_management', 'equipment_control'],
    categories: ['technique', 'réparation', 'entretien'],
    requiredLevel: 1
  },
  
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    textColor: 'text-yellow-600',
    description: 'Gestion de la réputation et avis clients',
    difficulty: 'Moyen',
    taskCount: 92,
    xpReward: 15,
    permissions: ['reputation_management', 'review_access', 'customer_feedback'],
    categories: ['communication', 'service client', 'marketing'],
    requiredLevel: 3
  },
  
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    description: 'Gestion inventaires et approvisionnements',
    difficulty: 'Facile',
    taskCount: 78,
    xpReward: 12,
    permissions: ['inventory_management', 'stock_access', 'supplier_relations'],
    categories: ['logistique', 'inventaire', 'approvisionnement'],
    requiredLevel: 1
  },
  
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    textColor: 'text-purple-600',
    description: 'Coordination et organisation équipes',
    difficulty: 'Avancé',
    taskCount: 110,
    xpReward: 20,
    permissions: ['organization_access', 'workflow_management', 'team_coordination'],
    categories: ['management', 'coordination', 'workflow'],
    requiredLevel: 5
  },
  
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-600',
    description: 'Création contenu visuel et communication',
    difficulty: 'Moyen',
    taskCount: 96,
    xpReward: 18,
    permissions: ['content_creation', 'design_access', 'visual_communication'],
    categories: ['créatif', 'design', 'communication'],
    requiredLevel: 2
  },
  
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-600',
    description: 'Formation et accompagnement équipes',
    difficulty: 'Avancé',
    taskCount: 88,
    xpReward: 25,
    permissions: ['mentoring_access', 'training_management', 'knowledge_sharing'],
    categories: ['formation', 'encadrement', 'développement'],
    requiredLevel: 7
  },
  
  planning: {
    id: 'planning',
    name: 'Planification & Horaires',
    icon: '📅',
    color: 'bg-gradient-to-r from-teal-500 to-blue-500',
    textColor: 'text-teal-600',
    description: 'Gestion planning et organisation temporelle',
    difficulty: 'Moyen',
    taskCount: 74,
    xpReward: 14,
    permissions: ['planning_access', 'schedule_management', 'time_coordination'],
    categories: ['planning', 'organisation', 'temps'],
    requiredLevel: 3
  },
  
  communication: {
    id: 'communication',
    name: 'Communication & Relations',
    icon: '💬',
    color: 'bg-gradient-to-r from-violet-500 to-purple-500',
    textColor: 'text-violet-600',
    description: 'Communication interne et externe',
    difficulty: 'Moyen',
    taskCount: 102,
    xpReward: 16,
    permissions: ['communication_access', 'relation_management', 'messaging'],
    categories: ['communication', 'relations', 'social'],
    requiredLevel: 2
  },
  
  quality: {
    id: 'quality',
    name: 'Contrôle Qualité & Standards',
    icon: '✅',
    color: 'bg-gradient-to-r from-emerald-500 to-green-500',
    textColor: 'text-emerald-600',
    description: 'Assurance qualité et respect standards',
    difficulty: 'Avancé',
    taskCount: 95,
    xpReward: 22,
    permissions: ['quality_control', 'standards_management', 'audit_access'],
    categories: ['qualité', 'contrôle', 'standards'],
    requiredLevel: 4
  },
  
  safety: {
    id: 'safety',
    name: 'Sécurité & Conformité',
    icon: '🛡️',
    color: 'bg-gradient-to-r from-red-500 to-orange-500',
    textColor: 'text-red-600',
    description: 'Sécurité au travail et conformité',
    difficulty: 'Expert',
    taskCount: 67,
    xpReward: 30,
    permissions: ['safety_management', 'compliance_access', 'risk_assessment'],
    categories: ['sécurité', 'conformité', 'risques'],
    requiredLevel: 6
  },

  // 🆕 RÔLES ÉTENDUS POUR COMPLETUDE
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '🤝',
    color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    textColor: 'text-indigo-600',
    description: 'Gestion relations entreprises et devis',
    difficulty: 'Expert',
    taskCount: 120,
    xpReward: 35,
    permissions: ['b2b_management', 'quote_generation', 'enterprise_relations'],
    categories: ['commercial', 'b2b', 'devis'],
    requiredLevel: 8
  },

  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-purple-600',
    description: 'Gestion système de gamification',
    difficulty: 'Expert',
    taskCount: 80,
    xpReward: 40,
    permissions: ['gamification_management', 'xp_system', 'badge_creation'],
    categories: ['gamification', 'système', 'motivation'],
    requiredLevel: 10
  }
};

/**
 * 🏆 NIVEAUX DE DIFFICULTÉ
 */
export const DIFFICULTY_LEVELS = {
  'Facile': {
    id: 'facile',
    name: 'Facile',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    requiredLevel: 1,
    xpMultiplier: 1.0,
    icon: '🟢'
  },
  'Moyen': {
    id: 'moyen',
    name: 'Moyen',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    requiredLevel: 3,
    xpMultiplier: 1.5,
    icon: '🟡'
  },
  'Avancé': {
    id: 'avance',
    name: 'Avancé',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    requiredLevel: 5,
    xpMultiplier: 2.0,
    icon: '🟠'
  },
  'Expert': {
    id: 'expert',
    name: 'Expert',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    requiredLevel: 8,
    xpMultiplier: 3.0,
    icon: '🔴'
  }
};

/**
 * 🎯 CATÉGORIES DE TÂCHES
 */
export const TASK_CATEGORIES = {
  technique: { name: 'Technique', icon: '⚙️', color: 'text-blue-500' },
  communication: { name: 'Communication', icon: '💬', color: 'text-green-500' },
  management: { name: 'Management', icon: '👥', color: 'text-purple-500' },
  créatif: { name: 'Créatif', icon: '🎨', color: 'text-pink-500' },
  commercial: { name: 'Commercial', icon: '💼', color: 'text-indigo-500' },
  logistique: { name: 'Logistique', icon: '📦', color: 'text-cyan-500' },
  formation: { name: 'Formation', icon: '🎓', color: 'text-yellow-500' },
  qualité: { name: 'Qualité', icon: '✅', color: 'text-emerald-500' },
  sécurité: { name: 'Sécurité', icon: '🛡️', color: 'text-red-500' }
};

/**
 * 🔐 PERMISSIONS PAR RÔLE
 */
export const ROLE_PERMISSIONS = {
  // Permissions globales
  global: {
    view_dashboard: 'Voir le tableau de bord',
    manage_tasks: 'Gérer les tâches',
    view_team: 'Voir l\'équipe',
    access_gamification: 'Accès gamification'
  },

  // Permissions spécialisées par rôle
  maintenance: {
    maintenance_access: 'Accès maintenance',
    repair_management: 'Gestion réparations',
    equipment_control: 'Contrôle équipement'
  },

  reputation: {
    reputation_management: 'Gestion réputation',
    review_access: 'Accès avis clients',
    customer_feedback: 'Retours clients'
  },

  stock: {
    inventory_management: 'Gestion inventaire',
    stock_access: 'Accès stocks',
    supplier_relations: 'Relations fournisseurs'
  },

  organization: {
    organization_access: 'Accès organisation',
    workflow_management: 'Gestion workflow',
    team_coordination: 'Coordination équipe'
  },

  content: {
    content_creation: 'Création contenu',
    design_access: 'Accès design',
    visual_communication: 'Communication visuelle'
  },

  mentoring: {
    mentoring_access: 'Accès mentorat',
    training_management: 'Gestion formation',
    knowledge_sharing: 'Partage connaissances'
  },

  planning: {
    planning_access: 'Accès planning',
    schedule_management: 'Gestion horaires',
    time_coordination: 'Coordination temporelle'
  },

  communication: {
    communication_access: 'Accès communication',
    relation_management: 'Gestion relations',
    messaging: 'Messagerie'
  },

  quality: {
    quality_control: 'Contrôle qualité',
    standards_management: 'Gestion standards',
    audit_access: 'Accès audit'
  },

  safety: {
    safety_management: 'Gestion sécurité',
    compliance_access: 'Accès conformité',
    risk_assessment: 'Évaluation risques'
  },

  b2b: {
    b2b_management: 'Gestion B2B',
    quote_generation: 'Génération devis',
    enterprise_relations: 'Relations entreprises'
  },

  gamification: {
    gamification_management: 'Gestion gamification',
    xp_system: 'Système XP',
    badge_creation: 'Création badges'
  }
};

/**
 * 🛠️ FONCTIONS UTILITAIRES
 */

/**
 * Obtenir un rôle par ID
 */
export const getRoleById = (roleId) => {
  return SYNERGIA_ROLES[roleId] || null;
};

/**
 * Obtenir tous les rôles par difficulté
 */
export const getRolesByDifficulty = (difficulty) => {
  return Object.values(SYNERGIA_ROLES).filter(role => role.difficulty === difficulty);
};

/**
 * Obtenir les rôles accessibles pour un niveau donné
 */
export const getAccessibleRoles = (userLevel) => {
  return Object.values(SYNERGIA_ROLES).filter(role => role.requiredLevel <= userLevel);
};

/**
 * Obtenir les permissions d'un rôle
 */
export const getRolePermissions = (roleId) => {
  const role = SYNERGIA_ROLES[roleId];
  return role ? role.permissions : [];
};

/**
 * Vérifier si un utilisateur a une permission
 */
export const hasPermission = (userRoles, permission) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  
  return userRoles.some(roleId => {
    const role = SYNERGIA_ROLES[roleId];
    return role && role.permissions.includes(permission);
  });
};

/**
 * Calculer l'XP total possible pour un rôle
 */
export const calculateMaxRoleXP = (roleId) => {
  const role = SYNERGIA_ROLES[roleId];
  if (!role) return 0;
  
  const difficultyMultiplier = DIFFICULTY_LEVELS[role.difficulty]?.xpMultiplier || 1;
  return role.taskCount * role.xpReward * difficultyMultiplier;
};

/**
 * Obtenir la couleur d'un rôle
 */
export const getRoleColor = (roleId) => {
  const role = SYNERGIA_ROLES[roleId];
  return role ? role.color : 'bg-gray-500';
};

/**
 * Obtenir l'icône d'un rôle
 */
export const getRoleIcon = (roleId) => {
  const role = SYNERGIA_ROLES[roleId];
  return role ? role.icon : '❓';
};

/**
 * Formater l'affichage d'un rôle
 */
export const formatRoleDisplay = (roleId) => {
  const role = SYNERGIA_ROLES[roleId];
  if (!role) return { name: 'Rôle inconnu', icon: '❓', color: 'bg-gray-500' };
  
  return {
    name: role.name,
    icon: role.icon,
    color: role.color,
    description: role.description,
    difficulty: role.difficulty
  };
};

// Export par défaut
export default SYNERGIA_ROLES;
