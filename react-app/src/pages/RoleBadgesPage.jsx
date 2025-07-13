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
  Smartphone
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { gamificationService } from '../core/services/gamificationService.js';

/**
 * 🏆 PAGE DES BADGES PAR RÔLE
 */
const RoleBadgesPage = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('developer');
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
      
      // Simuler des rôles basés sur les données de gamification
      const mockRoles = {
        developer: { level: Math.min(Math.floor(gameData.level / 2) + 1, 5) },
        designer: { level: gameData.tasksCompleted > 10 ? 2 : 1 },
        manager: { level: gameData.projectsCompleted > 0 ? 2 : 1 }
      };
      
      setUserRoles(mockRoles);
      setEarnedBadges(gameData.badges || []);
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Définition des rôles avec leurs données
  const roleDefinitions = {
    developer: {
      name: 'Développeur',
      icon: Code,
      color: 'blue',
      description: 'Maîtrise technique et innovation',
      gradient: 'from-blue-500 to-cyan-500'
    },
    designer: {
      name: 'Designer',
      icon: Palette,
      color: 'purple',
      description: 'Créativité et expérience utilisateur',
      gradient: 'from-purple-500 to-pink-500'
    },
    manager: {
      name: 'Manager',
      icon: Crown,
      color: 'yellow',
      description: 'Leadership et coordination d\'équipe',
      gradient: 'from-yellow-500 to-orange-500'
    },
    analyst: {
      name: 'Analyste',
      icon: Brain,
      color: 'green',
      description: 'Analyse de données et insights',
      gradient: 'from-green-500 to-emerald-500'
    },
    mentor: {
      name: 'Mentor',
      icon: GraduationCap,
      color: 'indigo',
      description: 'Formation et accompagnement',
      gradient: 'from-indigo-500 to-purple-500'
    },
    collaborator: {
      name: 'Collaborateur',
      icon: Users, // ✅ CORRECTION: Users au lieu de Handshake
      color: 'teal',
      description: 'Esprit d\'équipe et collaboration',
      gradient: 'from-teal-500 to-blue-500'
    },
    innovator: {
      name: 'Innovateur',
      icon: Zap,
      color: 'amber',
      description: 'Innovation et nouvelles idées',
      gradient: 'from-amber-500 to-yellow-500'
    },
    specialist: {
      name: 'Spécialiste',
      icon: Target,
      color: 'red',
      description: 'Expertise dans un domaine spécifique',
      gradient: 'from-red-500 to-pink-500'
    }
  };

  // Badges factices pour la démonstration
  const mockBadges = {
    developer: [
      {
        id: 'dev_first_commit',
        name: 'Premier Commit',
        description: 'Effectuer votre premier commit dans un projet',
        icon: '🌱',
        rarity: 'common',
        xpReward: 50,
        requiredLevel: 1,
        category: 'Débutant',
        unlocked: true,
        progress: 100
      },
      {
        id: 'dev_code_review',
        name: 'Reviewer Expert',
        description: 'Effectuer 10 reviews de code constructives',
        icon: '👁️',
        rarity: 'rare',
        xpReward: 200,
        requiredLevel: 2,
        category: 'Collaboration',
        unlocked: false,
        progress: 30
      },
      {
        id: 'dev_bug_hunter',
        name: 'Chasseur de Bugs',
        description: 'Corriger 25 bugs critiques',
        icon: '🐛',
        rarity: 'rare',
        xpReward: 300,
        requiredLevel: 2,
        category: 'Qualité',
        unlocked: false,
        progress: 68
      },
      {
        id: 'dev_architect',
        name: 'Architecte Système',
        description: 'Concevoir l\'architecture de 3 projets majeurs',
        icon: '🏗️',
        rarity: 'epic',
        xpReward: 500,
        requiredLevel: 3,
        category: 'Architecture',
        unlocked: false,
        progress: 0
      }
    ],
    designer: [
      {
        id: 'design_first_mockup',
        name: 'Premier Mockup',
        description: 'Créer votre premier mockup approuvé',
        icon: '🎨',
        rarity: 'common',
        xpReward: 50,
        requiredLevel: 1,
        category: 'Création',
        unlocked: true,
        progress: 100
      },
      {
        id: 'design_ui_master',
        name: 'Maître UI',
        description: 'Créer 50 composants UI réutilisables',
        icon: '🎯',
        rarity: 'epic',
        xpReward: 400,
        requiredLevel: 3,
        category: 'Interface',
        unlocked: false,
        progress: 22
      }
    ],
    // Ajouter d'autres rôles...
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
            🏆 Badges par Rôle
          </h1>
          <p className="text-xl text-gray-300">
            Débloquez des badges exclusifs selon vos rôles de prédilection
          </p>
        </motion.div>

        {/* Sélecteur de rôles */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Choisir un rôle</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries(roleDefinitions).map(([roleId, role]) => {
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
