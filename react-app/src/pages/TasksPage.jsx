// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PREMIUM AVEC DESIGN HARMONISÉ TEAM PAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Flag,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle,
  Circle,
  AlertCircle,
  Target,
  Users,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';

/**
 * ✅ TASKS PREMIUM REDESIGN
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const { tasks, loadTasks } = useTaskStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // États pour les statistiques
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0,
    todayTasks: 0
  });

  // Calcul des statistiques
  useEffect(() => {
    if (tasks?.length) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in-progress').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Tâches d'aujourd'hui
      const today = new Date().toDateString();
      const todayTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate).toDateString() === today
      ).length;
      
      setTaskStats({ total, completed, inProgress, pending, completionRate, todayTasks });
    }
  }, [tasks]);

  // Chargement initial
  useEffect(() => {
    if (loadTasks) {
      loadTasks();
    }
  }, [loadTasks]);

  // Mock tasks pour la démo
  const mockTasks = [
    {
      id: 1,
      title: 'Finaliser le rapport mensuel',
      description: 'Compiler les données du mois et créer le rapport pour la direction',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-07-15',
      assignee: 'Marie Dupont',
      project: 'Analytics Q3',
      tags: ['rapport', 'urgent'],
      xp: 50,
      estimatedTime: '4h'
    },
    {
      id: 2,
      title: 'Review code PR #245',
      description: 'Vérifier la qualité du code et les tests pour la nouvelle fonctionnalité',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-07-14',
      assignee: 'Alex Rodriguez',
      project: 'API v2',
      tags: ['code-review', 'backend'],
      xp: 25,
      estimatedTime: '1h'
    },
    {
      id: 3,
      title: 'Design nouveaux composants UI',
      description: 'Créer les maquettes pour les nouveaux composants de l\'interface',
      status: 'completed',
      priority: 'medium',
      dueDate: '2025-07-13',
      assignee: 'Sophie Chen',
      project: 'Refonte UI',
      tags: ['design', 'ui'],
      xp: 75,
      estimatedTime: '6h'
    },
    {
      id: 4,
      title: 'Configuration serveur production',
      description: 'Mettre en place l\'environnement de production pour le nouveau service',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-07-16',
      assignee: 'Thomas Martin',
      project: 'Infrastructure',
      tags: ['devops', 'production'],
      xp: 100,
      estimatedTime: '8h'
    },
    {
      id: 5,
      title: 'Tests d\'intégration',
      description: 'Créer et exécuter les tests d\'intégration pour le module de paiement',
      status: 'in-progress',
      priority: 'low',
      dueDate: '2025-07-18',
      assignee: 'Vous',
      project: 'E-commerce',
      tags: ['tests', 'intégration'],
      xp: 40,
      estimatedTime: '3h'
    }
  ];

  // Filtrage et tri des tâches
  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'xp':
        return b.xp - a.xp;
      default:
        return 0;
    }
  });

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Tâches totales",
      value: mockTasks.length,
      icon: CheckSquare,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Complétées",
      value: mockTasks.filter(t => t.status === 'completed').length,
      icon: CheckCircle,
      color: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      label: "En cours",
      value: mockTasks.filter(t => t.status === 'in-progress').length,
      icon: Play,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "Aujourd'hui",
      value: 3,
      icon: Calendar,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    }
  ];

  // Actions du header
  const headerActions = (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          {viewMode === 'grid' ? '📋 Liste' : '⊞ Grille'}
        </button>
      </div>
      <PremiumButton 
        variant="secondary" 
        size="md"
        icon={Filter}
      >
        Filtres
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

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Play className="w-4 h-4" />;
      case 'pending': return <Circle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  return (
    <PremiumLayout
      title="Tâches"
      subtitle="Gérez vos tâches et suivez votre progression"
      icon={CheckSquare}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🎯 Section filtres et recherche */}
      <PremiumCard className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <PremiumSearchBar
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          
          {/* Filtres */}
          <div className="flex items-center space-x-3">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>
            
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dueDate">Date d'échéance</option>
              <option value="priority">Priorité</option>
              <option value="xp">Points XP</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {/* 📊 Section métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Productivité"
          value="Élevée"
          icon={TrendingUp}
          color="purple"
          trend="📈 +18% cette semaine"
        />
        <StatCard
          title="Temps moyen"
          value="2.4h"
          icon={Clock}
          color="blue"
          trend="⏱️ Par tâche"
        />
        <StatCard
          title="XP gagné"
          value="350"
          icon={Star}
          color="yellow"
          trend="⭐ Cette semaine"
        />
        <StatCard
          title="Taux de réussite"
          value="96%"
          icon={Target}
          color="green"
          trend="🎯 Excellent"
        />
      </div>

      {/* 📋 Liste/Grille des tâches */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {viewMode === 'grid' ? (
              // Vue grille
              <PremiumCard className="h-full" hover={true}>
                
                {/* Header de la tâche */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <button className="p-1">
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white truncate">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span>{task.status === 'completed' ? 'Terminée' : task.status === 'in-progress' ? 'En cours' : 'En attente'}</span>
                        </div>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3 h-3" />
                          <span>{task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {task.description}
                </p>

                {/* Métriques */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-400">{task.xp}</div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">{task.estimatedTime}</div>
                    <div className="text-xs text-gray-400">Durée</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-purple-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                    </div>
                    <div className="text-xs text-gray-400">Échéance</div>
                  </div>
                </div>

                {/* Projet et assigné */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>{task.project}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{task.assignee}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {task.tags?.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    {task.status !== 'completed' && (
                      <button className="p-2 text-green-400 hover:text-green-300 transition-colors hover:bg-green-500/10 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500">
                      {task.dueDate ? 
                        Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) > 0 ?
                          `${Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}j restants` :
                          'Échue'
                        : 'Pas d\'échéance'
                      }
                    </span>
                  </div>
                </div>
              </PremiumCard>
            ) : (
              // Vue liste
              <PremiumCard hover={true}>
                <div className="flex items-center space-x-4">
                  <button className="p-1">
                    {getStatusIcon(task.status)}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{task.title}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3 h-3" />
                          <span>{task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}</span>
                        </div>
                        <span className="text-yellow-400 font-medium">{task.xp} XP</span>
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{task.project}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'Pas d\'échéance'}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        {task.status !== 'completed' && (
                          <button className="p-2 text-green-400 hover:text-green-300 transition-colors hover:bg-green-500/10 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            )}
          </motion.div>
        ))}

        {/* Carte "Ajouter une tâche" en mode grille */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: filteredTasks.length * 0.1 }}
          >
            <PremiumCard className="h-full border-dashed border-gray-600 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Nouvelle tâche</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Créez une nouvelle tâche pour votre équipe
                </p>
                <PremiumButton variant="primary" size="sm">
                  Créer
                </PremiumButton>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </div>

      {/* État vide */}
      {filteredTasks.length === 0 && (
        <PremiumCard className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Aucune tâche ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première tâche.'}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
              <PremiumButton 
                variant="secondary" 
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
            <PremiumButton 
              variant="primary" 
              size="md"
              icon={Plus}
            >
              Créer une tâche
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 📊 Section insights en bas */}
      {filteredTasks.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Activité récente */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-4">Activité récente</h3>
            <div className="space-y-3">
              {[
                { action: "Tâche terminée", task: "Design nouveaux composants UI", time: "il y a 2h", user: "Sophie C.", xp: "+75 XP" },
                { action: "Tâche assignée", task: "Configuration serveur production", time: "il y a 4h", user: "Thomas M.", xp: "" },
                { action: "Commentaire ajouté", task: "Review code PR #245", time: "hier", user: "Alex R.", xp: "" },
                { action: "Tâche créée", task: "Tests d'intégration", time: "il y a 2j", user: "Vous", xp: "" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.action.includes('terminée') ? 'bg-green-400' :
                      activity.action.includes('assignée') ? 'bg-blue-400' :
                      activity.action.includes('commentaire') ? 'bg-yellow-400' :
                      'bg-purple-400'
                    }`}></div>
                    <div>
                      <div className="text-white font-medium text-sm">{activity.action}</div>
                      <div className="text-gray-400 text-xs">{activity.task} • {activity.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.xp && (
                      <div className="text-green-400 font-medium text-sm">{activity.xp}</div>
                    )}
                    <div className="text-gray-500 text-xs">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Top contributeurs */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-4">Top contributeurs</h3>
            <div className="space-y-3">
              {[
                { name: "Sophie Chen", tasks: 12, completed: 11, xp: 890 },
                { name: "Vous", tasks: 8, completed: 7, xp: 650, isUser: true },
                { name: "Thomas Martin", tasks: 10, completed: 8, xp: 580 },
                { name: "Alex Rodriguez", tasks: 6, completed: 5, xp: 420 }
              ].map((contributor, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  contributor.isUser ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/30'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-800' :
                      index === 2 ? 'bg-amber-600 text-amber-100' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className={`font-medium ${contributor.isUser ? 'text-blue-400' : 'text-white'}`}>
                        {contributor.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {contributor.completed}/{contributor.tasks} tâches • {Math.round((contributor.completed / contributor.tasks) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-sm">{contributor.xp} XP</div>
                    <div className="text-gray-500 text-xs">Cette semaine</div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
