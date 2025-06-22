// src/components/TaskComponent.jsx - COMPOSANT TÂCHE AVEC GAMIFICATION
import React, { useState, useEffect } from 'react';
import { auth } from '../core/firebase';
import taskService from '../services/taskService';
import gamificationService from '../services/gamificationService';
import Button from '../shared/components/ui/Button';
import Card from '../shared/components/ui/Card';

const TaskComponent = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});
  const [userProgression, setUserProgression] = useState(null);

  useEffect(() => {
    loadUserTasks();
    loadUserProgression();
  }, []);

  const loadUserTasks = async () => {
    try {
      const userTasks = await taskService.getUserTasks();
      setTasks(userTasks);
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
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

  const handleCompleteTask = async (taskId, taskData) => {
    setCompleting(prev => ({ ...prev, [taskId]: true }));
    
    try {
      const result = await taskService.completeTask(taskId, {
        timeSpent: Math.floor(Math.random() * 120) + 30 // Temps simulé
      });

      if (result.success) {
        console.log('✅ Tâche terminée:', result);
        
        // Mettre à jour la liste des tâches
        await loadUserTasks();
        
        // Mettre à jour la progression
        await loadUserProgression();
        
        // Gestion spéciale pour level up
        if (result.gamification.leveledUp) {
          showLevelUpModal(result.gamification.newLevel);
        }
      }
    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
      alert('Erreur lors de la complétion de la tâche');
    } finally {
      setCompleting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const showLevelUpModal = (newLevel) => {
    // Modal de level up (simple)
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-2xl text-white text-center max-w-md mx-4 transform animate-pulse">
        <div class="text-6xl mb-4">🎊</div>
        <h2 class="text-3xl font-bold mb-2">LEVEL UP !</h2>
        <p class="text-xl mb-4">Niveau ${newLevel} atteint !</p>
        <button onclick="this.closest('.fixed').remove()" class="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">
          Fantastique !
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      if (modal.parentNode) modal.remove();
    }, 5000);
  };

  const getDifficultyColor = (complexity) => {
    const colors = {
      'simple': 'text-green-400 bg-green-900/20',
      'medium': 'text-yellow-400 bg-yellow-900/20', 
      'complex': 'text-red-400 bg-red-900/20',
      'expert': 'text-purple-400 bg-purple-900/20'
    };
    return colors[complexity] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'low': '🔵',
      'medium': '🟡', 
      'high': '🔴',
      'urgent': '🚨'
    };
    return icons[priority] || icons.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement des tâches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec progression XP */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">🎯 Mes Tâches</h1>
          
          {userProgression && (
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0">
              <Card.Content className="p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-lg font-bold">Niveau {userProgression.level}</h3>
                    <p className="opacity-90">{userProgression.xp} XP</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl">🏆</div>
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
                </div>
              </Card.Content>
            </Card>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: tasks.length, color: 'blue' },
            { label: 'À faire', value: tasks.filter(t => t.status === 'todo').length, color: 'yellow' },
            { label: 'En cours', value: tasks.filter(t => t.status === 'in_progress').length, color: 'orange' },
            { label: 'Terminées', value: tasks.filter(t => t.status === 'completed').length, color: 'green' }
          ].map((stat) => (
            <Card key={stat.label} className="bg-gray-800">
              <Card.Content className="p-4 text-center">
                <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.filter(task => task.status !== 'completed').map((task) => (
            <Card key={task.id} className="bg-gray-800 hover:bg-gray-750 transition-all">
              <Card.Content className="p-6">
                
                {/* Header de la tâche */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {task.description || 'Aucune description'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(task.complexity)}`}>
                      {task.xpReward || 40} XP
                    </span>
                  </div>
                </div>

                {/* Métadonnées */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                    {task.category || 'Général'}
                  </span>
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    {task.priority} priorité
                  </span>
                  {task.estimatedHours > 0 && (
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                      ~{task.estimatedHours}h
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Créée le {new Date(task.createdAt?.toDate()).toLocaleDateString()}
                  </div>
                  
                  {task.status !== 'completed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCompleteTask(task.id, task)}
                      loading={completing[task.id]}
                      disabled={completing[task.id]}
                      className="min-w-[120px]"
                    >
                      {completing[task.id] ? 'Finalisation...' : `Terminer (+${task.xpReward || 40} XP)`}
                    </Button>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Message si pas de tâches */}
        {tasks.filter(task => task.status !== 'completed').length === 0 && (
          <Card className="bg-gray-800 text-center">
            <Card.Content className="p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Toutes les tâches terminées !
              </h3>
              <p className="text-gray-400">
                Excellent travail ! Vous avez terminé toutes vos tâches.
              </p>
            </Card.Content>
          </Card>
        )}

        {/* Bouton pour créer une nouvelle tâche (exemple) */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => {
              // Logique pour créer une nouvelle tâche
              const newTask = {
                title: `Tâche test ${Date.now()}`,
                description: 'Tâche de démonstration',
                priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                complexity: ['simple', 'medium', 'complex'][Math.floor(Math.random() * 3)],
                category: 'test',
                estimatedHours: Math.floor(Math.random() * 8) + 1
              };
              
              taskService.createTask(newTask)
                .then(() => {
                  console.log('✅ Nouvelle tâche créée');
                  loadUserTasks();
                })
                .catch(console.error);
            }}
          >
            ➕ Créer une tâche de test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskComponent;
