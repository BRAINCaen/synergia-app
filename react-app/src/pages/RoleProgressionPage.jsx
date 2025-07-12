// ==========================================
// 📁 react-app/src/pages/RoleProgressionPage.jsx
// PAGE PROGRESSION DE RÔLE AVEC LES VRAIS RÔLES SYNERGIA
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
  Calendar
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
          'Possibilité de mentoring'
        ]
      },
      {
        level: 4,
        title: `${baseRole.name} - Expert`,
        xpRequired: 3000,
        maxXp: 4999,
        skills: [
          'Maîtrise complète du domaine',
          'Leadership sur les projets complexes',
          'Innovation et amélioration continue'
        ],
        rewards: [
          'Badge Maître du Domaine',
          'Accès aux projets stratégiques',
          'Participation aux décisions'
        ]
      },
      {
        level: 5,
        title: `${baseRole.name} - Maître`,
        xpRequired: 5000,
        maxXp: Infinity,
        skills: [
          'Expertise reconnue par tous',
          'Capacité à définir les standards',
          'Vision stratégique du rôle'
        ],
        rewards: [
          'Badge Grand Maître',
          'Accès privilégié à tous les projets',
          'Influence sur les orientations stratégiques'
        ]
      }
    ];
  };

  // Simuler les données utilisateur (à remplacer par de vraies données Firebase)
  const getUserRoleData = (roleId) => {
    // Simulation de données utilisateur pour démonstration
    const mockData = {
      gamemaster: { xp: 850, level: 2, tasksCompleted: 15 },
      maintenance: { xp: 1200, level: 2, tasksCompleted: 22 },
      reputation: { xp: 650, level: 2, tasksCompleted: 12 },
      stock: { xp: 300, level: 1, tasksCompleted: 8 },
      organization: { xp: 2100, level: 3, tasksCompleted: 35 },
      content: { xp: 950, level: 2, tasksCompleted: 18 },
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
                        width: `${Math.min((userData.xp % 500) / 5, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progression détaillée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Niveau actuel */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">{currentRole?.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentLevelData?.title}</h2>
              <p className="text-gray-600">Niveau {currentLevel} • {currentRole?.name}</p>
              <p className="text-sm text-blue-600 font-medium">{userRoleData.xp} XP</p>
            </div>
          </div>

          {/* Compétences actuelles */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Compétences maîtrisées
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {currentLevelData?.skills.map((skill, index) => (
                <div key={index} className="flex items-center bg-green-50 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-green-800 font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Récompenses obtenues */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-500" />
              Récompenses obtenues
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {currentLevelData?.rewards.map((reward, index) => (
                <div key={index} className="flex items-center bg-purple-50 rounded-lg p-3">
                  <Trophy className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="text-purple-800 font-medium">{reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Niveau suivant */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {nextLevelData ? (
            <>
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Objectif Suivant</h2>
                  <p className="text-gray-600">{nextLevelData.title}</p>
                </div>
              </div>

              {/* Progression vers le niveau suivant */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progression vers le niveau {nextLevelData.level}</span>
                  <span>{userRoleData.xp} / {nextLevelData.xpRequired} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((userRoleData.xp / nextLevelData.xpRequired) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Plus que {Math.max(0, nextLevelData.xpRequired - userRoleData.xp)} XP à gagner
                </p>
              </div>

              {/* Nouvelles compétences */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-orange-500" />
                  Nouvelles compétences
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {nextLevelData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center bg-orange-50 rounded-lg p-3">
                      <span className="text-orange-800">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nouvelles récompenses */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-orange-500" />
                  Récompenses à débloquer
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {nextLevelData.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center bg-orange-50 rounded-lg p-3">
                      <Lock className="w-5 h-5 text-orange-500 mr-3" />
                      <span className="text-orange-800">{reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Niveau Maximum Atteint !</h3>
              <p className="text-gray-600">
                Félicitations ! Vous avez atteint le niveau maximum pour ce rôle.
              </p>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  🎉 Vous êtes maintenant <strong>Maître {currentRole?.name}</strong> !
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Play className="w-6 h-6 mr-2" />
          Actions recommandées
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left hover:bg-white/30 transition-all">
            <Target className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Voir mes tâches</h4>
            <p className="text-sm text-white/80">Découvrir les missions disponibles</p>
          </button>
          
          <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left hover:bg-white/30 transition-all">
            <Trophy className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Mes badges</h4>
            <p className="text-sm text-white/80">Consulter mes récompenses</p>
          </button>
          
          <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left hover:bg-white/30 transition-all">
            <Users className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Équipe</h4>
            <p className="text-sm text-white/80">Voir la progression de l'équipe</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleProgressionPage;
