import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const TasksPage = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Simuler le chargement des tâches
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données de démonstration
      const mockTasks = [
        {
          id: '1',
          title: 'Intégrer le système de notifications',
          description: 'Ajouter les notifications en temps réel avec Firebase',
          status: 'in-progress',
          priority: 'high',
          xp: 60,
          dueDate: '2025-06-25',
          createdAt: new Date(),
          userId: user?.uid
        },
        {
          id: '2',
          title: 'Optimiser les performances',
          description: 'Réduire le temps de chargement des pages',
          status: 'todo',
          priority: 'medium',
          xp: 40,
          dueDate: '2025-06-27',
          createdAt: new Date(),
          userId: user?.uid
        },
        {
          id: '3',
          title: 'Créer les tests unitaires',
          description: 'Ajouter des tests pour les composants principaux',
          status: 'completed',
          priority: 'low',
          xp: 30,
          completedAt: new Date(),
          userId: user?.uid
        }
      ];
      
      setTasks(mockTasks);
      setLoading(false);
    };

    if (user) {
      loadTasks();
    }
  }, [user]);

  const handleCompleteTask = async (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', completedAt: new Date() }
        : task
    ));
    
    // Simuler gain XP
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      console.log(`🎉 +${task.xp} XP pour avoir terminé: ${task.title}`);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement de vos tâches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header avec statistiques */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <h3 className="text-sm font-medium opacity-90">Total</h3>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
              <h3 className="text-sm font-medium opacity-90">Terminées</h3>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
              <h3 className="text-sm font-medium opacity-90">En cours</h3>
              <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <h3 className="text-sm font-medium opacity-90">XP Gagné</h3>
              <p className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.xp, 0)}
              </p>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Toutes' },
                { key: 'todo', label: 'À faire' },
                { key: 'in-progress', label: 'En cours' },
                { key: 'completed', label: 'Terminées' }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              ➕ Nouvelle tâche
            </button>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📝</span>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'Aucune tâche trouvée' : 'Aucune tâche'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? 'Essayez de modifier votre recherche'
                  : 'Créez votre première tâche pour commencer'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Créer ma première tâche
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? 'Terminée' : 
                         task.status === 'in-progress' ? 'En cours' : 'À faire'}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? '🔴 Urgent' :
                         task.priority === 'medium' ? '🟡 Normal' : '🟢 Faible'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💎 {task.xp} XP</span>
                      {task.dueDate && (
                        <span>📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                      )}
                      {task.completedAt && (
                        <span>✅ Terminée le {task.completedAt.toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        ✓ Terminer
                      </button>
                    )}
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                      ✏️ Modifier
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal création tâche (placeholder) */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-white mb-4">Nouvelle tâche</h2>
              <p className="text-gray-400 mb-4">
                Formulaire de création en cours de développement. 
                Le système de gamification et Firebase sont opérationnels !
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Simuler création d'une tâche
                    const newTask = {
                      id: Date.now().toString(),
                      title: 'Nouvelle tâche de test',
                      description: 'Tâche créée pour démonstration',
                      status: 'todo',
                      priority: 'medium',
                      xp: 40,
                      dueDate: '2025-06-30',
                      createdAt: new Date(),
                      userId: user?.uid
                    };
                    setTasks(prev => [newTask, ...prev]);
                    setShowCreateForm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Créer (Demo)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
