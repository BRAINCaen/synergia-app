// ==========================================
// 📁 react-app/src/pages/RoleBadgesPage.jsx
// VERSION CORRIGÉE AVEC VRAIS RÔLES BRAIN ESCAPE & QUIZ GAME
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Award, 
  Star, 
  Lock, 
  CheckCircle, 
  Target, 
  TrendingUp,
  Trophy, 
  Zap, 
  Clock,
  Users,
  Settings,
  Wrench,
  MessageSquare,
  Package,
  Briefcase,
  Palette,
  GraduationCap,
  Handshake,
  Smartphone
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { ESCAPE_GAME_ROLES } from '../core/services/escapeGameRolesService.js';
import { ONBOARDING_BADGES } from '../core/services/onboardingService.js';

const RoleBadgesPage = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('maintenance');
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);

  // 🎭 RÔLES BRAIN ESCAPE & QUIZ GAME RÉELS
  const brainRoles = {
    maintenance: {
      ...ESCAPE_GAME_ROLES.MAINTENANCE,
      badges: [
        {
          id: 'maintenance_rookie',
          name: 'Apprenti Maintenance',
          description: 'Première réparation effectuée avec succès',
          icon: '🔧',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Débutant',
          criteria: 'Effectuer 1 réparation',
          unlocked: true,
          progress: 100
        },
        {
          id: 'tool_master',
          name: 'Maître des Outils',
          description: 'Utilisation experte de tous les outils',
          icon: '🛠️',
          rarity: 'Rare',
          xpReward: 150,
          requiredLevel: 2,
          category: 'Technique',
          criteria: 'Maîtriser 10 outils différents',
          unlocked: false,
          progress: 60
        },
        {
          id: 'safety_expert',
          name: 'Expert Sécurité',
          description: 'Zero incident sur 50 interventions',
          icon: '🛡️',
          rarity: 'Épique',
          xpReward: 300,
          requiredLevel: 3,
          category: 'Sécurité',
          criteria: '50 interventions sans incident',
          unlocked: false,
          progress: 32
        }
      ]
    },
    
    reputation: {
      ...ESCAPE_GAME_ROLES.REPUTATION,
      badges: [
        {
          id: 'review_tracker',
          name: 'Veilleur d\'Avis',
          description: 'Première réponse à un avis client',
          icon: '⭐',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Communication',
          criteria: 'Répondre à 1 avis',
          unlocked: true,
          progress: 100
        },
        {
          id: 'reputation_guardian',
          name: 'Gardien de Réputation',
          description: 'Amélioration de 20% de la note moyenne',
          icon: '🌟',
          rarity: 'Épique',
          xpReward: 250,
          requiredLevel: 3,
          category: 'Excellence',
          criteria: 'Augmenter la note de 20%',
          unlocked: false,
          progress: 75
        }
      ]
    },
    
    stock: {
      ...ESCAPE_GAME_ROLES.STOCK,
      badges: [
        {
          id: 'inventory_tracker',
          name: 'Gestionnaire Stock',
          description: 'Premier inventaire complet réalisé',
          icon: '📦',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Organisation',
          criteria: 'Réaliser 1 inventaire complet',
          unlocked: true,
          progress: 100
        },
        {
          id: 'supply_optimizer',
          name: 'Optimiseur Supply',
          description: 'Réduction de 15% des coûts d\'approvisionnement',
          icon: '📈',
          rarity: 'Rare',
          xpReward: 200,
          requiredLevel: 2,
          category: 'Optimisation',
          criteria: 'Réduire les coûts de 15%',
          unlocked: false,
          progress: 45
        }
      ]
    },
    
    organization: {
      ...ESCAPE_GAME_ROLES.ORGANIZATION,
      badges: [
        {
          id: 'workflow_master',
          name: 'Maître du Workflow',
          description: 'Optimisation d\'un processus d\'équipe',
          icon: '📋',
          rarity: 'Rare',
          xpReward: 150,
          requiredLevel: 2,
          category: 'Efficacité',
          criteria: 'Optimiser 1 processus',
          unlocked: false,
          progress: 80
        }
      ]
    },
    
    content: {
      ...ESCAPE_GAME_ROLES.CONTENT,
      badges: [
        {
          id: 'creative_genius',
          name: 'Génie Créatif',
          description: 'Création de 20 contenus visuels',
          icon: '🎨',
          rarity: 'Rare',
          xpReward: 200,
          requiredLevel: 2,
          category: 'Créativité',
          criteria: 'Créer 20 contenus visuels',
          unlocked: false,
          progress: 65
        }
      ]
    },
    
    mentoring: {
      ...ESCAPE_GAME_ROLES.MENTORING,
      badges: [
        {
          id: 'mentor_master',
          name: 'Maître Mentor',
          description: 'Formation réussie de 5 nouveaux membres',
          icon: '🎓',
          rarity: 'Épique',
          xpReward: 300,
          requiredLevel: 3,
          category: 'Formation',
          criteria: 'Former 5 nouveaux membres',
          unlocked: false,
          progress: 40
        }
      ]
    },
    
    partnerships: {
      ...ESCAPE_GAME_ROLES.PARTNERSHIPS,
      badges: [
        {
          id: 'network_builder',
          name: 'Bâtisseur de Réseau',
          description: 'Établissement de 10 nouveaux partenariats',
          icon: '🤝',
          rarity: 'Rare',
          xpReward: 250,
          requiredLevel: 2,
          category: 'Business',
          criteria: 'Créer 10 partenariats',
          unlocked: false,
          progress: 30
        }
      ]
    },
    
    communication: {
      ...ESCAPE_GAME_ROLES.COMMUNICATION,
      badges: [
        {
          id: 'social_media_expert',
          name: 'Expert Réseaux Sociaux',
          description: 'Augmentation de 50% de l\'engagement',
          icon: '📱',
          rarity: 'Rare',
          xpReward: 200,
          requiredLevel: 2,
          category: 'Digital',
          criteria: 'Augmenter l\'engagement de 50%',
          unlocked: false,
          progress: 70
        }
      ]
    },
    
    b2b: {
      ...ESCAPE_GAME_ROLES.B2B,
      badges: [
        {
          id: 'deal_closer',
          name: 'Closeur de Deals',
          description: 'Signature de 20 contrats B2B',
          icon: '💼',
          rarity: 'Épique',
          xpReward: 350,
          requiredLevel: 3,
          category: 'Ventes',
          criteria: 'Signer 20 contrats B2B',
          unlocked: false,
          progress: 55
        }
      ]
    }
  };

  const currentRoleData = brainRoles[selectedRole];
  const unlockedBadges = currentRoleData.badges.filter(badge => badge.unlocked);
  const lockedBadges = currentRoleData.badges.filter(badge => !badge.unlocked);

  // 🎨 Obtenir l'icône pour chaque rôle
  const getRoleIcon = (roleId) => {
    const icons = {
      maintenance: <Wrench className="w-8 h-8" />,
      reputation: <Star className="w-8 h-8" />,
      stock: <Package className="w-8 h-8" />,
      organization: <Settings className="w-8 h-8" />,
      content: <Palette className="w-8 h-8" />,
      mentoring: <GraduationCap className="w-8 h-8" />,
      partnerships: <Handshake className="w-8 h-8" />,
      communication: <Smartphone className="w-8 h-8" />,
      b2b: <Briefcase className="w-8 h-8" />
    };
    return icons[roleId] || <Settings className="w-8 h-8" />;
  };

  // Fonction pour obtenir la couleur de rareté
  const getRarityColor = (rarity) => {
    const colors = {
      'Commun': 'bg-gray-500',
      'Rare': 'bg-blue-500',
      'Épique': 'bg-purple-500',
      'Légendaire': 'bg-yellow-500'
    };
    return colors[rarity] || 'bg-gray-500';
  };

  // Fonction pour obtenir la couleur de rôle
  const getRoleColor = (roleId) => {
    const colors = {
      maintenance: 'from-orange-500 to-orange-600',
      reputation: 'from-yellow-500 to-yellow-600',
      stock: 'from-blue-500 to-blue-600',
      organization: 'from-purple-500 to-purple-600',
      content: 'from-pink-500 to-pink-600',
      mentoring: 'from-green-500 to-green-600',
      partnerships: 'from-indigo-500 to-indigo-600',
      communication: 'from-cyan-500 to-cyan-600',
      b2b: 'from-slate-500 to-slate-600'
    };
    return colors[roleId] || 'from-gray-500 to-gray-600';
  };

  // Charger les données utilisateur
  useEffect(() => {
    // Simulation du chargement des rôles utilisateur
    // TODO: Remplacer par un appel Firebase réel
    setUserRoles({
      maintenance: { level: 2, xp: 150 },
      reputation: { level: 1, xp: 50 }
    });
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des rôles Brain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧠 Badges Brain Escape & Quiz Game
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Débloquez des badges exclusifs selon votre rôle chez Brain et votre progression
          </p>
        </div>

        {/* Sélecteur de rôle */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Crown className="w-6 h-6 mr-2 text-yellow-400" />
            Choisissez votre rôle chez Brain
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {Object.entries(brainRoles).map(([roleId, roleData]) => (
              <button
                key={roleId}
                onClick={() => setSelectedRole(roleId)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedRole === roleId
                    ? `bg-gradient-to-r ${getRoleColor(roleId)} text-white shadow-lg scale-105`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  {getRoleIcon(roleId)}
                </div>
                <h3 className="font-bold mb-1 text-sm">{roleData.name}</h3>
                <p className="text-xs opacity-75 mb-2">{roleData.description}</p>
                <div className="text-xs">
                  {roleData.badges.length} badges disponibles
                </div>
                {userRoles[roleId] && (
                  <div className="mt-2 text-xs bg-black/20 rounded px-2 py-1">
                    Niveau {userRoles[roleId].level} • {userRoles[roleId].xp} XP
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques du rôle */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
            Progression {currentRoleData.name}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-500/20 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{unlockedBadges.length}</div>
              <div className="text-green-200 text-sm">Badges obtenus</div>
            </div>
            
            <div className="bg-blue-500/20 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentRoleData.badges.length}</div>
              <div className="text-blue-200 text-sm">Total disponible</div>
            </div>
            
            <div className="bg-purple-500/20 rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {Math.round((unlockedBadges.length / currentRoleData.badges.length) * 100)}%
              </div>
              <div className="text-purple-200 text-sm">Completion</div>
            </div>
            
            <div className="bg-yellow-500/20 rounded-lg p-4 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {userRoles[selectedRole]?.level || 1}
              </div>
              <div className="text-yellow-200 text-sm">Niveau actuel</div>
            </div>
          </div>
        </div>

        {/* Liste des badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Badges débloqués */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
              Badges Obtenus ({unlockedBadges.length})
            </h3>
            
            <div className="space-y-4">
              {unlockedBadges.map((badge) => (
                <div key={badge.id} className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-white">{badge.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{badge.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Zap className="w-4 h-4" />
                          <span>+{badge.xpReward} XP</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Débloqué</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {unlockedBadges.length === 0 && (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Aucun badge débloqué dans ce rôle</p>
                  <p className="text-gray-500 text-sm mt-2">Commencez à travailler pour débloquer vos premiers badges !</p>
                </div>
              )}
            </div>
          </div>

          {/* Badges à débloquer */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-red-400" />
              À Débloquer ({lockedBadges.length})
            </h3>
            
            <div className="space-y-4">
              {lockedBadges.map((badge) => (
                <div key={badge.id} className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl grayscale">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-gray-300">{badge.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        {badge.requiredLevel > (userRoles[selectedRole]?.level || 1) && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                            Niveau {badge.requiredLevel} requis
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{badge.description}</p>
                      
                      {/* Barre de progression */}
                      {badge.progress > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progression</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${badge.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Zap className="w-4 h-4" />
                          <span>+{badge.xpReward} XP</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{badge.criteria}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {lockedBadges.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-green-400 font-medium">Tous les badges débloqués !</p>
                  <p className="text-gray-400 text-sm">Félicitations pour votre progression dans ce rôle Brain</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conseils de progression */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6 mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-400" />
            Conseils de Progression Brain
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-2">Prochaine étape</h4>
              <p className="text-gray-300 text-sm">
                {lockedBadges.length > 0 
                  ? `Travaillez sur "${lockedBadges[0].name}" pour gagner ${lockedBadges[0].xpReward} XP`
                  : "Vous avez terminé tous les badges de ce rôle Brain !"
                }
              </p>
            </div>
            
            <div className="bg-purple-500/10 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-2">Spécialisation Brain</h4>
              <p className="text-gray-300 text-sm">
                Ce rôle est essentiel pour le bon fonctionnement de Brain Escape & Quiz Game. 
                Votre progression contribue directement à l'expérience client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBadgesPage;
