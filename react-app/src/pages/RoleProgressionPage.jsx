// ==========================================
// 📁 react-app/src/pages/RoleProgressionPage.jsx
// VERSION SIMPLIFIÉE SANS STORES COMPLEXES
// ==========================================

import React, { useState } from 'react';
import { Crown, Target, TrendingUp, Star, CheckCircle, Users, Award, Zap } from 'lucide-react';

const RoleProgressionPage = () => {
  const [selectedRole, setSelectedRole] = useState('developer');

  // Données locales simples - pas de stores externes
  const mockUserLevel = 2;
  const mockUserXP = 750;

  // Définition des rôles et leurs progressions
  const roles = {
    developer: {
      name: 'Développeur',
      icon: '💻',
      color: 'blue',
      description: 'Maîtrisez l\'art du code et des technologies',
      levels: [
        { 
          level: 1, 
          title: 'Junior Developer', 
          xpRequired: 0,
          skills: ['HTML/CSS', 'JavaScript', 'Git basics'],
          tasks: ['Créer 5 tâches', 'Compléter votre profil', 'Premier commit'],
          rewards: ['Badge Codeur Débutant', '+100 XP']
        },
        { 
          level: 2, 
          title: 'Developer', 
          xpRequired: 500,
          skills: ['React/Vue', 'Node.js', 'Bases de données'],
          tasks: ['10 tâches complétées', '3 projets créés', 'Code review'],
          rewards: ['Badge Développeur', '+250 XP', 'Accès projets avancés']
        },
        { 
          level: 3, 
          title: 'Senior Developer', 
          xpRequired: 1500,
          skills: ['Architecture', 'Mentoring', 'CI/CD'],
          tasks: ['Mentorer un junior', 'Créer une architecture', 'Lead un projet'],
          rewards: ['Badge Senior', '+500 XP', 'Titre Senior']
        }
      ]
    },
    designer: {
      name: 'Designer',
      icon: '🎨',
      color: 'purple',
      description: 'Créez des expériences visuelles exceptionnelles',
      levels: [
        { 
          level: 1, 
          title: 'Junior Designer', 
          xpRequired: 0,
          skills: ['Design basics', 'Figma/Sketch', 'Color theory'],
          tasks: ['Créer 3 mockups', 'Compléter profil créatif', 'Premier design'],
          rewards: ['Badge Designer Débutant', '+100 XP']
        },
        { 
          level: 2, 
          title: 'UI Designer', 
          xpRequired: 400,
          skills: ['Interface design', 'Prototyping', 'User flows'],
          tasks: ['5 interfaces créées', 'Prototype interactif', 'Design system'],
          rewards: ['Badge UI Designer', '+200 XP', 'Outils avancés']
        }
      ]
    },
    manager: {
      name: 'Manager',
      icon: '👔',
      color: 'green',
      description: 'Guidez les équipes vers le succès',
      levels: [
        { 
          level: 1, 
          title: 'Team Member', 
          xpRequired: 0,
          skills: ['Communication', 'Collaboration', 'Organization'],
          tasks: ['Participer activement', 'Aider collègues', 'Être proactif'],
          rewards: ['Badge Team Player', '+100 XP']
        },
        { 
          level: 2, 
          title: 'Team Lead', 
          xpRequired: 600,
          skills: ['Basic leadership', 'Planning', 'Coordination'],
          tasks: ['Coordonner projet', 'Organiser meetings', 'Suivre progress'],
          rewards: ['Badge Team Lead', '+250 XP', 'Responsabilités']
        }
      ]
    }
  };

  // Calculer le niveau actuel de l'utilisateur pour un rôle
  const getCurrentLevel = (roleKey) => {
    const roleLevels = roles[roleKey].levels;
    let currentLevel = 1;
    for (let i = roleLevels.length - 1; i >= 0; i--) {
      if (mockUserXP >= roleLevels[i].xpRequired) {
        currentLevel = roleLevels[i].level;
        break;
      }
    }
    return currentLevel;
  };

  // Calculer le progress vers le niveau suivant
  const getProgressToNext = (roleKey) => {
    const currentLevel = getCurrentLevel(roleKey);
    const roleLevels = roles[roleKey].levels;
    
    const nextLevelData = roleLevels.find(l => l.level === currentLevel + 1);
    if (!nextLevelData) return 100;
    
    const currentLevelData = roleLevels.find(l => l.level === currentLevel);
    const currentLevelXP = currentLevelData?.xpRequired || 0;
    const nextLevelXP = nextLevelData.xpRequired;
    
    const progress = ((mockUserXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const currentRole = roles[selectedRole];
  const currentLevel = getCurrentLevel(selectedRole);
  const progressToNext = getProgressToNext(selectedRole);
  const currentLevelData = currentRole.levels.find(l => l.level === currentLevel);
  const nextLevelData = currentRole.levels.find(l => l.level === currentLevel + 1);

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
            Progression par Rôles
          </h1>
          <p className="text-xl text-white/90">
            Développez vos compétences et progressez dans votre carrière
          </p>
        </div>
      </div>

      {/* Sélection du rôle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choisissez votre parcours</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(roles).map(([key, role]) => {
            const isSelected = selectedRole === key;
            const level = getCurrentLevel(key);
            
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
                    <p className="text-sm text-gray-600">Niveau {level}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{role.description}</p>
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
            <span className="text-4xl mr-4">{currentRole.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentLevelData?.title}</h2>
              <p className="text-gray-600">Niveau {currentLevel} • {currentRole.name}</p>
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
                  <Star className="w-5 h-5 text-purple-500 mr-3" />
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
                <div className="relative">
                  <span className="text-4xl opacity-50">{currentRole.icon}</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-700">{nextLevelData.title}</h2>
                  <p className="text-gray-500">Niveau {nextLevelData.level} • Objectif suivant</p>
                </div>
              </div>

              {/* Progress vers le niveau suivant */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm text-gray-500">{Math.round(progressToNext)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{mockUserXP} XP</span>
                  <span>{nextLevelData.xpRequired} XP requis</span>
                </div>
              </div>

              {/* Tâches à accomplir */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  Tâches à accomplir
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {nextLevelData.tasks.map((task, index) => (
                    <div key={index} className="flex items-center bg-blue-50 rounded-lg p-3">
                      <div className="w-5 h-5 border-2 border-blue-300 rounded mr-3"></div>
                      <span className="text-blue-800">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nouvelles compétences */}
              <div>
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
            </>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Niveau Maximum Atteint !</h3>
              <p className="text-gray-600">
                Félicitations ! Vous avez atteint le niveau maximum pour ce rôle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progression vers le prochain niveau */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">🚀 Continuez votre progression !</h3>
        <p className="mb-4 text-white/90">
          Votre niveau actuel : <strong>Niveau {mockUserLevel}</strong> avec <strong>{mockUserXP} XP</strong>
        </p>
        
        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progression globale</span>
            <span>{mockUserXP} / 1500 XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${(mockUserXP / 1500) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleProgressionPage;
