// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD PREMIUM AVEC DESIGN HARMONISÉ TEAM PAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Target, 
  Users, 
  Trophy, 
  Clock, 
  Calendar,
  CheckCircle2,
  Rocket,
  Star,
  Brain,
  TrendingUp,
  Bell,
  Plus,
  BarChart3,
  Activity,
  Zap,
  Award
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';

/**
 * 🏠 DASHBOARD PREMIUM REDESIGN
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();
  
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalXP: 0,
    currentStreak: 0,
    teamRanking: 0,
    weeklyProgress: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // Calcul des statistiques
  useEffect(() => {
    if (tasks?.length) {
      const completed = tasks.filter(task => task.status === 'completed').length;
      const totalXP = tasks.reduce((sum, task) => sum + (task.xp || 0), 0);
      
      setStats(prev => ({
        ...prev,
        tasksCompleted: completed,
        totalXP,
        weeklyProgress: Math.min(100, (completed / Math.max(1, tasks.length)) * 100)
      }));
    }
  }, [tasks]);

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Tâches complétées",
      value: stats.tasksCompleted,
      icon: CheckCircle2,
      color: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      label: "XP Total",
      value: stats.totalXP,
      icon: Star,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "Série actuelle",
      value: `${stats.currentStreak} j`,
      icon: Zap,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    },
    {
      label: "Rang équipe",
      value: `#${stats.teamRanking || '-'}`,
      icon: Trophy,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    }
  ];

  // Actions du header
  const headerActions = (
    <>
      <PremiumButton 
        variant="outline" 
        size="md"
        icon={Bell}
      >
        Notifications
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        size="md"
        icon={Plus}
      >
        Nouvelle tâche
      </PremiumButton>
    </>
  );

  return (
    <PremiumLayout
      title="Dashboard"
      subtitle={`Bienvenue ${user?.displayName || 'Utilisateur'} ! Voici votre vue d'ensemble`}
      icon={Home}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 📊 Section métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Productivité"
          value="Élevée"
          icon={Brain}
          color="purple"
          trend="↗️ +15% cette semaine"
        />
        <StatCard
          title="Temps moyen"
          value="2.3h"
          icon={Clock}
          color="blue"
          trend="⏱️ Par tâche"
        />
        <StatCard
          title="Projets actifs"
          value="8"
          icon={Rocket}
          color="green"
          trend="🚀 3 nouveaux ce mois"
        />
        <StatCard
          title="Niveau"
          value="12"
          icon={Award}
          color="yellow"
          trend="🏆 Prochaine étape: 1,250 XP"
        />
      </div>

      {/* 📈 Section principale - 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne principale - Progression et activité */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progression de la semaine */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Progression cette semaine</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.weeklyProgress.toFixed(0)}% complété</span>
              </div>
            </div>
            
            {/* Barre de progression premium */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Objectif hebdomadaire</span>
                <span>{stats.tasksCompleted}/15 tâches</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.weeklyProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
            </div>

            {/* Métriques de performance */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">92%</div>
                <div className="text-sm text-gray-400">Taux de complétion</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">4.8</div>
                <div className="text-sm text-gray-400">Score qualité</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">7</div>
                <div className="text-sm text-gray-400">Jours de série</div>
              </div>
            </div>
          </PremiumCard>

          {/* Activité récente */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Activité récente</h3>
              <PremiumButton variant="ghost" size="sm">
                Voir tout
              </PremiumButton>
            </div>
            
            <div className="space-y-4">
              {[
                { action: "Tâche complétée", item: "Révision code backend", time: "il y a 2h", xp: "+50 XP", type: "complete" },
                { action: "Badge débloqué", item: "Code Master", time: "il y a 4h", xp: "+100 XP", type: "badge" },
                { action: "Projet avancé", item: "Migration API v2", time: "hier", xp: "+75 XP", type: "progress" },
                { action: "Collaboration", item: "Review de Marie", time: "il y a 2j", xp: "+25 XP", type: "collab" }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'complete' ? 'bg-green-400' :
                      activity.type === 'badge' ? 'bg-yellow-400' :
                      activity.type === 'progress' ? 'bg-blue-400' :
                      'bg-purple-400'
                    }`}></div>
                    <div>
                      <div className="text-white font-medium">{activity.action}</div>
                      <div className="text-gray-400 text-sm">{activity.item}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium text-sm">{activity.xp}</div>
                    <div className="text-gray-500 text-xs">{activity.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </PremiumCard>
        </div>

        {/* Colonne secondaire - Tâches à venir et raccourcis */}
        <div className="space-y-6">
          
          {/* Tâches prioritaires */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-4">Priorités du jour</h3>
            <div className="space-y-3">
              {[
                { title: "Finaliser rapport mensuel", priority: "high", deadline: "14:00" },
                { title: "Réunion équipe design", priority: "medium", deadline: "16:30" },
                { title: "Code review PR #245", priority: "high", deadline: "EOD" }
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <div className="text-white font-medium text-sm">{task.title}</div>
                      <div className="text-gray-400 text-xs">{task.deadline}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <PremiumButton variant="outline" size="sm" className="w-full">
                Voir toutes les tâches
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Raccourcis rapides */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              <PremiumButton variant="ghost" size="sm" icon={Plus}>
                Nouvelle tâche
              </PremiumButton>
              <PremiumButton variant="ghost" size="sm" icon={Users}>
                Équipe
              </PremiumButton>
              <PremiumButton variant="ghost" size="sm" icon={BarChart3}>
                Analytics
              </PremiumButton>
              <PremiumButton variant="ghost" size="sm" icon={Calendar}>
                Planning
              </PremiumButton>
            </div>
          </PremiumCard>

          {/* Mini leaderboard */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-4">Top équipe</h3>
            <div className="space-y-3">
              {[
                { name: "Marie D.", xp: 2450, rank: 1 },
                { name: "Vous", xp: 2380, rank: 2, isUser: true },
                { name: "Alex R.", xp: 2290, rank: 3 }
              ].map((member, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded ${
                  member.isUser ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/30'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      member.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                      member.rank === 2 ? 'bg-gray-300 text-gray-800' :
                      'bg-amber-600 text-amber-100'
                    }`}>
                      {member.rank}
                    </div>
                    <span className={`font-medium ${member.isUser ? 'text-blue-400' : 'text-white'}`}>
                      {member.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">{member.xp} XP</span>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumLayout>
  );
};

export default Dashboard;
