// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// Dashboard premium avec design moderne et gradients
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';
import { 
  Plus, 
  CheckSquare, 
  FolderOpen, 
  TrendingUp, 
  Target, 
  Star, 
  Zap, 
  Calendar,
  Clock,
  Trophy,
  Users,
  BarChart3,
  ArrowRight,
  Flame
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks, loadUserTasks } = useTaskStore();
  const { projects, loadUserProjects } = useProjectStore();
  const { level, xp, streak, tasksCompleted, badges } = useGameStore();
  
  const [greeting, setGreeting] = useState('');
  const [quickStats, setQuickStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    totalProjects: 0,
    completedProjects: 0,
    todayTasks: 0
  });

  // Définir le message de salutation
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);

  // Charger les données et calculer les stats
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
      loadUserProjects(user.uid);
    }
  }, [user?.uid, loadUserTasks, loadUserProjects]);

  useEffect(() => {
    const today = new Date().toDateString();
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const activeTasks = tasks.filter(task => task.status !== 'completed');
    const completedProjects = projects.filter(project => project.status === 'completed');
    const todayTasks = tasks.filter(task => {
      const taskDate = task.createdAt?.toDate?.()?.toDateString() || '';
      return taskDate === today;
    });

    setQuickStats({
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      totalProjects: projects.length,
      completedProjects: completedProjects.length,
      todayTasks: todayTasks.length
    });
  }, [tasks, projects]);

  // Obtenir les tâches récentes
  const getRecentTasks = () => {
    return tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  // Obtenir les projets actifs
  const getActiveProjects = () => {
    return projects
      .filter(project => project.status === 'active')
      .slice(0, 3);
  };

  // Calculer le taux de completion
  const getCompletionRate = () => {
    if (quickStats.totalTasks === 0) return 0;
    return Math.round((quickStats.completedTasks / quickStats.totalTasks) * 100);
  };

  // Obtenir le niveau suivant
  const getNextLevelXP = () => {
    return (level + 1) * 100;
  };

  const getXPProgress = () => {
    const currentLevelXP = level * 100;
    const nextLevelXP = getNextLevelXP();
    const progressXP = xp - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    return Math.max(0, Math.min(100, (progressXP / neededXP) * 100));
  };

  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="space-y-8">
      {/* Header avec salutation */}
      <div className="relative">
        {/* Background gradient card */}
        <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {greeting}, {userName} ! 👋
              </h1>
              <p className="text-xl text-blue-200 mb-4">
                Bienvenue dans Synergia v3.5 avec collaboration avancée ! 🚀
              </p>
              
              {/* Stats rapides dans le header */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-100">
                    {new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-300" />
                  <span className="text-green-100">Niveau {level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-yellow-100">{xp} XP</span>
                </div>
              </div>
            </div>
            
            {/* Avatar et niveau */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl mb-3">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-white text-sm font-medium">En ligne</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tâches */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
              {quickStats.totalTasks}
            </div>
          </div>
          <h3 className="text-blue-200 font-medium mb-1">Total Tâches</h3>
          <p className="text-sm text-blue-300/60">
            {quickStats.completedTasks} terminées
          </p>
        </div>

        {/* Projets Actifs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
              {quickStats.totalProjects}
            </div>
          </div>
          <h3 className="text-purple-200 font-medium mb-1">Projets</h3>
          <p className="text-sm text-purple-300/60">
            {projects.filter(p => p.status === 'active').length} actifs
          </p>
        </div>

        {/* Niveau actuel */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
              {level}
            </div>
          </div>
          <h3 className="text-yellow-200 font-medium mb-1">Niveau</h3>
          <p className="text-sm text-yellow-300/60">
            {xp} XP totaux
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
              {streak}
            </div>
          </div>
          <h3 className="text-orange-200 font-medium mb-1">Streak</h3>
          <p className="text-sm text-orange-300/60">
            jours consécutifs
          </p>
        </div>
      </div>

      {/* Progression XP */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Star className="w-5 h-5 text-yellow-400 mr-2" />
            Progression XP
          </h2>
          <span className="text-blue-200">Niveau {level} → {level + 1}</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-white/60">
            <span>{xp} XP</span>
            <span>{getNextLevelXP()} XP</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${getXPProgress()}%` }}
            ></div>
          </div>
          
          <p className="text-center text-white/80 text-sm">
            {getNextLevelXP() - xp} XP pour le niveau suivant
          </p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Zap className="w-5 h-5 text-blue-400 mr-2" />
          Actions Rapides
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nouvelle tâche */}
          <Link
            to="/tasks"
            className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-green-200 font-medium">Nouvelle Tâche</span>
            </div>
            <p className="text-sm text-green-300/60 group-hover:text-green-300/80 transition-colors">
              Créer une nouvelle tâche
            </p>
          </Link>

          {/* Nouveau projet */}
          <Link
            to="/projects"
            className="group bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-xl p-4 hover:from-purple-500/20 hover:to-violet-500/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-purple-200 font-medium">Nouveau Projet</span>
            </div>
            <p className="text-sm text-purple-300/60 group-hover:text-purple-300/80 transition-colors">
              Démarrer un nouveau projet
            </p>
          </Link>

          {/* Voir Analytics */}
          <Link
            to="/analytics"
            className="group bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-orange-200 font-medium">Voir Analytics</span>
            </div>
            <p className="text-sm text-orange-300/60 group-hover:text-orange-300/80 transition-colors">
              Analyser vos performances
            </p>
          </Link>
        </div>
      </div>

      {/* Contenu principal en 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tâches récentes */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Clock className="w-5 h-5 text-blue-400 mr-2" />
              Tâches Récentes
            </h2>
            <Link 
              to="/tasks"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 transition-colors"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {getRecentTasks().length > 0 ? (
              getRecentTasks().map((task) => (
                <div key={task.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${task.status === 'completed' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : task.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }
                        `}>
                          {task.status === 'completed' ? '✅ Terminé' : 
                           task.status === 'in_progress' ? '🔄 En cours' : '📋 À faire'}
                        </span>
                        {task.priority && (
                          <span className={`
                            px-2 py-1 text-xs rounded-full
                            ${task.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              task.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                              task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                              'bg-green-500/20 text-green-300 border border-green-500/30'
                            }
                          `}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">Aucune tâche récente</p>
                <Link 
                  to="/tasks"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block transition-colors"
                >
                  Créer votre première tâche
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Projets actifs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Users className="w-5 h-5 text-purple-400 mr-2" />
              Projets Actifs
            </h2>
            <Link 
              to="/projects"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1 transition-colors"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {getActiveProjects().length > 0 ? (
              getActiveProjects().map((project) => {
                const projectTasks = tasks.filter(task => task.projectId === project.id);
                const completedTasks = projectTasks.filter(task => task.status === 'completed');
                const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
                
                return (
                  <div key={project.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium truncate">
                        {project.title}
                      </h3>
                      <span className="text-purple-300 text-sm">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-white/60 text-sm">
                      {completedTasks.length}/{projectTasks.length} tâches terminées
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">Aucun projet actif</p>
                <Link 
                  to="/projects"
                  className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block transition-colors"
                >
                  Créer votre premier projet
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Système de badges */}
      {badges && badges.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
              Badges Débloqués
            </h2>
            <Link 
              to="/leaderboard"
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center space-x-1 transition-colors"
            >
              <span>Voir classement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.slice(0, 4).map((badge, index) => (
              <div key={index} className="text-center p-4 bg-white/5 rounded-xl border border-yellow-500/20">
                <div className="text-3xl mb-2">{badge.icon || '🏆'}</div>
                <h3 className="text-yellow-200 font-medium text-sm">{badge.name}</h3>
                <p className="text-yellow-300/60 text-xs mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
