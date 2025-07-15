// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE AVEC IMPORT TASKFORM CORRIGÉ
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
import { taskAssignmentService } from '../core/services/taskAssignmentService.js';
import { taskValidationService } from '../core/services/taskValidationService.js';

// 🔧 CORRECTION : Import corrigé du TaskForm
import TaskForm from '../components/tasks/TaskForm.jsx';

// Modals et composants - Imports directs sans require()
// Pour éviter l'erreur "TypeError: l is not a function"
const TaskSubmissionModal = ({ isOpen, onClose, task, onSubmit }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Soumettre la tâche</h3>
        <p className="text-gray-600 mb-4">
          Soumission de la tâche "{task?.title}" pour validation admin.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onSubmit({ status: 'submitted', submittedAt: new Date() });
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskAssignmentModal = ({ isOpen, onClose, task, onAssignmentSuccess }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Assigner la tâche</h3>
        <p className="text-gray-600 mb-4">
          Assignation de la tâche "{task?.title}" à un membre de l'équipe.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onAssignmentSuccess({ assignedTo: 'user123', assignedAt: new Date() });
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 🎯 PAGE PRINCIPALE DES TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const { 
    tasks, 
    loading, 
    createTask, 
    updateTask, 
    deleteTask, 
    loadTasks,
    getTaskStats 
  } = useTaskStore();

  // États locaux
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState('grid');

  // États des modals
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // États des actions
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Charger les tâches au montage
  useEffect(() => {
    if (user?.uid) {
      loadTasks(user.uid);
    }
  }, [user?.uid, loadTasks]);

  // Filtrage et tri des tâches
  useEffect(() => {
    let filtered = [...tasks];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filtre par priorité
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'xp':
          return (b.xpReward || 0) - (a.xpReward || 0);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority, sortBy]);

  // Statistiques des tâches
  const stats = getTaskStats();

  /**
   * 🔧 GESTION DES ACTIONS
   */
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        title: newTaskTitle,
        description: '',
        status: 'todo',
        priority: 'medium',
        xpReward: 50,
        createdBy: user.uid,
        assignedTo: user.uid
      });

      setNewTaskTitle('');
      setShowQuickCreate(false);
    } catch (error) {
      console.error('Erreur création tâche:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Erreur suppression tâche:', error);
      }
    }
  };

  const handleTaskSubmission = async (submissionData) => {
    try {
      await taskValidationService.submitTaskForValidation(selectedTask.id, submissionData);
      setShowSubmissionModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Erreur soumission tâche:', error);
    }
  };

  const handleTaskAssignment = async (assignmentData) => {
    try {
      await taskAssignmentService.assignTask(selectedTask.id, assignmentData);
      setShowAssignmentModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Erreur assignation tâche:', error);
    }
  };

  const handleTaskFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask({
          ...taskData,
          createdBy: user.uid,
          assignedTo: user.uid
        });
      }
      
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Erreur sauvegarde tâche:', error);
    }
  };

  /**
   * 🎨 COMPOSANTS D'AFFICHAGE
   */
  const TaskCard = ({ task }) => {
    const priorityColors = {
      low: 'border-green-500 text-green-400',
      medium: 'border-yellow-500 text-yellow-400',
      high: 'border-orange-500 text-orange-400',
      urgent: 'border-red-500 text-red-400'
    };

    const statusColors = {
      todo: 'bg-gray-600',
      in_progress: 'bg-blue-600',
      completed: 'bg-green-600',
      blocked: 'bg-red-600'
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-gray-400 text-sm line-clamp-2">{task.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]} text-white`}>
              {task.status}
            </span>
            
            <div className="relative group">
              <button className="p-1 hover:bg-gray-700 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleEditTask(task)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowSubmissionModal(true);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Soumettre
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
              <Flag className="w-3 h-3" />
              <span className="capitalize">{task.priority}</span>
            </div>
            
            {task.dueDate && (
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {task.isRecurring && (
              <div className="flex items-center gap-1 text-blue-400">
                <Clock className="w-3 h-3" />
                <span>Récurrente</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-yellow-400">
            <Trophy className="w-3 h-3" />
            <span>{task.xpReward || 50} XP</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PremiumLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-blue-400" />
              Gestion des Tâches 
              <Zap className="w-6 h-6 text-yellow-400" />
            </h1>
            <p className="text-gray-400 mt-1">
              Fonctionnalités avancées : Upload médias, Assignation équipe, Validation admin
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PremiumButton
              onClick={() => setShowQuickCreate(!showQuickCreate)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Création rapide
            </PremiumButton>

            <PremiumButton
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </PremiumButton>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total des tâches"
            value={stats.total}
            icon={<CheckSquare className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="En cours"
            value={stats.inProgress}
            icon={<Play className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Terminées"
            value={stats.completed}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="XP disponible"
            value={stats.totalXp}
            icon={<Trophy className="w-6 h-6" />}
            color="yellow"
          />
        </div>

        {/* Création rapide */}
        {showQuickCreate && (
          <PremiumCard>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                placeholder="Titre de la nouvelle tâche..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </PremiumCard>
        )}

        {/* Filtres et recherche */}
        <PremiumCard>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <PremiumSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Rechercher des tâches..."
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="blocked">Bloquées</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="urgent">Urgente</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dueDate">Par échéance</option>
                <option value="priority">Par priorité</option>
                <option value="created">Par création</option>
                <option value="xp">Par XP</option>
              </select>
            </div>
          </div>
        </PremiumCard>

        {/* Liste des tâches */}
        <PremiumCard>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Créez votre première tâche pour commencer'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </PremiumCard>
      </div>

      {/* 🔧 MODAL TASKFORM AVEC SYSTÈME RÉCURRENCE */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskFormSubmit}
          initialData={editingTask}
          categories={[]} // À remplir avec les vraies catégories
          projects={[]} // À remplir avec les vrais projets
        />
      )}

      {/* Modals avancées */}
      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleTaskSubmission}
          task={selectedTask}
        />
      )}

      {showAssignmentModal && selectedTask && (
        <TaskAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedTask(null);
          }}
          onAssignmentSuccess={handleTaskAssignment}
          task={selectedTask}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
