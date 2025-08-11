// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// CORRECTION EXPORT PAR DÉFAUT - FIX BUILD ERROR
// ==========================================

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  RefreshCw,
  AlertTriangle,
  Trophy,
  Clock,
  User,
  Loader
} from 'lucide-react';

// Imports services
import { taskService } from '../core/services/taskService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// ✅ IMPORT CONDITIONNEL DU MODAL CORRIGÉ
const NewTaskModal = React.lazy(() => import('../components/tasks/NewTaskModal.jsx'));

// Import des composants avec fallback
const TaskCard = React.lazy(() => import('../modules/tasks/TaskCard.jsx'));

/**
 * 📋 PAGE DES TÂCHES PRINCIPALE - VERSION CORRIGÉE
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // 📊 États principaux
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // 🎨 États UI
  const [activeTab, setActiveTab] = useState('my');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // 📝 États modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // 📊 États calculés
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);

  /**
   * 🔄 CHARGEMENT INITIAL
   */
  useEffect(() => {
    loadTasks();
  }, [user]);

  /**
   * 📥 CHARGER TOUTES LES TÂCHES
   */
  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('📥 [TASKS_PAGE] Chargement des tâches...');
      
      const allTasks = await taskService.getAllTasks();
      
      console.log(`📊 [TASKS_PAGE] ${allTasks.length} tâches récupérées`);
      
      // Categoriser les tâches
      const userTasks = allTasks.filter(task => 
        Array.isArray(task.assignedTo) ? task.assignedTo.includes(user.uid) : 
        task.assignedTo === user.uid || 
        task.createdBy === user.uid
      );
      
      const openTasks = allTasks.filter(task => 
        task.openToVolunteers && 
        task.status !== 'completed' &&
        !userTasks.find(ut => ut.id === task.id)
      );
      
      const remainingTasks = allTasks.filter(task => 
        !userTasks.find(ut => ut.id === task.id) &&
        !openTasks.find(ot => ot.id === task.id)
      );
      
      setTasks(allTasks);
      setMyTasks(userTasks);
      setAvailableTasks(openTasks);
      setOtherTasks(remainingTasks);
      
      console.log('✅ [TASKS_PAGE] Tâches categorisées:', {
        myTasks: userTasks.length,
        available: openTasks.length,
        other: remainingTasks.length
      });
      
    } catch (error) {
      console.error('❌ [TASKS_PAGE] Erreur chargement:', error);
      setError('Erreur lors du chargement des tâches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 FILTRER LES TÂCHES
   */
  const getFilteredTasks = (tasksList) => {
    return tasksList.filter(task => {
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
   * 📝 GESTIONNAIRE CRÉATION TÂCHE CORRIGÉ
   */
  const handleCreateTask = async (taskData) => {
    setSubmitting(true);
    setError('');
    
    try {
      console.log('📝 [TASKS_PAGE] Création tâche demandée...');
      console.log('📝 [TASKS_PAGE] Données reçues:', taskData);
      console.log('📝 [TASKS_PAGE] Utilisateur:', user?.uid);
      
      // ✅ VÉRIFICATION UTILISATEUR OBLIGATOIRE
      if (!user || !user.uid) {
        throw new Error('Utilisateur non connecté. Veuillez vous reconnecter.');
      }
      
      // ✅ IMPORT DYNAMIQUE DU SERVICE CORRIGÉ
      const { createTaskSafely } = await import('../core/services/taskCreationFix.js');
      
      // ✅ UTILISER LE SERVICE CORRIGÉ
      const result = await createTaskSafely(taskData, user);
      
      if (result.success) {
        console.log('✅ [TASKS_PAGE] Tâche créée avec succès:', result.id);
        
        // Fermer le modal
        setShowCreateModal(false);
        
        // Recharger les tâches
        await loadTasks();
        
        // Notification de succès
        console.log('✅ Tâche créée:', result.task.title);
        
      } else {
        console.error('❌ [TASKS_PAGE] Erreur création:', result.error);
        setError(result.message || 'Erreur lors de la création');
      }
      
    } catch (error) {
      console.error('❌ [TASKS_PAGE] Erreur gestionnaire:', error);
      setError('Erreur lors de la création: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 📝 GESTIONNAIRE ÉDITION TÂCHE CORRIGÉ
   */
  const handleEditTask = async (taskData) => {
    if (!selectedTask) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      console.log('📝 [TASKS_PAGE] Édition tâche demandée...');
      console.log('📝 [TASKS_PAGE] Tâche ID:', selectedTask.id);
      console.log('📝 [TASKS_PAGE] Nouvelles données:', taskData);
      
      // ✅ VÉRIFICATION UTILISATEUR
      if (!user || !user.uid) {
        throw new Error('Utilisateur non connecté. Veuillez vous reconnecter.');
      }
      
      // ✅ UTILISER LE SERVICE STANDARD POUR L'ÉDITION
      await taskService.updateTask(selectedTask.id, {
        ...taskData,
        updatedAt: new Date(),
        updatedBy: user.uid // Ajouter qui a modifié
      });
      
      console.log('✅ [TASKS_PAGE] Tâche modifiée avec succès');
      
      // Fermer le modal
      setShowCreateModal(false);
      setSelectedTask(null);
      
      // Recharger les tâches
      await loadTasks();
      
    } catch (error) {
      console.error('❌ [TASKS_PAGE] Erreur édition:', error);
      setError('Erreur lors de la modification: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 📝 GESTIONNAIRE SUPPRESSION TÂCHE CORRIGÉ
   */
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      console.log('🗑️ [TASKS_PAGE] Suppression tâche:', taskId);
      
      // ✅ VÉRIFICATION UTILISATEUR
      if (!user || !user.uid) {
        throw new Error('Utilisateur non connecté. Veuillez vous reconnecter.');
      }
      
      await taskService.deleteTask(taskId);
      
      console.log('✅ [TASKS_PAGE] Tâche supprimée avec succès');
      
      // Recharger les tâches
      await loadTasks();
      
    } catch (error) {
      console.error('❌ [TASKS_PAGE] Erreur suppression:', error);
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
      console.error('❌ Erreur post-soumission:', error);
    }
  };

  // 🎨 AFFICHAGE LOADING
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement des tâches...
          </h3>
          <p className="text-gray-600">
            Récupération des données depuis Firebase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      {/* 📊 HEADER */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gestion des Tâches
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Organisez et suivez vos tâches
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Bouton Refresh */}
              <button
                onClick={loadTasks}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              {/* Bouton Nouvelle Tâche */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Mes tâches</p>
                  <p className="text-2xl font-bold">{myTasks.length}</p>
                </div>
                <User className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Disponibles</p>
                  <p className="text-2xl font-bold">{availableTasks.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Autres</p>
                  <p className="text-2xl font-bold">{otherTasks.length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-96"
              />
            </div>
            
            {/* Filtres */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Terminé</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>
          
          {/* Vue */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1">
          {[
            { id: 'my', label: 'Mes tâches', count: myTasks.length },
            { id: 'available', label: 'Disponibles', count: availableTasks.length },
            { id: 'other', label: 'Autres', count: otherTasks.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === tab.id
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 📋 CONTENU PRINCIPAL */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={loadTasks}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {getCurrentTasks().length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune tâche trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? `Aucun résultat pour "${searchTerm}"`
                  : `Aucune tâche dans la catégorie "${activeTab}"`
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`p-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {getCurrentTasks().map((task) => (
              <Suspense 
                key={task.id} 
                fallback={
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                }
              >
                <TaskCard
                  task={task}
                  onEdit={() => {
                    setSelectedTask(task);
                    setShowCreateModal(true);
                  }}
                  onDelete={() => handleDeleteTask(task.id)}
                  onViewDetails={handleViewDetails}
                  onSubmit={handleSubmitTask}
                  onTaskUpdate={loadTasks}
                  viewMode={viewMode}
                />
              </Suspense>
            ))}
          </div>
        )}
      </div>

      {/* 📝 MODAL CRÉATION/ÉDITION CORRIGÉE */}
      {showCreateModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Chargement du formulaire...</span>
              </div>
            </div>
          </div>
        }>
          <NewTaskModal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedTask(null);
              setError('');
            }}
            onSuccess={handleCreateTask}
            initialData={selectedTask}
            mode={selectedTask ? 'edit' : 'create'}
          />
        </Suspense>
      )}
    </div>
  );
};

// ✅ EXPORT PAR DÉFAUT AJOUTÉ
export default TasksPage;

console.log('📋 TasksPage corrigée - Export par défaut ajouté');
