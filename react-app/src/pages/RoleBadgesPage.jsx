// ==========================================
// 📁 react-app/src/pages/RoleBadgesPage.jsx
// VERSION SIMPLIFIÉE SANS STORES COMPLEXES
// ==========================================

import React, { useState } from 'react';
import { Crown, Award, Star, Lock, CheckCircle, Target } from 'lucide-react';

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
          description: 'Concevoir l\'architecture de 3 systèmes complexes',
          icon: '🏗️',
          rarity: 'Épique',
          xpReward: 500,
          requiredLevel: 4,
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
      description: 'Badges pour les créateurs d\'expériences visuelles',
      badges: [
        {
          id: 'des_first_design',
          name: 'Premier Design',
          description: 'Créer votre premier design dans un projet',
          icon: '🎨',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Débutant',
          criteria: 'Créer 1 design',
          unlocked: true,
          progress: 100
        },
        {
          id: 'des_ui_expert',
          name: 'Expert UI',
          description: 'Créer 15 interfaces utilisateur exceptionnelles',
          icon: '✨',
          rarity: 'Rare',
          xpReward: 250,
          requiredLevel: 2,
          category: 'Interface',
          criteria: 'Créer 15 interfaces UI',
          unlocked: false,
          progress: 80
        }
      ]
    },
    manager: {
      name: 'Manager',
      icon: '👔',
      color: 'green',
      description: 'Badges pour les leaders et gestionnaires d\'équipe',
      badges: [
        {
          id: 'mgr_first_lead',
          name: 'Premier Leadership',
          description: 'Diriger votre première initiative d\'équipe',
          icon: '👨‍💼',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Débutant',
          criteria: 'Diriger 1 initiative',
          unlocked: true,
          progress: 100
        },
        {
          id: 'mgr_team_builder',
          name: 'Constructeur d\'Équipe',
          description: 'Organiser 10 activités de team building',
          icon: '🤝',
          rarity: 'Rare',
          xpReward: 200,
          requiredLevel: 2,
          category: 'Équipe',
          criteria: 'Organiser 10 activités',
          unlocked: false,
          progress: 70
        }
      ]
    }
  };

  const currentRole = roleBadges[selectedRole];

  // Statistiques des badges
  const badgeStats = {
    total: currentRole.badges.length,
    unlocked: currentRole.badges.filter(b => b.unlocked).length,
    available: currentRole.badges.filter(b => !b.unlocked && b.requiredLevel <= mockUserLevel).length,
    locked: currentRole.badges.filter(b => !b.unlocked && b.requiredLevel > mockUserLevel).length
  };

  // Couleurs selon la rareté
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Commun': return 'border-gray-300 bg-gray-50';
      case 'Rare': return 'border-blue-300 bg-blue-50';
      case 'Épique': return 'border-purple-300 bg-purple-50';
      case 'Légendaire': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case 'Commun': return 'text-gray-700';
      case 'Rare': return 'text-blue-700';
      case 'Épique': return 'text-purple-700';
      case 'Légendaire': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <Crown className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Crown className="w-10 h-10 mr-3" />
            Badges Exclusifs par Rôle
          </h1>
          <p className="text-xl text-white/90">
            Collectionnez des badges spécialisés selon votre expertise
          </p>
          
          {/* Stats utilisateur */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{mockUserLevel}</div>
              <div className="text-sm text-white/80">Votre niveau</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{badgeStats.unlocked}</div>
              <div className="text-sm text-white/80">Débloqués</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{badgeStats.available}</div>
              <div className="text-sm text-white/80">Disponibles</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <div className="text-2xl font-bold">{((badgeStats.unlocked / badgeStats.total) * 100).toFixed(0)}%</div>
              <div className="text-sm text-white/80">Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection du rôle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Choisissez votre spécialité</h2>
        <div className="flex gap-3">
          {Object.entries(roleBadges).map(([key, role]) => {
            const roleStats = {
              unlocked: role.badges.filter(b => b.unlocked).length,
              total: role.badges.length
            };
            
            return (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedRole === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-2xl mr-3">{role.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{role.name}</div>
                  <div className="text-xs text-gray-500">
                    {roleStats.unlocked}/{roleStats.total} badges
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collection de badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRole.badges.map((badge) => {
          const isLocked = badge.requiredLevel > mockUserLevel;
          const isUnlocked = badge.unlocked;
          const isAvailable = !isUnlocked && !isLocked;

          return (
            <div
              key={badge.id}
              className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 ${
                isUnlocked
                  ? getRarityColor(badge.rarity) + ' shadow-2xl'
                  : isLocked
                  ? 'border-gray-200 opacity-60'
                  : 'border-blue-200 hover:border-blue-300 hover:shadow-2xl'
              }`}
            >
              {/* Header du badge */}
              <div className="text-center mb-4">
                <div className={`relative inline-block ${isLocked ? 'opacity-50' : ''}`}>
                  <div className="text-6xl mb-2">{badge.icon}</div>
                  {isUnlocked && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <h3 className={`font-bold text-lg mb-2 ${
                  isUnlocked ? getRarityTextColor(badge.rarity) :
                  isLocked ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {badge.name}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    badge.rarity === 'Légendaire' ? 'bg-yellow-100 text-yellow-700' :
                    badge.rarity === 'Épique' ? 'bg-purple-100 text-purple-700' :
                    badge.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {badge.rarity}
                  </span>
                  
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {badge.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm text-center mb-4 ${
                isLocked ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {badge.description}
              </p>

              {/* Progress bar (pour les badges non débloqués) */}
              {!isUnlocked && !isLocked && badge.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Récompense et niveau requis */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center text-yellow-600 font-bold">
                  <Star className="w-4 h-4 mr-1" />
                  {badge.xpReward} XP
                </div>
                
                <div className={`text-sm ${
                  isLocked ? 'text-red-500' : 'text-gray-600'
                }`}>
                  Niveau {badge.requiredLevel}+
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-4 text-center">
                {isUnlocked ? (
                  <div className="flex items-center justify-center text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Débloqué
                  </div>
                ) : isLocked ? (
                  <div className="flex items-center justify-center text-gray-400 font-medium">
                    <Lock className="w-5 h-5 mr-2" />
                    Niveau {badge.requiredLevel} requis
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-blue-600 font-medium">
                    <Target className="w-5 h-5 mr-2" />
                    En progression
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleBadgesPage;

const RoleBadgesPage = () => {
  const { user } = useAuthStore();
  const { userStats, badges: userBadges } = useGameStore();
  const [selectedRole, setSelectedRole] = useState('developer');
  const [filterStatus, setFilterStatus] = useState('all');

  // Base de données des badges par rôle
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
          description: 'Concevoir l\'architecture de 3 systèmes complexes',
          icon: '🏗️',
          rarity: 'Épique',
          xpReward: 500,
          requiredLevel: 4,
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
      description: 'Badges pour les créateurs d\'expériences visuelles',
      badges: [
        {
          id: 'des_first_design',
          name: 'Premier Design',
          description: 'Créer votre premier design dans un projet',
          icon: '🎨',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Débutant',
          criteria: 'Créer 1 design',
          unlocked: true,
          progress: 100
        },
        {
          id: 'des_ui_expert',
          name: 'Expert UI',
          description: 'Créer 15 interfaces utilisateur exceptionnelles',
          icon: '✨',
          rarity: 'Rare',
          xpReward: 250,
          requiredLevel: 2,
          category: 'Interface',
          criteria: 'Créer 15 interfaces UI',
          unlocked: false,
          progress: 80
        }
      ]
    },
    manager: {
      name: 'Manager',
      icon: '👔',
      color: 'green',
      description: 'Badges pour les leaders et gestionnaires d\'équipe',
      badges: [
        {
          id: 'mgr_first_lead',
          name: 'Premier Leadership',
          description: 'Diriger votre première initiative d\'équipe',
          icon: '👨‍💼',
          rarity: 'Commun',
          xpReward: 50,
          requiredLevel: 1,
          category: 'Débutant',
          criteria: 'Diriger 1 initiative',
          unlocked: true,
          progress: 100
        },
        {
          id: 'mgr_team_builder',
          name: 'Constructeur d\'Équipe',
          description: 'Organiser 10 activités de team building',
          icon: '🤝',
          rarity: 'Rare',
          xpReward: 200,
          requiredLevel: 2,
          category: 'Équipe',
          criteria: 'Organiser 10 activités',
          unlocked: false,
          progress: 70
        }
      ]
    }
  };

  // Calculer le niveau de l'utilisateur
  const getUserLevel = () => {
    const xp = userStats?.totalXp || 0;
    if (xp >= 5000) return 5;
    if (xp >= 3000) return 4;
    if (xp >= 1500) return 3;
    if (xp >= 500) return 2;
    return 1;
  };

  const userLevel = getUserLevel();
  const currentRole = roleBadges[selectedRole];

  // Filtrer les badges
  const getFilteredBadges = () => {
    let badges = currentRole.badges;

    if (filterStatus === 'unlocked') {
      badges = badges.filter(badge => badge.unlocked);
    } else if (filterStatus === 'available') {
      badges = badges.filter(badge => !badge.unlocked && badge.requiredLevel <= userLevel);
    } else if (filterStatus === 'locked') {
      badges = badges.filter(badge => !badge.unlocked && badge.requiredLevel > userLevel);
    }

    return badges;
  };

  const filteredBadges = getFilteredBadges();

  // Statistiques des badges
  const badgeStats = {
    total: currentRole.badges.length,
    unlocked: currentRole.badges.filter(b => b.unlocked).length,
    available: currentRole.badges.filter(b => !b.unlocked && b.requiredLevel <= userLevel).length,
    locked: currentRole.badges.filter(b => !b.unlocked && b.requiredLevel > userLevel).length
  };

  // Couleurs selon la rareté
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Commun': return 'border-gray-300 bg-gray-50';
      case 'Rare': return 'border-blue-300 bg-blue-50';
      case 'Épique': return 'border-purple-300 bg-purple-50';
      case 'Légendaire': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case 'Commun': return 'text-gray-700';
      case 'Rare': return 'text-blue-700';
      case 'Épique': return 'text-purple-700';
      case 'Légendaire': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <Crown className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Crown className="w-10 h-10 mr-3" />
            Badges Exclusifs par Rôle
          </h1>
          <p className="text-xl text-white/90">
            Collectionnez des badges spécialisés selon votre expertise
          </p>
        </div>
      </div>

      {/* Sélection du rôle et filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Sélection du rôle */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Choisissez votre spécialité</h2>
            <div className="flex gap-3">
              {Object.entries(roleBadges).map(([key, role]) => {
                const roleStats = {
                  unlocked: role.badges.filter(b => b.unlocked).length,
                  total: role.badges.length
                };
                
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedRole === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl mr-3">{role.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-gray-500">
                        {roleStats.unlocked}/{roleStats.total} badges
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtres */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les badges</option>
              <option value="unlocked">Débloqués</option>
              <option value="available">Disponibles</option>
              <option value="locked">Verrouillés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Description du rôle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{currentRole.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentRole.name}</h2>
            <p className="text-gray-600">{currentRole.description}</p>
          </div>
        </div>
        
        {/* Barre de progression globale */}
        <div className="bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(badgeStats.unlocked / badgeStats.total) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{badgeStats.unlocked} badges débloqués</span>
          <span>{badgeStats.total} badges au total</span>
        </div>
      </div>

      {/* Collection de badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const isLocked = badge.requiredLevel > userLevel;
          const isUnlocked = badge.unlocked;
          const isAvailable = !isUnlocked && !isLocked;

          return (
            <div
              key={badge.id}
              className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 ${
                isUnlocked
                  ? getRarityColor(badge.rarity) + ' shadow-2xl'
                  : isLocked
                  ? 'border-gray-200 opacity-60'
                  : 'border-blue-200 hover:border-blue-300 hover:shadow-2xl'
              }`}
            >
              {/* Header du badge */}
              <div className="text-center mb-4">
                <div className={`relative inline-block ${isLocked ? 'opacity-50' : ''}`}>
                  <div className="text-6xl mb-2">{badge.icon}</div>
                  {isUnlocked && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full p-1">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <h3 className={`font-bold text-lg mb-2 ${
                  isUnlocked ? getRarityTextColor(badge.rarity) :
                  isLocked ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {badge.name}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    badge.rarity === 'Légendaire' ? 'bg-yellow-100 text-yellow-700' :
                    badge.rarity === 'Épique' ? 'bg-purple-100 text-purple-700' :
                    badge.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {badge.rarity}
                  </span>
                  
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    {badge.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm text-center mb-4 ${
                isLocked ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {badge.description}
              </p>

              {/* Critères */}
              <div className="text-center mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Critères :</p>
                <p className={`text-sm ${
                  isLocked ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  {badge.criteria}
                </p>
              </div>

              {/* Progress bar (pour les badges non débloqués) */}
              {!isUnlocked && !isLocked && badge.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Récompense et niveau requis */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center text-yellow-600 font-bold">
                  <Star className="w-4 h-4 mr-1" />
                  {badge.xpReward} XP
                </div>
                
                <div className={`text-sm ${
                  isLocked ? 'text-red-500' : 'text-gray-600'
                }`}>
                  Niveau {badge.requiredLevel}+
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-4 text-center">
                {isUnlocked ? (
                  <div className="flex items-center justify-center text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Débloqué
                  </div>
                ) : isLocked ? (
                  <div className="flex items-center justify-center text-gray-400 font-medium">
                    <Lock className="w-5 h-5 mr-2" />
                    Niveau {badge.requiredLevel} requis
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-blue-600 font-medium">
                    <Target className="w-5 h-5 mr-2" />
                    En progression
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun badge */}
      {filteredBadges.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun badge trouvé</h3>
          <p className="text-gray-600">
            Changez de filtre ou de rôle pour voir d'autres badges.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleBadgesPage;
