// ==========================================
// 📁 react-app/src/pages/RoleBadgesPage.jsx
// PAGE BADGES PAR RÔLE - IMPORT CORRIGÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Award, 
  Star, 
  Lock, 
  CheckCircle, 
  Target,
  Shield,
  Zap,
  Heart,
  Brain,
  Code,
  Palette,
  GraduationCap,
  Users, // ✅ CORRECTION: Remplacer Handshake par Users
  Smartphone,
  Clock, // ✅ CORRECTION: Ajouter Clock manquant
  Trophy
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { gamificationService } from '../core/services/gamificationService.js';

/**
 * 🏆 PAGE DES BADGES PAR RÔLE
 */
const RoleBadgesPage = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('gamemaster');
  const [userRoles, setUserRoles] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage
  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      // Utiliser le service de gamification existant
      const gameData = await gamificationService.initializeUserData(user.uid);
      
      // Simuler des rôles basés sur les données de gamification - RÔLES ESCAPE GAME
      const mockRoles = {
        gamemaster: { level: Math.min(Math.floor(gameData.level / 2) + 1, 5) },
        maintenance: { level: gameData.tasksCompleted > 5 ? 2 : 1 },
        reputation: { level: gameData.tasksCompleted > 10 ? 2 : 1 },
        stock: { level: gameData.projectsCompleted > 0 ? 2 : 1 },
        organization: { level: Math.min(Math.floor(gameData.level / 3) + 1, 4) },
        content: { level: gameData.badgesUnlocked > 3 ? 3 : 1 },
        mentoring: { level: gameData.level > 5 ? 3 : 2 },
        partnerships: { level: gameData.tasksCompleted > 15 ? 2 : 1 },
        communication: { level: Math.min(Math.floor(gameData.level / 2) + 1, 4) }
      };
      
      setUserRoles(mockRoles);
      setEarnedBadges(gameData.badges || []);
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Définition des rôles avec leurs données - LES VRAIS RÔLES ESCAPE GAME SYNERGIA
  const roleDefinitions = {
    gamemaster: {
      name: 'Game Master',
      icon: Smartphone, // Gamepad2 n'existe pas, on utilise Smartphone
      color: 'purple',
      description: 'Animateur·rice des sessions de jeu, garant·e de l\'immersion et de la satisfaction client',
      gradient: 'from-purple-500 to-pink-500'
    },
    maintenance: {
      name: 'Entretien & Maintenance',
      icon: Target, // Wrench n'existe pas, on utilise Target
      color: 'orange',
      description: 'Garant·e du bon état, de la sécurité et de la qualité des salles',
      gradient: 'from-orange-500 to-red-500'
    },
    reputation: {
      name: 'Gestion des Avis & Réputation',
      icon: Star,
      color: 'yellow',
      description: 'Surveille, répond et valorise les avis clients pour améliorer la réputation',
      gradient: 'from-yellow-500 to-orange-500'
    },
    stock: {
      name: 'Gestion des Stocks',
      icon: Shield, // Package n'existe pas, on utilise Shield
      color: 'blue',
      description: 'Optimise les achats, stocks et ressources matérielles du lieu',
      gradient: 'from-blue-500 to-cyan-500'
    },
    organization: {
      name: 'Organisation & Planification',
      icon: Clock,
      color: 'green',
      description: 'Gère le planning, les réservations et l\'organisation globale',
      gradient: 'from-green-500 to-emerald-500'
    },
    content: {
      name: 'Création de Contenu',
      icon: Palette,
      color: 'pink',
      description: 'Crée du contenu visuel, vidéo et digital pour promouvoir le lieu',
      gradient: 'from-pink-500 to-rose-500'
    },
    mentoring: {
      name: 'Formation & Accompagnement',
      icon: GraduationCap,
      color: 'indigo',
      description: 'Forme et accompagne les nouveaux arrivants',
      gradient: 'from-indigo-500 to-purple-500'
    },
    partnerships: {
      name: 'Partenariats & Référencement',
      icon: Users,
      color: 'teal',
      description: 'Développe les relations externes, partenariats et visibilité',
      gradient: 'from-teal-500 to-blue-500'
    },
    communication: {
      name: 'Communication & Réseaux Sociaux',
      icon: Zap, // Megaphone n'existe pas, on utilise Zap
      color: 'violet',
      description: 'anime la présence en ligne, gère la communication et développe la communauté',
      gradient: 'from-violet-500 to-purple-500'
    }
  };

  // Badges factices pour la démonstration - ADAPTÉS AUX NOUVEAUX RÔLES
  const mockBadges = {
    gamemaster: [
      {
        id: 'gm_first_session',
        name: 'Première Session',
        description: 'Animer votre première session de jeu',
        icon: '🎭',
        rarity: 'common',
        xpReward: 50,
        requiredLevel: 1,
        category: 'Débutant',
        unlocked: true,
        progress: 100
      },
      {
        id: 'gm_master_actor',
        name: 'Maître Acteur',
        description: 'Animer 25 sessions avec excellence',
        icon: '🎬',
        rarity: 'epic',
        xpReward: 500,
        requiredLevel: 3,
        category: 'Performance',
        unlocked: false,
        progress: 45
      },
      {
        id: 'gm_crisis_manager',
        name: 'Gestionnaire de Crise',
        description: 'Gérer 10 situations difficiles avec brio',
        icon: '🚨',
        rarity: 'rare',
        xpReward: 300,
        requiredLevel: 2,
        category: 'Gestion',
        unlocked: false,
        progress: 70
      }
    ],
    maintenance: [
      {
        id: 'maint_first_repair',
        name: 'Premier Dépannage',
        description: 'Effectuer votre première réparation',
        icon: '🔧',
        rarity: 'common',
        xpReward: 40,
        requiredLevel: 1,
        category: 'Technique',
        unlocked: true,
        progress: 100
      },
      {
        id: 'maint_expert_tech',
        name: 'Expert Technique',
        description: 'Résoudre 50 problèmes techniques',
        icon: '⚙️',
        rarity: 'epic',
        xpReward: 400,
        requiredLevel: 3,
        category: 'Expertise',
        unlocked: false,
        progress: 22
      }
    ],
    reputation: [
      {
        id: 'rep_first_response',
        name: 'Première Réponse',
        description: 'Répondre à votre premier avis client',
        icon: '💬',
        rarity: 'common',
        xpReward: 30,
        requiredLevel: 1,
        category: 'Communication',
        unlocked: true,
        progress: 100
      },
      {
        id: 'rep_five_stars',
        name: 'Cinq Étoiles',
        description: 'Maintenir une moyenne de 4.8/5 pendant 3 mois',
        icon: '⭐',
        rarity: 'legendary',
        xpReward: 800,
        requiredLevel: 4,
        category: 'Excellence',
        unlocked: false,
        progress: 15
      }
    ],
    stock: [
      {
        id: 'stock_first_order',
        name: 'Première Commande',
        description: 'Passer votre première commande optimisée',
        icon: '📦',
        rarity: 'common',
        xpReward: 35,
        requiredLevel: 1,
        category: 'Gestion',
        unlocked: true,
        progress: 100
      },
      {
        id: 'stock_zero_waste',
        name: 'Zéro Gaspillage',
        description: 'Atteindre 0% de gaspillage sur un trimestre',
        icon: '♻️',
        rarity: 'epic',
        xpReward: 450,
        requiredLevel: 3,
        category: 'Optimisation',
        unlocked: false,
        progress: 60
      }
    ],
    organization: [
      {
        id: 'org_first_planning',
        name: 'Premier Planning',
        description: 'Organiser votre premier planning hebdomadaire',
        icon: '📅',
        rarity: 'common',
        xpReward: 40,
        requiredLevel: 1,
        category: 'Organisation',
        unlocked: true,
        progress: 100
      },
      {
        id: 'org_efficiency_master',
        name: 'Maître de l\'Efficacité',
        description: 'Atteindre 95% de taux d\'occupation optimal',
        icon: '⚡',
        rarity: 'legendary',
        xpReward: 750,
        requiredLevel: 4,
        category: 'Performance',
        unlocked: false,
        progress: 35
      }
    ],
    content: [
      {
        id: 'content_first_video',
        name: 'Première Vidéo',
        description: 'Créer votre première vidéo promotionnelle',
        icon: '🎥',
        rarity: 'common',
        xpReward: 45,
        requiredLevel: 1,
        category: 'Création',
        unlocked: true,
        progress: 100
      },
      {
        id: 'content_viral_post',
        name: 'Post Viral',
        description: 'Créer un contenu avec plus de 10k vues',
        icon: '🔥',
        rarity: 'epic',
        xpReward: 600,
        requiredLevel: 3,
        category: 'Viralité',
        unlocked: false,
        progress: 80
      }
    ],
    mentoring: [
      {
        id: 'mentor_first_student',
        name: 'Premier Élève',
        description: 'Former votre premier nouvel arrivant',
        icon: '👨‍🏫',
        rarity: 'common',
        xpReward: 55,
        requiredLevel: 1,
        category: 'Formation',
        unlocked: true,
        progress: 100
      },
      {
        id: 'mentor_master_teacher',
        name: 'Maître Formateur',
        description: 'Former 20 personnes avec succès',
        icon: '🎓',
        rarity: 'legendary',
        xpReward: 900,
        requiredLevel: 4,
        category: 'Expertise',
        unlocked: false,
        progress: 25
      }
    ],
    partnerships: [
      {
        id: 'partner_first_deal',
        name: 'Premier Partenariat',
        description: 'Signer votre premier accord de partenariat',
        icon: '🤝',
        rarity: 'common',
        xpReward: 60,
        requiredLevel: 1,
        category: 'Business',
        unlocked: true,
        progress: 100
      },
      {
        id: 'partner_network_king',
        name: 'Roi du Réseau',
        description: 'Établir 15 partenariats actifs',
        icon: '👑',
        rarity: 'epic',
        xpReward: 700,
        requiredLevel: 3,
        category: 'Réseau',
        unlocked: false,
        progress: 40
      }
    ],
    communication: [
      {
        id: 'comm_first_post',
        name: 'Premier Post',
        description: 'Publier votre premier post sur les réseaux',
        icon: '📱',
        rarity: 'common',
        xpReward: 25,
        requiredLevel: 1,
        category: 'Social Media',
        unlocked: true,
        progress: 100
      },
      {
        id: 'comm_influencer',
        name: 'Micro-Influenceur',
        description: 'Atteindre 5000 followers engagés',
        icon: '🌟',
        rarity: 'epic',
        xpReward: 550,
        requiredLevel: 3,
        category: 'Influence',
        unlocked: false,
        progress: 65
      }
    ]
  };

  // Obtenir les badges du rôle sélectionné
  const currentRoleBadges = mockBadges[selectedRole] || [];
  const currentRole = roleDefinitions[selectedRole];
  const userRoleLevel = userRoles[selectedRole]?.level || 0;

  // Statistiques des badges
  const badgeStats = {
    total: currentRoleBadges.length,
    unlocked: currentRoleBadges.filter(b => b.unlocked).length,
    inProgress: currentRoleBadges.filter(b => !b.unlocked && b.progress > 0).length,
    locked: currentRoleBadges.filter(b => !b.unlocked && b.progress === 0).length
  };

  const completionPercentage = badgeStats.total > 0 ? 
    Math.round((badgeStats.unlocked / badgeStats.total) * 100) : 0;

  // Styles de rareté
  const getRarityStyles = (rarity) => {
    const styles = {
      common: {
        border: 'border-gray-500',
        bg: 'bg-gray-500/20',
        text: 'text-gray-300',
        glow: 'shadow-gray-500/30'
      },
      uncommon: {
        border: 'border-green-500',
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        glow: 'shadow-green-500/30'
      },
      rare: {
        border: 'border-blue-500',
        bg: 'bg-blue-500/20',
        text: 'text-blue-300',
        glow: 'shadow-blue-500/30'
      },
      epic: {
        border: 'border-purple-500',
        bg: 'bg-purple-500/20',
        text: 'text-purple-300',
        glow: 'shadow-purple-500/30'
      },
      legendary: {
        border: 'border-yellow-500',
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-300',
        glow: 'shadow-yellow-500/30'
      }
    };
    return styles[rarity] || styles.common;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement des badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🏆 Badges des Rôles Escape Game
          </h1>
          <p className="text-xl text-gray-300">
            Débloquez des badges exclusifs selon vos rôles dans l'escape game Synergia
          </p>
        </motion.div>

        {/* Sélecteur de rôles */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Choisir un rôle Escape Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">{Object.entries(roleDefinitions).map(([roleId, role]) => {
              const Icon = role.icon;
              const isSelected = selectedRole === roleId;
              const userLevel = userRoles[roleId]?.level || 0;
              
              return (
                <motion.button
                  key={roleId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRole(roleId)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300
                    ${isSelected 
                      ? `border-${role.color}-500 bg-gradient-to-r ${role.gradient} shadow-lg shadow-${role.color}-500/30` 
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }
                  `}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {role.name}
                  </div>
                  {userLevel > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{userLevel}</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Informations du rôle sélectionné */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-r ${currentRole.gradient} rounded-2xl p-6 mb-8 text-white`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <currentRole.icon className="w-12 h-12" />
              <div>
                <h2 className="text-2xl font-bold">{currentRole.name}</h2>
                <p className="text-white/80">{currentRole.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{completionPercentage}%</div>
              <div className="text-white/80">Complété</div>
            </div>
          </div>
          
          {/* Statistiques des badges */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{badgeStats.total}</div>
              <div className="text-white/80 text-sm">Total</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{badgeStats.unlocked}</div>
              <div className="text-white/80 text-sm">Débloqués</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{badgeStats.inProgress}</div>
              <div className="text-white/80 text-sm">En cours</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-300">{badgeStats.locked}</div>
              <div className="text-white/80 text-sm">Verrouillés</div>
            </div>
          </div>
        </motion.div>

        {/* Liste des badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="wait">
            {currentRoleBadges.map((badge, index) => {
              const rarityStyle = getRarityStyles(badge.rarity);
              const isUnlocked = badge.unlocked;
              const canUnlock = userRoleLevel >= badge.requiredLevel;
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2
                    ${rarityStyle.border} ${rarityStyle.bg}
                    ${isUnlocked ? `shadow-lg ${rarityStyle.glow}` : 'opacity-75'}
                    transition-all duration-300 hover:scale-105
                  `}
                >
                  {/* Badge icon et statut */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex flex-col items-end">
                      {isUnlocked ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : canUnlock ? (
                        <Clock className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-500" />
                      )}
                      <span className={`text-xs font-medium mt-1 ${rarityStyle.text}`}>
                        {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Informations du badge */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-2">{badge.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{badge.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Catégorie: {badge.category}</span>
                      <span className="text-purple-400">+{badge.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  {!isUnlocked && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${badge.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-2 rounded-full bg-gradient-to-r ${currentRole.gradient}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Niveau requis */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Niveau requis: {badge.requiredLevel}</span>
                    {!canUnlock && (
                      <span className="text-red-400">Niveau insuffisant</span>
                    )}
                  </div>

                  {/* Effet brillant pour les badges débloqués */}
                  {isUnlocked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl pointer-events-none"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Message si aucun badge */}
        {currentRoleBadges.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Aucun badge disponible
            </h3>
            <p className="text-gray-500">
              Les badges pour ce rôle sont en cours de développement
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default RoleBadgesPage;
