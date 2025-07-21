// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES ULTRA-SÉCURISÉE - VERSION BULLETPROOF
// ==========================================

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, Calendar, Clock, Star, Users, CheckCircle, XCircle } from 'lucide-react';

// ✅ IMPORTS SÉCURISÉS AVEC FALLBACKS
let useAuthStore = null;
let taskAssignmentService = null;
let TaskAssignmentModal = null;
let TaskSubmissionModal = null;

try {
  useAuthStore = require('../shared/stores/authStore.js').useAuthStore;
} catch (error) {
  console.warn('❌ AuthStore non disponible, mode dégradé activé');
  useAuthStore = () => ({ user: null });
}

try {
  taskAssignmentService = require('../core/services/taskAssignmentService.js').taskAssignmentService;
} catch (error) {
  console.warn('❌ TaskAssignmentService non disponible');
  taskAssignmentService = {
    volunteerForTask: async () => ({ success: false, error: 'Service non disponible' }),
    getUserAssignedTasks: async () => []
  };
}

try {
  TaskAssignmentModal = require('../components/tasks/TaskAssignmentModal.jsx').default;
} catch (error) {
  console.warn('❌ TaskAssignmentModal non disponible');
  TaskAssignmentModal = () => null;
}

try {
  TaskSubmissionModal = require('../components/tasks/TaskSubmissionModal.jsx').default;
} catch (error) {
  console.warn('❌ TaskSubmissionModal non disponible'); 
  TaskSubmissionModal = () => null;
}

export default function TasksPage() {
  // ✅ STATES AVEC VALEURS SÉCURISÉES
  const { user } = useAuthStore?.() || { user: null };
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals (seulement ceux qui existent)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ✅ FONCTION SÉCURISÉE POUR NOTIFICATIONS
  const showNotification = (message, type = 'success') => {
    try {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error('❌ Erreur notification:', error);
    }
  };

  useEffect(() => {
    // ✅ CHARGEMENT SÉCURISÉ AVEC VÉRIFICATIONS
    const loadSafely = async () => {
      try {
        if (user?.uid) {
          await loadAllTasks();
          await loadAllUsers();
        } else {
          console.log('⚠️ Utilisateur non connecté, affichage mode démo');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erreur chargement initial:', error);
        setError('Erreur de chargement. Veuillez recharger la page.');
        setLoading(false);
      }
    };

    loadSafely();
  }, [user?.uid]);

  /**
   * 📥 CHARGER TOUTES LES TÂCHES - VERSION SÉCURISÉE
   */
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 [TASKS] Chargement sécurisé des tâches');
      
      // ✅ DONNÉES DÉMO SÉCURISÉES
      const demoAssignedTasks = [
        {
          id: 'demo1',
          title: 'Finaliser le rapport mensuel',
          description: 'Compiler et analyser les données du mois précédent',
          status: 'in_progress',
          priority: 'high',
          xpReward: 50,
          estimatedHours: 3,
          dueDate: { seconds: Date.now() / 1000 + 86400 },
          category: 'Administration'
        },
        {
          id: 'demo2', 
          title: 'Réviser les procédures',
          description: 'Mettre à jour les procédures internes',
          status: 'assigned',
          priority: 'medium',
          xpReward: 30,
          estimatedHours: 2,
          category: 'Documentation'
        }
      ];

      const demoAvailableTasks = [
        {
          id: 'demo3',
          title: 'Organiser l\'événement équipe',
          description: 'Planifier et coordonner le prochain événement d\'équipe',
          status: 'pending',
          priority: 'medium',
          xpReward: 40,
          estimatedHours: 4,
          category: 'Événementiel',
          openToVolunteers: true
        },
        {
          id: 'demo4',
          title: 'Améliorer la documentation utilisateur',
          description: 'Rédiger et améliorer les guides utilisateur',
          status: 'pending',
          priority: 'low',
          xpReward: 25,
          estimatedHours: 2,
          category: 'Documentation',
          openToVolunteers: true
        }
      ];

      setAssignedTasks(demoAssignedTasks);
      setAvailableTasks(demoAvailableTasks);
      
      console.log('✅ [TASKS] Tâches démo chargées avec succès');
      
    } catch (err) {
      console.error('❌ Erreur chargement tâches:', err);
      setError(`Erreur lors du chargement des tâches: ${err?.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 👥 CHARGER TOUS LES UTILISATEURS - VERSION SÉCURISÉE
   */
  const loadAllUsers = async () => {
    try {
      if (!user?.uid) {
        console.log('⚠️ Pas d\'utilisateur pour charger les membres');
        return;
      }

      const demoUsers = [
        { id: user.uid, name: user.displayName || 'Vous', email: user.email || 'vous@exemple.com' },
        { id: 'user2', name: 'Jean Dupont', email: 'jean@exemple.com' },
        { id: 'user3', name: 'Marie Martin', email: 'marie@exemple.com' },
        { id: 'user4', name: 'Pierre Bernard', email: 'pierre@exemple.com' }
      ];
      
      setAllUsers(demoUsers);
      console.log('✅ [USERS] Utilisateurs démo chargés');
      
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
    }
  };

  /**
   * 🎯 SE PORTER VOLONTAIRE - VERSION ULTRA-SÉCURISÉE
   */
  const handleVolunteerForTask = async (task) => {
    try {
      if (!user?.uid) {
        showNotification('Vous devez être connecté pour postuler', 'error');
        return;
      }

      if (!task?.id) {
        showNotification('Tâche invalide', 'error');
        return;
      }

      console.log('🙋‍♂️ [VOLUNTEER] Candidature sécurisée pour:', task.title);
      
      // ✅ VÉRIFICATION SERVICE DISPONIBLE
      if (!taskAssignmentService?.volunteerForTask) {
        showNotification('Service de candidature temporairement indisponible', 'error');
        return;
      }

      const result = await taskAssignmentService.volunteerForTask(task.id, user.uid);
      
      if (result?.success) {
        console.log('✅ [VOLUNTEER] Candidature réussie');
        await loadAllTasks();
        
        const successMessage = result.pending ? 
          `Candidature envoyée pour "${task.title}" ! En attente d'approbation.` :
          `Vous avez été assigné à "${task.title}" !`;
        
        showNotification(successMessage, 'success');
      } else {
        throw new Error(result?.error || 'Erreur de candidature');
      }
      
    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature:', error);
      
      // ✅ GESTION D'ERREUR INTELLIGENTE
      let errorMessage = 'Erreur lors de la candidature';
      
      if (error?.message?.includes('déjà assigné')) {
        errorMessage = 'Vous êtes déjà assigné à cette tâche';
      } else if (error?.message?.includes('déjà postulé')) {
        errorMessage = 'Vous avez déjà postulé pour cette tâche';
      } else if (error?.message?.includes('introuvable')) {
        errorMessage = 'Cette tâche n\'existe plus';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  /**
   * 👁️ VOIR LES DÉTAILS - VERSION SÉCURISÉE
   */
  const handleViewDetails = (task) => {
    try {
      if (!task) {
        showNotification('Tâche invalide', 'error');
        return;
      }
      
      console.log('👁️ [DETAILS] Affichage détails:', task.title);
      showNotification(`Détails de "${task.title}" - Fonctionnalité à implémenter`, 'info');
    } catch (error) {
      console.error('❌ Erreur affichage détails:', error);
      showNotification('Erreur d\'affichage', 'error');
    }
  };

  /**
   * 👥 ASSIGNER DES UTILISATEURS - VERSION SÉCURISÉE
   */
  const handleAssignUsers = (task) => {
    try {
      if (!task) {
        showNotification('Tâche invalide', 'error');
        return;
      }

      if (!TaskAssignmentModal) {
        showNotification('Modal d\'assignation non disponible', 'error');
        return;
      }
      
      console.log('👥 [ASSIGN] Assignation sécurisée:', task.title);
      setSelectedTask(task);
      setShowAssignModal(true);
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      showNotification('Erreur d\'assignation', 'error');
    }
  };

  /**
   * 📤 SOUMETTRE UNE TÂCHE - VERSION SÉCURISÉE
   */
  const handleSubmitTask = (task) => {
    try {
      if (!task) {
        showNotification('Tâche invalide', 'error');
        return;
      }

      if (!TaskSubmissionModal) {
        showNotification('Modal de soumission non disponible', 'error');
        return;
      }
      
      console.log('📤 [SUBMIT] Soumission sécurisée:', task.title);
      setSelectedTask(task);
      setShowSubmitModal(true);
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      showNotification('Erreur de soumission', 'error');
    }
  };

  // ✅ FILTRAGE SÉCURISÉ
  const filteredAssignedTasks = assignedTasks.filter(task => {
    try {
      const matchesSearch = !searchTerm || 
        task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || task?.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    } catch (error) {
      console.error('❌ Erreur filtrage assignées:', error);
      return true;
    }
  });

  const filteredAvailableTasks = availableTasks.filter(task => {
    try {
      const matchesSearch = !searchTerm || 
        task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    } catch (error) {
      console.error('❌ Erreur filtrage disponibles:', error);
      return true;
    }
  });

  // ✅ AFFICHAGE LOADING SÉCURISÉ
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  // ✅ AFFICHAGE ERREUR SÉCURISÉ
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ✅ NOTIFICATION ULTRA-SÉCURISÉE */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : notification.type === 'error'
            ? 'bg-red-100 border border-red-200 text-red-800'
            : 'bg-blue-100 border border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : notification.type === 'error' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
          <p className="text-gray-600">Gérez vos tâches assignées et découvrez de nouvelles opportunités</p>
        </div>
        
        <button
          onClick={() => showNotification('Création de tâche - Fonctionnalité à implémenter', 'info')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle tâche
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="assigned">Assignées</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <div className="flex-1 text-center py-2 bg-white text-blue-600 rounded-md font-medium">
          Mes tâches ({filteredAssignedTasks.length})
        </div>
        <div className="flex-1 text-center py-2 text-gray-600 font-medium">
          Opportunités volontaires ({filteredAvailableTasks.length})
        </div>
      </div>

      {/* Tâches assignées */}
      <div className="space-y-4">
        {filteredAssignedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche assignée</h3>
            <p className="text-gray-600">Vous n'avez aucune tâche assignée pour le moment.</p>
          </div>
        ) : (
          filteredAssignedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isAssigned={true}
              onViewDetails={handleViewDetails}
              onAssignUsers={handleAssignUsers}
              onSubmit={handleSubmitTask}
              onVolunteer={handleVolunteerForTask}
              currentUser={user}
            />
          ))
        )}
      </div>

      {/* Opportunités volontaires */}
      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-green-900">Opportunités Volontaires</h2>
            <p className="text-green-700">C'est l'occasion idéale de contribuer et d'apprendre !</p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAvailableTasks.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">Aucune opportunité disponible</h3>
              <p className="text-green-700">Aucune tâche volontaire n'est disponible actuellement.</p>
            </div>
          ) : (
            filteredAvailableTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isAssigned={false}
                onViewDetails={handleViewDetails}
                onVolunteer={handleVolunteerForTask}
                currentUser={user}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals sécurisés */}
      {TaskAssignmentModal && (
        <TaskAssignmentModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          task={selectedTask}
          onAssignmentSuccess={() => {
            loadAllTasks();
            showNotification('Assignation réussie !', 'success');
          }}
        />
      )}

      {TaskSubmissionModal && (
        <TaskSubmissionModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          task={selectedTask}
          onSubmissionComplete={() => {
            loadAllTasks();
            showNotification('Tâche soumise pour validation !', 'success');
          }}
        />
      )}
    </div>
  );
}

/**
 * 📋 COMPOSANT CARD ULTRA-SÉCURISÉ
 */
function TaskCard({ task, isAssigned, onViewDetails, onAssignUsers, onSubmit, onVolunteer, currentUser }) {
  
  // ✅ FONCTION SÉCURISÉE POUR COULEURS
  const getPriorityColor = (priority) => {
    try {
      const colors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
      };
      return colors[priority] || 'bg-gray-100 text-gray-800';
    } catch (error) {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    try {
      const colors = {
        pending: 'bg-blue-100 text-blue-800',
        assigned: 'bg-purple-100 text-purple-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    } catch (error) {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    try {
      const texts = {
        pending: 'En attente',
        assigned: 'Assignée',
        in_progress: 'En cours',
        completed: 'Terminée',
        cancelled: 'Annulée'
      };
      return texts[status] || 'Inconnu';
    } catch (error) {
      return 'Inconnu';
    }
  };

  // ✅ VÉRIFICATIONS SÉCURISÉES
  if (!task) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.title || 'Titre manquant'}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority || 'normal'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">{task.description || 'Aucune description'}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{task.xpReward || 0} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedHours || 0}h estimées</span>
            </div>
            {task.category && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{task.category}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onViewDetails?.(task)}
          className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
        >
          Détails
        </button>

        {isAssigned ? (
          <>
            {task.status === 'assigned' && (
              <button
                onClick={() => onSubmit?.(task)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Soumettre
              </button>
            )}
            <button
              onClick={() => onAssignUsers?.(task)}
              className="px-3 py-1 text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition-colors text-sm"
            >
              Assigner
            </button>
          </>
        ) : (
          <button
            onClick={() => onVolunteer?.(task)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
          >
            <Star className="w-4 h-4" />
            Se porter volontaire
          </button>
        )}
      </div>
    </div>
  );
}
