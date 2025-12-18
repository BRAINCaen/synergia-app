// ==========================================
// react-app/src/core/services/skillService.js
// SERVICE ARBRE DE COMPÉTENCES - SYNERGIA v2.0
// Système RPG avec choix de talents par tier
// ==========================================

import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🌳 CONFIGURATION DES TIERS
 */
export const TIER_CONFIG = {
  1: { xpRequired: 100, choices: 3, name: 'Tier 1' },
  2: { xpRequired: 400, choices: 2, name: 'Tier 2' },
  3: { xpRequired: 1000, choices: 1, name: 'Tier 3 (Ultime)' }
};

/**
 * 🎯 7 BRANCHES DE COMPÉTENCES
 */
export const SKILL_BRANCHES = {
  relationnel: {
    id: 'relationnel',
    name: 'Relationnel',
    emoji: '🤝',
    icon: '🤝',
    gradient: 'from-pink-500/20 to-rose-600/20',
    color: 'from-pink-500 to-rose-600',
    textColor: 'text-pink-400',
    description: 'Accueil, service client, gestion des relations',
    roles: ['Game Master', 'Gestion des Avis', 'Relations B2B'],
    skills: ['accueil_client', 'gestion_conflits', 'satisfaction_client', 'fidelisation']
  },
  technique: {
    id: 'technique',
    name: 'Technique',
    emoji: '🔧',
    icon: '🔧',
    gradient: 'from-blue-500/20 to-cyan-600/20',
    color: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-400',
    description: 'Maintenance, bricolage, résolution de pannes',
    roles: ['Entretien & Maintenance'],
    skills: ['maintenance_preventive', 'reparation_urgente', 'bricolage', 'electronique']
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    emoji: '📱',
    icon: '📱',
    gradient: 'from-purple-500/20 to-violet-600/20',
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    description: 'Réseaux sociaux, rédaction, visibilité',
    roles: ['Création de Contenu', 'Communication & Réseaux Sociaux'],
    skills: ['reseaux_sociaux', 'redaction', 'photo_video', 'strategie_com']
  },
  organisation: {
    id: 'organisation',
    name: 'Organisation',
    emoji: '📋',
    icon: '📋',
    gradient: 'from-green-500/20 to-emerald-600/20',
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-400',
    description: 'Plannings, stocks, rigueur administrative',
    roles: ['Organisation Interne', 'Gestion des Stocks'],
    skills: ['gestion_planning', 'gestion_stocks', 'procedures', 'reporting']
  },
  creativite: {
    id: 'creativite',
    name: 'Créativité',
    emoji: '🎨',
    icon: '🎨',
    gradient: 'from-orange-500/20 to-amber-600/20',
    color: 'from-orange-500 to-amber-600',
    textColor: 'text-orange-400',
    description: 'Design, improvisation, innovation',
    roles: ['Création de Contenu', 'Game Master'],
    skills: ['game_design', 'improvisation', 'decoration', 'innovation']
  },
  pedagogie: {
    id: 'pedagogie',
    name: 'Pédagogie',
    emoji: '👩‍🏫',
    icon: '👩‍🏫',
    gradient: 'from-teal-500/20 to-cyan-600/20',
    color: 'from-teal-500 to-cyan-600',
    textColor: 'text-teal-400',
    description: 'Formation, mentorat, transmission',
    roles: ['Mentorat & Formation'],
    skills: ['formation_nouveaux', 'mentorat', 'documentation', 'evaluation']
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial',
    emoji: '💼',
    icon: '💼',
    gradient: 'from-yellow-500/20 to-orange-600/20',
    color: 'from-yellow-500 to-orange-600',
    textColor: 'text-yellow-400',
    description: 'Partenariats, négociation, B2B',
    roles: ['Partenariats & Référencement', 'Relations B2B'],
    skills: ['prospection', 'negociation', 'partenariats', 'upselling']
  }
};

/**
 * 🎯 28 SKILLS (4 par branche) avec leurs 3 tiers de talents
 */
export const SKILLS = {
  // ============================================
  // 🤝 BRANCHE RELATIONNEL
  // ============================================
  accueil_client: {
    id: 'accueil_client',
    name: 'Accueil Client',
    icon: '🎯',
    branch: 'relationnel',
    description: 'Brief/débrief, satisfaction client, première impression',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Efficacité', description: '+8% XP sur quêtes accueil', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Rapidité', description: '-15% temps estimé accueil', bonus: { type: 'time_reduction', value: 15 } },
          { id: 'c', name: 'Polyvalence', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Hôte d\'élite', description: 'Badge "Hôte d\'élite" + Titre', bonus: { type: 'badge', value: 'hote_elite' } },
          { id: 'b', name: 'Prioritaire', description: 'Priorité sur les quêtes accueil', bonus: { type: 'priority', value: 'accueil' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Ambassadeur', description: '+20% XP toute branche Relationnel', bonus: { type: 'xp_branch', value: 20, branch: 'relationnel' }, isUltimate: true }
        ]
      }
    }
  },
  gestion_crise: {
    id: 'gestion_crise',
    name: 'Gestion de Crise',
    icon: '🆘',
    branch: 'relationnel',
    description: 'Panique, mécontentement, situations difficiles',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Sang-froid', description: '+8% XP sur quêtes crise', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Réactivité', description: 'Notification prioritaire crises', bonus: { type: 'notification', value: 'crisis' } },
          { id: 'c', name: 'Empathie', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Médiateur', description: 'Badge "Médiateur" + Titre', bonus: { type: 'badge', value: 'mediateur' } },
          { id: 'b', name: 'Expert conflits', description: '+5% XP branche Relationnel', bonus: { type: 'xp_branch', value: 5, branch: 'relationnel' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Pacificateur', description: 'Peut résoudre les conflits équipe + Badge ultime', bonus: { type: 'ability', value: 'resolve_conflicts' }, isUltimate: true }
        ]
      }
    }
  },
  diplomatie: {
    id: 'diplomatie',
    name: 'Diplomatie',
    icon: '🕊️',
    branch: 'relationnel',
    description: 'Réponses aux avis, médiation, communication positive',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Éloquence', description: '+8% XP sur quêtes avis', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Tact', description: 'Templates réponses avis', bonus: { type: 'tool', value: 'templates_avis' } },
          { id: 'c', name: 'Patience', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Négociateur', description: 'Badge "Négociateur"', bonus: { type: 'badge', value: 'negociateur' } },
          { id: 'b', name: 'Influenceur', description: 'Réponses mises en avant', bonus: { type: 'visibility', value: 'responses' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Voix de l\'équipe', description: 'Peut gérer les avis critiques + Badge ultime', bonus: { type: 'ability', value: 'critical_reviews' }, isUltimate: true }
        ]
      }
    }
  },
  fidelisation: {
    id: 'fidelisation',
    name: 'Fidélisation',
    icon: '💝',
    branch: 'relationnel',
    description: 'Suivi clients, relation durable, satisfaction long terme',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Mémoire', description: '+8% XP sur quêtes fidélisation', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Attention', description: 'Rappels clients réguliers', bonus: { type: 'tool', value: 'client_reminders' } },
          { id: 'c', name: 'Dévouement', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'VIP Manager', description: 'Badge "VIP Manager"', bonus: { type: 'badge', value: 'vip_manager' } },
          { id: 'b', name: 'Fidélisateur', description: '+5% XP branche Relationnel', bonus: { type: 'xp_branch', value: 5, branch: 'relationnel' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Gardien des clients', description: 'Accès stats fidélisation + Badge ultime', bonus: { type: 'ability', value: 'loyalty_stats' }, isUltimate: true }
        ]
      }
    }
  },

  // ============================================
  // 🔧 BRANCHE TECHNIQUE
  // ============================================
  maintenance: {
    id: 'maintenance',
    name: 'Maintenance',
    icon: '🔩',
    branch: 'technique',
    description: 'Serrures, câbles, mécanismes, réparations',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Efficacité', description: '+8% XP sur quêtes maintenance', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Rapidité', description: '-15% temps estimé maintenance', bonus: { type: 'time_reduction', value: 15 } },
          { id: 'c', name: 'Polyvalence', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Technicien', description: 'Badge "Technicien" + Titre', bonus: { type: 'badge', value: 'technicien' } },
          { id: 'b', name: 'Mentor Tech', description: 'Peut former sur maintenance', bonus: { type: 'mentor', value: 'maintenance' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître Technicien', description: '+20% XP toute branche Technique', bonus: { type: 'xp_branch', value: 20, branch: 'technique' }, isUltimate: true }
        ]
      }
    }
  },
  diagnostic: {
    id: 'diagnostic',
    name: 'Diagnostic',
    icon: '🔍',
    branch: 'technique',
    description: 'Identifier pannes, anticipation, analyse',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Perspicacité', description: '+8% XP sur quêtes diagnostic', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Intuition', description: 'Alertes préventives', bonus: { type: 'tool', value: 'preventive_alerts' } },
          { id: 'c', name: 'Analyse', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Détective', description: 'Badge "Détective technique"', bonus: { type: 'badge', value: 'detective_tech' } },
          { id: 'b', name: 'Préventif', description: '+5% XP branche Technique', bonus: { type: 'xp_branch', value: 5, branch: 'technique' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Oracle technique', description: 'Rapport état salles + Badge ultime', bonus: { type: 'ability', value: 'room_report' }, isUltimate: true }
        ]
      }
    }
  },
  bricolage: {
    id: 'bricolage',
    name: 'Bricolage',
    icon: '🛠️',
    branch: 'technique',
    description: 'Réparations, retouches, décoration',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Dextérité', description: '+8% XP sur quêtes bricolage', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Ingéniosité', description: 'Accès tutoriels bricolage', bonus: { type: 'tool', value: 'diy_tutorials' } },
          { id: 'c', name: 'Créativité', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Artisan', description: 'Badge "Artisan"', bonus: { type: 'badge', value: 'artisan' } },
          { id: 'b', name: 'MacGyver', description: 'Peut improviser réparations', bonus: { type: 'ability', value: 'improvise_repair' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître Artisan', description: 'Peut créer nouvelles décos + Badge ultime', bonus: { type: 'ability', value: 'create_decor' }, isUltimate: true }
        ]
      }
    }
  },
  securite: {
    id: 'securite',
    name: 'Sécurité',
    icon: '🛡️',
    branch: 'technique',
    description: 'Vérifications, protocoles, prévention',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Vigilance', description: '+8% XP sur quêtes sécurité', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Rigueur', description: 'Checklists sécurité', bonus: { type: 'tool', value: 'security_checklists' } },
          { id: 'c', name: 'Prévention', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Gardien', description: 'Badge "Gardien"', bonus: { type: 'badge', value: 'gardien' } },
          { id: 'b', name: 'Sentinelle', description: 'Alertes incidents prioritaires', bonus: { type: 'notification', value: 'incidents' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Protecteur', description: 'Responsable sécurité + Badge ultime', bonus: { type: 'ability', value: 'security_lead' }, isUltimate: true }
        ]
      }
    }
  },

  // ============================================
  // 📱 BRANCHE COMMUNICATION
  // ============================================
  redaction: {
    id: 'redaction',
    name: 'Rédaction',
    icon: '✍️',
    branch: 'communication',
    description: 'Posts, réponses, contenus écrits',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Plume', description: '+8% XP sur quêtes rédaction', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Inspiration', description: 'Accès banque de textes', bonus: { type: 'tool', value: 'text_bank' } },
          { id: 'c', name: 'Clarté', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Écrivain', description: 'Badge "Écrivain"', bonus: { type: 'badge', value: 'ecrivain' } },
          { id: 'b', name: 'Storyteller', description: '+5% XP branche Communication', bonus: { type: 'xp_branch', value: 5, branch: 'communication' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Plume d\'or', description: 'Peut rédiger communications officielles + Badge ultime', bonus: { type: 'ability', value: 'official_comms' }, isUltimate: true }
        ]
      }
    }
  },
  reseaux_sociaux: {
    id: 'reseaux_sociaux',
    name: 'Réseaux Sociaux',
    icon: '📲',
    branch: 'communication',
    description: 'Animation, tendances, engagement',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Viral', description: '+8% XP sur quêtes réseaux', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Tendance', description: 'Veille tendances automatique', bonus: { type: 'tool', value: 'trend_watch' } },
          { id: 'c', name: 'Engagement', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Influenceur', description: 'Badge "Influenceur"', bonus: { type: 'badge', value: 'influenceur' } },
          { id: 'b', name: 'Analytics', description: 'Accès statistiques réseaux', bonus: { type: 'tool', value: 'social_analytics' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Community Manager', description: '+20% XP toute branche Communication', bonus: { type: 'xp_branch', value: 20, branch: 'communication' }, isUltimate: true }
        ]
      }
    }
  },
  veille: {
    id: 'veille',
    name: 'Veille',
    icon: '👁️',
    branch: 'communication',
    description: 'Commentaires, messages, e-réputation',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Observateur', description: '+8% XP sur quêtes veille', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Réactif', description: 'Alertes mentions', bonus: { type: 'notification', value: 'mentions' } },
          { id: 'c', name: 'Curieux', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Vigie', description: 'Badge "Vigie"', bonus: { type: 'badge', value: 'vigie' } },
          { id: 'b', name: 'Sentinelle', description: '+5% XP branche Communication', bonus: { type: 'xp_branch', value: 5, branch: 'communication' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Gardien de l\'image', description: 'Rapport e-réputation + Badge ultime', bonus: { type: 'ability', value: 'reputation_report' }, isUltimate: true }
        ]
      }
    }
  },
  storytelling: {
    id: 'storytelling',
    name: 'Storytelling',
    icon: '📖',
    branch: 'communication',
    description: 'Mise en valeur expériences, narration',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Narrateur', description: '+8% XP sur quêtes storytelling', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Captivant', description: 'Templates stories', bonus: { type: 'tool', value: 'story_templates' } },
          { id: 'c', name: 'Imaginatif', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Conteur', description: 'Badge "Conteur"', bonus: { type: 'badge', value: 'conteur' } },
          { id: 'b', name: 'Immersif', description: 'Peut créer campagnes stories', bonus: { type: 'ability', value: 'create_campaigns' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître Conteur', description: 'Direction éditoriale + Badge ultime', bonus: { type: 'ability', value: 'editorial_lead' }, isUltimate: true }
        ]
      }
    }
  },

  // ============================================
  // 📋 BRANCHE ORGANISATION
  // ============================================
  planning: {
    id: 'planning',
    name: 'Planning',
    icon: '📅',
    branch: 'organisation',
    description: 'Gestion horaires, anticipation, coordination',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Planificateur', description: '+8% XP sur quêtes planning', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Anticipation', description: 'Vue planning étendue', bonus: { type: 'tool', value: 'extended_planning' } },
          { id: 'c', name: 'Flexibilité', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Organisateur', description: 'Badge "Organisateur"', bonus: { type: 'badge', value: 'organisateur' } },
          { id: 'b', name: 'Coordinateur', description: 'Peut proposer modifications planning', bonus: { type: 'ability', value: 'suggest_planning' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître du Temps', description: '+20% XP toute branche Organisation', bonus: { type: 'xp_branch', value: 20, branch: 'organisation' }, isUltimate: true }
        ]
      }
    }
  },
  gestion_stocks: {
    id: 'gestion_stocks',
    name: 'Gestion Stocks',
    icon: '📦',
    branch: 'organisation',
    description: 'Inventaire, commandes, approvisionnement',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Inventoriste', description: '+8% XP sur quêtes stocks', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Prévoyant', description: 'Alertes stock bas', bonus: { type: 'notification', value: 'low_stock' } },
          { id: 'c', name: 'Méthodique', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Magasinier', description: 'Badge "Magasinier"', bonus: { type: 'badge', value: 'magasinier' } },
          { id: 'b', name: 'Acheteur', description: 'Peut passer commandes', bonus: { type: 'ability', value: 'place_orders' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Gestionnaire', description: 'Responsable stocks + Badge ultime', bonus: { type: 'ability', value: 'stock_lead' }, isUltimate: true }
        ]
      }
    }
  },
  rigueur_admin: {
    id: 'rigueur_admin',
    name: 'Rigueur Administrative',
    icon: '📝',
    branch: 'organisation',
    description: 'Pointages, suivis, documentation',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Précision', description: '+8% XP sur quêtes admin', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Documentation', description: 'Templates documents', bonus: { type: 'tool', value: 'doc_templates' } },
          { id: 'c', name: 'Assiduité', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Administrateur', description: 'Badge "Administrateur"', bonus: { type: 'badge', value: 'administrateur' } },
          { id: 'b', name: 'Archiviste', description: '+5% XP branche Organisation', bonus: { type: 'xp_branch', value: 5, branch: 'organisation' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Secrétaire Général', description: 'Accès rapports complets + Badge ultime', bonus: { type: 'ability', value: 'full_reports' }, isUltimate: true }
        ]
      }
    }
  },
  coordination: {
    id: 'coordination',
    name: 'Coordination',
    icon: '🔗',
    branch: 'organisation',
    description: 'Communication équipe, synchronisation',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Connecteur', description: '+8% XP sur quêtes coordination', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Facilitateur', description: 'Accès chat prioritaire', bonus: { type: 'tool', value: 'priority_chat' } },
          { id: 'c', name: 'Communicant', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Chef d\'orchestre', description: 'Badge "Chef d\'orchestre"', bonus: { type: 'badge', value: 'chef_orchestre' } },
          { id: 'b', name: 'Pivot', description: 'Notifications équipe', bonus: { type: 'ability', value: 'team_notify' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Synchronisateur', description: 'Peut organiser réunions + Badge ultime', bonus: { type: 'ability', value: 'organize_meetings' }, isUltimate: true }
        ]
      }
    }
  },

  // ============================================
  // 🎨 BRANCHE CRÉATIVITÉ
  // ============================================
  design_graphique: {
    id: 'design_graphique',
    name: 'Design Graphique',
    icon: '🖼️',
    branch: 'creativite',
    description: 'Affiches, visuels, identité visuelle',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Visuel', description: '+8% XP sur quêtes design', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Templates', description: 'Accès templates graphiques', bonus: { type: 'tool', value: 'graphic_templates' } },
          { id: 'c', name: 'Esthète', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Designer', description: 'Badge "Designer"', bonus: { type: 'badge', value: 'designer' } },
          { id: 'b', name: 'Créatif', description: '+5% XP branche Créativité', bonus: { type: 'xp_branch', value: 5, branch: 'creativite' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Directeur Artistique', description: '+20% XP toute branche Créativité', bonus: { type: 'xp_branch', value: 20, branch: 'creativite' }, isUltimate: true }
        ]
      }
    }
  },
  improvisation: {
    id: 'improvisation',
    name: 'Improvisation',
    icon: '🎭',
    branch: 'creativite',
    description: 'Acting, animation live, adaptation',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Spontané', description: '+8% XP sur quêtes impro', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Réactif', description: 'Fiches personnages', bonus: { type: 'tool', value: 'character_sheets' } },
          { id: 'c', name: 'Caméléon', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Comédien', description: 'Badge "Comédien"', bonus: { type: 'badge', value: 'comedien' } },
          { id: 'b', name: 'Showman', description: 'Peut animer événements spéciaux', bonus: { type: 'ability', value: 'special_events' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Artiste', description: 'Créer nouveaux rôles + Badge ultime', bonus: { type: 'ability', value: 'create_roles' }, isUltimate: true }
        ]
      }
    }
  },
  innovation: {
    id: 'innovation',
    name: 'Innovation',
    icon: '💡',
    branch: 'creativite',
    description: 'Nouvelles idées, amélioration continue',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Inventif', description: '+8% XP sur quêtes innovation', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Visionnaire', description: 'Boîte à idées prioritaire', bonus: { type: 'tool', value: 'idea_box' } },
          { id: 'c', name: 'Curieux', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Innovateur', description: 'Badge "Innovateur"', bonus: { type: 'badge', value: 'innovateur' } },
          { id: 'b', name: 'Pionnier', description: 'Peut proposer améliorations', bonus: { type: 'ability', value: 'suggest_improvements' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Génie créatif', description: 'Lead projets innovation + Badge ultime', bonus: { type: 'ability', value: 'innovation_lead' }, isUltimate: true }
        ]
      }
    }
  },
  ambiance: {
    id: 'ambiance',
    name: 'Ambiance',
    icon: '✨',
    branch: 'creativite',
    description: 'Décoration, mise en scène, atmosphère',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Décorateur', description: '+8% XP sur quêtes ambiance', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Atmosphère', description: 'Accès catalogue déco', bonus: { type: 'tool', value: 'decor_catalog' } },
          { id: 'c', name: 'Sensible', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Scénographe', description: 'Badge "Scénographe"', bonus: { type: 'badge', value: 'scenographe' } },
          { id: 'b', name: 'Immersif', description: '+5% XP branche Créativité', bonus: { type: 'xp_branch', value: 5, branch: 'creativite' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître de l\'immersion', description: 'Conception nouvelles salles + Badge ultime', bonus: { type: 'ability', value: 'room_design' }, isUltimate: true }
        ]
      }
    }
  },

  // ============================================
  // 👩‍🏫 BRANCHE PÉDAGOGIE
  // ============================================
  formation: {
    id: 'formation',
    name: 'Formation',
    icon: '🎓',
    branch: 'pedagogie',
    description: 'Animation sessions, transmission savoir',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Pédagogue', description: '+8% XP sur quêtes formation', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Structuré', description: 'Accès supports formation', bonus: { type: 'tool', value: 'training_materials' } },
          { id: 'c', name: 'Patient', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Formateur', description: 'Badge "Formateur"', bonus: { type: 'badge', value: 'formateur' } },
          { id: 'b', name: 'Coach', description: 'Peut créer formations', bonus: { type: 'ability', value: 'create_training' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître Formateur', description: '+20% XP toute branche Pédagogie', bonus: { type: 'xp_branch', value: 20, branch: 'pedagogie' }, isUltimate: true }
        ]
      }
    }
  },
  mentorat: {
    id: 'mentorat',
    name: 'Mentorat',
    icon: '🤲',
    branch: 'pedagogie',
    description: 'Accompagnement nouveaux, suivi personnalisé',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Guide', description: '+8% XP sur quêtes mentorat', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Accueillant', description: 'Fiches intégration', bonus: { type: 'tool', value: 'onboarding_sheets' } },
          { id: 'c', name: 'Bienveillant', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Mentor', description: 'Badge "Mentor"', bonus: { type: 'badge', value: 'mentor' } },
          { id: 'b', name: 'Parrain', description: '+5% XP branche Pédagogie', bonus: { type: 'xp_branch', value: 5, branch: 'pedagogie' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Grand Mentor', description: 'Responsable intégration + Badge ultime', bonus: { type: 'ability', value: 'onboarding_lead' }, isUltimate: true }
        ]
      }
    }
  },
  documentation: {
    id: 'documentation',
    name: 'Documentation',
    icon: '📚',
    branch: 'pedagogie',
    description: 'Guides, checklists, fiches pratiques',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Rédacteur', description: '+8% XP sur quêtes documentation', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Méthodique', description: 'Accès base de connaissances', bonus: { type: 'tool', value: 'knowledge_base' } },
          { id: 'c', name: 'Clair', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Documentaliste', description: 'Badge "Documentaliste"', bonus: { type: 'badge', value: 'documentaliste' } },
          { id: 'b', name: 'Archiviste', description: 'Peut éditer la base de connaissances', bonus: { type: 'ability', value: 'edit_knowledge' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Gardien du Savoir', description: 'Responsable documentation + Badge ultime', bonus: { type: 'ability', value: 'doc_lead' }, isUltimate: true }
        ]
      }
    }
  },
  feedback: {
    id: 'feedback',
    name: 'Feedback',
    icon: '💬',
    branch: 'pedagogie',
    description: 'Écoute, conseils constructifs, amélioration',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Écoutant', description: '+8% XP sur quêtes feedback', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Constructif', description: 'Templates feedback', bonus: { type: 'tool', value: 'feedback_templates' } },
          { id: 'c', name: 'Empathique', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Conseiller', description: 'Badge "Conseiller"', bonus: { type: 'badge', value: 'conseiller' } },
          { id: 'b', name: 'Coach', description: '+5% XP branche Pédagogie', bonus: { type: 'xp_branch', value: 5, branch: 'pedagogie' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Sage', description: 'Peut donner feedback officiel + Badge ultime', bonus: { type: 'ability', value: 'official_feedback' }, isUltimate: true }
        ]
      }
    }
  },

  // ============================================
  // 💼 BRANCHE COMMERCIAL
  // ============================================
  negociation: {
    id: 'negociation',
    name: 'Négociation',
    icon: '🤝',
    branch: 'commercial',
    description: 'Devis, offres, argumentation',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Persuasif', description: '+8% XP sur quêtes négociation', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Argumentaire', description: 'Accès argumentaires', bonus: { type: 'tool', value: 'sales_arguments' } },
          { id: 'c', name: 'Confiant', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Négociateur', description: 'Badge "Négociateur"', bonus: { type: 'badge', value: 'negociateur_com' } },
          { id: 'b', name: 'Closer', description: 'Peut finaliser devis', bonus: { type: 'ability', value: 'finalize_quotes' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître Négociateur', description: '+20% XP toute branche Commercial', bonus: { type: 'xp_branch', value: 20, branch: 'commercial' }, isUltimate: true }
        ]
      }
    }
  },
  partenariats: {
    id: 'partenariats',
    name: 'Partenariats',
    icon: '🔗',
    branch: 'commercial',
    description: 'Relations locales, collaborations',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Connecteur', description: '+8% XP sur quêtes partenariats', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Réseau', description: 'Accès annuaire partenaires', bonus: { type: 'tool', value: 'partner_directory' } },
          { id: 'c', name: 'Relationnel', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Ambassadeur', description: 'Badge "Ambassadeur"', bonus: { type: 'badge', value: 'ambassadeur' } },
          { id: 'b', name: 'Networker', description: 'Peut proposer partenariats', bonus: { type: 'ability', value: 'propose_partnerships' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Directeur Partenariats', description: 'Responsable partenariats + Badge ultime', bonus: { type: 'ability', value: 'partnership_lead' }, isUltimate: true }
        ]
      }
    }
  },
  b2b: {
    id: 'b2b',
    name: 'B2B',
    icon: '🏢',
    branch: 'commercial',
    description: 'Événements entreprises, team building',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Corporate', description: '+8% XP sur quêtes B2B', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Professionnel', description: 'Templates offres B2B', bonus: { type: 'tool', value: 'b2b_templates' } },
          { id: 'c', name: 'Sérieux', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Account Manager', description: 'Badge "Account Manager"', bonus: { type: 'badge', value: 'account_manager' } },
          { id: 'b', name: 'Event Planner', description: 'Peut organiser événements', bonus: { type: 'ability', value: 'organize_events' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Directeur B2B', description: 'Responsable B2B + Badge ultime', bonus: { type: 'ability', value: 'b2b_lead' }, isUltimate: true }
        ]
      }
    }
  },
  seo_visibilite: {
    id: 'seo_visibilite',
    name: 'SEO & Visibilité',
    icon: '🔍',
    branch: 'commercial',
    description: 'Google, référencement, présence web',
    tiers: {
      1: {
        options: [
          { id: 'a', name: 'Référenceur', description: '+8% XP sur quêtes SEO', bonus: { type: 'xp_skill', value: 8 } },
          { id: 'b', name: 'Analytique', description: 'Accès Google Analytics', bonus: { type: 'tool', value: 'analytics_access' } },
          { id: 'c', name: 'Web', description: '+3% XP global', bonus: { type: 'xp_global', value: 3 } }
        ]
      },
      2: {
        options: [
          { id: 'a', name: 'Expert SEO', description: 'Badge "Expert SEO"', bonus: { type: 'badge', value: 'expert_seo' } },
          { id: 'b', name: 'Webmaster', description: '+5% XP branche Commercial', bonus: { type: 'xp_branch', value: 5, branch: 'commercial' } }
        ]
      },
      3: {
        options: [
          { id: 'a', name: 'Maître du Web', description: 'Gestion fiche Google + Badge ultime', bonus: { type: 'ability', value: 'google_business' }, isUltimate: true }
        ]
      }
    }
  }
};

/**
 * 🏆 ACHIEVEMENTS LIÉS AUX SKILLS
 */
export const SKILL_ACHIEVEMENTS = {
  polyvalent: {
    id: 'polyvalent',
    name: 'Polyvalent',
    icon: '🌟',
    description: '4 branches avec au moins 1 skill Tier 2',
    xpReward: 100,
    condition: (userSkills) => {
      const branchesWithTier2 = new Set();
      Object.values(userSkills).forEach(skill => {
        if (skill.unlockedTiers?.includes(2)) {
          branchesWithTier2.add(SKILLS[skill.skillId]?.branch);
        }
      });
      return branchesWithTier2.size >= 4;
    }
  },
  specialiste: {
    id: 'specialiste',
    name: 'Spécialiste',
    icon: '🎯',
    description: '1 skill au Tier 3 (Ultime)',
    xpReward: 200,
    condition: (userSkills) => {
      return Object.values(userSkills).some(s => s.unlockedTiers?.includes(3));
    }
  },
  touche_a_tout: {
    id: 'touche_a_tout',
    name: 'Touche-à-tout',
    icon: '🌈',
    description: 'Au moins 1 skill dans chaque branche',
    xpReward: 150,
    condition: (userSkills) => {
      const branchesWithSkills = new Set();
      Object.values(userSkills).forEach(skill => {
        if (skill.xp > 0) {
          branchesWithSkills.add(SKILLS[skill.skillId]?.branch);
        }
      });
      return branchesWithSkills.size >= 7;
    }
  },
  expert_metier: {
    id: 'expert_metier',
    name: 'Expert Métier',
    icon: '👑',
    description: '3 skills Tier 2+ dans la même branche',
    xpReward: 300,
    condition: (userSkills) => {
      const branchCounts = {};
      Object.values(userSkills).forEach(skill => {
        if (skill.unlockedTiers?.includes(2)) {
          const branch = SKILLS[skill.skillId]?.branch;
          branchCounts[branch] = (branchCounts[branch] || 0) + 1;
        }
      });
      return Object.values(branchCounts).some(count => count >= 3);
    }
  },
  legende_vivante: {
    id: 'legende_vivante',
    name: 'Légende Vivante',
    icon: '💎',
    description: '1 skill au niveau maximum (Tier 3)',
    xpReward: 500,
    condition: (userSkills) => {
      return Object.values(userSkills).some(s => s.unlockedTiers?.includes(3));
    }
  },
  maitre_absolu: {
    id: 'maitre_absolu',
    name: 'Maître Absolu',
    icon: '🏅',
    description: 'Tous les skills au moins Tier 2',
    xpReward: 1000,
    condition: (userSkills) => {
      const skillCount = Object.keys(SKILLS).length;
      const tier2Count = Object.values(userSkills).filter(s => s.unlockedTiers?.includes(2)).length;
      return tier2Count >= skillCount;
    }
  }
};

// ==========================================
// 🔧 FONCTIONS UTILITAIRES
// ==========================================

/**
 * Calculer le niveau (tier) du skill basé sur l'XP
 * Retourne un nombre simple : 0, 1, 2 ou 3
 */
export const getSkillLevel = (xp) => {
  if (xp >= TIER_CONFIG[3].xpRequired) return 3;
  if (xp >= TIER_CONFIG[2].xpRequired) return 2;
  if (xp >= TIER_CONFIG[1].xpRequired) return 1;
  return 0;
};

/**
 * Obtenir l'XP requis pour le prochain tier
 * Retourne null si déjà au max
 */
export const getNextTierXP = (xp) => {
  if (xp >= TIER_CONFIG[3].xpRequired) return null;
  if (xp >= TIER_CONFIG[2].xpRequired) return TIER_CONFIG[3].xpRequired;
  if (xp >= TIER_CONFIG[1].xpRequired) return TIER_CONFIG[2].xpRequired;
  return TIER_CONFIG[1].xpRequired;
};

/**
 * Obtenir les infos détaillées du niveau (pour affichage)
 */
export const getSkillLevelInfo = (xp) => {
  if (xp >= TIER_CONFIG[3].xpRequired) return { tier: 3, name: 'Maître', progress: 100 };
  if (xp >= TIER_CONFIG[2].xpRequired) {
    const progress = ((xp - TIER_CONFIG[2].xpRequired) / (TIER_CONFIG[3].xpRequired - TIER_CONFIG[2].xpRequired)) * 100;
    return { tier: 2, name: 'Expert', progress: Math.min(progress, 99) };
  }
  if (xp >= TIER_CONFIG[1].xpRequired) {
    const progress = ((xp - TIER_CONFIG[1].xpRequired) / (TIER_CONFIG[2].xpRequired - TIER_CONFIG[1].xpRequired)) * 100;
    return { tier: 1, name: 'Initié', progress: Math.min(progress, 99) };
  }
  const progress = (xp / TIER_CONFIG[1].xpRequired) * 100;
  return { tier: 0, name: 'Novice', progress: Math.min(progress, 99) };
};

/**
 * Calculer les stats d'une branche
 * @param {string} branchId - ID de la branche
 * @param {object} userSkills - Skills de l'utilisateur
 * @returns {object} Stats de la branche
 */
export const getBranchProgress = (branchId, userSkills) => {
  const branch = SKILL_BRANCHES[branchId];
  if (!branch) return { totalXP: 0, talentsChosen: 0, progress: 0 };

  const branchSkillIds = branch.skills || Object.keys(SKILLS).filter(id => SKILLS[id].branch === branchId);

  let totalXP = 0;
  let talentsChosen = 0;

  branchSkillIds.forEach(skillId => {
    const userSkill = userSkills[skillId];
    if (userSkill) {
      totalXP += userSkill.xp || 0;
      talentsChosen += (userSkill.talents || []).length;
    }
  });

  const maxTalents = branchSkillIds.length * 3; // 3 tiers par skill
  const progress = maxTalents > 0 ? Math.round((talentsChosen / maxTalents) * 100) : 0;

  return {
    totalXP,
    talentsChosen,
    maxTalents,
    progress,
    skillCount: branchSkillIds.length
  };
};

/**
 * Obtenir les skills avec des talents non choisis
 * @param {object} userSkills - Skills de l'utilisateur
 * @returns {array} Liste des skills avec talents en attente
 */
export const getUnspentTalentPoints = (userSkills) => {
  const unspentList = [];

  Object.entries(userSkills).forEach(([skillId, skillData]) => {
    const xp = skillData.xp || 0;
    const talents = skillData.talents || [];
    const level = getSkillLevel(xp);

    // Compter les tiers débloqués sans talent choisi
    const pendingTiers = [];
    for (let tier = 1; tier <= level; tier++) {
      const hasTalent = talents.some(t => t.tier === tier);
      if (!hasTalent) {
        pendingTiers.push(tier);
      }
    }

    if (pendingTiers.length > 0) {
      unspentList.push({
        skillId,
        pendingChoices: pendingTiers.length,
        pendingTiers
      });
    }
  });

  return unspentList;
};

/**
 * Calculer les bonus actifs d'un utilisateur
 * Retourne un objet simple { bonus_type: total_value }
 */
export const calculateActiveBonus = (userSkills) => {
  const bonuses = {};

  Object.entries(userSkills).forEach(([skillId, skillData]) => {
    const talents = skillData.talents || [];

    talents.forEach(talent => {
      // Le talent stocke son bonus directement
      if (talent.bonus) {
        Object.entries(talent.bonus).forEach(([bonusType, bonusValue]) => {
          bonuses[bonusType] = (bonuses[bonusType] || 0) + bonusValue;
        });
      }
    });
  });

  return bonuses;
};

// ==========================================
// 🔥 SERVICE FIREBASE
// ==========================================

class SkillService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Obtenir les skills d'un utilisateur
   */
  async getUserSkills(userId) {
    try {
      const docRef = doc(db, 'user_skills', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().skills || {};
      }

      // Initialiser si n'existe pas
      const initialSkills = {};
      await setDoc(docRef, {
        skills: initialSkills,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return initialSkills;
    } catch (error) {
      console.error('❌ [SKILLS] Erreur getUserSkills:', error);
      return {};
    }
  }

  /**
   * S'abonner aux changements de skills
   */
  subscribeToUserSkills(userId, callback) {
    const docRef = doc(db, 'user_skills', userId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().skills || {});
      } else {
        callback({});
      }
    }, (error) => {
      console.error('❌ [SKILLS] Erreur subscription:', error);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Ajouter de l'XP à un skill
   */
  async addSkillXP(userId, skillId, xpAmount) {
    try {
      const docRef = doc(db, 'user_skills', userId);
      const docSnap = await getDoc(docRef);

      let skills = {};
      if (docSnap.exists()) {
        skills = docSnap.data().skills || {};
      }

      const currentSkill = skills[skillId] || { skillId, xp: 0, unlockedTiers: [], chosenTalents: {} };
      const oldXp = currentSkill.xp;
      const newXp = oldXp + xpAmount;

      currentSkill.xp = newXp;

      // Vérifier les nouveaux tiers débloqués
      const newTiersUnlocked = [];
      Object.entries(TIER_CONFIG).forEach(([tier, config]) => {
        const tierNum = parseInt(tier);
        if (newXp >= config.xpRequired && !currentSkill.unlockedTiers.includes(tierNum)) {
          currentSkill.unlockedTiers.push(tierNum);
          newTiersUnlocked.push(tierNum);
        }
      });

      skills[skillId] = currentSkill;

      await setDoc(docRef, {
        skills,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log(`✅ [SKILLS] +${xpAmount} XP pour ${skillId} (${oldXp} → ${newXp})`);

      return {
        skillId,
        oldXp,
        newXp,
        newTiersUnlocked
      };
    } catch (error) {
      console.error('❌ [SKILLS] Erreur addSkillXP:', error);
      throw error;
    }
  }

  /**
   * Choisir un talent pour un tier
   */
  async chooseTalent(userId, skillId, tier, optionId) {
    try {
      const docRef = doc(db, 'user_skills', userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Skills utilisateur non trouvés');
      }

      const skills = docSnap.data().skills || {};
      const skill = skills[skillId];

      if (!skill) {
        throw new Error('Skill non trouvé');
      }

      // Vérifier que le tier est débloqué
      if (!skill.unlockedTiers.includes(parseInt(tier))) {
        throw new Error('Tier non débloqué');
      }

      // Vérifier que le talent n'est pas déjà choisi
      if (skill.chosenTalents[tier]) {
        throw new Error('Talent déjà choisi pour ce tier');
      }

      // Enregistrer le choix
      skill.chosenTalents[tier] = optionId;
      skills[skillId] = skill;

      await setDoc(docRef, {
        skills,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Obtenir le bonus
      const skillData = SKILLS[skillId];
      const chosenOption = skillData?.tiers[tier]?.options?.find(o => o.id === optionId);

      console.log(`✅ [SKILLS] Talent choisi: ${skillId} T${tier} → ${optionId}`);

      return {
        skillId,
        tier,
        optionId,
        bonus: chosenOption?.bonus
      };
    } catch (error) {
      console.error('❌ [SKILLS] Erreur chooseTalent:', error);
      throw error;
    }
  }

  /**
   * Distribuer l'XP de skill lors de la complétion d'une quête
   */
  async distributeQuestSkillXP(userId, questXP, requiredSkills = []) {
    if (!requiredSkills || requiredSkills.length === 0) return [];

    // Calculer l'XP par skill (XP quête × 0.5 réparti équitablement)
    const xpPerSkill = Math.floor((questXP * 0.5) / requiredSkills.length);

    const results = [];
    for (const skillId of requiredSkills) {
      if (SKILLS[skillId]) {
        const result = await this.addSkillXP(userId, skillId, xpPerSkill);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Réinitialiser les skills d'un utilisateur (admin)
   */
  async resetUserSkills(userId) {
    try {
      const docRef = doc(db, 'user_skills', userId);
      await setDoc(docRef, {
        skills: {},
        resetAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`✅ [SKILLS] Skills réinitialisés pour ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ [SKILLS] Erreur reset:', error);
      throw error;
    }
  }
}

export const skillService = new SkillService();
export default skillService;
