// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// SYSTÈME COLLABORATIF AVEC PARTAGE XP ET GESTION DES VOLONTAIRES
// VERSION CORRIGÉE - PRIORITÉ TÂCHES COLLABORATIVES
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
  getDoc,
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
  Heart,
  Send,
  Eye,
  Star,
  Badge,
  Zap,
  X,
  Calendar,
  User,
  Tag,
  FileText,
  UserPlus,
  Settings,
  Share2,
  PlusCircle,
  UserCheck
} from 'lucide-react';

/**
 * 👥 SERVICE DE GESTION DES UTILISATEURS
 */
class UserService {
  constructor() {
    this.userCache = new Map();
    this.isLoading = false;
  }

  async loadAllUsers() {
    if (this.isLoading) return;
    
    try {
      this.isLoading = true;
      console.log('👥 Chargement de tous les utilisateurs...');
      
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const cleanName = this.cleanDisplayName(userData);
        
        this.userCache.set(doc.id, {
          id: doc.id,
          displayName: cleanName,
          email: userData.email || '',
          photoURL: userData.photoURL || null,
          rawData: userData
        });
      });
      
      console.log('✅ Utilisateurs chargés:', this.userCache.size);
      
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cleanDisplayName(userData) {
    let cleanName = userData.displayName || userData.email || 'Utilisateur';
    
    if (cleanName.includes('googleusercontent.com')) {
      cleanName = userData.email || 'Utilisateur';
    }
    
    if (cleanName.includes('@')) {
      const emailParts = cleanName.split('@');
      cleanName = emailParts[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return cleanName;
  }

  getUser(userId) {
    return this.userCache.get(userId) || {
      id: userId,
      displayName: `User ${userId.substring(0, 8)}`,
      email: '',
      photoURL: null
    };
  }

  getAllUsers() {
    return Array.from(this.userCache.values());
  }
}

// Instance globale du service utilisateur
const userService = new UserService();

/**
 * 📊 MODAL DE DÉTAILS DE TÂCHE AVEC INFOS CRÉATEUR/ASSIGNÉS
 */
const TaskDetailsModal = ({ isOpen, task, onClose }) => {
  if (!task) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Non défini';
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Erreur formatage date:', error);
      return 'Date invalide';
    }
  };

  // Récupérer les infos du créateur
  const creator = task.createdBy ? userService.getUser(task.createdBy) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Priorité {task.priority}
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
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* INFORMATIONS SUR LE CRÉATEUR */}
          {creator && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Créateur de la tâche</h4>
              <div className="flex items-center gap-3">
                <UserAvatar user={creator} size="lg" />
                <div>
                  <p className="font-medium text-gray-900">{creator.displayName}</p>
                  <p className="text-sm text-gray-600">{creator.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* UTILISATEURS ASSIGNÉS */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Utilisateurs assignés ({task.assignedTo.length})
              </h4>
              <AssignedUsersList userIds={task.assignedTo} maxDisplay={5} task={task} />
            </div>
          )}

          {task.description && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Créé le</span>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(task.createdAt)}
              </p>
            </div>

            {task.updatedAt && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Dernière mise à jour</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(task.updatedAt)}
                </p>
              </div>
            )}

            {task.xpReward && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Récompense XP</span>
                </div>
                <p className="text-sm text-gray-600">
                  {task.xpReward} XP total
                  {task.assignedTo && task.assignedTo.length > 1 && (
                    <span className="block text-xs text-gray-500">
                      ({Math.round(task.xpReward / task.assignedTo.length)} XP par personne)
                    </span>
                  )}
                </p>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * 🚀 MODAL DE COLLABORATION
 */
const CollaborationModal = ({ isOpen, task, onClose, onUpdate }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAvailableUsers(userService.getAllUsers());
    }
  }, [isOpen]);

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        assignedTo: arrayUnion(...selectedUsers),
        updatedAt: serverTimestamp()
      });

      alert(`Tâche assignée à ${selectedUsers.length} utilisateur(s) !`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      alert('Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Assigner la tâche
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>

          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {availableUsers.map(user => (
              <div
                key={user.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedUsers.includes(user.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleUserToggle(user.id)}
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.displayName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {selectedUsers.includes(user.id) && (
                  <UserCheck className="w-5 h-5 text-blue-600" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAssign}
              disabled={loading || selectedUsers.length === 0}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Attribution...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assigner ({selectedUsers.length})
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * 📁 COMPOSANT PRINCIPAL TasksPage
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // États pour les tâches
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('my_tasks');
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  
  // États pour les tâches sélectionnées
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForCollaboration, setSelectedTaskForCollaboration] = useState(null);

  // Statistiques calculées
  const [taskStats, setTaskStats] = useState({
    myTotal: 0,
    myCompleted: 0,
    completionRate: 0,
    totalXpEarned: 0,
    availableTotal: 0
  });

  /**
   * 📊 CALCUL DES STATISTIQUES
   */
  const calculateStats = (myTasks, availableTasks) => {
    const myCompleted = myTasks.filter(task => task.status === 'completed').length;
    const completionRate = myTasks.length > 0 ? Math.round((myCompleted / myTasks.length) * 100) : 0;
    const totalXpEarned = myTasks
      .filter(task => task.status === 'completed')
      .reduce((total, task) => total + (task.xpReward || 0), 0);

    setTaskStats({
      myTotal: myTasks.length,
      myCompleted,
      completionRate,
      totalXpEarned,
      availableTotal: availableTasks.length
    });
  };

  /**
   * 📥 CHARGEMENT DE TOUTES LES TÂCHES
   */
  const loadAllTasks = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Charger les utilisateurs si pas encore fait
      if (userService.getAllUsers().length === 0) {
        await userService.loadAllUsers();
      }

      console.log('📥 Chargement des tâches pour:', user.uid);

      // Query pour toutes les tâches
      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      console.log('📊 Tâches trouvées:', tasksSnapshot.size);

      const allTasks = [];
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        allTasks.push({
          id: doc.id,
          ...taskData
        });
      });

      // Répartition des tâches
      const myTasks = allTasks.filter(task => 
        task.assignedTo?.includes(user.uid) || task.createdBy === user.uid
      );

      const availableTasks = allTasks.filter(task => 
        task.openToVolunteers === true && 
        !task.assignedTo?.includes(user.uid) &&
        task.status !== 'completed'
      );

      const otherTasks = allTasks.filter(task => 
        !myTasks.some(myTask => myTask.id === task.id) &&
        !availableTasks.some(availableTask => availableTask.id === task.id)
      );

      // Mise à jour des états
      setMyTasks(myTasks);
      setAvailableTasks(availableTasks);
      setOtherTasks(otherTasks);

      // Calcul des statistiques
      calculateStats(myTasks, availableTasks);

      console.log('✅ Répartition des tâches:', {
        myTasks: myTasks.length,
        availableTasks: availableTasks.length,
        otherTasks: otherTasks.length
      });

    } catch (error) {
      console.error('❌ Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🚀 REJOINDRE UNE TÂCHE COMME VOLONTAIRE
   */
  const handleJoinTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        assignedTo: arrayUnion(user.uid),
        updatedAt: serverTimestamp()
      });

      alert('Vous avez rejoint cette tâche avec succès !');
      await loadAllTasks();
    } catch (error) {
      console.error('❌ Erreur lors de la participation:', error);
      alert('Erreur lors de la participation à la tâche');
    }
  };

  /**
   * 📤 SOUMISSION DE TÂCHE POUR VALIDATION
   */
  const handleTaskSubmission = async (taskId, submissionData) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      const submissionRecord = {
        taskId: taskId,
        submittedBy: user.uid,
        submitterName: user.displayName || user.email,
        submissionData: submissionData,
        submittedAt: serverTimestamp(),
        status: 'validation_pending'
      };

      // Créer l'enregistrement de soumission
      await addDoc(collection(db, 'task_submissions'), submissionRecord);

      // Mettre à jour le statut de la tâche
      await updateDoc(taskRef, {
        status: 'validation_pending',
        lastSubmission: submissionRecord,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Tâche soumise pour validation');
      await loadAllTasks();
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      throw error;
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user?.uid) {
      loadAllTasks();
    }
  }, [user?.uid]);

  /**
   * 🎨 COMPOSANT CARTE DE TÂCHE
   */
  const TaskCard = ({ task, isMyTask = true }) => {
    const formatDate = (timestamp) => {
      if (!timestamp) return 'Non défini';
      
      try {
        let date;
        if (timestamp.toDate) {
          date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
          date = timestamp;
        } else {
          date = new Date(timestamp);
        }
        
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short'
        });
      } catch (error) {
        return 'Date invalide';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              <span className={`px-2 py-1 text-xs rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'validation_pending' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status === 'completed' ? 'Terminée' :
                 task.status === 'in_progress' ? 'En cours' :
                 task.status === 'validation_pending' ? 'En validation' : 'En attente'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(task.createdAt)}
              </span>
              {task.xpReward && (
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {task.xpReward} XP
                </span>
              )}
              {task.assignedTo && task.assignedTo.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {task.assignedTo.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {isMyTask && task.status !== 'completed' && task.status !== 'validation_pending' && (
                <button
                  onClick={() => {
                    setSelectedTaskForSubmission(task);
                    setShowSubmissionModal(true);
                  }}
                  className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Soumettre
                </button>
              )}

              {!isMyTask && task.openToVolunteers && (
                <button
                  onClick={() => handleJoinTask(task.id)}
                  className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Rejoindre
                </button>
              )}

              {isMyTask && task.createdBy === user.uid && (
                <button
                  onClick={() => {
                    setSelectedTaskForCollaboration(task);
                    setShowCollaborationModal(true);
                  }}
                  className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Assigner
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedTaskForDetails(task);
                setShowDetailsModal(true);
              }}
              className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm ml-auto"
            >
              <Eye className="w-4 h-4" />
              Détails
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

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

        {/* STATISTIQUES GLOBALES AVEC XP PARTAGÉ */}
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
                <p className="text-sm text-gray-500">Taux de completion</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.totalXpEarned}</h3>
                <p className="text-sm text-gray-500">XP gagné</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.availableTotal}</h3>
                <p className="text-sm text-gray-500">Tâches disponibles</p>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION ONGLETS */}
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
              <button
                onClick={() => setActiveTab('other_tasks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'other_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Autres Tâches ({otherTasks.length})
              </button>
            </nav>
          </div>
        </div>

        {/* FILTRES ET RECHERCHE */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher des tâches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="validation_pending">En validation</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
        </div>

        {/* CONTENU DES ONGLETS */}
        <div className="space-y-6">
          {activeTab === 'my_tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes Tâches ({myTasks.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Tâches que vous créez ou auxquelles vous participez
                </div>
              </div>

              {myTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune tâche assignée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas encore de tâches assignées. Créez-en une ou rejoignez des tâches disponibles !
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une tâche
                    </button>
                    <button
                      onClick={() => setActiveTab('available_tasks')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Voir les tâches disponibles
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myTasks
                    .filter(task => {
                      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
                          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return false;
                      }
                      if (filterStatus !== 'all' && task.status !== filterStatus) {
                        return false;
                      }
                      if (filterPriority !== 'all' && task.priority !== filterPriority) {
                        return false;
                      }
                      return true;
                    })
                    .map(task => (
                      <TaskCard key={task.id} task={task} isMyTask={true} />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'available_tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tâches Disponibles ({availableTasks.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Tâches ouvertes aux volontaires
                </div>
              </div>

              {availableTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune tâche disponible
                  </h3>
                  <p className="text-gray-500">
                    Il n'y a pas de tâches disponibles pour le volontariat en ce moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableTasks
                    .filter(task => {
                      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
                          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return false;
                      }
                      if (filterPriority !== 'all' && task.priority !== filterPriority) {
                        return false;
                      }
                      return true;
                    })
                    .map(task => (
                      <TaskCard key={task.id} task={task} isMyTask={false} />
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'other_tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Autres Tâches ({otherTasks.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Tâches assignées à d'autres + Mes créations
                </div>
              </div>

              {otherTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune autre tâche
                  </h3>
                  <p className="text-gray-500">
                    Il n'y a pas d'autres tâches à afficher en ce moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {otherTasks
                    .filter(task => {
                      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
                          !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return false;
                      }
                      if (filterStatus !== 'all' && task.status !== filterStatus) {
                        return false;
                      }
                      if (filterPriority !== 'all' && task.priority !== filterPriority) {
                        return false;
                      }
                      return true;
                    })
                    .map(task => (
                      <TaskCard key={task.id} task={task} isMyTask={false} />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODALS */}

        {/* Modal création */}
        {showCreateModal && (
          <TaskForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (taskData) => {
              try {
                await addDoc(collection(db, 'tasks'), {
                  ...taskData,
                  createdBy: user.uid,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  status: taskData.assignedTo && taskData.assignedTo.length > 0 ? 'pending' : 'open',
                  assignedTo: taskData.assignedTo || [],
                  openToVolunteers: !taskData.assignedTo || taskData.assignedTo.length === 0
                });
                setShowCreateModal(false);
                await loadAllTasks();
              } catch (error) {
                console.error('❌ Erreur création tâche:', error);
                alert('Erreur lors de la création: ' + error.message);
              }
            }}
          />
        )}

        {/* Modal soumission validation */}
        {showSubmissionModal && selectedTaskForSubmission && (
          <TaskSubmissionModal
            isOpen={showSubmissionModal}
            task={selectedTaskForSubmission}
            onClose={() => {
              setShowSubmissionModal(false);
              setSelectedTaskForSubmission(null);
            }}
            onSubmit={async (submissionData) => {
              try {
                await handleTaskSubmission(selectedTaskForSubmission.id, submissionData);
                setShowSubmissionModal(false);
                setSelectedTaskForSubmission(null);
                alert('Tâche soumise avec succès pour validation !');
              } catch (error) {
                console.error('❌ Erreur soumission:', error);
                alert('Erreur lors de la soumission: ' + error.message);
              }
            }}
          />
        )}

        {/* Modal détails */}
        <TaskDetailsModal
          isOpen={showDetailsModal}
          task={selectedTaskForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTaskForDetails(null);
          }}
        />

        {/* Modal collaboration */}
        <CollaborationModal
          isOpen={showCollaborationModal}
          task={selectedTaskForCollaboration}
          onClose={() => {
            setShowCollaborationModal(false);
            setSelectedTaskForCollaboration(null);
          }}
          onUpdate={loadAllTasks}
        />
      </div>
    </div>
  );
};

// ✅ EXPORT DEFAULT CORRIGÉ
export default TasksPage;
