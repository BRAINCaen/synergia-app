// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE AVEC TOUTES LES FONCTIONNALITÉS ORIGINALES RESTAURÉES
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

// Modals et composants (imports conditionnels pour éviter les erreurs de build)
let TaskSubmissionModal, TaskAssignmentModal, TaskForm;
try {
  TaskSubmissionModal = require('../components/tasks/TaskSubmissionModal.jsx').default;
  TaskAssignmentModal = require('../components/tasks/TaskAssignmentModal.jsx').default;
  TaskForm = require('../components/forms/TaskForm.jsx').default;
} catch (error) {
  console.warn('Certains composants de modal ne sont pas disponibles:', error.message);
  // Composants fallback simples
  TaskSubmissionModal = ({ isOpen, onClose }) => isOpen ? <div>Modal indisponible</div> : null;
  TaskAssignmentModal = ({ isOpen, onClose }) => isOpen ? <div>Modal indisponible</div> : null;
  TaskForm = ({ isOpen, onClose }) => isOpen ? <div>Formulaire indisponible</div> : null;
}

/**
 * ✅ TASKS PAGE AVEC TOUTES LES FONCTIONNALITÉS
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const { 
    tasks, 
    loading, 
    createTask, 
    updateTask, 
    deleteTask,
    loadUserTasks 
  } = useTaskStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // États pour les statistiques
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
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
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const pending = tasks.filter(t => t.status === 'todo').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setTaskStats({
        total,
        completed,
        inProgress,
        pending,
        completionRate
      });
    }
  }, [tasks]);

  // Filtrage des tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // 🎯 HANDLERS POUR LES ACTIONS DE TÂCHES

  const handleCreateTask = async (taskData) => {
    try {
      await createTask({
        ...taskData,
        userId: user.uid,
        createdBy: user.uid,
        createdAt: new Date(),
        status: 'todo'
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, {
        ...updates,
        updatedAt: new Date()
      });
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('❌ Erreur suppression tâche:', error);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
    }
  };

  const handleSubmitForValidation = (task) => {
    setSelectedTask(task);
    setShowSubmissionModal(true);
  };

  const handleTaskSubmission = async (submissionData) => {
    try {
      console.log('📝 Soumission tâche pour validation:', submissionData);
      
      const result = await taskValidationService.submitTaskForValidation(submissionData);
      
      if (result.success) {
        // Mettre à jour le statut de la tâche
        await updateTask(selectedTask.id, {
          status: 'validation_pending',
          submittedAt: new Date(),
          validationRequestId: result.validationId
        });
        
        alert('✅ Tâche soumise pour validation avec succès !');
        setShowSubmissionModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      alert('❌ Erreur lors de la soumission : ' + error.message);
    }
  };

  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setShowAssignmentModal(true);
  };

  const handleTaskAssignment = async (assignmentData) => {
    try {
      console.log('👥 Assignation tâche:', assignmentData);
      
      const result = await taskAssignmentService.assignTaskToMembers(
        selectedTask.id,
        assignmentData.assignedUserIds,
        user.uid
      );
      
      if (result.success) {
        // Mettre à jour la tâche localement
        await updateTask(selectedTask.id, {
          assignedTo: assignmentData.assignedUserIds,
          isMultipleAssignment: assignmentData.assignedUserIds.length > 1,
          assignmentCount: assignmentData.assignedUserIds.length,
          status: 'assigned',
          updatedAt: new Date()
        });
        
        alert(`✅ Tâche assignée à ${result.assignedCount} personne(s) !`);
        setShowAssignmentModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      alert('❌ Erreur lors de l\'assignation : ' + error.message);
    }
  };

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Total tâches",
      value: taskStats.total,
      icon: CheckSquare,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Complétées",
      value: taskStats.completed,
      icon: CheckCircle,
      color: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      label: "En cours",
      value: taskStats.inProgress,
      icon: Clock,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "Taux réussite",
      value: `${taskStats.completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    }
  ];

  // Actions du header
  const headerActions = (
    <>
      <PremiumButton 
        variant="outline" 
        size="md"
        icon={Filter}
      >
        Filtres
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        size="md"
        icon={Plus}
        onClick={() => setShowTaskForm(true)}
      >
        Nouvelle tâche
      </PremiumButton>
    </>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'in_progress':
        return 'border-blue-500 bg-blue-500/10';
      case 'validation_pending':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'assigned':
        return 'border-purple-500 bg-purple-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: 'À faire',
      in_progress: 'En cours',
      completed: 'Terminée',
      validation_pending: 'En validation',
      assigned: 'Assignée'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'validation_pending':
        return <Upload className="w-4 h-4 text-yellow-400" />;
      case 'assigned':
        return <Users className="w-4 h-4 text-purple-400" />;
      default:
        return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <PremiumLayout
        title="Mes Tâches"
        subtitle="Chargement de vos tâches..."
        icon={CheckSquare}
      >
        <PremiumCard className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de vos tâches...</p>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Mes Tâches"
      subtitle="Gérez efficacement vos tâches et projets"
      icon={CheckSquare}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🔍 Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <PremiumSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher dans vos tâches..."
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Toutes', color: 'bg-gray-600' },
            { key: 'todo', label: 'À faire', color: 'bg-blue-600' },
            { key: 'in_progress', label: 'En cours', color: 'bg-yellow-600' },
            { key: 'completed', label: 'Terminées', color: 'bg-green-600' },
            { key: 'validation_pending', label: 'En validation', color: 'bg-purple-600' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filterStatus === filter.key
                  ? `${filter.color} text-white shadow-lg`
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Grille des tâches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <PremiumCard className={`h-full border-l-4 ${getStatusColor(task.status)}`} hover={true}>
              
              {/* Header de la tâche */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {getStatusIcon(task.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]">
                      {task.title || 'Tâche sans nom'}
                    </h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span>{getStatusLabel(task.status)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {/* Menu déroulant */}
                  <div className="absolute right-0 top-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowTaskForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleSubmitForValidation(task)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                      >
                        <Upload className="w-4 h-4" />
                        Soumettre pour validation
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleAssignTask(task)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assigner à l'équipe
                    </button>
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    
                    {task.status === 'todo' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 w-full text-left"
                      >
                        <Play className="w-4 h-4" />
                        Démarrer
                      </button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-gray-700 w-full text-left"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marquer terminée
                      </button>
                    )}
                    
                    {task.status !== 'todo' && task.status !== 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'todo')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 w-full text-left"
                      >
                        <Target className="w-4 h-4" />
                        Marquer à faire
                      </button>
                    )}
                    
                    <div className="border-t border-gray-700 my-1"></div>
                    
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {task.description || 'Aucune description disponible'}
              </p>

              {/* Informations de la tâche */}
              <div className="space-y-3">
                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      Échéance: {new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {task.assignedTo && task.assignedTo.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {task.isMultipleAssignment ? `${task.assignedTo.length} assignés` : 'Assignée'}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">
                    +{task.xpReward || 50} XP
                  </span>
                </div>
              </div>

              {/* Barre de progression pour tâches multiples */}
              {task.isMultipleAssignment && task.assignments && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progression équipe</span>
                    <span>{task.assignments.filter(a => a.hasSubmitted).length}/{task.assignments.length}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(task.assignments.filter(a => a.hasSubmitted).length / task.assignments.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* État vide */}
      {filteredTasks.length === 0 && !loading && (
        <PremiumCard className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucune tâche trouvée</h3>
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
      {showTaskForm && (
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
      )}

      {/* Modal de soumission pour validation */}
      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          task={selectedTask}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleTaskSubmission}
        />
      )}

      {/* Modal d'assignation multiple */}
      {showAssignmentModal && selectedTask && (
        <TaskAssignmentModal
          isOpen={showAssignmentModal}
          task={selectedTask}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedTask(null);
          }}
          onAssignmentSuccess={handleTaskAssignment}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
