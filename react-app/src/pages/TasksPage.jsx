// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// FICHIER COMPLET - VERSION CORRIGÉE AVEC BOUTON VOLONTAIRE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Target, 
  Clock, 
  Heart,
  Users,
  Trophy,
  Star,
  MessageSquare,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart3,
  TrendingUp
} from 'lucide-react';

// Imports Firebase et services
import { 
  collection, 
  doc,
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Imports des stores et composants
import { useAuthStore } from '../shared/stores/authStore';
import { TaskCard } from '../modules/tasks';
import TaskForm from '../components/tasks/TaskForm';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import CollaborationModal from '../components/tasks/CollaborationModal';

/**
 * 📋 COMPOSANT PRINCIPAL - PAGE DE GESTION DES TÂCHES
 */
const TasksPage = () => {
  const { user } = useAuthStore();

  // États des données
  const [allTasks, setAllTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // États de l'interface
  const [activeTab, setActiveTab] = useState('my_tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Statistiques
  const [taskStats, setTaskStats] = useState({
    myTotal: 0,
    completionRate: 0,
    totalXP: 0,
    availableCount: 0
  });

  /**
   * 📊 CHARGEMENT DE TOUTES LES TÂCHES
   */
  const loadAllTasks = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      console.log('🔄 Chargement des tâches...');

      // Récupérer toutes les tâches
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
        status: taskData.assignedTo && taskData.assignedTo.length > 0 ? 'assigned' : 'pending'
      };

      await addDoc(collection(db, 'tasks'), newTask);
      await loadAllTasks();
      setShowCreateModal(false);
      
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
      await updateDoc(doc(db, 'tasks', taskId), {
        ...taskData,
        updatedAt: serverTimestamp()
      });
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

  /**
   * 🔄 FILTRAGE DES TÂCHES
   */
  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
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
        
        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
              <p className="text-lg text-gray-600 mt-1">
                Gérez vos tâches et contribuez aux projets collaboratifs
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer une tâche
            </button>
          </div>
        </div>

        {/* STATISTIQUES GLOBALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.myTotal}</h3>
                <p className="text-sm text-gray-500">Mes tâches</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.completionRate}%</h3>
                <p className="text-sm text-gray-500">Taux de réussite</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.totalXP}</h3>
                <p className="text-sm text-gray-500">XP gagné</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.availableCount}</h3>
                <p className="text-sm text-gray-500">Tâches disponibles</p>
              </div>
            </div>
          </div>
        </div>

        {/* FILTRES ET RECHERCHE */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* Barre de recherche */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une tâche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="validation_pending">En validation</option>
                  <option value="completed">Terminée</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="urgent">Urgent</option>
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="basse">Basse</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ONGLETS DE NAVIGATION */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('my_tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Mes Tâches ({myTasks.length})
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Assignées à moi
                </div>
              </button>

              <button
                onClick={() => setActiveTab('available_tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'available_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Tâches Disponibles ({availableTasks.length})
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Tâches non assignées
                </div>
              </button>

              <button
                onClick={() => setActiveTab('other_tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'other_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Autres Tâches ({otherTasks.length})
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Assignées à d'autres
                </div>
              </button>
            </nav>
          </div>

          {/* CONTENU DES ONGLETS */}
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
                <button
                  onClick={() => setShowCollaborationModal(true)}
                  className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Collaborer
                </button>
              </div>

              {getFilteredTasks(myTasks).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                        console.log('📝 Ouverture modal édition pour:', task.title);
                        setSelectedTask(task);
                        setShowCreateModal(true);
                      }}
                      onDelete={async (taskId) => {
                        console.log('🗑️ Suppression tâche:', taskId);
                        await handleDeleteTask(taskId);
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
                      showVolunteerButton={true}  {/* ✅ CORRECTION APPLIQUÉE */}
                      onEdit={(task) => {
                        console.log('📝 Ouverture modal édition pour tâche disponible:', task.title);
                        setSelectedTask(task);
                        setShowCreateModal(true);
                      }}
                      onDelete={async (taskId) => {
                        console.log('🗑️ Suppression tâche disponible:', taskId);
                        await handleDeleteTask(taskId);
                      }}
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
                    Tâches assignées à d'autres membres de l'équipe
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
          onSubmit={selectedTask ? handleEditTask : handleCreateTask}
          initialTask={selectedTask}
          mode={selectedTask ? 'edit' : 'create'}
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

export default TasksPage;
