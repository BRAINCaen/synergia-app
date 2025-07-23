// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES SIMPLE ET FONCTIONNELLE - FIX PAGE BLANCHE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Star,
  Calendar,
  User
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';

const TasksPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Tâches d'exemple sécurisées
  const mockTasks = [
    {
      id: 'task_1',
      title: 'Révision du code frontend',
      description: 'Réviser et optimiser le code JavaScript pour améliorer les performances',
      status: 'completed',
      priority: 'high',
      xpReward: 25,
      estimatedTime: '2h',
      assignedTo: user?.email || 'Non assigné',
      dueDate: '2024-01-15',
      category: 'Développement'
    },
    {
      id: 'task_2', 
      title: 'Mise à jour de la documentation',
      description: 'Mettre à jour la documentation utilisateur avec les nouvelles fonctionnalités',
      status: 'in_progress',
      priority: 'medium',
      xpReward: 15,
      estimatedTime: '1h30',
      assignedTo: user?.email || 'Non assigné',
      dueDate: '2024-01-20',
      category: 'Documentation'
    },
    {
      id: 'task_3',
      title: 'Test des nouvelles fonctionnalités',
      description: 'Effectuer des tests complets sur les fonctionnalités récemment développées',
      status: 'todo',
      priority: 'high',
      xpReward: 30,
      estimatedTime: '3h',
      assignedTo: 'Disponible',
      dueDate: '2024-01-25',
      category: 'Tests'
    },
    {
      id: 'task_4',
      title: 'Optimisation de la base de données',
      description: 'Optimiser les requêtes et améliorer les performances de la base de données',
      status: 'todo',
      priority: 'low',
      xpReward: 40,
      estimatedTime: '4h',
      assignedTo: 'Disponible',
      dueDate: '2024-01-30',
      category: 'Backend'
    }
  ];

  useEffect(() => {
    // Simuler le chargement
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
      console.log('✅ [TASKS] Page tâches chargée avec succès');
    }, 500);
  }, []);

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'todo': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ✅ Gestion des Tâches
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Organisez et suivez vos tâches avec le système XP intégré
              </p>
            </div>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Nouvelle tâche
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Terminées</p>
                  <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En cours</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">À faire</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.todo}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des tâches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les tâches</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Aucune tâche ne correspond à votre recherche.' : 'Commencez par créer votre première tâche.'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-[1.01]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status === 'completed' ? 'Terminée' : 
                         task.status === 'in_progress' ? 'En cours' : 'À faire'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Haute' : 
                         task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{task.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{task.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium">
                      {task.category}
                    </span>
                    
                    {task.status !== 'completed' && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        {task.status === 'todo' ? 'Commencer' : 'Continuer'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation retour */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Retour au Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;

// Log de confirmation
console.log('✅ [TASKS] TasksPage simple et fonctionnelle créée');
console.log('🎯 [TASKS] Features: Recherche, Filtres, Statistiques, Design Premium');
console.log('🛡️ [TASKS] Protection: Aucune dépendance externe complexe');
console.log('📊 [TASKS] Données: Tâches d\'exemple sécurisées avec XP');
