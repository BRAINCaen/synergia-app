// src/components/TaskComponent.jsx - COMPOSANT TÂCHE COMPLET AVEC GAMIFICATION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../core/firebase';
import taskService from '../services/taskService';
import gamificationService from '../services/gamificationService';
import Button from '../shared/components/ui/Button';
import Card from '../shared/components/ui/Card';
import Input from '../shared/components/ui/Input';

const TaskComponent = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});
  const [creating, setCreating] = useState(false);
  const [userProgression, setUserProgression] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskStats, setTaskStats] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    complexity: 'normal',
    category: 'general',
    estimatedHours: 1
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadUserTasks(),
        loadUserProgression(),
        loadTaskStats()
      ]);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTasks = async () => {
    try {
      const userTasks = await taskService.getUserTasks(auth.currentUser.uid);
      setTasks(userTasks);
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
    }
  };

  const loadUserProgression = async () => {
    try {
      const progression = await gamificationService.getUserProgression(auth.currentUser.uid);
      setUserProgression(progression);
    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
    }
  };

  const loadTaskStats = async () => {
    try {
      const stats = await taskService.getTaskStats(auth.currentUser.uid);
      setTaskStats(stats);
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
  };

  const handleCompleteTask = async (taskId, taskData) => {
    setCompleting(prev => ({ ...prev, [taskId]: true }));
    
    try {
      const result = await taskService.completeTask(taskId, {
        timeSpent: Math.floor(Math.random() * 120) + 30 // Temps simulé 30-150 min
      });

      if (result.success) {
        console.log('✅ Tâche terminée:', result);
        
        // Mettre à jour toutes les données
        await loadAllData();
        
        // Gestion spéciale pour level up
        if (result.gamification?.leveledUp) {
          showLevelUpModal(result.gamification.newLevel);
        }
        
        // Afficher les nouveaux badges
        if (result.gamification?.newBadges?.length > 0) {
          showBadgeModal(result.gamification.newBadges);
        }
      }
    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
      alert('Erreur lors de la complétion de la tâche: ' + error.message);
    } finally {
      setCompleting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    setCreating(true);
    
    try {
      const result = await taskService.createTask(newTask);
      
      if (result.success) {
        console.log('✅ Tâche créée:', result);
        
        // Réinitialiser le formulaire
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          complexity: 'normal',
          category: 'general',
          estimatedHours: 1
        });
        setShowCreateForm(false);
        
        // Recharger les tâches
        await loadUserTasks();
        await loadTaskStats();
      }
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert('Erreur lors de la création: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const showLevelUpModal = (newLevel) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn';
    modal.innerHTML = `
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-2xl text-white text-center max-w-md mx-4 transform animate-bounce">
        <div class="text-8xl mb-4 animate-pulse">🎊</div>
        <h2 class="text-4xl font-bold mb-4">LEVEL UP !</h2>
        <p class="text-2xl mb-6">Niveau ${newLevel} atteint !</p>
        <div class="text-lg mb-6 opacity-90">
          Félicitations ! Vous continuez à progresser dans Synergia !
        </div>
        <button onclick="this.closest('.fixed').remove()" class="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors transform hover:scale-105">
          🚀 Fantastique !
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-suppression après 8 secondes
    setTimeout(() => {
      if (modal.parentNode) modal.remove();
    }, 8000);
  };

  const showBadgeModal = (badges) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 rounded-2xl text-white text-center max-w-md mx-4">
        <div class="text-6xl mb-4">🏆</div>
        <h2 class="text-2xl font-bold mb-4">Nouveau Badge !</h2>
        <div class="space-y-2 mb-6">
          ${badges.map(badge => `
            <div class="bg-white/20 rounded-lg p-3">
              <div class="text-2xl mb-1">${badge.icon || '🏆'}</div>
              <div class="font-bold">${badge.name}</div>
              <div class="text-sm opacity-90">${badge.description}</div>
            </div>
          `).join('')}
        </div>
        <button onclick="this.closest('.fixed').remove()" class="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
          Super !
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => {
      if (modal.parentNode) modal.remove();
    }, 6000);
  };

  const filteredTasks = tasks.filter(task => {
    // Filtre par statut
    if (filter === 'todo' && task.status !== 'todo') return false;
    if (filter === 'in_progress' && task.status !== 'in_progress') return false;
    if (filter === 'completed' && task.status !== 'completed') return false;
    if (filter === 'active' && task.status === 'completed') return false;
    
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.category.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const getDifficultyColor = (complexity) => {
    const colors = {
      'simple': 'text-green-400 bg-green-900/20 border-green-500/30',
      'easy': 'text-green-400 bg-green-900/20 border-green-500/30',
      'medium': 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
      'normal': 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
      'complex': 'text-red-400 bg-red-900/20 border-red-500/30',
      'hard': 'text-red-400 bg-red-900/20 border-red-500/30',
      'expert': 'text-purple-400 bg-purple-900/20 border-purple-500/30',
      'very_complex': 'text-purple-400 bg-purple-900/20 border-purple-500/30'
    };
    return colors[complexity] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'low': '🔵',
      'medium': '🟡', 
      'high': '🟠',
      'urgent': '🔴',
      'critical': '🚨'
    };
    return icons[priority] || icons.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-gray-600 text-gray-200',
      'in_progress': 'bg-blue-600 text-blue-100',
      'completed': 'bg-green-600 text-green-100',
      'paused': 'bg-yellow-600 text-yellow-100',
      'cancelled': 'bg-red-600 text-red-100'
    };
    return colors[status] || colors.todo;
  };

  const getXPReward = (complexity) => {
    const rewards = {
      'simple': 20, 'easy': 20,
      'medium': 40, 'normal': 40,
      'complex': 60, 'hard': 60,
      'expert': 100, 'very_complex': 100
    };
    return rewards[complexity] || 40;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg">Chargement des tâches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header avec navigation */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-2xl font-bold text-white">Synergia</span>
              </Link>
              <span className="text-gray-400">→</span>
              <h1 className="text-xl font-bold text-white">🎯 Mes Tâches</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                🏠 Dashboard
              </Link>
              <button
                onClick={() => auth.signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* Widget progression XP */}
        {userProgression && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
              <Card.Content className="p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-2xl font-bold">Niveau {userProgression.level}</h3>
                    <p className="opacity-90 text-lg">{userProgression.xp} XP</p>
                    {userProgression.rank && (
                      <p className="text-sm opacity-75">🏆 Rang: #{userProgression.rank}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl mb-2">🎮</div>
                    <div className="text-sm opacity-75">{userProgression.badges.length} badges</div>
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progression vers niveau {userProgression.level + 1}</span>
                    <span>{userProgression.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${userProgression.progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {userProgression.xpInCurrentLevel} / {userProgression.xpForNextLevel} XP
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: taskStats?.total || 0, color: 'blue', icon: '📋' },
            { label: 'À faire', value: taskStats?.todo || 0, color: 'gray', icon: '⏳' },
            { label: 'En cours', value: taskStats?.inProgress || 0, color: 'yellow', icon: '🔄' },
            { label: 'Terminées', value: taskStats?.completed || 0, color: 'green', icon: '✅' },
            { label: 'XP Gagné', value: taskStats?.totalXPEarned || 0, color: 'purple', icon: '⭐' }
          ].map((stat) => (
            <Card key={stat.label} className="bg-gray-800 hover:bg-gray-750 transition-colors">
              <Card.Content className="p-4 text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Contrôles et filtres */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Bouton créer tâche */}
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nouvelle Tâche</span>
            </Button>
            
            {/* Filtres */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
            >
              <option value="all">Toutes</option>
              <option value="active">Actives</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>
          </div>

          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Formulaire de création de tâche */}
        {showCreateForm && (
          <Card className="bg-gray-800 mb-8">
            <Card.Header>
              <Card.Title>Créer une nouvelle tâche</Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Titre de la tâche"
                    placeholder="Ex: Finaliser le rapport mensuel"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))}
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask(prev => ({...prev, category: e.target.value}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                    >
                      <option value="general">Général</option>
                      <option value="development">Développement</option>
                      <option value="design">Design</option>
                      <option value="testing">Tests</option>
                      <option value="marketing">Marketing</option>
                      <option value="documentation">Documentation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Décrivez la tâche en détail..."
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({...prev, description: e.target.value}))}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priorité
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({...prev, priority: e.target.value}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                    >
                      <option value="low">🔵 Basse</option>
                      <option value="medium">🟡 Moyenne</option>
                      <option value="high">🟠 Haute</option>
                      <option value="urgent">🔴 Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Complexité
                    </label>
                    <select
                      value={newTask.complexity}
                      onChange={(e) => setNewTask(prev => ({...prev, complexity: e.target.value}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                    >
                      <option value="simple">Simple (20 XP)</option>
                      <option value="normal">Normal (40 XP)</option>
                      <option value="complex">Complexe (60 XP)</option>
                      <option value="expert">Expert (100 XP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Temps estimé (heures)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="40"
                      step="0.5"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask(prev => ({...prev, estimatedHours: parseFloat(e.target.value)}))}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={creating}
                    disabled={!newTask.title.trim() || creating}
                  >
                    Créer la tâche (+{getXPReward(newTask.complexity)} XP)
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        )}

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-gray-800 hover:bg-gray-750 transition-all border-l-4 border-l-blue-500">
              <Card.Content className="p-6">
                
                {/* Header de la tâche */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                      <h3 className="text-lg font-semibold text-white">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'todo' ? 'À faire' :
                         task.status === 'in_progress' ? 'En cours' :
                         task.status === 'completed' ? 'Terminée' :
                         task.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {task.description || 'Aucune description'}
                    </p>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(task.complexity)}`}>
                      +{task.xpReward || getXPReward(task.complexity)} XP
                    </span>
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                    📁 {task.category || 'Général'}
                  </span>
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    {getPriorityIcon(task.priority)} {task.priority}
                  </span>
                  <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                    🎯 {task.complexity || 'normal'}
                  </span>
                  {task.estimatedHours > 0 && (
                    <span className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs">
                      ⏱️ ~{task.estimatedHours}h
                    </span>
                  )}
                </div>

                {/* Footer avec actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <div>Créée le {new Date(task.createdAt).toLocaleDateString()}</div>
                    {task.completedAt && (
                      <div>Terminée le {new Date(task.completedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {task.status === 'todo' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => taskService.updateTask(task.id, { status: 'in_progress' }).then(loadUserTasks)}
                      >
                        ▶️ Démarrer
                      </Button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => taskService.updateTask(task.id, { status: 'paused' }).then(loadUserTasks)}
                      >
                        ⏸️ Pause
                      </Button>
                    )}
                    
                    {task.status !== 'completed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompleteTask(task.id, task)}
                        loading={completing[task.id]}
                        disabled={completing[task.id]}
                        className="min-w-[120px]"
                      >
                        {completing[task.id] 
                          ? 'Finalisation...' 
                          : `✅ Terminer (+${task.xpReward || getXPReward(task.complexity)} XP)`
                        }
                      </Button>
                    )}
                    
                    {task.status === 'completed' && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <span>✅ Terminée</span>
                        <span className="text-xs bg-green-900/30 px-2 py-1 rounded">
                          +{task.xpRewarded || task.xpReward || getXPReward(task.complexity)} XP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Message si pas de tâches */}
        {filteredTasks.length === 0 && (
          <Card className="bg-gray-800 text-center">
            <Card.Content className="p-12">
              <div className="text-8xl mb-6">
                {filter === 'completed' ? '🎉' : 
                 searchTerm ? '🔍' : '📋'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {filter === 'completed' ? 'Aucune tâche terminée' :
                 searchTerm ? 'Aucun résultat trouvé' :
                 'Aucune tâche à afficher'}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'completed' ? 'Terminez des tâches pour gagner de l\'XP et débloquer des badges !' :
                 searchTerm ? `Aucune tâche ne correspond à "${searchTerm}"` :
                 'Commencez par créer votre première tâche pour gagner de l\'XP !'}
              </p>
              
              {!searchTerm && !showCreateForm && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Créer ma première tâche</span>
                </Button>
              )}
              
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                >
                  Effacer la recherche
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Bouton retour dashboard */}
        <div className="mt-12 text-center">
          <Link 
            to="/dashboard"
            className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>🏠</span>
            <span>Retour au Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskComponent;
