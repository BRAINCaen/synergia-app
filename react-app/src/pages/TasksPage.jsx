// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// CORRECTION LOGIQUE DE RÉPARTITION DES TÂCHES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Users, 
  Heart,
  Loader,
  RefreshCw,
  Shield,
  X
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';

// 🎭 RÔLES SYNERGIA POUR FILTRAGE
const SYNERGIA_ROLES = {
  stock: { id: 'stock', name: 'Gestion des Stocks', icon: '📦', color: 'bg-orange-500' },
  maintenance: { id: 'maintenance', name: 'Maintenance & Technique', icon: '🔧', color: 'bg-blue-500' },
  organization: { id: 'organization', name: 'Organisation & Planning', icon: '📋', color: 'bg-green-500' },
  reputation: { id: 'reputation', name: 'Réputation & Avis', icon: '⭐', color: 'bg-yellow-500' },
  content: { id: 'content', name: 'Contenu & Documentation', icon: '📝', color: 'bg-purple-500' },
  mentoring: { id: 'mentoring', name: 'Encadrement & Formation', icon: '🎓', color: 'bg-indigo-500' },
  partnerships: { id: 'partnerships', name: 'Partenariats & Référencement', icon: '🤝', color: 'bg-pink-500' },
  communication: { id: 'communication', name: 'Communication & Réseaux Sociaux', icon: '📱', color: 'bg-cyan-500' },
  b2b: { id: 'b2b', name: 'Relations B2B & Devis', icon: '💼', color: 'bg-slate-500' }
};

// Imports des composants existants seulement
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskForm from '../modules/tasks/TaskForm.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx'; // ✅ Import de la modal complète

/**
 * 📋 PAGE PRINCIPALE DES TÂCHES AVEC LOGIQUE CORRIGÉE
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux - répartition selon vos critères
  const [myTasks, setMyTasks] = useState([]); // Tâches QUI ME SONT ASSIGNÉES (pas créées par moi)
  const [availableTasks, setAvailableTasks] = useState([]); // Non assignées et ouvertes
  const [otherTasks, setOtherTasks] = useState([]); // Assignées à d'autres
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  
  // États UI avec filtrage par rôle
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all'); // ✅ NOUVEAU FILTRE RÔLE
  const [showRoleFilters, setShowRoleFilters] = useState(false); // ✅ AFFICHAGE FILTRES RÔLES
  
  // États modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 🔄 CHARGER ET RÉPARTIR TOUTES LES TÂCHES (ABSOLUMENT TOUTES)
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement de TOUTES les tâches de la base de données...');

      if (!user?.uid) {
        console.warn('⚠️ Utilisateur non connecté');
        return;
      }

      // ✅ RÉCUPÉRER ABSOLUMENT TOUTES LES TÂCHES SANS FILTRE
      const allTasks = await taskService.getAllTasksFromDatabase(); // Nouvelle méthode pour TOUT récupérer
      console.log(`📊 TOTAL de toutes les tâches dans la base: ${allTasks.length}`);

      // 🎯 LOGIQUE DE RÉPARTITION SELON VOS CRITÈRES EXACTS
      const myTasksArray = [];        // Tâches qui me sont assignées (pas créées par moi)
      const availableTasksArray = []; // Non assignées et ouvertes
      const otherTasksArray = [];     // Assignées à d'autres

      allTasks.forEach(task => {
        // Vérifier si je suis assigné à cette tâche
        const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
        
        // Vérifier si la tâche a des assignés
        const hasAssignees = Array.isArray(task.assignedTo) && task.assignedTo.length > 0;
        
        // Vérifier si je suis le créateur
        const isMyCreation = task.createdBy === user.uid;

        if (isAssignedToMe) {
          // ✅ MES TÂCHES = Tâches qui me sont assignées (même si je les ai créées)
          myTasksArray.push(task);
          
        } else if (!hasAssignees || task.status === 'todo' || task.status === 'open') {
          // ✅ TÂCHES DISPONIBLES = Non assignées OU ouvertes à participation
          availableTasksArray.push(task);
          
        } else {
          // ✅ AUTRES TÂCHES = Toutes les autres (assignées à d'autres, créées par d'autres, etc.)
          otherTasksArray.push(task);
        }
      });

      // Trier par date de création (plus récentes d'abord)
      const sortByDate = (a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || Date.now());
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || Date.now());
        return dateB - dateA;
      };

      setMyTasks(myTasksArray.sort(sortByDate));
      setAvailableTasks(availableTasksArray.sort(sortByDate));
      setOtherTasks(otherTasksArray.sort(sortByDate));
      
      setLastUpdateTime(Date.now());
      
      console.log('✅ Répartition complète des tâches:', {
        'Total dans la base': allTasks.length,
        'Mes tâches (assignées à moi)': myTasksArray.length,
        'Disponibles (non assignées/ouvertes)': availableTasksArray.length,
        'Autres (assignées à autres)': otherTasksArray.length,
        'Vérification': myTasksArray.length + availableTasksArray.length + otherTasksArray.length
      });

      // Afficher quelques exemples pour debug
      console.log('📋 Exemples de répartition:');
      console.log('Mes tâches:', myTasksArray.slice(0, 3).map(t => `"${t.title}" (créateur: ${t.createdBy})`));
      console.log('Disponibles:', availableTasksArray.slice(0, 3).map(t => `"${t.title}" (assignés: ${t.assignedTo?.length || 0})`));
      console.log('Autres:', otherTasksArray.slice(0, 3).map(t => `"${t.title}" (assignés: ${t.assignedTo?.join(', ') || 'aucun'})`));

    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * 🔄 FONCTION DE RECHARGEMENT FORCÉ
   */
  const forceReload = useCallback(async () => {
    console.log('🔄 Rechargement forcé des tâches...');
    await loadTasks();
  }, [loadTasks]);

  /**
   * 🔄 CHARGEMENT INITIAL ET ÉVÉNEMENTS
   */
  useEffect(() => {
    if (user?.uid) {
      loadTasks();
    }
  }, [user?.uid, loadTasks]);

  // Recharger quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.uid) {
        console.log('🔄 Page redevenue visible - rechargement');
        loadTasks();
      }
    };

    const handleFocus = () => {
      if (user?.uid) {
        console.log('🔄 Fenêtre focus - rechargement');
        loadTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.uid, loadTasks]);

  /**
   * 🔍 FILTRER LES TÂCHES SELON LES CRITÈRES DE RECHERCHE ET RÔLE
   */
  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      // Filtre par recherche
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // Filtre par priorité
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      // ✅ NOUVEAU FILTRE PAR RÔLE SYNERGIA
      const matchesRole = roleFilter === 'all' || task.roleId === roleFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesRole;
    });
  };

  /**
   * 📋 FONCTIONS DE GESTION DES TÂCHES
   */
  const handleCreateTask = async (taskData) => {
    try {
      setSubmitting(true);
      await taskService.createTask(taskData);
      await forceReload(); // Recharger après création
      setShowCreateModal(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError('Erreur lors de la création de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      setSubmitting(true);
      await taskService.updateTask(selectedTask.id, taskData);
      await forceReload(); // Recharger après modification
      setShowCreateModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('❌ Erreur modification tâche:', error);
      setError('Erreur lors de la modification de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      await forceReload(); // Recharger après suppression
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      setError('Erreur lors de la suppression de la tâche');
    }
  };

  const handleSubmitTask = async (taskId) => {
    try {
      await taskService.submitTask(taskId);
      await forceReload(); // Recharger après soumission
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError('Erreur lors de la soumission de la tâche');
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleTaskUpdate = useCallback(async () => {
    console.log('🔄 Mise à jour détectée - rechargement des tâches');
    await forceReload();
  }, [forceReload]);

  // Obtenir les tâches filtrées selon l'onglet actif
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

  const currentTasks = getCurrentTasks();

  // Affichage de chargement
  if (loading && myTasks.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Chargement des tâches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos tâches assignées et participez aux projets collaboratifs
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Dernière mise à jour : {new Date(lastUpdateTime).toLocaleTimeString('fr-FR')}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={forceReload}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Recharger les tâches"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Onglets avec description claire */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <div className="text-left">
              <div>Mes tâches ({myTasks.length})</div>
              <div className="text-xs text-gray-400">Assignées à moi</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <div className="text-left">
              <div>Disponibles ({availableTasks.length})</div>
              <div className="text-xs text-gray-400">Non assignées</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('other')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'other'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <div className="text-left">
              <div>Autres ({otherTasks.length})</div>
              <div className="text-xs text-gray-400">Assignées à d'autres</div>
            </div>
          </div>
        </button>
      </div>

      {/* Filtres avec rôles Synergia */}
      <div className="space-y-4 mb-6">
        {/* Première ligne de filtres */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="validation_pending">En validation</option>
            <option value="completed">Terminée</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="urgent">Urgente</option>
          </select>

          {/* ✅ BOUTON FILTRES RÔLES */}
          <button
            onClick={() => setShowRoleFilters(!showRoleFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              showRoleFilters 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            Rôles Synergia
            {roleFilter !== 'all' && (
              <span className="bg-white text-purple-600 px-2 py-1 rounded-full text-xs font-bold">
                {Object.values(SYNERGIA_ROLES).filter(role => role.id === roleFilter).length}
              </span>
            )}
          </button>
        </div>

        {/* ✅ FILTRES PAR RÔLES SYNERGIA */}
        {showRoleFilters && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-purple-900 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Filtrer par rôle Synergia
              </h3>
              {roleFilter !== 'all' && (
                <button
                  onClick={() => setRoleFilter('all')}
                  className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm"
                >
                  <X className="w-3 h-3" />
                  Effacer
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* Bouton "Tous" */}
              <button
                onClick={() => setRoleFilter('all')}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  roleFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>🔍</span>
                  <span>Tous</span>
                </div>
              </button>

              {/* Boutons des rôles */}
              {Object.values(SYNERGIA_ROLES).map((role) => (
                <button
                  key={role.id}
                  onClick={() => setRoleFilter(role.id)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    roleFilter === role.id
                      ? 'bg-purple-600 text-white shadow-md scale-105'
                      : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 hover:scale-102'
                  }`}
                  title={role.name}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm">{role.icon}</span>
                    <span className="leading-tight">{role.name.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Indicateur de filtre actif */}
            {roleFilter !== 'all' && (
              <div className="mt-3 p-2 bg-purple-100 rounded flex items-center gap-2">
                <span className="text-lg">{SYNERGIA_ROLES[roleFilter]?.icon}</span>
                <span className="text-purple-700 font-medium text-sm">
                  Filtrage par : {SYNERGIA_ROLES[roleFilter]?.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {currentTasks.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {activeTab === 'my' && 'Aucune tâche assignée'}
              {activeTab === 'available' && 'Aucune tâche disponible'}
              {activeTab === 'other' && 'Aucune autre tâche'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'my' && 'Aucune tâche ne vous est actuellement assignée. Consultez les tâches disponibles pour vous porter volontaire.'}
              {activeTab === 'available' && 'Toutes les tâches disponibles ont été prises ou il n\'y en a pas encore.'}
              {activeTab === 'other' && 'Aucune tâche assignée à d\'autres utilisateurs pour le moment.'}
            </p>
          </div>
        ) : (
          currentTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={user}
              onEdit={() => {
                setSelectedTask(task);
                setShowCreateModal(true);
              }}
              onDelete={() => handleDeleteTask(task.id)}
              onViewDetails={() => handleViewDetails(task)}
              onSubmit={() => handleSubmitTask(task.id)}
              onTaskUpdate={handleTaskUpdate}
            />
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      <TaskForm
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleEditTask : handleCreateTask}
        initialData={selectedTask}
        submitting={submitting}
      />

      {/* Modal de détails complète */}
      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        currentUser={user}
        onEdit={() => {
          setShowDetailModal(false);
          setShowCreateModal(true);
        }}
        onDelete={(taskId) => handleDeleteTask(taskId)}
        onSubmit={(taskId) => handleSubmitTask(taskId)}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default TasksPage;
