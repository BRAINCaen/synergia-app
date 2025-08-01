// ==========================================
// 📁 react-app/src/pages/RoleProgressionPage.jsx
// PAGE PROGRESSION DE RÔLE AVEC LES VRAIS RÔLES SYNERGIA - IMPORTS CORRIGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Star, 
  Award, 
  Zap, 
  CheckCircle, 
  Target,
  TrendingUp,
  Trophy,
  Users,
  Lock,
  Play,
  Calendar,
  BarChart3, // ✅ Import ajouté pour corriger l'erreur
  Activity,
  Clock,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { ESCAPE_GAME_ROLES } from '../core/services/escapeGameRolesService.js';
import { SYNERGIA_ROLES, ROLE_LEVELS } from '../core/services/synergiaRolesService.js';

const RoleProgressionPage = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('gamemaster'); // Premier rôle par défaut
  const [userRoles, setUserRoles] = useState({});
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

  // Données de niveaux étendues pour chaque rôle
  const getRoleLevels = (roleId) => {
    const baseRole = allRoles[roleId];
    if (!baseRole) return [];

    return [
      {
        level: 1,
        title: `${baseRole.name} - Novice`,
        xpRequired: 0,
        maxXp: 499,
        skills: [
          'Bases du métier acquises',
          'Première prise en main des outils',
          'Compréhension des procédures de base'
        ],
        rewards: [
          'Badge Première Mission',
          'Accès aux tâches débutant',
          '+10% XP sur les premières tâches'
        ]
      },
      {
        level: 2,
        title: `${baseRole.name} - Apprenti`,
        xpRequired: 500,
        maxXp: 1499,
        skills: [
          'Autonomie sur les tâches courantes',
          'Maîtrise des outils principaux',
          'Début de spécialisation'
        ],
        rewards: [
          'Badge Montée en Compétence',
          'Accès aux tâches intermédiaires',
          'Déblocage de nouvelles responsabilités'
        ]
      },
      {
        level: 3,
        title: `${baseRole.name} - Compétent`,
        xpRequired: 1500,
        maxXp: 2999,
        skills: [
          'Expertise technique confirmée',
          'Capacité à former les nouveaux',
          'Résolution de problèmes complexes'
        ],
        rewards: [
          'Badge Expert Confirmé',
          'Accès aux tâches avancées',
          'Possibilité de mentorer'
        ]
      },
      {
        level: 4,
        title: `${baseRole.name} - Expert`,
        xpRequired: 3000,
        maxXp: 5999,
        skills: [
          'Maîtrise totale du domaine',
          'Innovation et amélioration des processus',
          'Leadership technique'
        ],
        rewards: [
          'Badge Maître Expert',
          'Accès aux projets spéciaux',
          'Bonus XP permanent +25%'
        ]
      },
      {
        level: 5,
        title: `${baseRole.name} - Maître`,
        xpRequired: 6000,
        maxXp: 9999,
        skills: [
          'Référent dans le domaine',
          'Capacité à définir les standards',
          'Transmission du savoir'
        ],
        rewards: [
          'Badge Maître Reconnu',
          'Participation aux décisions stratégiques',
          'Accès aux formations avancées'
        ]
      }
    ];
  };

  // Simuler des données utilisateur (à remplacer par Firebase)
  const getUserRoleData = (roleId) => {
    const mockData = {
      gamemaster: { xp: 2850, level: 3, tasksCompleted: 42 },
      operator: { xp: 1650, level: 2, tasksCompleted: 28 },
      creator: { xp: 950, level: 2, tasksCompleted: 18 },
      mentoring: { xp: 1800, level: 3, tasksCompleted: 28 },
      partnerships: { xp: 450, level: 1, tasksCompleted: 9 },
      communication: { xp: 1350, level: 2, tasksCompleted: 25 },
      b2b: { xp: 720, level: 2, tasksCompleted: 14 }
    };
    
    return mockData[roleId] || { xp: 0, level: 1, tasksCompleted: 0 };
  };

  // Calculer le niveau actuel basé sur l'XP
  const getCurrentLevel = (roleId) => {
    const userRoleData = getUserRoleData(roleId);
    const levels = getRoleLevels(roleId);
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (userRoleData.xp >= levels[i].xpRequired) {
        return levels[i].level;
      }
    }
    return 1;
  };

  // Obtenir les données du niveau actuel
  const currentRole = allRoles[selectedRole];
  const currentLevel = getCurrentLevel(selectedRole);
  const roleLevels = getRoleLevels(selectedRole);
  const currentLevelData = roleLevels.find(l => l.level === currentLevel);
  const nextLevelData = roleLevels.find(l => l.level === currentLevel + 1);
  const userRoleData = getUserRoleData(selectedRole);

  useEffect(() => {
    // Charger les données utilisateur
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <Crown className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Crown className="w-10 h-10 mr-3" />
            Progression par Rôles Synergia
          </h1>
          <p className="text-xl text-white/90">
            Développez vos compétences dans les métiers de l'escape game
          </p>
        </div>
      </div>

      {/* Sélection du rôle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choisissez votre parcours</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(allRoles).map(([key, role]) => {
            const isSelected = selectedRole === key;
            const level = getCurrentLevel(key);
            const userData = getUserRoleData(key);
            
            return (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{role.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-600">Niveau {level} • {userData.xp} XP</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{role.description}</p>
                
                {/* Barre de progression */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{userData.tasksCompleted} tâches</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(((userData.xp % 1000) / 1000) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Détails du rôle sélectionné */}
      {selectedRole && currentRole && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progression actuelle */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">{currentRole.icon}</span>
                {currentRole.name}
              </h3>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Niveau {currentLevel}</span>
              </div>
            </div>

            {/* Barre de progression principale */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-700">
                  {currentLevelData?.title}
                </span>
                <span className="text-sm text-gray-600">
                  {userRoleData.xp} / {nextLevelData?.xpRequired || 'MAX'} XP
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                  style={{
                    width: nextLevelData 
                      ? `${((userRoleData.xp - currentLevelData.xpRequired) / (nextLevelData.xpRequired - currentLevelData.xpRequired)) * 100}%`
                      : '100%'
                  }}
                >
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {nextLevelData && (
                <p className="text-sm text-gray-600 mt-2">
                  Plus que {nextLevelData.xpRequired - userRoleData.xp} XP pour atteindre le niveau {nextLevelData.level}
                </p>
              )}
            </div>

            {/* Compétences actuelles */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Compétences acquises
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {currentLevelData?.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Récompenses débloquées */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                Récompenses débloquées
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {currentLevelData?.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-700">{reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panneau latéral - Progression et objectifs */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Statistiques
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">XP Total</span>
                  <span className="font-bold text-blue-600">{userRoleData.xp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Niveau Actuel</span>
                  <span className="font-bold text-purple-600">{currentLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tâches Complétées</span>
                  <span className="font-bold text-green-600">{userRoleData.tasksCompleted}</span>
                </div>
              </div>
            </div>

            {/* Prochains objectifs */}
            {nextLevelData && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-600" />
                  Prochain niveau
                </h4>
                
                <div className="mb-4">
                  <h5 className="font-semibold text-gray-800 mb-2">{nextLevelData.title}</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Débloquez de nouvelles compétences et récompenses
                  </p>
                </div>

                <div className="space-y-3">
                  <h6 className="font-medium text-gray-700">Nouvelles compétences :</h6>
                  {nextLevelData.skills.slice(0, 2).map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4 text-gray-400" />
                      {skill}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  Voir les tâches disponibles
                </button>
              </div>
            )}

            {/* Timeline des niveaux */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Parcours de progression
              </h4>
              
              <div className="space-y-3">
                {roleLevels.map((level, index) => {
                  const isCompleted = level.level <= currentLevel;
                  const isCurrent = level.level === currentLevel;
                  
                  return (
                    <div key={level.level} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                      }`}>
                        {level.level}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          isCompleted ? 'text-green-700' : 
                          isCurrent ? 'text-blue-700' : 'text-gray-400'
                        }`}>
                          Niveau {level.level}
                        </div>
                        <div className={`text-xs ${
                          isCompleted ? 'text-green-600' : 
                          isCurrent ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {level.xpRequired} XP requis
                        </div>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleProgressionPage;
