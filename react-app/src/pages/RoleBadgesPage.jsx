// ==========================================
// 📁 react-app/src/pages/RoleBadgesPage.jsx
// VERSION CORRIGÉE AVEC IMPORT TrendingUp
// ==========================================

import React, { useState } from 'react';
import { 
  Crown, 
  Award, 
  Star, 
  Lock, 
  CheckCircle, 
  Target, 
  TrendingUp,  // ✅ AJOUTÉ : Import TrendingUp manquant
  Trophy, 
  Zap, 
  Clock,
  Users,
  Settings
} from 'lucide-react';

const RoleBadgesPage = () => {
  const [selectedRole, setSelectedRole] = useState('developer');

  // Données locales simples - pas de stores externes
  const mockUserLevel = 2;

  // Base de données des badges par rôle (simplifiée)
  const roleBadges = {
    developer: {
      name: 'Développeur',
      icon: '💻',
      color: 'blue',
      description: 'Badges exclusifs pour les maîtres du code',
      badges: [
        {
          id: 'dev_first_commit',
          name: 'Premier Commit',
          description: 'Effectuer votre premier commit dans un projet',
          icon: '🌱',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Débutant',
          criteria: 'Effectuer 1 commit',
          unlocked: true,
          progress: 100
        },
        {
          id: 'dev_code_review',
          name: 'Reviewer Expert',
          description: 'Effectuer 10 reviews de code constructives',
          icon: '👁️',
          rarity: 'Rare',
          xpReward: 200,
          requiredLevel: 2,
          category: 'Collaboration',
          criteria: 'Effectuer 10 reviews de code',
          unlocked: false,
          progress: 30
        },
        {
          id: 'dev_bug_hunter',
          name: 'Chasseur de Bugs',
          description: 'Corriger 25 bugs critiques',
          icon: '🐛',
          rarity: 'Rare',
          xpReward: 300,
          requiredLevel: 2,
          category: 'Qualité',
          criteria: 'Corriger 25 bugs',
          unlocked: false,
          progress: 68
        },
        {
          id: 'dev_architect',
          name: 'Architecte Système',
          description: 'Concevoir l\'architecture de 3 projets majeurs',
          icon: '🏗️',
          rarity: 'Épique',
          xpReward: 500,
          requiredLevel: 3,
          category: 'Architecture',
          criteria: 'Concevoir 3 architectures',
          unlocked: false,
          progress: 0
        }
      ]
    },
    
    designer: {
      name: 'Designer',
      icon: '🎨',
      color: 'purple',
      description: 'Badges pour les créatifs visuels',
      badges: [
        {
          id: 'design_first_mockup',
          name: 'Premier Mockup',
          description: 'Créer votre premier mockup d\'interface',
          icon: '🖼️',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Débutant',
          criteria: 'Créer 1 mockup',
          unlocked: true,
          progress: 100
        },
        {
          id: 'design_ui_master',
          name: 'Maître UI',
          description: 'Créer 20 composants UI réutilisables',
          icon: '🧩',
          rarity: 'Rare',
          xpReward: 250,
          requiredLevel: 2,
          category: 'Interface',
          criteria: 'Créer 20 composants UI',
          unlocked: false,
          progress: 45
        }
      ]
    },
    
    manager: {
      name: 'Manager',
      icon: '👔',
      color: 'green',
      description: 'Badges de leadership et gestion',
      badges: [
        {
          id: 'manager_first_team',
          name: 'Premier Leadership',
          description: 'Gérer votre première équipe',
          icon: '👥',
          rarity: 'Commun',
          xpReward: 75,
          requiredLevel: 1,
          category: 'Leadership',
          criteria: 'Gérer 1 équipe',
          unlocked: true,
          progress: 100
        },
        {
          id: 'manager_project_success',
          name: 'Projet Réussi',
          description: 'Mener 5 projets à terme avec succès',
          icon: '🎯',
          rarity: 'Rare',
          xpReward: 300,
          requiredLevel: 2,
          category: 'Gestion',
          criteria: 'Terminer 5 projets',
          unlocked: false,
          progress: 80
        }
      ]
    }
  };

  const currentRoleData = roleBadges[selectedRole];
  const unlockedBadges = currentRoleData.badges.filter(badge => badge.unlocked);
  const lockedBadges = currentRoleData.badges.filter(badge => !badge.unlocked);

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
  const getRoleColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏆 Badges par Rôle
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Débloquez des badges exclusifs selon votre rôle et votre progression
          </p>
        </div>

        {/* Sélecteur de rôle */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Crown className="w-6 h-6 mr-2 text-yellow-400" />
            Choisissez votre rôle
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(roleBadges).map(([roleId, roleData]) => (
              <button
                key={roleId}
                onClick={() => setSelectedRole(roleId)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedRole === roleId
                    ? `bg-gradient-to-r ${getRoleColor(roleData.color)} text-white shadow-lg scale-105`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="text-3xl mb-2">{roleData.icon}</div>
                <h3 className="font-bold mb-1">{roleData.name}</h3>
                <p className="text-sm opacity-75">{roleData.description}</p>
                <div className="mt-2 text-xs">
                  {roleData.badges.length} badges disponibles
                </div>
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
              <div className="text-2xl font-bold text-white">{mockUserLevel}</div>
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
                        {badge.requiredLevel > mockUserLevel && (
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
                  <p className="text-gray-400 text-sm">Félicitations pour votre progression</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conseils de progression */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6 mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-400" />
            Conseils de Progression
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-2">Prochaine étape</h4>
              <p className="text-gray-300 text-sm">
                {lockedBadges.length > 0 
                  ? `Travaillez sur "${lockedBadges[0].name}" pour gagner ${lockedBadges[0].xpReward} XP`
                  : "Vous avez terminé tous les badges de ce rôle !"
                }
              </p>
            </div>
            
            <div className="bg-purple-500/10 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-2">Stratégie</h4>
              <p className="text-gray-300 text-sm">
                Concentrez-vous sur les badges "Commun" et "Rare" d'abord pour une progression rapide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBadgesPage;
