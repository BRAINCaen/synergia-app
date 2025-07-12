// ==========================================
// 📁 react-app/src/pages/RoleBadgesPage.jsx
// PAGE BADGES DE RÔLE AVEC LES VRAIS RÔLES SYNERGIA
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Award, 
  Star, 
  Lock, 
  CheckCircle, 
  Target,
  Trophy,
  Zap,
  Medal,
  Sparkles,
  Shield,
  Flame,
  Gem
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { ESCAPE_GAME_ROLES } from '../core/services/escapeGameRolesService.js';
import { SYNERGIA_ROLES } from '../core/services/synergiaRolesService.js';

const RoleBadgesPage = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('gamemaster');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [loading, setLoading] = useState(true);

  // 🎯 COMBINER LES RÔLES ESCAPE GAME ET SYNERGIA
  const allRoles = {
    // Rôles Escape Game (priorité)
    ...ESCAPE_GAME_ROLES,
    // Rôles Synergia (en complément)
    ...Object.fromEntries(
      Object.entries(SYNERGIA_ROLES).map(([key, role]) => [
        key.toLowerCase(),
        {
          ...role,
          icon: role.icon === '🔧' ? '🛠️' : 
                role.icon === '⭐' ? '🌟' : 
                role.icon === '📦' ? '📦' : 
                role.icon === '📋' ? '🗓️' : 
                role.icon === '🎨' ? '🎨' : 
                role.icon === '🎓' ? '🎓' : 
                role.icon === '🤝' ? '🤝' : 
                role.icon === '📢' ? '📢' : 
                role.icon === '💼' ? '💼' : 
                role.icon === '🎮' ? '🎮' : role.icon,
          color: role.color?.replace('bg-', 'from-') + ' to-blue-600',
          description: role.description
        }
      ])
    )
  };

  // 🏆 BADGES SPÉCIFIQUES PAR RÔLE SYNERGIA
  const roleSpecificBadges = {
    gamemaster: [
      {
        id: 'gm_first_session',
        name: 'Première Session',
        description: 'Mener à bien votre première session en tant que Game Master',
        icon: '🎭',
        rarity: 'Commun',
        xpReward: 50,
        requiredLevel: 1,
        category: 'Débuts',
        criteria: 'Animer 1 session complète',
        unlocked: true,
        progress: 100
      },
      {
        id: 'gm_master_of_immersion',
        name: 'Maître de l\'Immersion',
        description: 'Recevoir 10 commentaires positifs sur l\'ambiance créée',
        icon: '🎪',
        rarity: 'Rare',
        xpReward: 150,
        requiredLevel: 2,
        category: 'Excellence',
        criteria: '10 commentaires positifs sur l\'immersion',
        unlocked: true,
        progress: 100
      },
      {
        id: 'gm_crisis_manager',
        name: 'Gestionnaire de Crise',
        description: 'Résoudre 5 situations d\'urgence avec brio',
        icon: '🚨',
        rarity: 'Épique',
        xpReward: 300,
        requiredLevel: 3,
        category: 'Expertise',
        criteria: 'Gérer 5 situations de crise',
        unlocked: false,
        progress: 60
      },
      {
        id: 'gm_legend',
        name: 'Légende du Mastering',
        description: 'Atteindre 1000 sessions menées avec excellence',
        icon: '👑',
        rarity: 'Légendaire',
        xpReward: 500,
        requiredLevel: 5,
        category: 'Maîtrise',
        criteria: '1000 sessions excellentes',
        unlocked: false,
        progress: 15
      }
    ],
    
    maintenance: [
      {
        id: 'maint_first_repair',
        name: 'Premier Réparateur',
        description: 'Effectuer votre première réparation importante',
        icon: '🔧',
        rarity: 'Commun',
        xpReward: 40,
        requiredLevel: 1,
        category: 'Débuts',
        criteria: 'Effectuer 1 réparation',
        unlocked: true,
        progress: 100
      },
      {
        id: 'maint_innovator',
        name: 'Innovateur Technique',
        description: 'Proposer 3 améliorations adoptées par l\'équipe',
        icon: '💡',
        rarity: 'Rare',
        xpReward: 200,
        requiredLevel: 2,
        category: 'Innovation',
        criteria: '3 améliorations adoptées',
        unlocked: false,
        progress: 33
      },
      {
        id: 'maint_zero_downtime',
        name: 'Zéro Panne',
        description: 'Maintenir les salles sans incident pendant 30 jours',
        icon: '⚡',
        rarity: 'Épique',
        xpReward: 350,
        requiredLevel: 3,
        category: 'Excellence',
        criteria: '30 jours sans incident',
        unlocked: false,
        progress: 70
      }
    ],
    
    reputation: [
      {
        id: 'rep_first_response',
        name: 'Première Réponse',
        description: 'Répondre à votre premier avis client',
        icon: '💬',
        rarity: 'Commun',
        xpReward: 30,
        requiredLevel: 1,
        category: 'Débuts',
        criteria: 'Répondre à 1 avis',
        unlocked: true,
        progress: 100
      },
      {
        id: 'rep_positive_turnaround',
        name: 'Retournement Positif',
        description: 'Transformer 5 avis négatifs en expérience positive',
        icon: '🔄',
        rarity: 'Rare',
        xpReward: 180,
        requiredLevel: 2,
        category: 'Expertise',
        criteria: 'Transformer 5 avis négatifs',
        unlocked: false,
        progress: 40
      },
      {
        id: 'rep_5_stars_champion',
        name: 'Champion 5 Étoiles',
        description: 'Maintenir une moyenne de 4.8/5 pendant 3 mois',
        icon: '⭐',
        rarity: 'Épique',
        xpReward: 400,
        requiredLevel: 3,
        category: 'Excellence',
        criteria: 'Moyenne 4.8/5 pendant 3 mois',
        unlocked: false,
        progress: 85
      }
    ],
    
    stock: [
      {
        id: 'stock_first_inventory',
        name: 'Premier Inventaire',
        description: 'Réaliser votre premier inventaire complet',
        icon: '📋',
        rarity: 'Commun',
        xpReward: 35,
        requiredLevel: 1,
        category: 'Débuts',
        criteria: 'Faire 1 inventaire complet',
        unlocked: true,
        progress: 100
      },
      {
        id: 'stock_anticipation_master',
        name: 'Maître de l\'Anticipation',
        description: 'Éviter 10 ruptures de stock grâce à l\'anticipation',
        icon: '🔮',
        rarity: 'Rare',
        xpReward: 160,
        requiredLevel: 2,
        category: 'Stratégie',
        criteria: 'Éviter 10 ruptures de stock',
        unlocked: false,
        progress: 60
      }
    ],
    
    organization: [
      {
        id: 'org_first_planning',
        name: 'Premier Planning',
        description: 'Organiser votre premier planning d\'équipe',
        icon: '📅',
        rarity: 'Commun',
        xpReward: 40,
        requiredLevel: 1,
        category: 'Débuts',
        criteria: 'Créer 1 planning',
        unlocked: true,
        progress: 100
      },
      {
        id: 'org_harmony_keeper',
        name: 'Gardien de l\'Harmonie',
        description: 'Résoudre 20 conflits d\'horaires avec satisfaction',
        icon: '⚖️',
        rarity: 'Rare',
        xpReward: 220,
        requiredLevel: 2,
        category: 'Médiation',
        criteria: 'Résoudre 20 conflits d\'horaires',
        unlocked: false,
        progress: 45
      },
      {
        id: 'org_efficiency_expert',
        name: 'Expert en Efficacité',
        description: 'Améliorer l\'efficacité de l\'équipe de 25%',
        icon: '📈',
        rarity: 'Épique',
        xpReward: 380,
        requiredLevel: 3,
        category: 'Performance',
        criteria: 'Améliorer efficacité de 25%',
        unlocked: false,
        progress: 20
      }
    ],
    
    content: [
      {
        id: 'content_first_creation',
        name: 'Première Création',
        description: 'Créer votre premier contenu visuel',
        icon: '🎨',
        rarity: 'Commun',
        xpReward: 45,
        requiredLevel: 1,
        category: 'Débuts',
        criteria: 'Créer 1 contenu visuel',
        unlocked: true,
        progress: 100
      },
      {
        id: 'content_viral_creator',
        name: 'Créateur Viral',
        description: 'Créer un contenu partagé plus de 100 fois',
        icon: '🚀',
        rarity: 'Rare',
        xpReward: 190,
        requiredLevel: 2,
        category: 'Impact',
        criteria: 'Contenu partagé 100+ fois',
        unlocked: false,
        progress: 75
      }
    ],
    
    communication: [
      {
        id: 'comm_first_post',
        name: 'Premier Post',
        description: 'Publier votre premier post sur les réseaux sociaux',
        icon: '📱',
        rarity: 'Commun',
        xpReward: 30,
        requiredLevel: 1,
        category: 'Débuts',
        criteria: 'Publier 1 post',
        unlocked: true,
        progress: 100
      },
      {
        id: 'comm_engagement_master',
        name: 'Maître de l\'Engagement',
        description: 'Atteindre 1000 interactions sur un mois',
        icon: '❤️',
        rarity: 'Rare',
        xpReward: 170,
        requiredLevel: 2,
        category: 'Engagement',
        criteria: '1000 interactions en 1 mois',
        unlocked: false,
        progress: 55
      },
      {
        id: 'comm_influencer',
        name: 'Influenceur Local',
        description: 'Atteindre 5000 followers organiques',
        icon: '🌟',
        rarity: 'Épique',
        xpReward: 320,
        requiredLevel: 3,
        category: 'Influence',
        criteria: '5000 followers organiques',
        unlocked: false,
        progress: 30
      }
    ]
  };

  // Simuler les données utilisateur
  const getUserRoleData = (roleId) => {
    const mockData = {
      gamemaster: { level: 2, badges: 2, totalBadges: 4 },
      maintenance: { level: 2, badges: 1, totalBadges: 3 },
      reputation: { level: 2, badges: 1, totalBadges: 3 },
      stock: { level: 1, badges: 1, totalBadges: 2 },
      organization: { level: 3, badges: 2, totalBadges: 3 },
      content: { level: 2, badges: 1, totalBadges: 2 },
      communication: { level: 2, badges: 1, totalBadges: 3 }
    };
    
    return mockData[roleId] || { level: 1, badges: 0, totalBadges: 0 };
  };

  // Obtenir les badges filtrés
  const getFilteredBadges = () => {
    const badges = roleSpecificBadges[selectedRole] || [];
    
    return badges.filter(badge => {
      if (selectedRarity === 'all') return true;
      return badge.rarity === selectedRarity;
    });
  };

  // Couleurs par rareté
  const getRarityStyles = (rarity) => {
    switch (rarity) {
      case 'Commun':
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          glow: 'shadow-gray-200'
        };
      case 'Rare':
        return {
          color: 'text-blue-700',
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          glow: 'shadow-blue-200'
        };
      case 'Épique':
        return {
          color: 'text-purple-700',
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          glow: 'shadow-purple-200'
        };
      case 'Légendaire':
        return {
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          glow: 'shadow-yellow-200'
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          glow: 'shadow-gray-200'
        };
    }
  };

  const currentRole = allRoles[selectedRole];
  const userRoleData = getUserRoleData(selectedRole);
  const filteredBadges = getFilteredBadges();

  useEffect(() => {
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <Crown className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Crown className="w-10 h-10 mr-3" />
            Badges par Rôle Synergia
          </h1>
          <p className="text-xl text-white/90">
            Collectionnez les badges exclusifs de votre spécialisation
          </p>
        </div>
      </div>

      {/* Sélection du rôle et filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ma collection de badges</h2>

        {/* Sélection du rôle */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {Object.entries(allRoles).map(([key, role]) => {
            const isSelected = selectedRole === key;
            const userData = getUserRoleData(key);
            const badges = roleSpecificBadges[key] || [];
            const unlockedBadges = badges.filter(b => b.unlocked).length;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{role.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-600">Niveau {userData.level}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Trophy className="w-3 h-3 mr-1" />
                  <span>{unlockedBadges}/{badges.length} badges</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filtres par rareté */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Tous', icon: Award },
            { id: 'Commun', label: 'Communs', icon: Medal },
            { id: 'Rare', label: 'Rares', icon: Star },
            { id: 'Épique', label: 'Épiques', icon: Gem },
            { id: 'Légendaire', label: 'Légendaires', icon: Crown }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedRarity(filter.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRarity === filter.id
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <filter.icon className="w-4 h-4 mr-2" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Informations du rôle sélectionné */}
      {currentRole && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{currentRole.icon}</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{currentRole.name}</h3>
              <p className="text-gray-600">{currentRole.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{userRoleData.level}</div>
              <div className="text-yellow-600 text-sm">Niveau actuel</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userRoleData.badges}</div>
              <div className="text-green-600 text-sm">Badges obtenus</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userRoleData.totalBadges}</div>
              <div className="text-blue-600 text-sm">Badges disponibles</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((userRoleData.badges / userRoleData.totalBadges) * 100) || 0}%
              </div>
              <div className="text-purple-600 text-sm">Progression</div>
            </div>
          </div>
        </div>
      )}

      {/* Grille des badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge) => {
            const rarityStyles = getRarityStyles(badge.rarity);
            
            return (
              <div
                key={badge.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                  badge.unlocked 
                    ? `${rarityStyles.border} ${rarityStyles.glow} shadow-lg` 
                    : 'border-gray-200 opacity-70'
                }`}
              >
                <div className="text-center mb-4">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-3 ${
                    badge.unlocked ? rarityStyles.bg : 'bg-gray-100'
                  }`}>
                    {badge.unlocked ? badge.icon : <Lock className="w-8 h-8 text-gray-400" />}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${
                    badge.unlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                  
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    badge.unlocked ? `${rarityStyles.bg} ${rarityStyles.color}` : 'bg-gray-100 text-gray-500'
                  }`}>
                    {badge.rarity}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <p className={`text-sm text-center ${
                    badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>
                  
                  <div className={`text-center p-3 rounded-lg ${
                    badge.unlocked ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-center mb-1">
                      <Trophy className={`w-4 h-4 mr-1 ${
                        badge.unlocked ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <span className={`font-bold text-sm ${
                        badge.unlocked ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {badge.xpReward} XP
                      </span>
                    </div>
                    
                    <p className={`text-xs ${
                      badge.unlocked ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {badge.criteria}
                    </p>
                  </div>
                  
                  {!badge.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progression</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${badge.progress}%` }}
                        ></div>
                      </div>
                      
                      {badge.requiredLevel > getUserRoleData(selectedRole).level && (
                        <div className="flex items-center justify-center text-xs text-red-500 mt-2">
                          <Lock className="w-3 h-3 mr-1" />
                          <span>Niveau {badge.requiredLevel} requis</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {badge.unlocked && (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Badge obtenu !</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun badge trouvé</h3>
            <p className="text-gray-600">
              Aucun badge ne correspond à votre filtre pour ce rôle.
            </p>
          </div>
        )}
      </div>

      {/* Section conseils */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Sparkles className="w-6 h-6 mr-2" />
          Conseils pour débloquer plus de badges
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <Target className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Complétez vos tâches</h4>
            <p className="text-sm text-white/80">Chaque tâche terminée vous rapproche des badges</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <TrendingUp className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Montez en niveau</h4>
            <p className="text-sm text-white/80">Les badges rares nécessitent un niveau élevé</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <Star className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Visez l'excellence</h4>
            <p className="text-sm text-white/80">Les badges épiques récompensent la qualité</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBadgesPage;
