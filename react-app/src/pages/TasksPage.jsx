// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE CORRIGÉE - SANS require() 
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Target,
  Clock,
  Star,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Upload,
  Camera,
  Video,
  UserPlus,
  Share,
  Trophy,
  Zap
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTaskStore } from '../shared/stores/taskStore.js';

// ✅ COMPOSANTS FALLBACK SIMPLES (sans require)
const TaskSubmissionModal = ({ isOpen, onClose, task, onSubmit }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Soumettre la tâche</h3>
        <p className="text-gray-300 mb-4">{task?.title}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => onSubmit && onSubmit({})}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Soumettre
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskAssignmentModal = ({ isOpen, onClose, task, onAssignmentSuccess }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Assigner la tâche</h3>
        <p className="text-gray-300 mb-4">{task?.title}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => onAssignmentSuccess && onAssignmentSuccess()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Assigner
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskForm = ({ isOpen, onClose, task, onSave }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave && onSave({ title: title.trim(), description: description.trim() });
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">
          {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Titre de la tâche..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description de la tâche..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {task ? 'Modifier' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 📋 TASKS PAGE AVEC TOUTES LES FONCTIONNALITÉS
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const { tasks, loading, createTask, updateTask, deleteTask, loadUserTasks } = useTaskStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // États pour les statistiques
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completionRate: 0
  });

  // Charger les tâches
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
    }
  }, [user?.uid, loadUserTasks]);

  // Calcul des statistiques
  useEffect(() => {
    if (tasks?.length) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      setTaskStats({
        total,
        completed,
        pending,
        inProgress,
        completionRate
      });
    }
  }, [tasks]);

  // Filtrer les tâches
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  // Handlers
  const handleCreateTask = async (taskData) => {
    if (!user?.uid) return;
    
    try {
      await createTask({
        ...taskData,
        userId: user.uid,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString()
      });
      console.log('✅ Tâche créée avec succès');
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      console.log('✅ Tâche mise à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId);
        console.log('✅ Tâche supprimée avec succès');
      } catch (error) {
        console.error('❌ Erreur suppression tâche:', error);
      }
    }
  };

  const handleTaskSubmission = async (submissionData) => {
    console.log('📤 Soumission de tâche:', submissionData);
    setShowSubmissionModal(false);
    setSelectedTask(null);
  };

  const handleTaskAssignment = () => {
    console.log('👥 Assignation de tâche');
    setShowAssignmentModal(false);
    setSelectedTask(null);
  };

  // Statistiques pour le header
  const headerStats = [
    { label: "Total", value: taskStats.total, icon: CheckSquare, color: "text-blue-400" },
    { label: "Terminées", value: taskStats.completed, icon: CheckCircle, color: "text-green-400" },
    { label: "En cours", value: taskStats.inProgress, icon: Clock, color: "text-yellow-400" },
    { label: "Taux", value: `${taskStats.completionRate}%`, icon: TrendingUp, color: "text-purple-400" }
  ];

  // Actions du header
  const headerActions = (
    <>
      <PremiumButton variant="secondary" icon={Filter}>
        Filtres
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={Plus}
        onClick={() => setShowTaskForm(true)}
      >
        Nouvelle tâche
      </PremiumButton>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Chargement des tâches...</h2>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout
      title="Gestion des Tâches"
      subtitle="Organisez et suivez toutes vos tâches"
      icon={CheckSquare}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2">
          <PremiumSearchBar
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={setSearchTerm}
            icon={Search}
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
          </select>
        </div>
        
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
      </div>

      {/* 📋 LISTE DES TÂCHES */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PremiumCard className="hover:shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`
                      px-2 py-1 text-xs rounded-full font-medium
                      ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'}
                    `}>
                      {task.status === 'completed' ? 'Terminée' :
                       task.status === 'in_progress' ? 'En cours' : 'En attente'}
                    </span>
                    
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {task.createdAt ? 
                          new Date(task.createdAt).toLocaleDateString() : 
                          'Récent'
                        }
                      </span>
                    </div>
                    
                    <div className={`
                      flex items-center space-x-1
                      ${task.priority === 'high' ? 'text-red-400' :
                        task.priority === 'medium' ? 'text-yellow-400' :
                        'text-green-400'}
                    `}>
                      <Target className="w-4 h-4" />
                      <span>
                        {task.priority === 'high' ? 'Haute' :
                         task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowSubmissionModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 p-1 rounded"
                      title="Soumettre"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowTaskForm(true);
                      }}
                      className="text-green-400 hover:text-green-300 p-1 rounded"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <PremiumCard className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Aucune tâche trouvée' : 'Aucune tâche'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucune tâche ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première tâche.'}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || filterStatus !== 'all') && (
              <PremiumButton 
                variant="secondary" 
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
            <PremiumButton 
              variant="primary" 
              size="md"
              icon={Plus}
              onClick={() => setShowTaskForm(true)}
            >
              Créer une tâche
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 📝 MODALS */}
      
      {/* Modal de création/édition de tâche */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={editingTask ? 
          (data) => handleUpdateTask(editingTask.id, data) : 
          handleCreateTask
        }
      />

      {/* Modal de soumission pour validation */}
      <TaskSubmissionModal
        isOpen={showSubmissionModal}
        task={selectedTask}
        onClose={() => {
          setShowSubmissionModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleTaskSubmission}
      />

      {/* Modal d'assignation multiple */}
      <TaskAssignmentModal
        isOpen={showAssignmentModal}
        task={selectedTask}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedTask(null);
        }}
        onAssignmentSuccess={handleTaskAssignment}
      />
    </PremiumLayout>
  );
};

export default TasksPage;
