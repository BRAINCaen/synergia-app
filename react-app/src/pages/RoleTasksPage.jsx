// ==========================================
// 📁 react-app/src/pages/RoleTasksPage.jsx
// PAGE INDIVIDUELLE - Tâches spécialisées par rôle
// ==========================================

import React, { useState, useEffect } from 'react';
import { Target, Code, Palette, Users, Clock, Star, Lock, CheckCircle, Plus, Filter } from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore';
import { useGamificationStore } from '../shared/stores/gamificationStore';

const RoleTasksPage = () => {
  const { user } = useAuthStore();
  const { userStats } = useGamificationStore();
  const [selectedRole, setSelectedRole] = useState('developer');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Base de données des tâches spécialisées
  const roleTasks = {
    developer: {
      name: 'Développeur',
      icon: '💻',
      color: 'blue',
      tasks: [
        {
          id: 'dev_1',
          title: 'Mettre en place un système de CI/CD',
          description: 'Configurer une pipeline d\'intégration continue avec GitHub Actions',
          category: 'DevOps',
          difficulty: 'Intermédiaire',
          xpReward: 250,
          timeEstimate: '4-6 heures',
          requiredLevel: 2,
          skills: ['Git', 'GitHub Actions', 'Automatisation'],
          deliverables: ['Fichier .github/workflows', 'Documentation', 'Tests automatisés'],
          status: 'available'
        },
        {
          id: 'dev_2',
          title: 'Optimiser les performances d\'une application React',
          description: 'Analyser et améliorer les performances d\'une application React existante',
          category: 'Performance',
          difficulty: 'Avancé',
          xpReward: 350,
          timeEstimate: '6-8 heures',
          requiredLevel: 3,
          skills: ['React', 'Performance', 'Profiling'],
          deliverables: ['Rapport de performance', 'Code optimisé', 'Métriques avant/après'],
          status: 'available'
        },
        {
          id: 'dev_3',
          title: 'Créer une API RESTful complète',
          description: 'Développer une API avec authentification, validation et documentation',
          category: 'Backend',
          difficulty: 'Intermédiaire',
          xpReward: 300,
          timeEstimate: '8-10 heures',
          requiredLevel: 2,
          skills: ['Node.js', 'Express', 'API Design'],
          deliverables: ['Code API', 'Documentation OpenAPI', 'Tests unitaires'],
          status: 'locked'
        }
      ]
    },
    designer: {
      name: 'Designer',
      icon: '🎨',
      color: 'purple',
      tasks: [
        {
          id: 'des_1',
          title: 'Créer un design system complet',
          description: 'Développer un système de design cohérent avec composants réutilisables',
          category: 'Design System',
          difficulty: 'Avancé',
          xpReward: 400,
          timeEstimate: '12-15 heures',
          requiredLevel: 3,
          skills: ['Design System', 'Figma', 'Composants'],
          deliverables: ['Bibliothèque de composants', 'Guide de style', 'Documentation'],
          status: 'available'
        }
      ]
    },
    manager: {
      name: 'Manager',
      icon: '👔',
      color: 'green',
      tasks: [
        {
          id: 'mgr_1',
          title: 'Organiser un sprint planning efficace',
          description: 'Planifier et animer une session de sprint planning',
          category: 'Agile',
          difficulty: 'Intermédiaire',
          xpReward: 200,
          timeEstimate: '3-4 heures',
          requiredLevel: 2,
          skills: ['Agile', 'Planning', 'Animation'],
          deliverables: ['Plan de sprint', 'Estimation des tâches', 'Objectifs clairs'],
          status: 'available'
        }
      ]
    }
  };

  // Calculer le niveau de l'utilisateur
  const getUserLevel = () => {
    const xp = userStats?.totalXp || 0;
    if (xp >= 3000) return 4;
    if (xp >= 1500) return 3;
    if (xp >= 500) return 2;
    return 1;
  };

  const userLevel = getUserLevel();
  const currentRole = roleTasks[selectedRole];

  // Filtrer les tâches
  const getFilteredTasks = () => {
    let tasks = currentRole.tasks;

    if (filterLevel !== 'all') {
      const levelNum = parseInt(filterLevel);
      tasks = tasks.filter(task => task.requiredLevel === levelNum);
    }

    if (filterStatus !== 'all') {
      tasks = tasks.filter(task => {
        if (filterStatus === 'available') {
          return task.status === 'available' && task.requiredLevel <= userLevel;
        }
        return task.status === filterStatus;
      });
    }

    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  // Déterminer le statut d'une tâche
  const getTaskStatus = (task) => {
    if (task.status === 'completed') return 'completed';
    if (task.requiredLevel > userLevel) return 'locked';
    return 'available';
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <Target className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Target className="w-10 h-10 mr-3" />
            Tâches Spécialisées
          </h1>
          <p className="text-xl text-white/90">
            Développez vos compétences avec des missions ciblées
          </p>
        </div>
      </div>

      {/* Sélection du rôle */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Choisissez votre domaine</h2>
        <div className="flex gap-3">
          {Object.entries(roleTasks).map(([key, role]) => (
            <button
              key={key}
              onClick={() => setSelectedRole(key)}
              className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all ${
                selectedRole === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span className="text-xl mr-2">{role.icon}</span>
              <span className="font-medium">{role.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => {
          const status = getTaskStatus(task);
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const isAvailable = status === 'available';

          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 ${
                isCompleted
                  ? 'border-green-200 bg-green-50'
                  : isAvailable
                  ? 'border-blue-200 hover:border-blue-300 hover:shadow-2xl'
                  : 'border-gray-200 opacity-75'
              }`}
            >
              {/* Header de la tâche */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
                    {isLocked && <Lock className="w-5 h-5 text-gray-400 mr-2" />}
                    {isAvailable && <Target className="w-5 h-5 text-blue-500 mr-2" />}
                    
                    <h3 className={`font-bold text-lg ${
                      isCompleted ? 'text-green-800' : 
                      isLocked ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.difficulty === 'Expert' ? 'bg-red-100 text-red-700' :
                      task.difficulty === 'Avancé' ? 'bg-orange-100 text-orange-700' :
                      task.difficulty === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.difficulty}
                    </span>
                    
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {task.category}
                    </span>
                    
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Niveau {task.requiredLevel}+
                    </span>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="flex items-center text-yellow-600 font-bold">
                    <Star className="w-4 h-4 mr-1" />
                    {task.xpReward} XP
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {task.timeEstimate}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm mb-4 ${
                isLocked ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>

              {/* Compétences requises */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Compétences :</p>
                <div className="flex flex-wrap gap-1">
                  {task.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs ${
                        isLocked 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action button */}
              <div className="pt-4 border-t border-gray-200">
                {isCompleted ? (
                  <div className="flex items-center justify-center text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Tâche complétée
                  </div>
                ) : isLocked ? (
                  <div className="flex items-center justify-center text-gray-400 font-medium">
                    <Lock className="w-5 h-5 mr-2" />
                    Débloquée au niveau {task.requiredLevel}
                  </div>
                ) : (
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Commencer cette tâche
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucune tâche */}
      {filteredTasks.length === 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-600">
            Sélectionnez un autre rôle pour voir les tâches disponibles.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleTasksPage;
