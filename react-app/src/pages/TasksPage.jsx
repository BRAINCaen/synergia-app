// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx  
// SUPPRESSION FAUSSES NOTIFICATIONS COMMENTAIRES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  CheckCircle, 
  Heart, 
  Users, 
  Loader, 
  Clock,
  Filter,
  ChevronDown,
  Send,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Info,
  X  // ✅ Ajout UNIQUEMENT de cette icône pour le bouton fermer
} from 'lucide-react';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import taskService from '../core/services/taskService.js';

// Composants
import TaskForm from '../modules/tasks/TaskForm.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';

/**
 * 🎯 COMPOSANT TASKCARD SANS FAUSSES NOTIFICATIONS
 */
const TaskCard = ({ 
  task, 
  currentUser, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onSubmit,
  onVolunteer,
  isMyTask = false,
  showVolunteerButton = false
}) => {
  const [isVolunteering, setIsVolunteering] = useState(false);

  // Vérifications de permissions
  const isTaskOwner = currentUser && task && task.createdBy === currentUser.uid;
  const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(currentUser.uid);
  
  const canVolunteer = showVolunteerButton && 
    currentUser && 
    task && 
    !isAssignedToMe &&
    task.status !== 'completed' &&
    task.status !== 'validation_pending';

  const handleVolunteer = async () => {
    if (isVolunteering || !onVolunteer) return;
    
    setIsVolunteering(true);
    try {
      await onVolunteer(task.id);
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
    } finally {
      setIsVolunteering(false);
    }
  };

  // Badge de priorité
  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700', 
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || colors.medium}`}>
        {priority || 'medium'}
      </span>
    );
  };

  if (!task) return null;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-all duration-200 shadow-lg relative">
      
      {/* ✅ SUPPRESSION DU BADGE COMMENTAIRES FACTICE */}
      {/* Pas de badge commentaires en haut à droite pour éviter les fausses notifications */}

      {/* En-tête avec titre et statut */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg leading-tight">
            {task.title}
          </h3>
        </div>

        {/* Badges de statut et priorité */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-100 text-green-700' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            task.status === 'validation_pending' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {task.status === 'completed' ? 'Terminée' :
             task.status === 'in_progress' ? 'En cours' :
             task.status === 'validation_pending' ? 'En validation' :
             'À faire'}
          </span>

          {task.priority && <PriorityBadge priority={task.priority} />}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Métadonnées */}
      <div className="space-y-1 mb-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Créé par: {task.creatorName || 'Utilisateur'}</span>
        </div>

        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Assigné à {task.assignedTo.length} personne{task.assignedTo.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {task.xpReward && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🏆 +{task.xpReward} XP</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-600 flex-wrap">
        
        {/* ✅ BOUTON DÉTAILS AVEC INDICATION COMMENTAIRES */}
        <button
          onClick={() => onViewDetails && onViewDetails(task)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
          title="Voir les détails et écrire des commentaires"
        >
          <Eye className="w-4 h-4" />
          Détails
          <MessageCircle className="w-3 h-3 opacity-60" />
        </button>

        {/* Actions propriétaire */}
        {isTaskOwner && (
          <>
            <button
              onClick={() => onEdit && onEdit(task)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            <button
              onClick={() => onDelete && onDelete(task.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </>
        )}

        {/* Bouton volontaire pour tâches disponibles */}
        {canVolunteer && (
          <button
            onClick={handleVolunteer}
            disabled={isVolunteering}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
              isVolunteering 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isVolunteering ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Inscription...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Volontaire
              </>
            )}
          </button>
        )}

        {/* BOUTON SOUMETTRE POUR MES TÂCHES */}
        {isMyTask && isAssignedToMe && task.status !== 'completed' && task.status !== 'validation_pending' && (
          <button
            onClick={() => onSubmit && onSubmit(task)}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            Soumettre
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES AVEC GUIDE COMMENTAIRES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États des tâches avec répartition correcte
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentGuide, setShowCommentGuide] = useState(false);
  
  // États UI
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // États modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 🔄 CHARGER TOUTES LES TÂCHES AVEC RÉPARTITION CORRECTE
   */
  const loadTasks = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement de TOUTES les tâches...');
      
      const allTasks = await taskService.getAllTasks();
      console.log(`📊 TOTAL tâches récupérées: ${allTasks.length}`);

      if (allTasks.length === 0) {
        console.warn('⚠️ Aucune tâche trouvée dans la base');
      }

      // RÉPARTITION CORRECTE DES TÂCHES
      const myTasksArray = [];
      const availableTasksArray = [];
      const otherTasksArray = [];

      allTasks.forEach(task => {
        const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
        const hasAssignees = Array.isArray(task.assignedTo) && task.assignedTo.length > 0;
        const isOpenStatus = !task.status || task.status === 'pending' || task.status === 'todo';

        if (isAssignedToMe) {
          myTasksArray.push(task);
        } else if (!hasAssignees && isOpenStatus) {
          availableTasksArray.push(task);
        } else {
          otherTasksArray.push(task);
        }
      });

      setMyTasks(myTasksArray);
      setAvailableTasks(availableTasksArray);
      setOtherTasks(otherTasksArray);

      console.log('✅ Répartition terminée:', {
        'Mes tâches': myTasksArray.length,
        'Disponibles': availableTasksArray.length,
        'Autres': otherTasksArray.length,
        'Total': allTasks.length
      });

    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      setError('Erreur lors du chargement des tâches: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Chargement initial
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * 🎯 FILTRER LES TÂCHES SELON LES CRITÈRES
   */
  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  };

  // Obtenir les tâches actuelles selon l'onglet
  const getCurrentTasks = () => {
    switch (activeTab) {
      case 'my':
        return getFilteredTasks(myTasks);
      case 'available':
        return getFilteredTasks(availableTasks);
      case 'other':
        return getFilteredTasks(otherTasks);
      default:
        return [];
    }
  };

  /**
   * 📝 GESTIONNAIRES D'ACTIONS
   */
  const handleCreateTask = async (taskData) => {
    setSubmitting(true);
    try {
      await taskService.createTask({
        ...taskData,
        createdBy: user.uid,
        status: 'pending',
        createdAt: new Date()
      });
      setShowCreateModal(false);
      await loadTasks();
    } catch (error) {
      console.error('❌ Erreur création:', error);
      setError('Erreur lors de la création: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async (taskData) => {
    if (!selectedTask) return;
    
    setSubmitting(true);
    try {
      await taskService.updateTask(selectedTask.id, {
        ...taskData,
        updatedAt: new Date()
      });
      setShowCreateModal(false);
      setSelectedTask(null);
      await loadTasks();
    } catch (error) {
      console.error('❌ Erreur édition:', error);
      setError('Erreur lors de la modification: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setError('Erreur lors de la suppression: ' + error.message);
    }
  };

  // GESTIONNAIRE BOUTON DÉTAILS - FONCTIONNEL
  const handleViewDetails = (task, tab = 'details') => {
    console.log('👁️ Ouverture détails pour:', task.title, 'onglet:', tab);
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // GESTIONNAIRE BOUTON SOUMETTRE - FONCTIONNEL  
  const handleSubmitTask = (task) => {
    console.log('📤 Ouverture modal soumission pour:', task.title);
    setSelectedTask(task);
    setShowSubmissionModal(true);
  };

  // SUCCÈS DE SOUMISSION
  const handleSubmissionSuccess = async (result) => {
    try {
      console.log('✅ Soumission réussie:', result);
      setShowSubmissionModal(false);
      setSelectedTask(null);
      await loadTasks();
      alert(`✅ Tâche soumise pour validation !`);
    } catch (error) {
      console.error('❌ Erreur après soumission:', error);
    }
  };

  // Volontariat
  const handleVolunteer = async (taskId) => {
    try {
      const task = availableTasks.find(t => t.id === taskId);
      if (!task) return;

      await taskService.updateTask(taskId, {
        assignedTo: [...(task.assignedTo || []), user.uid],
        status: 'in_progress',
        updatedAt: new Date()
      });

      await loadTasks();
      console.log('✅ Volontariat enregistré');
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      setError('Erreur lors du volontariat: ' + error.message);
    }
  };

  const currentTasks = getCurrentTasks();

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* En-tête */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Tâches</h1>
              <p className="text-gray-400 text-sm">Gérez vos tâches assignées et participez aux projets collaboratifs</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* ✅ BOUTON GUIDE COMMENTAIRES */}
              <button
                onClick={() => setShowCommentGuide(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors"
                title="Comment écrire des commentaires ?"
              >
                <MessageCircle className="w-4 h-4" />
                <Info className="w-4 h-4" />
              </button>

              <button
                onClick={loadTasks}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-200">❌ {error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-300 underline text-sm mt-1"
            >
              Fermer
            </button>
          </div>
        )}

        {/* ✅ GUIDE COMMENTAIRES */}
        {showCommentGuide && (
          <div className="mb-6 bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-blue-300 font-medium text-lg mb-2 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comment écrire des commentaires ?
                </h3>
                <div className="text-blue-200 space-y-2 text-sm">
                  <p><strong>1.</strong> Cliquez sur le bouton "Détails" d'une tâche 👁️</p>
                  <p><strong>2.</strong> Dans le modal qui s'ouvre, cliquez sur l'onglet "Messages"</p>
                  <p><strong>3.</strong> Écrivez votre commentaire dans la zone de texte en bas</p>
                  <p><strong>4.</strong> Cliquez sur "Envoyer" pour publier votre commentaire</p>
                  <p className="italic mt-3">💡 Les commentaires permettent de discuter et collaborer sur les tâches !</p>
                </div>
              </div>
              <button
                onClick={() => setShowCommentGuide(false)}
                className="text-blue-300 hover:text-blue-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ONGLETS AVEC COMPTEURS CORRECTS */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'my'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Mes tâches ({myTasks.length})
            </button>
            
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'available'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className="w-4 h-4" />
              Disponibles ({availableTasks.length})
            </button>
            
            <button
              onClick={() => setActiveTab('other')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'other'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              Autres ({otherTasks.length})
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all" className="text-gray-900">Tous les statuts</option>
            <option value="pending" className="text-gray-900">En attente</option>
            <option value="in_progress" className="text-gray-900">En cours</option>
            <option value="validation_pending" className="text-gray-900">En validation</option>
            <option value="completed" className="text-gray-900">Terminées</option>
          </select>

          {/* Filtre par priorité */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all" className="text-gray-900">Toutes les priorités</option>
            <option value="low" className="text-gray-900">Basse</option>
            <option value="medium" className="text-gray-900">Moyenne</option>
            <option value="high" className="text-gray-900">Haute</option>
            <option value="urgent" className="text-gray-900">Urgente</option>
          </select>
        </div>

        {/* LISTE DES TÂCHES SANS FAUSSES NOTIFICATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-400">
                {activeTab === 'my' && 'Vous n\'avez pas encore de tâches assignées.'}
                {activeTab === 'available' && 'Aucune tâche disponible pour le moment.'}
                {activeTab === 'other' && 'Aucune tâche assignée à d\'autres utilisateurs.'}
              </p>
            </div>
          ) : (
            currentTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                currentUser={user}
                onEdit={(task) => {
                  setSelectedTask(task);
                  setShowCreateModal(true);
                }}
                onDelete={handleDeleteTask}
                onViewDetails={handleViewDetails}
                onSubmit={handleSubmitTask}
                onVolunteer={handleVolunteer}
                isMyTask={activeTab === 'my'}
                showVolunteerButton={activeTab === 'available'}
              />
            ))
          )}
        </div>
      </div>

      {/* MODALS FONCTIONNELS */}
      
      {/* Modal de création/édition */}
      {showCreateModal && (
        <TaskForm
          isOpen={showCreateModal}
          task={selectedTask}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTask(null);
          }}
          onSubmit={selectedTask ? handleEditTask : handleCreateTask}
          submitting={submitting}
        />
      )}

      {/* Modal de détails FONCTIONNEL */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          isOpen={showDetailModal}
          task={selectedTask}
          currentUser={user}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowCreateModal(true);
          }}
          onDelete={() => {
            setShowDetailModal(false);
            handleDeleteTask(selectedTask.id);
          }}
          onSubmit={() => {
            setShowDetailModal(false);
            handleSubmitTask(selectedTask);
          }}
        />
      )}

      {/* Modal de soumission FONCTIONNEL */}
      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          task={selectedTask}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default TasksPage;
