// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE GESTION DES TÂCHES COMPLÈTE AVEC CORRECTION getFilteredTasks
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Heart, 
  Users, 
  Star,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';

// Firebase
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Composants
import TaskForm from '../modules/tasks/TaskForm.jsx';
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import CollaborationModal from '../components/collaboration/CollaborationModal.jsx';

// Stores et hooks
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 📋 PAGE PRINCIPALE DE GESTION DES TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();

  // ✅ ÉTATS PRINCIPAUX
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);

  // ✅ ÉTATS MODALS
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ✅ ÉTATS FILTRES - REQUIS POUR getFilteredTasks
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // ✅ ÉTATS UI
  const [activeTab, setActiveTab] = useState('my_tasks');
  const [taskStats, setTaskStats] = useState({
    myTotal: 0,
    completionRate: 0,
    totalXP: 0,
    availableCount: 0
  });

  // ✅ FONCTION getFilteredTasks CORRIGÉE - OBLIGATOIRE
  const getFilteredTasks = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) {
      console.warn('⚠️ getFilteredTasks: tasks non valide:', tasks);
      return [];
    }

    return tasks.filter(task => {
      // Filtre par terme de recherche
      const matchesSearch = !searchTerm || 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.tags && Array.isArray(task.tags) && 
         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
        
      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      // Filtre par priorité
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  /**
   * 📥 CHARGER TOUTES LES TÂCHES DEPUIS FIREBASE
   */
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) {
        console.log('❌ Utilisateur non connecté');
        return;
      }

      console.log('🔄 Chargement des tâches...');

      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${tasks.length} tâches chargées`);

      // Filtrer par catégories
      const myTasksList = tasks.filter(task => 
        task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid)
      );

      const availableTasksList = tasks.filter(task => 
        !task.assignedTo || 
        !Array.isArray(task.assignedTo) || 
        task.assignedTo.length === 0 ||
        (!task.assignedTo.includes(user.uid) && task.status !== 'completed')
      );

      const otherTasksList = tasks.filter(task => 
        task.assignedTo && 
        Array.isArray(task.assignedTo) && 
        task.assignedTo.length > 0 && 
        !task.assignedTo.includes(user.uid) &&
        task.createdBy !== user.uid
      );

      // Mettre à jour les états
      setAllTasks(tasks);
      setMyTasks(myTasksList);
      setAvailableTasks(availableTasksList);
      setOtherTasks(otherTasksList);

      // Calculer les statistiques
      const completedTasks = myTasksList.filter(task => task.status === 'completed').length;
      const completionRate = myTasksList.length > 0 ? Math.round((completedTasks / myTasksList.length) * 100) : 0;
      const totalXP = myTasksList
        .filter(task => task.status === 'completed')
        .reduce((sum, task) => sum + (task.xpReward || 0), 0);

      setTaskStats({
        myTotal: myTasksList.length,
        completionRate,
        totalXP,
        availableCount: availableTasksList.length
      });

      console.log('📊 Statistiques mises à jour:', {
        myTotal: myTasksList.length,
        available: availableTasksList.length,
        other: otherTasksList.length,
        completionRate
      });

    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ➕ CRÉATION D'UNE NOUVELLE TÂCHE
   */
  const handleCreateTask = async (taskData) => {
    try {
      console.log('➕ Création nouvelle tâche:', taskData.title);

      const newTask = {
        ...taskData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: taskData.assignedTo && taskData.assignedTo.length > 0 ? 
          'assigned' : 'pending'
      };

      await addDoc(collection(db, 'tasks'), newTask);
      await loadAllTasks();
      setShowCreateModal(false);
      
      console.log('✅ Tâche créée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  /**
   * ✏️ MODIFICATION D'UNE TÂCHE
   */
  const handleEditTask = async (taskId, taskData) => {
    try {
      console.log('✏️ Mise à jour tâche:', taskId, taskData);
      
      // Préparer les données de mise à jour
      const updateData = {
        ...taskData,
        updatedAt: serverTimestamp()
      };
      
      // Supprimer les champs qui ne doivent pas être mis à jour
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.createdBy;
      
      // Mettre à jour dans Firebase
      await updateDoc(doc(db, 'tasks', taskId), updateData);
      
      console.log('✅ Tâche mise à jour avec succès');
      
      // Recharger toutes les tâches pour voir les changements
      await loadAllTasks();
      
    } catch (error) {
      console.error('❌ Erreur modification tâche:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  /**
   * 🗑️ SUPPRESSION D'UNE TÂCHE
   */
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      await loadAllTasks();
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  /**
   * 🚀 SOUMISSION D'UNE TÂCHE POUR VALIDATION
   */
  const handleSubmitTask = (task) => {
    setSelectedTask(task);
    setShowSubmissionModal(true);
  };

  /**
   * 👀 AFFICHER LES DÉTAILS D'UNE TÂCHE
   */
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      loadAllTasks();
    }
  }, [user]);

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  // Interface principale
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
              <p className="text-gray-600 mt-1">Gérez vos tâches et contribuez aux projets collaboratifs</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer une tâche
            </button>
          </div>

          {/* Statistiques */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Mes tâches</p>
                  <p className="text-2xl font-bold text-gray-900">{taskStats.myTotal}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Taux de réussite</p>
                  <p className="text-2xl font-bold text-gray-900">{taskStats.completionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">XP gagné</p>
                  <p className="text-2xl font-bold text-gray-900">{taskStats.totalXP}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tâches disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{taskStats.availableCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Recherche */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtre Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>

            {/* Filtre Priorité */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>

            {/* Bouton Collaboration */}
            <button
              onClick={() => setShowCollaborationModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Collaborer
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('my_tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Mes Tâches ({myTasks.length})
              </button>

              <button
                onClick={() => setActiveTab('available_tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Tâches Disponibles ({availableTasks.length})
              </button>

              <button
                onClick={() => setActiveTab('other_tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'other_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Autres Tâches ({otherTasks.length})
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'my_tasks' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mes Tâches ({getFilteredTasks(myTasks).length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tâches qui vous sont assignées
                  </p>
                </div>
              </div>

              {getFilteredTasks(myTasks).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {myTasks.length === 0 ? 'Aucune tâche assignée' : 'Aucune tâche ne correspond aux filtres'}
                  </h3>
                  <p className="text-gray-500">
                    {myTasks.length === 0 
                      ? 'Prenez une tâche disponible ou demandez une assignation !'
                      : 'Essayez de modifier vos filtres de recherche.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredTasks(myTasks).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      isMyTask={true}
                      onEdit={(task) => {
                        console.log('📝 [EDIT] Ouverture modal édition pour:', task.title);
                        console.log('📝 [EDIT] Données tâche:', task);
                        setSelectedTask(task);
                        setShowCreateModal(true);
                      }}
                      onDelete={async (task) => {
                        console.log('🗑️ [DELETE] Suppression tâche:', task.id);
                        if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
                          await handleDeleteTask(task.id);
                        }
                      }}
                      onViewDetails={handleViewDetails}
                      onSubmit={handleSubmitTask}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'available_tasks' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Tâches Disponibles ({getFilteredTasks(availableTasks).length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tâches non assignées, ouvertes à tous
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  Cliquez pour vous porter volontaire
                </span>
              </div>

              {getFilteredTasks(availableTasks).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {availableTasks.length === 0 ? 'Aucune tâche disponible' : 'Aucune tâche ne correspond aux filtres'}
                  </h3>
                  <p className="text-gray-500">
                    {availableTasks.length === 0 
                      ? 'Toutes les tâches sont assignées ou créez-en une nouvelle !'
                      : 'Essayez de modifier vos filtres de recherche.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredTasks(availableTasks).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      isMyTask={false}
                      showVolunteerButton={true}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'other_tasks' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Autres Tâches ({getFilteredTasks(otherTasks).length})
                  </h2>
                  <p className="text-sm text-gray-500">
                    Tâches assignées à d'autres membres
                  </p>
                </div>
              </div>

              {getFilteredTasks(otherTasks).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {otherTasks.length === 0 ? 'Aucune autre tâche assignée' : 'Aucune tâche ne correspond aux filtres'}
                  </h3>
                  <p className="text-gray-500">
                    {otherTasks.length === 0 
                      ? 'Toutes les tâches sont soit disponibles, soit vous sont assignées.'
                      : 'Essayez de modifier vos filtres de recherche.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredTasks(otherTasks).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      isMyTask={false}
                      onEdit={task.createdBy === user?.uid ? ((task) => {
                        console.log('📝 [EDIT] Ouverture modal édition pour tâche créée par moi:', task.title);
                        setSelectedTask(task);
                        setShowCreateModal(true);
                      }) : undefined}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <TaskForm
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTask(null);
          }}
          onSubmit={selectedTask ? 
            // Mode édition : passer taskId et données
            async (taskData) => {
              console.log('📝 Mise à jour tâche:', selectedTask.id, taskData);
              await handleEditTask(selectedTask.id, taskData);
              setShowCreateModal(false);
              setSelectedTask(null);
            } : 
            // Mode création : passer seulement les données
            async (taskData) => {
              console.log('➕ Création nouvelle tâche:', taskData);
              await handleCreateTask(taskData);
              setShowCreateModal(false);
            }
          }
          initialData={selectedTask}
          submitting={false}
        />
      )}

      {showSubmissionModal && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          task={selectedTask}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={async () => {
            await loadAllTasks();
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {showDetailsModal && (
        <TaskDetailsModal
          isOpen={showDetailsModal}
          task={selectedTask}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTask(null);
          }}
          onEdit={(task) => {
            console.log('📝 Ouverture édition depuis modal détails:', task.title);
            setSelectedTask(task);
            setShowDetailsModal(false);
            setShowCreateModal(true);
          }}
          onDelete={handleDeleteTask}
        />
      )}

      {showCollaborationModal && (
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={() => setShowCollaborationModal(false)}
          userTasks={myTasks}
        />
      )}
    </div>
  );
};

// ✅ EXPORT PAR DÉFAUT OBLIGATOIRE
export default TasksPage;
