// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION COMPLÈTE AVEC AFFICHAGE DES NOMS UTILISATEURS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Heart, 
  Target,
  Clock,
  Star,
  Zap,
  Eye,
  Edit,
  Trash2,
  User,
  UserPlus,
  UserCheck,
  MessageSquare,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';

// Firebase imports
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import userService from '../core/services/userService.js';

// Composants
import TaskForm from '../components/tasks/TaskForm.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import TaskDetailsModal from '../components/ui/TaskDetailModal.jsx';
import CollaborationModal from '../components/collaboration/CollaborationModal.jsx';

/**
 * 👥 HOOK DE RÉSOLUTION DES UTILISATEURS
 */
const useUserResolver = () => {
  const [usersCache, setUsersCache] = useState(new Map());
  
  const resolveUser = async (userId) => {
    if (!userId) return null;
    
    // Vérifier le cache d'abord
    if (usersCache.has(userId)) {
      return usersCache.get(userId);
    }
    
    try {
      // Récupérer depuis Firebase
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = {
          uid: userId,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
          email: userData.email || 'Non défini',
          photoURL: userData.photoURL || null,
          initials: (userData.displayName || userData.email?.split('@')[0] || 'U')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        };
        
        // Mettre en cache
        setUsersCache(prev => new Map(prev).set(userId, user));
        return user;
      } else {
        // Utilisateur non trouvé - créer un fallback
        const fallbackUser = {
          uid: userId,
          displayName: `User_${userId.substring(0, 8)}`,
          email: 'Non défini',
          photoURL: null,
          initials: userId.substring(0, 2).toUpperCase()
        };
        
        setUsersCache(prev => new Map(prev).set(userId, fallbackUser));
        return fallbackUser;
      }
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', userId, error);
      
      // Fallback d'erreur
      const errorUser = {
        uid: userId,
        displayName: `Utilisateur ${userId.substring(0, 6)}`,
        email: 'Erreur chargement',
        photoURL: null,
        initials: 'ER'
      };
      
      return errorUser;
    }
  };
  
  return { resolveUser, usersCache };
};

/**
 * 🎨 COMPOSANT AVATAR UTILISATEUR
 */
const UserAvatar = ({ userId, user, size = 'md' }) => {
  const [resolvedUser, setResolvedUser] = useState(user);
  const [loading, setLoading] = useState(!user && !!userId);
  const { resolveUser } = useUserResolver();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  // Résoudre l'utilisateur si pas fourni
  useEffect(() => {
    if (!user && userId) {
      setLoading(true);
      resolveUser(userId).then(resolved => {
        setResolvedUser(resolved);
        setLoading(false);
      });
    }
  }, [userId, user, resolveUser]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-300 rounded-full animate-pulse`} />
    );
  }

  if (!resolvedUser) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center`}>
        <span className="text-gray-500">?</span>
      </div>
    );
  }

  const displayName = resolvedUser.displayName || resolvedUser.email || 'User';
  const initials = resolvedUser.initials || displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div 
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-medium shadow-sm`}
      title={`${displayName} (${resolvedUser.email})`}
    >
      {initials}
    </div>
  );
};

/**
 * 👥 COMPOSANT LISTE DES UTILISATEURS ASSIGNÉS
 */
const AssignedUsersList = ({ userIds = [], maxDisplay = 3, task = null }) => {
  const [resolvedUsers, setResolvedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { resolveUser } = useUserResolver();

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setResolvedUsers([]);
      setLoading(false);
      return;
    }

    const resolveAllUsers = async () => {
      setLoading(true);
      
      const userPromises = (Array.isArray(userIds) ? userIds : [userIds])
        .filter(Boolean) // Supprimer les valeurs nulles/vides
        .map(userId => resolveUser(userId));

      try {
        const users = await Promise.all(userPromises);
        setResolvedUsers(users.filter(Boolean)); // Supprimer les null
      } catch (error) {
        console.error('❌ Erreur résolution utilisateurs:', error);
        setResolvedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    resolveAllUsers();
  }, [userIds, resolveUser]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(3, (userIds || []).length) }).map((_, index) => (
            <div key={index} className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          ))}
        </div>
        <span className="text-sm text-gray-500">Chargement...</span>
      </div>
    );
  }

  if (!userIds || userIds.length === 0 || resolvedUsers.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Aucun utilisateur assigné
      </div>
    );
  }

  const displayedUsers = resolvedUsers.slice(0, maxDisplay);
  const remainingCount = resolvedUsers.length - maxDisplay;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {displayedUsers.map((user, index) => (
          <div
            key={user.uid || index}
            className="relative group"
          >
            <UserAvatar user={user} size="sm" />
            {/* Tooltip avec nom complet */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {user.displayName}
              {user.email && user.email !== 'Non défini' && (
                <div className="text-gray-300">{user.email}</div>
              )}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div 
            className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium"
            title={`+${remainingCount} autre${remainingCount > 1 ? 's' : ''} utilisateur${remainingCount > 1 ? 's' : ''}`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">
          {resolvedUsers.length} assigné{resolvedUsers.length > 1 ? 's' : ''}
        </span>
        <div className="text-xs text-gray-500">
          {displayedUsers.map(u => u.displayName).join(', ')}
          {remainingCount > 0 && `, +${remainingCount}`}
        </div>
      </div>
    </div>
  );
};

/**
 * 🃏 COMPOSANT CARTE DE TÂCHE
 */
const TaskCard = ({ task, isMyTask, onEdit, onDelete, onViewDetails, onSubmit }) => {
  const { user } = useAuthStore();
  const [creatorUser, setCreatorUser] = useState(null);
  const { resolveUser } = useUserResolver();

  // Résoudre le créateur de la tâche
  useEffect(() => {
    if (task.createdBy) {
      resolveUser(task.createdBy).then(setCreatorUser);
    }
  }, [task.createdBy, resolveUser]);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'assigned': return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'open': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'assigned': return 'Assignée';
      case 'open': return 'Ouverte';
      default: return status || 'Non défini';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const canEditTask = (task, user) => {
    if (!user || !task) return false;
    return task.createdBy === user.uid || (task.assignedTo && task.assignedTo.includes(user.uid));
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${isMyTask ? 'ring-2 ring-blue-100' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(task.status)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
            {task.priority && (
              <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' && '🔥 Priorité haute'}
                {task.priority === 'medium' && '⚡ Priorité moyenne'}  
                {task.priority === 'low' && '🌱 Priorité basse'}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {task.description || 'Aucune description'}
          </p>
        </div>
        {task.xpReward && (
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            <Zap className="w-3 h-3" />
            {task.xpReward} XP
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Assignation avec noms réels */}
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Assigné à:</div>
          <AssignedUsersList 
            userIds={task.assignedTo} 
            maxDisplay={3} 
            task={task} 
          />
        </div>
      )}

      {/* Créateur avec nom réel */}
      {creatorUser && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Créé par:</span>
            <div className="flex items-center gap-1">
              <UserAvatar user={creatorUser} size="sm" />
              <span className="text-gray-700 font-medium">{creatorUser.displayName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Temps estimé */}
      {task.estimatedHours && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>~{task.estimatedHours}h estimée{task.estimatedHours > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {task.createdAt && (
            <span>Créée le {formatDate(task.createdAt)}</span>
          )}
          {task.dueDate && (
            <span className="text-orange-600">
              Échéance: {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Voir les détails"
            onClick={() => onViewDetails && onViewDetails(task)}
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {isMyTask && task.status !== 'completed' && (
            <button 
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Soumettre pour validation"
              onClick={() => onSubmit && onSubmit(task)}
            >
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
          
          {canEditTask(task, user) && (
            <>
              <button 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Modifier"
                onClick={() => onEdit && onEdit(task)}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
                onClick={() => onDelete && onDelete(task)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 📋 COMPOSANT PRINCIPAL TASKSPAGE
 */
export default function TasksPage() {
  const { user } = useAuthStore();
  
  // États
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('my_tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [taskStats, setTaskStats] = useState({
    myTotal: 0,
    myCompleted: 0,
    completionRate: 0,
    totalXpEarned: 0,
    availableTotal: 0
  });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  /**
   * 📥 CHARGEMENT DE TOUTES LES TÂCHES
   */
  const loadAllTasks = async () => {
    if (!user?.uid) {
      console.error('❌ Aucun utilisateur connecté');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 DEBUG - Début du chargement des tâches pour:', user.uid);
      
      // 1. Vérifier Firebase
      console.log('🔍 DEBUG - Vérification de la connexion Firebase...');
      if (!db) {
        console.error('❌ Firebase db non initialisé');
        return;
      }
      
      // 2. Pas besoin de charger les utilisateurs ici, ils seront chargés à la demande

      // 3. Requête Firebase avec debug
      console.log('🔍 DEBUG - Exécution de la requête Firebase...');
      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      console.log('🔍 DEBUG - Nombre de tâches récupérées depuis Firebase:', tasksSnapshot.size);
      
      const allTasks = [];
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        const task = {
          id: doc.id,
          ...taskData
        };
        allTasks.push(task);
        console.log('📄 Tâche trouvée:', {
          id: task.id,
          title: task.title,
          createdBy: task.createdBy,
          assignedTo: task.assignedTo,
          status: task.status
        });
      });

      console.log('🔍 DEBUG - Total tâches récupérées:', allTasks.length);

      // 4. Filtrage avec debug
      console.log('🔍 DEBUG - Filtrage des tâches pour utilisateur:', user.uid);
      
      const myTasks = allTasks.filter(task => {
        const isAssigned = task.assignedTo?.includes?.(user.uid) || task.assignedTo === user.uid;
        const isCreator = task.createdBy === user.uid;
        const result = isAssigned || isCreator;
        
        if (result) {
          console.log('✅ Tâche utilisateur trouvée:', task.title);
        }
        
        return result;
      });

      const availableTasks = allTasks.filter(task => {
        const isAvailable = task.isAvailable === true || (!task.assignedTo || task.assignedTo.length === 0) || task.status === 'open';
        const isNotMine = task.createdBy !== user.uid;
        const result = isAvailable && isNotMine;
        
        if (result) {
          console.log('✅ Tâche disponible trouvée:', task.title);
        }
        
        return result;
      });

      const otherTasks = allTasks.filter(task => {
        const isNotMine = task.createdBy !== user.uid;
        const isNotAssignedToMe = !task.assignedTo?.includes?.(user.uid) && task.assignedTo !== user.uid;
        const isNotAvailable = !(task.isAvailable === true || (!task.assignedTo || task.assignedTo.length === 0) || task.status === 'open');
        const result = isNotMine && isNotAssignedToMe && isNotAvailable;
        
        return result;
      });

      console.log('📊 Résultat filtrage:', {
        myTasks: myTasks.length,
        availableTasks: availableTasks.length,
        otherTasks: otherTasks.length,
        total: allTasks.length
      });

      // 5. Mettre à jour les états
      setMyTasks(myTasks);
      setAvailableTasks(availableTasks);
      setOtherTasks(otherTasks);
      
      // 6. Calculer les statistiques
      calculateStats(myTasks, availableTasks);
      
      console.log('✅ Chargement des tâches terminé avec succès');

    } catch (error) {
      console.error('❌ ERREUR CRITIQUE - Chargement des tâches:', error);
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);
      
      // Réinitialiser les états en cas d'erreur
      setMyTasks([]);
      setAvailableTasks([]);
      setOtherTasks([]);
      setTaskStats({
        myTotal: 0,
        myCompleted: 0,
        completionRate: 0,
        totalXpEarned: 0,
        availableTotal: 0
      });
      
    } finally {
      setLoading(false);
    }
  };

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
   * 📝 CRÉATION D'UNE NOUVELLE TÂCHE
   */
  const handleCreateTask = async (taskData) => {
    if (!user?.uid) {
      console.error('❌ Utilisateur non connecté');
      return;
    }

    try {
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
                <p className="text-sm text-gray-500">XP gagnés</p>
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

        {/* FILTRES ET RECHERCHE */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher des tâches..."
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="assigned">Assignée</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="open">Ouverte</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Priorité haute</option>
                <option value="medium">Priorité moyenne</option>
                <option value="low">Priorité basse</option>
              </select>
            </div>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('my_tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my_tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Mes Tâches ({myTasks.length})
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
              </button>
            </nav>
          </div>

          {/* CONTENU DES ONGLETS */}
          {activeTab === 'my_tasks' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes Tâches ({getFilteredTasks(myTasks).length})
                </h2>
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
                      ? 'Créez une nouvelle tâche ou prenez une tâche disponible !'
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
                        setSelectedTask(task);
                        setShowCreateModal(true);
                      }}
                      onDelete={(task) => handleDeleteTask(task.id)}
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Tâches Disponibles ({getFilteredTasks(availableTasks).length})
                </h2>
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
                      ? 'Il n\'y a pas de tâches disponibles pour le volontariat.'
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Autres Tâches ({getFilteredTasks(otherTasks).length})
                </h2>
              </div>

              {getFilteredTasks(otherTasks).length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {otherTasks.length === 0 ? 'Aucune autre tâche' : 'Aucune tâche ne correspond aux filtres'}
                  </h3>
                  <p className="text-gray-500">
                    {otherTasks.length === 0 
                      ? 'Il n\'y a pas d\'autres tâches à afficher.'
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

        {/* MODALS */}
        {showCreateModal && (
          <TaskForm
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedTask(null);
            }}
            onSubmit={handleCreateTask}
            initialTask={selectedTask}
            user={user}
          />
        )}

        {showSubmissionModal && selectedTask && (
          <TaskSubmissionModal
            isOpen={showSubmissionModal}
            onClose={() => {
              setShowSubmissionModal(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            user={user}
            onSubmit={async (submissionData) => {
              try {
                await updateDoc(doc(db, 'tasks', selectedTask.id), {
                  status: 'pending_validation',
                  submission: submissionData,
                  submittedAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                });
                await loadAllTasks();
                setShowSubmissionModal(false);
                setSelectedTask(null);
              } catch (error) {
                console.error('❌ Erreur soumission tâche:', error);
                alert('Erreur lors de la soumission: ' + error.message);
              }
            }}
          />
        )}

        {showDetailsModal && selectedTask && (
          <TaskDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            user={user}
          />
        )}

        {showCollaborationModal && (
          <CollaborationModal
            isOpen={showCollaborationModal}
            onClose={() => setShowCollaborationModal(false)}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
