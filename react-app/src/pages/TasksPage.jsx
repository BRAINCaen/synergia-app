// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES CORRIGÉE - REMPLACE TON FICHIER ENTIER
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Trophy,
  Target,
  UserPlus,
  Send,
  Loader
} from 'lucide-react';

// ✅ IMPORTS CORRIGÉS POUR LES MODALS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore';
import { useTaskStore } from '../shared/stores/taskStore';
import TaskForm from '../modules/tasks/TaskForm'; // Formulaire depuis modules
import { TaskDetailModal } from '../shared/components/ui/ModalWrapper'; // Modal détails depuis ModalWrapper
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal'; // Modal assignation
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal'; // Modal soumission
import { taskService } from '../core/services/taskService';

/**
 * 🛡️ FONCTION DE SÉCURITÉ POUR TÂCHES
 */
const createSafeTask = (task) => {
  if (!task || typeof task !== 'object') {
    console.warn('❌ Tâche invalide:', task);
    return {
      id: `safe-${Date.now()}`,
      title: 'Tâche corrompue',
      description: 'Données endommagées',
      status: 'error',
      priority: 'medium',
      xpReward: 0,
      estimatedHours: 0,
      category: 'Système',
      createdAt: new Date(),
      assignedTo: []
    };
  }

  return {
    id: task.id || `fallback-${Date.now()}`,
    title: task.title || 'Sans titre',
    description: task.description || '',
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    xpReward: task.xpReward || 0,
    estimatedHours: task.estimatedHours || 0,
    category: task.category || 'Général',
    createdAt: task.createdAt || new Date(),
    assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
    dueDate: task.dueDate || null,
    tags: Array.isArray(task.tags) ? task.tags : [],
    projectId: task.projectId || null
  };
};

const sanitizeTaskArray = (tasks) => {
  if (!Array.isArray(tasks)) {
    console.warn('❌ Tasks n\'est pas un array:', tasks);
    return [];
  }
  return tasks.map(createSafeTask);
};

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const { tasks, loading: storeLoading } = useTaskStore();

  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);

  // ✅ ÉTATS POUR LES MODALS CORRIGÉS
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Notification temporaire
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  /**
   * 📊 CHARGEMENT DES DONNÉES SÉCURISÉ
   */
  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ EXTRACTION ROBUSTE DE L'ID UTILISATEUR RÉEL
      let userId = null;
      
      if (user.uid && typeof user.uid === 'string' && user.uid.trim() !== '') {
        userId = user.uid;
      } else if (user.id && typeof user.id === 'string' && user.id.trim() !== '') {
        userId = user.id;
      } else {
        throw new Error('Impossible d\'identifier l\'utilisateur. Veuillez vous reconnecter.');
      }

      console.log('🔄 [TASKS] Chargement tâches utilisateur:', userId);

      // ✅ CHARGEMENT DES VRAIES DONNÉES FIREBASE UNIQUEMENT
      const userAssignedTasks = await taskService.getTasksByUser(userId);
      console.log('✅ [TASKS] Tâches assignées chargées:', userAssignedTasks.length);
      console.log('📋 [DEBUG] Détail tâches assignées:', userAssignedTasks);

      const openTasks = await taskService.getAvailableTasks();
      console.log('✅ [TASKS] Tâches disponibles chargées:', openTasks.length);
      console.log('📋 [DEBUG] Détail tâches disponibles:', openTasks);

      // ✅ UTILISATION DES VRAIES DONNÉES FIREBASE SEULEMENT
      const safeAssignedTasks = sanitizeTaskArray(userAssignedTasks);
      const safeAvailableTasks = sanitizeTaskArray(openTasks);

      setAssignedTasks(safeAssignedTasks);
      setAvailableTasks(safeAvailableTasks);

    } catch (error) {
      console.error('❌ [TASKS] Erreur chargement:', error);
      setError(error.message);
      
      // Arrays vides si erreur - pas de données fictives
      setAssignedTasks([]);
      setAvailableTasks([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ➕ CRÉER UNE NOUVELLE TÂCHE - FONCTION CORRIGÉE
   */
  const handleCreateNewTask = () => {
    console.log('➕ [CREATE] Ouverture formulaire création tâche');
    
    // ✅ DONNÉES INITIALES POUR NOUVELLE TÂCHE
    const userId = user.uid || user.id;
    setEditingTask({
      // Pré-remplir avec l'utilisateur actuel comme créateur et assigné
      createdBy: userId,
      assignedTo: [userId], // S'assigner automatiquement la tâche
      status: 'assigned',
      priority: 'medium',
      title: '',
      description: '',
      category: 'general',
      xpReward: 25,
      estimatedHours: 1,
      openToVolunteers: false
    });
    setShowTaskForm(true);
  };

  /**
   * ✏️ ÉDITER UNE TÂCHE - FONCTION CORRIGÉE
   */
  const handleEditTask = (task) => {
    console.log('✏️ [EDIT] Édition tâche:', task.title);
    setEditingTask(task); // Passer la tâche à éditer
    setShowTaskForm(true); // Ouvrir le modal de formulaire en mode édition
  };

  /**
   * 👁️ VOIR LES DÉTAILS - FONCTION CORRIGÉE
   */
  const handleViewDetails = (task) => {
    console.log('👁️ [DETAILS] Affichage détails tâche:', task.title);
    setSelectedTask(task); // Passer la tâche sélectionnée
    setShowTaskDetail(true); // Ouvrir le modal de détails
  };

  /**
   * 📝 FERMETURE DU FORMULAIRE DE TÂCHE
   */
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    // Recharger les tâches après création/modification
    loadTasks();
  };

  /**
   * 🔄 SOUMISSION RÉUSSIE DU FORMULAIRE
   */
  const handleTaskFormSuccess = (taskData, isEdit) => {
    const action = isEdit ? 'modifiée' : 'créée';
    showNotification(`Tâche "${taskData.title}" ${action} avec succès!`, 'success');
    handleCloseTaskForm();
  };

  /**
   * 🎯 POSTULER POUR UNE TÂCHE VOLONTAIRE
   */
  const handleVolunteerForTask = async (task) => {
    if (!user) {
      showNotification('Vous devez être connecté pour postuler', 'error');
      return;
    }

    try {
      console.log('🎯 [VOLUNTEER] Candidature pour:', task.title);
      
      const result = await taskService.volunteerForTask(task.id, user.id);
      
      if (result.success) {
        const successMessage = result.requiresApproval 
          ? `Candidature envoyée pour "${task.title}" ! En attente d'approbation.`
          : `Vous avez été assigné à "${task.title}" !`;
        
        showNotification(successMessage, 'success');
        loadTasks(); // Recharger les listes
      }
      
    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature:', error);
      
      let errorMessage = 'Erreur lors de la candidature';
      
      if (error.message.includes('déjà assigné')) {
        errorMessage = 'Vous êtes déjà assigné à cette tâche';
      } else if (error.message.includes('déjà postulé')) {
        errorMessage = 'Vous avez déjà postulé pour cette tâche';
      } else if (error.message.includes('introuvable')) {
        errorMessage = 'Cette tâche n\'existe plus';
      } else {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  /**
   * 👥 ASSIGNER DES UTILISATEURS
   */
  const handleAssignUsers = (task) => {
    console.log('👥 [ASSIGN] Assignation utilisateurs:', task.title);
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  /**
   * 📤 SOUMETTRE UNE TÂCHE TERMINÉE
   */
  const handleSubmitTask = (task) => {
    console.log('📤 [SUBMIT] Soumission tâche:', task.title);
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  // Filtrer les tâches avec protection maximale
  const filteredAssignedTasks = sanitizeTaskArray(assignedTasks).filter(task => {
    try {
      const title = task.title || '';
      const description = task.description || '';
      const status = task.status || '';
      
      const matchesSearch = !searchTerm || 
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      
      return matchesSearch && matchesStatus;
    } catch (error) {
      console.error('❌ Erreur filtrage tâche assignée:', error, task);
      return false;
    }
  });

  const filteredAvailableTasks = sanitizeTaskArray(availableTasks).filter(task => {
    try {
      const title = task.title || '';
      const description = task.description || '';
      
      const matchesSearch = !searchTerm || 
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    } catch (error) {
      console.error('❌ Erreur filtrage tâche disponible:', error, task);
      return false;
    }
  });

  // Affichage loading
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

  // Affichage erreur
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
      
      {/* Notification */}
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
        
        {/* ✅ BOUTON CORRIGÉ - Appelle la vraie fonction */}
        <div className="flex gap-2">
          <button
            onClick={handleCreateNewTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle tâche
          </button>
          
          {/* Bouton de rechargement pour diagnostiquer */}
          <button
            onClick={() => {
              console.log('🔄 [MANUAL_RELOAD] Rechargement manuel des tâches...');
              loadTasks();
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Recharger les tâches"
          >
            <Loader className="w-4 h-4" />
          </button>
        </div>
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

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredAssignedTasks.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredAssignedTasks.filter(t => t.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">En cours</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredAssignedTasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Terminées</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredAssignedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">XP Total</p>
            </div>
          </div>
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
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune tâche assignée
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez actuellement aucune tâche assignée. Créez une nouvelle tâche ou explorez les opportunités disponibles.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCreateNewTask}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Créer une tâche
              </button>
              <button
                onClick={() => {
                  // Scroll vers les opportunités volontaires
                  const element = document.querySelector('[data-section="opportunities"]');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Voir les opportunités
              </button>
            </div>
          </div>
        ) : (
          filteredAssignedTasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority === 'high' ? 'Haute' : 
                       task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'completed' ? 'Terminée' :
                       task.status === 'in_progress' ? 'En cours' : 'En attente'}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {task.category && (
                      <span className="flex items-center gap-1">
                        📂 {task.category}
                      </span>
                    )}
                    {task.xpReward > 0 && (
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {task.xpReward} XP
                      </span>
                    )}
                    {task.estimatedHours > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedHours}h
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions corrigées */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(task)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleSubmitTask(task)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Soumettre le travail"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tâches disponibles pour volontaires */}
      <div data-section="opportunities" className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Opportunités de volontariat</h2>
        
        {filteredAvailableTasks.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <UserPlus className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune opportunité disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Il n'y a actuellement aucune tâche ouverte aux volontaires. Les nouvelles opportunités apparaîtront ici.
            </p>
            <p className="text-sm text-purple-600">
              💡 Astuce : Créez des tâches et marquez-les comme "ouvertes aux volontaires" pour que d'autres puissent postuler.
            </p>
          </div>
        ) : (
          filteredAvailableTasks.map((task) => (
            <div key={task.id} className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Volontariat
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {task.xpReward > 0 && (
                      <span className="flex items-center gap-1 text-purple-600 font-medium">
                        <Trophy className="w-4 h-4" />
                        {task.xpReward} XP de récompense
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleVolunteerForTask(task)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Postuler
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ MODALS AJOUTÉS - Utilisation des composants existants */}
      
      {/* Modal création/édition de tâche */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          initialData={editingTask}
          onClose={handleCloseTaskForm}
          onSubmit={handleTaskFormSuccess}
          onSuccess={handleTaskFormSuccess}
        />
      )}

      {/* Modal détails de tâche */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          isOpen={showTaskDetail}
          task={selectedTask}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onEdit={() => {
            setShowTaskDetail(false);
            handleEditTask(selectedTask);
          }}
        />
      )}

      {/* Modal assignation */}
      {showAssignModal && selectedTask && (
        <TaskAssignmentModal
          isOpen={showAssignModal}
          task={selectedTask}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedTask(null);
            showNotification('Assignation réussie!', 'success');
            loadTasks(); // Recharger après assignation
          }}
        />
      )}

      {/* Modal soumission */}
      {showSubmitModal && selectedTask && (
        <TaskSubmissionModal
          isOpen={showSubmitModal}
          task={selectedTask}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedTask(null);
          }}
          onSubmit={() => {
            setShowSubmitModal(false);
            setSelectedTask(null);
            showNotification('Tâche soumise avec succès!', 'success');
            loadTasks(); // Recharger après soumission
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;
