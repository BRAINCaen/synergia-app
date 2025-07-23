// ==========================================
// 📁 react-app/src/pages/RoleProgressionPage.jsx
// PAGE PROGRESSION DES RÔLES - DESIGN PREMIUM
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Star, 
  Lock, 
  Unlock,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Zap,
  Crown,
  Shield,
  Flame,
  BookOpen,
  Users,
  Settings,
  Rocket,
  Brain,
  Heart,
  Eye
} from 'lucide-react';

// Services
import { useAuthStore } from '../shared/stores/authStore.js';

const RoleProgressionPage = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('developer');
  const [userProgress, setUserProgress] = useState({});

  // Définition des rôles disponibles
  const roles = [
    {
      id: 'developer',
      name: 'Développeur',
      icon: '💻',
      color: 'blue',
      description: 'Créer et maintenir des solutions techniques innovantes',
      maxLevel: 10,
      skills: ['Programmation', 'Architecture', 'Tests', 'DevOps']
    },
    {
      id: 'designer',
      name: 'Designer',
      icon: '🎨',
      color: 'purple',
      description: 'Concevoir des expériences utilisateur exceptionnelles',
      maxLevel: 8,
      skills: ['UI/UX', 'Branding', 'Prototypage', 'Research']
    },
    {
      id: 'manager',
      name: 'Manager',
      icon: '👔',
      color: 'green',
      description: 'Diriger des équipes vers le succès',
      maxLevel: 12,
      skills: ['Leadership', 'Stratégie', 'Communication', 'Coaching']
    },
    {
      id: 'analyst',
      name: 'Analyste',
      icon: '📊',
      color: 'yellow',
      description: 'Analyser les données pour prendre des décisions éclairées',
      maxLevel: 9,
      skills: ['Data Analysis', 'Reporting', 'KPIs', 'Business Intelligence']
    },
    {
      id: 'marketer',
      name: 'Marketeur',
      icon: '📢',
      color: 'pink',
      description: 'Promouvoir et développer la notoriété',
      maxLevel: 8,
      skills: ['Marketing Digital', 'SEO/SEM', 'Social Media', 'Content']
    },
    {
      id: 'support',
      name: 'Support',
      icon: '🎧',
      color: 'indigo',
      description: 'Accompagner et satisfaire les utilisateurs',
      maxLevel: 7,
      skills: ['Service Client', 'Résolution', 'Communication', 'Empathie']
    }
  ];

  // Progression utilisateur simulée
  const sampleProgress = {
    developer: {
      currentLevel: 5,
      currentXP: 750,
      nextLevelXP: 1000,
      totalXP: 3250,
      completedChallenges: 23,
      unlockedSkills: ['Programmation', 'Architecture', 'Tests'],
      nextSkill: 'DevOps',
      badges: ['First Code', 'Bug Hunter', 'Code Reviewer'],
      achievements: [
        { id: 1, name: 'Premier commit', completed: true },
        { id: 2, name: '100 lignes de code', completed: true },
        { id: 3, name: 'Code review master', completed: true },
        { id: 4, name: 'Debugger expert', completed: false },
        { id: 5, name: 'Architecture guru', completed: false }
      ]
    },
    designer: {
      currentLevel: 3,
      currentXP: 420,
      nextLevelXP: 600,
      totalXP: 1420,
      completedChallenges: 12,
      unlockedSkills: ['UI/UX', 'Branding'],
      nextSkill: 'Prototypage',
      badges: ['Color Master', 'UX Thinker'],
      achievements: [
        { id: 1, name: 'Premier design', completed: true },
        { id: 2, name: 'Palette parfaite', completed: true },
        { id: 3, name: 'Prototype fonctionnel', completed: false }
      ]
    },
    manager: {
      currentLevel: 2,
      currentXP: 180,
      nextLevelXP: 400,
      totalXP: 580,
      completedChallenges: 6,
      unlockedSkills: ['Leadership'],
      nextSkill: 'Stratégie',
      badges: ['Team Builder'],
      achievements: [
        { id: 1, name: 'Première équipe', completed: true },
        { id: 2, name: 'Réunion productive', completed: false }
      ]
    }
  };

  useEffect(() => {
    setUserProgress(sampleProgress);
  }, []);

  const currentRoleData = roles.find(role => role.id === selectedRole);
  const currentProgress = userProgress[selectedRole] || {};

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        gradient: 'from-blue-500 to-blue-600'
      },
      purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        gradient: 'from-purple-500 to-purple-600'
      },
      green: {
        bg: 'bg-green-500/20',
        border: 'border-green-500/30',
        text: 'text-green-400',
        gradient: 'from-green-500 to-green-600'
      },
      yellow: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      pink: {
        bg: 'bg-pink-500/20',
        border: 'border-pink-500/30',
        text: 'text-pink-400',
        gradient: 'from-pink-500 to-pink-600'
      },
      indigo: {
        bg: 'bg-indigo-500/20',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        gradient: 'from-indigo-500 to-indigo-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const progressPercentage = currentProgress.nextLevelXP ? 
    (currentProgress.currentXP / currentProgress.nextLevelXP) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🎯 Progression des Rôles
          </h1>
          <p className="text-gray-400 text-lg">
            Développez vos compétences et progressez dans différents domaines
          </p>
        </motion.div>

        {/* Sélection des rôles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Choisissez votre rôle</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {roles.map((role) => {
              const colors = getColorClasses(role.color);
              const progress = userProgress[role.id];
              
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    selectedRole === role.id 
                      ? `${colors.bg} ${colors.border} ring-2 ring-${role.color}-500/50` 
                      : 'bg-gray-700/30 border-gray-600 hover:bg-gray-600/30'
                  }`}
                >
                  <div className="text-3xl mb-2">{role.icon}</div>
                  <h3 className={`font-semibold ${selectedRole === role.id ? colors.text : 'text-white'}`}>
                    {role.name}
                  </h3>
                  {progress && (
                    <p className="text-xs text-gray-400 mt-1">
                      Niveau {progress.currentLevel}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Détails du rôle sélectionné */}
        {currentRoleData && (
          <>
            {/* Vue d'ensemble */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <div className="flex items-start gap-6">
                <div className="text-6xl">{currentRoleData.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-white">{currentRoleData.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(currentRoleData.color).bg} ${getColorClasses(currentRoleData.color).text}`}>
                      Niveau {currentProgress.currentLevel || 1}
                    </span>
                  </div>
                  <p className="text-gray-400 text-lg mb-4">{currentRoleData.description}</p>
                  
                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progression vers le niveau suivant</span>
                      <span className="text-white">
                        {currentProgress.currentXP || 0} / {currentProgress.nextLevelXP || 1000} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r ${getColorClasses(currentRoleData.color).gradient} transition-all duration-500`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Compétences */}
                  <div>
                    <h4 className="text-white font-semibold mb-2">Compétences clés</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentRoleData.skills.map((skill) => {
                        const isUnlocked = currentProgress.unlockedSkills?.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                              isUnlocked
                                ? `${getColorClasses(currentRoleData.color).bg} ${getColorClasses(currentRoleData.color).text}`
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Statistiques et succès */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Statistiques */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Statistiques
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className={`text-2xl font-bold ${getColorClasses(currentRoleData.color).text}`}>
                      {currentProgress.totalXP || 0}
                    </div>
                    <div className="text-gray-400 text-sm">XP Total</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {currentProgress.completedChallenges || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Défis Réussis</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {currentProgress.badges?.length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Badges</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-gray-400 text-sm">Progression</div>
                  </div>
                </div>
              </motion.div>

              {/* Succès */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Succès Récents
                </h3>
                
                <div className="space-y-3">
                  {currentProgress.achievements?.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        achievement.completed 
                          ? 'bg-green-500/20 border border-green-500/30' 
                          : 'bg-gray-700/30'
                      }`}
                    >
                      {achievement.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={achievement.completed ? 'text-white' : 'text-gray-400'}>
                        {achievement.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Prochaines étapes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                Prochaines Étapes
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Objectifs Recommandés</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span className="text-white">Débloquer : {currentProgress.nextSkill}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                      <Star className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Atteindre le niveau {(currentProgress.currentLevel || 1) + 1}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <Award className="w-5 h-5 text-green-400" />
                      <span className="text-white">Gagner 3 nouveaux badges</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Défis Disponibles</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="text-white font-medium">Défi Sprint</div>
                          <div className="text-gray-400 text-sm">+150 XP</div>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-white font-medium">Défi Collaboration</div>
                          <div className="text-gray-400 text-sm">+200 XP</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleProgressionPage;
