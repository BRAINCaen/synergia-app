// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE COMPLÈTE - SYSTÈME VOLONTARIAT RESTAURÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import TaskForm from '../modules/tasks/TaskForm.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import { 
  Plus, 
  Filter, 
  Search, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Target,
  TrendingUp,
  Award,
  BarChart3,
  Users,
  HandHeart,
  Send,
  Eye,
  Star,
  Badge,
  Zap
} from 'lucide-react';

/**
 * ✅ TASKS PAGE COMPLÈTE AVEC SYSTÈME VOLONTARIAT
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // États pour les tâches
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('my_tasks'); // my_tasks | available_tasks
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState(null);
  
  // Statistiques réelles
  const [taskStats, setTaskStats] = useState({
    myTotal: 0,
    myCompleted: 0,
    myInProgress: 0,
    myPending: 0,
    availableTotal: 0,
    completionRate: 0,
    totalXpEarned: 0
  });

  useEffect(() => {
    if (user?.uid) {
      loadAllTasks();
    }
  }, [user?.uid]);

  useEffect(() => {
    calculateStats();
  }, [myTasks, availableTasks]);

  /**
   * 📊 CHARGER TOUTES LES TÂCHES (MES TÂCHES + DISPONIBLES)
   */
  const loadAllTasks = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement de toutes les tâches pour:', user.uid);
      
      // 1. Charger MES TÂCHES (assignées à moi)
      const myTasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const myTasksSnapshot = await getDocs(myTasksQuery);
      const loadedMyTasks = [];
      myTasksSnapshot.forEach(doc => {
        loadedMyTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Mes tâches chargées:', loadedMyTasks.length);
      setMyTasks(loadedMyTasks);
      
      // 2. Charger TÂCHES DISPONIBLES (pas assignées à moi mais disponibles)
      const availableTasksQuery = query(
        collection(db, 'tasks'),
        where('status', 'in', ['pending', 'open']),
        orderBy('createdAt', 'desc')
      );
      
      const availableTasksSnapshot = await getDocs(availableTasksQuery);
      const loadedAvailableTasks = [];
      availableTasksSnapshot.forEach(doc => {
        const taskData = { id: doc.id, ...doc.data() };
        
        // Exclure mes propres tâches et celles déjà assignées à moi
        const isMyTask = (taskData.assignedTo || []).includes(user.uid);
        const isCreatedByMe = taskData.createdBy === user.uid;
        
        if (!isMyTask && !isCreatedByMe) {
          loadedAvailableTasks.push(taskData);
        }
      });
      
      console.log('✅ Tâches disponibles chargées:', loadedAvailableTasks.length);
      setAvailableTasks(loadedAvailableTasks);
      
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CALCULER LES STATISTIQUES RÉELLES
   */
  const calculateStats = () => {
    const myTotal = myTasks.length;
    const myCompleted = myTasks.filter(t => t.status === 'completed').length;
    const myInProgress = myTasks.filter(t => t.status === 'in_progress').length;
    const myPending = myTasks.filter(t => ['pending', 'todo'].includes(t.status)).length;
    const availableTotal = availableTasks.length;
    const completionRate = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;
    const totalXpEarned = myTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, task) => sum + (task.xpReward || 0), 0);

    setTaskStats({
      myTotal,
      myCompleted,
      myInProgress,
      myPending,
      availableTotal,
      completionRate,
      totalXpEarned
    });
  };

  /**
   * 🙋 SE PORTER VOLONTAIRE POUR UNE TÂCHE
   */
  const handleVolunteerForTask = async (taskId) => {
    try {
      console.log('🙋 Volontariat pour tâche:', taskId);
      
      const taskRef = doc(db, 'tasks', taskId);
      
      // Ajouter l'utilisateur aux assignés
      await updateDoc(taskRef, {
        assignedTo: arrayUnion(user.uid),
        status: 'in_progress',
        volunteerDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Volontariat enregistré');
      
      // Recharger les tâches
      await loadAllTasks();
      
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      alert('Erreur lors du volontariat: ' + error.message);
    }
  };

  /**
   * 🚪 SE RETIRER D'UNE TÂCHE
   */
  const handleWithdrawFromTask = async (taskId) => {
    try {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous retirer de cette tâche ?');
      if (!confirmed) return;
      
      console.log('🚪 Retrait de tâche:', taskId);
      
      const taskRef = doc(db, 'tasks', taskId);
      
      // Retirer l'utilisateur des assignés
      await updateDoc(taskRef, {
        assignedTo: arrayRemove(user.uid),
        status: 'pending',
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Retrait enregistré');
      
      // Recharger les tâches
      await loadAllTasks();
      
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
      alert('Erreur lors du retrait: ' + error.message);
    }
  };

  /**
   * 📤 SOUMETTRE UNE TÂCHE POUR VALIDATION
   */
  const handleSubmitTask = (task) => {
    setSelectedTaskForSubmission(task);
    setShowSubmissionModal(true);
  };

  /**
   * ✅ MARQUER UNE TÂCHE COMME TERMINÉE
   */
  const handleCompleteTask = async (taskId) => {
    try {
      console.log('✅ Marquer tâche terminée:', taskId);
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: user.uid,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche marquée terminée');
      await loadAllTasks();
      
    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
    }
  };

  /**
   * 🎨 COMPOSANT CARTE DE TÂCHE
   */
  const TaskCard = ({ task, isMyTask = false }) => {
    const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
    const canVolunteer = !isAssignedToMe && !isMyTask;
    const canSubmit = isAssignedToMe && task.status === 'in_progress';
    const canComplete = isAssignedToMe && ['in_progress', 'validation_pending'].includes(task.status);
    
    // Couleurs selon le statut
    const getStatusColor = (status) => {
      switch(status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'validation_pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getPriorityIcon = (priority) => {
      switch(priority) {
        case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
        case 'high': return <TrendingUp className="w-4 h-4 text-orange-500" />;
        case 'medium': return <Target className="w-4 h-4 text-blue-500" />;
        case 'low': return <Clock className="w-4 h-4 text-gray-500" />;
        default: return <Target className="w-4 h-4 text-blue-500" />;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        {/* En-tête de la tâche */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {task.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {task.description}
            </p>
          </div>
          
          {/* Badge statut */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status === 'completed' && 'Terminé'}
            {task.status === 'in_progress' && 'En cours'}
            {task.status === 'validation_pending' && 'En validation'}
            {task.status === 'pending' && 'Disponible'}
            {task.status === 'open' && 'Ouvert'}
          </span>
        </div>

        {/* Métadonnées */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          {/* Priorité */}
          <div className="flex items-center gap-1">
            {getPriorityIcon(task.priority)}
            <span className="capitalize">{task.priority || 'medium'}</span>
          </div>
          
          {/* XP */}
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>{task.xpReward || 0} XP</span>
          </div>
          
          {/* Assignés */}
          {(task.assignedTo || []).length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{task.assignedTo.length} assigné{task.assignedTo.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {/* Actions pour MES TÂCHES */}
          {isMyTask && (
            <>
              {canSubmit && (
                <button
                  onClick={() => handleSubmitTask(task)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Send className="w-4 h-4" />
                  Soumettre
                </button>
              )}
              
              {canComplete && task.status !== 'validation_pending' && (
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  Terminer
                </button>
              )}
              
              <button
                onClick={() => handleWithdrawFromTask(task.id)}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Se retirer
              </button>
            </>
          )}

          {/* Actions pour TÂCHES DISPONIBLES */}
          {!isMyTask && canVolunteer && (
            <button
              onClick={() => handleVolunteerForTask(task.id)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <HandHeart className="w-4 h-4" />
              Se porter volontaire
            </button>
          )}
          
          {/* Bouton voir détails */}
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm ml-auto">
            <Eye className="w-4 h-4" />
            Détails
          </button>
        </div>
      </motion.div>
    );
  };

  /**
   * 🎨 RENDU PRINCIPAL
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

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
          {/* Mes tâches totales */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.myTotal}</h3>
                <p className="text-gray-600">Mes tâches</p>
              </div>
            </div>
          </div>

          {/* Tâches terminées */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.myCompleted}</h3>
                <p className="text-gray-600">Terminées</p>
              </div>
            </div>
          </div>

          {/* Taux de complétion */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.completionRate}%</h3>
                <p className="text-gray-600">Taux de réussite</p>
              </div>
            </div>
          </div>

          {/* XP total */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.totalXpEarned}</h3>
                <p className="text-gray-600">XP gagnés</p>
              </div>
            </div>
          </div>
        </div>

        {/* ONGLETS PRINCIPAUX */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('my_tasks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mes Tâches ({taskStats.myTotal})
              </button>
              <button
                onClick={() => setActiveTab('available_tasks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tâches Disponibles ({taskStats.availableTotal})
              </button>
            </nav>
          </div>
        </div>

        {/* FILTRES ET RECHERCHE */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Terminé</option>
            </select>

            {/* Filtre priorité */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>

        {/* CONTENU PRINCIPAL SELON L'ONGLET */}
        <div className="space-y-6">
          {activeTab === 'my_tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes Tâches ({myTasks.length})
                </h2>
                <div className="text-sm text-gray-500">
                  {taskStats.myInProgress} en cours • {taskStats.myCompleted} terminées
                </div>
              </div>

              {myTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune tâche assignée
                  </h3>
                  <p className="text-gray-500 mb-4">
