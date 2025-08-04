// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// SYSTÈME COLLABORATIF AVEC PARTAGE XP ET GESTION DES VOLONTAIRES
// VERSION CORRIGÉE - SANS DUPLICATIONS
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

// Instance unique du service
const userService = new UserService();

/**
 * 👤 COMPOSANT AVATAR UTILISATEUR
 */
const UserAvatar = ({ user, size = "sm" }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  const initials = user.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className={`${sizeClasses[size]} bg-blue-500 text-white rounded-full flex items-center justify-center ${textSizeClasses[size]} font-medium`}>
      {initials}
    </div>
  );
};

/**
 * 👥 COMPOSANT LISTE DES UTILISATEURS ASSIGNÉS
 */
const AssignedUsersList = ({ userIds = [], maxDisplay = 3, task = null }) => {
  if (!userIds || userIds.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Aucun utilisateur assigné
      </div>
    );
  }

  const users = userIds.map(id => userService.getUser(id));
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;
  
  // Calcul XP avec partage
  const totalXP = task?.xpReward || 0;
  const xpPerUser = users.length > 0 ? Math.floor(totalXP / users.length) : 0;
  const remainingXP = totalXP - (xpPerUser * users.length);

  return (
    <div className="space-y-2">
      <div className="flex items-center -space-x-2">
        {displayUsers.map((user) => (
          <div key={user.id} className="relative group">
            <UserAvatar user={user} size="md" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {user.displayName}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium">
            +{remainingCount}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        <span className="font-medium">
          {users.length} assigné{users.length > 1 ? 's' : ''}
        </span>
        <span className="text-xs text-gray-500">
          {users.length} assigné{users.length > 1 ? 's' : ''} • {xpPerUser} XP chacun
          {remainingXP > 0 && ` (+${remainingXP} bonus)`}
        </span>
      </div>
    </div>
  );
};

/**
 * 🤝 MODAL DE COLLABORATION
 */
const CollaborationModal = ({ isOpen, task, onClose, onUpdate }) => {
  const { user } = useAuthStore();
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isOpenToVolunteers, setIsOpenToVolunteers] = useState(task?.openToVolunteers || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen]);

  const loadAvailableUsers = () => {
    const allUsers = userService.getAllUsers();
    const currentAssignees = task?.assignedTo || [];
    
    const available = allUsers.filter(u => !currentAssignees.includes(u.id));
    setAvailableUsers(available);
  };

  const handleAddCollaborators = async () => {
    if (selectedUsers.length === 0 && !isOpenToVolunteers) return;

    try {
      setLoading(true);
      console.log('🤝 Ajout collaborateurs:', selectedUsers.map(u => u.displayName));

      const taskRef = doc(db, 'tasks', task.id);
      const currentAssignees = task.assignedTo || [];
      const newAssignees = [...currentAssignees, ...selectedUsers.map(u => u.id)];

      const updateData = {
        assignedTo: newAssignees,
        openToVolunteers: isOpenToVolunteers,
        updatedAt: serverTimestamp(),
        collaborationUpdatedBy: user.uid,
        collaborationUpdatedAt: serverTimestamp()
      };

      await updateDoc(taskRef, updateData);
      
      console.log('✅ Collaboration mise à jour');
      onUpdate && await onUpdate();
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur collaboration:', error);
      alert('Erreur lors de la mise à jour: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Gérer la Collaboration</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Ajouter des collaborateurs</h4>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {availableUsers.map(u => (
                <label key={u.id} className="flex items-center p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedUsers.some(su => su.id === u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, u]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(su => su.id !== u.id));
                      }
                    }}
                    className="mr-2"
                  />
                  <UserAvatar user={u} size="sm" />
                  <span className="ml-2 text-sm">{u.displayName}</span>
                </label>
              ))}
            </div>
            {selectedUsers.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  <strong>{selectedUsers.length} personne{selectedUsers.length > 1 ? 's' : ''} sélectionnée{selectedUsers.length > 1 ? 's' : ''}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Nouveau XP par personne: {Math.floor((task?.xpReward || 0) / ((task?.assignedTo || []).length + selectedUsers.length))} XP
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="openToVolunteers"
                checked={isOpenToVolunteers}
                onChange={(e) => setIsOpenToVolunteers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="openToVolunteers" className="flex-1">
                <div className="font-medium text-gray-900">Ouvrir aux volontaires</div>
                <div className="text-sm text-gray-500">
                  Permettre à d'autres utilisateurs de se porter volontaires pour cette tâche
                </div>
              </label>
              <Share2 className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleAddCollaborators}
            disabled={loading || (selectedUsers.length === 0 && isOpenToVolunteers === (task?.openToVolunteers || false))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Confirmer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 👁️ MODAL DÉTAILS DE TÂCHE
 */
const TaskDetailsModal = ({ isOpen, task, onClose }) => {
  if (!isOpen || !task) return null;

  const assignedUsers = (task.assignedTo || []).map(id => userService.getUser(id));
  const totalXP = task.xpReward || 0;
  const xpPerUser = assignedUsers.length > 0 ? Math.floor(totalXP / assignedUsers.length) : totalXP;

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Détails de la tâche</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Priorité</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 capitalize">
                {task.priority || 'Moyenne'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">XP Total / Par personne</span>
              </div>
              <div>
                <span className="text-lg font-bold text-yellow-600">
                  {totalXP} XP
                </span>
                {assignedUsers.length > 1 && (
                  <div className="text-sm text-yellow-600">
                    {xpPerUser} XP chacun
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Collaborateurs ({assignedUsers.length})
              </h3>
            </div>
            
            {assignedUsers.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500">Aucune personne assignée</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {assignedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg shadow-sm">
                      <UserAvatar user={user} size="md" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-600">{xpPerUser} XP</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((1 / assignedUsers.length) * 100)}% du total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
          </div>
        </div>
      </div>
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
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForCollaboration, setSelectedTaskForCollaboration] = useState(null);
  
  // Statistiques réelles
  const [taskStats, setTaskStats] = useState({
    myTotal: 0,
    myCompleted: 0,
    myInProgress: 0,
    myPending: 0,
    availableTotal: 0,
    otherTotal: 0,
    completionRate: 0,
    totalXpEarned: 0
  });

  useEffect(() => {
    if (user?.uid) {
      initializeData();
    }
  }, [user?.uid]);

  useEffect(() => {
    calculateStats();
  }, [myTasks, availableTasks, otherTasks]);

  /**
   * 🚀 INITIALISER TOUTES LES DONNÉES
   */
  const initializeData = async () => {
    await userService.loadAllUsers();
    await loadAllTasks();
  };

  /**
   * 📊 CHARGER TOUTES LES TÂCHES AVEC LOGIQUE CORRIGÉE
   */
  const loadAllTasks = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 ========== DÉBUT CHARGEMENT TÂCHES ==========');
      console.log('📊 [1] Chargement pour utilisateur:', user.uid);
      
      const allTasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
      
      const allTasksSnapshot = await getDocs(allTasksQuery);
      const allTasks = [];
      allTasksSnapshot.forEach(doc => {
        allTasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('📊 [2] Total tâches Firebase:', allTasks.length);
      
      // ✅ CORRECTION 1: Mes tâches = SEULEMENT les tâches où je suis ASSIGNÉ
      const myTasksList = allTasks.filter(task => {
        const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
        const result = isAssignedToMe;
        
        if (result) {
          console.log(`📊 [3] MA TÂCHE ASSIGNÉE: "${task.title}" - Assigné: ${isAssignedToMe}`);
        }
        
        return result;
      });
      
      // ✅ CORRECTION 2: Tâches disponibles - NOUVELLE LOGIQUE COLLABORATIVE
      const availableTasksList = allTasks.filter(task => {
        const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
        const isCreatedByMe = task.createdBy === user.uid;
        const hasAssignees = (task.assignedTo || []).length > 0;
        
        // ✅ NOUVELLE LOGIQUE: Disponible si :
        // 1. Pas assignée à moi ET pas créée par moi
        // 2. ET statut ouvert (pending, open, todo)
        // 3. ET (pas d'assignés OU ouverte aux volontaires)
        const isAvailableStatus = ['pending', 'open', 'todo'].includes(task.status);
        
        // ✅ CORRECTION CLÉE: Inclure les tâches collaboratives
        const isOpenForVolunteers = !hasAssignees || task.openToVolunteers === true;
        
        // ✅ CONDITION FINALE SIMPLIFIÉE
        const result = !isAssignedToMe && !isCreatedByMe && isAvailableStatus && isOpenForVolunteers;
        
        if (result) {
          console.log(`📊 [4] TÂCHE DISPONIBLE: "${task.title}" - Status: ${task.status}, OpenToVolunteers: ${task.openToVolunteers}, HasAssignees: ${hasAssignees}`);
        }
        
        return result;
      });

      // ✅ CORRECTION 3: Tâches des autres - LOGIQUE MISE À JOUR
      const otherTasksList = allTasks.filter(task => {
        const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
        const isCreatedByMe = task.createdBy === user.uid;
        const hasAssignees = (task.assignedTo || []).length > 0;
        
        // ✅ NOUVELLES CONDITIONS: Autres tâches si :
        // 1. Assignées à d'autres personnes (pas à moi) ET PAS ouvertes aux volontaires
        // 2. OU créées par moi mais pas assignées à moi
        const isAssignedToOthersOnly = hasAssignees && !isAssignedToMe && !task.openToVolunteers;
        const isMyCreationNotAssignedToMe = isCreatedByMe && !isAssignedToMe;
        
        const result = isAssignedToOthersOnly || isMyCreationNotAssignedToMe;
        
        if (result) {
          console.log(`📊 [5] TÂCHE DES AUTRES: "${task.title}" - Assignés: ${task.assignedTo?.length || 0}, Créé par moi: ${isCreatedByMe}, OpenToVolunteers: ${task.openToVolunteers}`);
        }
        
        return result;
      });
      
      console.log('📊 [6] RÉSULTATS FINAUX:');
      console.log('📊   - Mes tâches:', myTasksList.length);
      console.log('📊   - Tâches disponibles:', availableTasksList.length);
      console.log('📊   - Tâches des autres:', otherTasksList.length);
      
      // ✅ MISE À JOUR DES ÉTATS
      setMyTasks(myTasksList);
      setAvailableTasks(availableTasksList);
      setOtherTasks(otherTasksList);
      
      console.log('📊 [7] États mis à jour avec succès');
      console.log('📊 ========== FIN CHARGEMENT TÂCHES ==========');
      
    } catch (error) {
      console.error('❌ ========== ERREUR CHARGEMENT ==========');
      console.error('❌ Erreur chargement tâches:', error);
      console.error('❌ =====================================');
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
    const myPending = myTasks.filter(t => ['pending', 'todo', 'open'].includes(t.status)).length;
    const availableTotal = availableTasks.length;
    const otherTotal = otherTasks.length;
    const completionRate = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;
    
    // ✅ CALCUL XP AVEC PARTAGE
    const totalXpEarned = myTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, task) => {
        const assignedCount = (task.assignedTo || []).length;
        const taskXP = task.xpReward || 0;
        const myShare = assignedCount > 0 ? Math.floor(taskXP / assignedCount) : taskXP;
        return sum + myShare;
      }, 0);

    setTaskStats({
      myTotal,
      myCompleted,
      myInProgress,
      myPending,
      availableTotal,
      otherTotal,
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
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        alert('Tâche non trouvée');
        return;
      }
      
      const currentTask = taskDoc.data();
      const currentAssignees = currentTask.assignedTo || [];
      
      if (currentAssignees.includes(user.uid)) {
        alert('Vous êtes déjà assigné à cette tâche');
        return;
      }
      
      const newAssignees = [...currentAssignees, user.uid];
      
      await updateDoc(taskRef, {
        assignedTo: newAssignees,
        status: currentTask.status === 'pending' ? 'in_progress' : currentTask.status,
        volunteeredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Volontariat enregistré');
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
    const confirmed = window.confirm('Êtes-vous sûr de vouloir vous retirer de cette tâche ?');
    if (!confirmed) return;
    
    try {
      console.log('🚪 ========== DÉBUT RETRAIT DEBUG ==========');
      console.log('🚪 [1] Task ID:', taskId);
      console.log('🚪 [2] User ID:', user.uid);
      
      const taskRef = doc(db, 'tasks', taskId);
      
      // ✅ ÉTAPE 1: Récupérer les données actuelles
      console.log('🚪 [3] Récupération données tâche...');
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        console.error('❌ [ERROR] Tâche introuvable:', taskId);
        alert('Erreur: Tâche introuvable');
        return;
      }
      
      const currentTask = taskDoc.data();
      const currentAssignees = currentTask.assignedTo || [];
      
      console.log('🚪 [4] Tâche actuelle:', {
        title: currentTask.title,
        status: currentTask.status,
        assignedTo: currentAssignees
      });
      
      // ✅ ÉTAPE 2: Vérifier présence utilisateur
      const userIndex = currentAssignees.indexOf(user.uid);
      const isUserAssigned = userIndex !== -1;
      
      console.log('🚪 [5] Vérification assignation:', {
        userInList: isUserAssigned,
        userIndex: userIndex,
        currentAssignees: currentAssignees
      });
      
      if (!isUserAssigned) {
        console.warn('⚠️ [WARNING] Utilisateur pas dans la liste des assignés');
        alert('Vous n\'êtes pas assigné à cette tâche');
        return;
      }
      
      // ✅ ÉTAPE 3: Créer nouvelle liste sans l'utilisateur
      const newAssignees = currentAssignees.filter(id => id !== user.uid);
      
      console.log('🚪 [6] Nouvelle liste assignés:', {
        ancien: currentAssignees,
        nouveau: newAssignees,
        différence: currentAssignees.length - newAssignees.length
      });
      
      // ✅ ÉTAPE 4: Mettre à jour la tâche
      await updateDoc(taskRef, {
        assignedTo: newAssignees,
        status: newAssignees.length === 0 ? 'pending' : currentTask.status,
        withdrawnAt: serverTimestamp(),
        withdrawnBy: user.uid,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [SUCCESS] Retrait réussi');
      console.log('🚪 ========== FIN RETRAIT DEBUG ==========');
      
      await loadAllTasks();
      
    } catch (error) {
      console.error('❌ ========== ERREUR RETRAIT ==========');
      console.error('❌ [ERROR] Erreur complète:', error);
      console.error('❌ [ERROR] Stack trace:', error.stack);
      console.error('❌ [ERROR] Message:', error.message);
      console.error('❌ =======================================');
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
   * 👁️ VOIR LES DÉTAILS D'UNE TÂCHE
   */
  const handleViewTaskDetails = (task) => {
    setSelectedTaskForDetails(task);
    setShowDetailsModal(true);
  };

  /**
   * 🤝 GÉRER LA COLLABORATION
   */
  const handleManageCollaboration = (task) => {
    setSelectedTaskForCollaboration(task);
    setShowCollaborationModal(true);
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
   * 🎨 COMPOSANT CARTE DE TÂCHE AMÉLIORÉE AVEC COLLABORATION
   */
  const TaskCard = ({ task, isMyTask = false, isOtherTask = false }) => {
    const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
    const isCreatedByMe = task.createdBy === user.uid;
    const canVolunteer = !isAssignedToMe && !isMyTask && !isOtherTask;
    const canSubmit = isMyTask && ['in_progress', 'todo'].includes(task.status);
    const canComplete = isMyTask && task.status !== 'completed';
    const canManageCollaboration = isCreatedByMe || isAssignedToMe;

    const getStatusColor = (status) => {
      const colors = {
        'completed': 'bg-green-100 text-green-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'validation_pending': 'bg-yellow-100 text-yellow-800',
        'pending': 'bg-gray-100 text-gray-800',
        'todo': 'bg-purple-100 text-purple-800',
        'open': 'bg-indigo-100 text-indigo-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
      const colors = {
        'high': 'text-red-600',
        'medium': 'text-yellow-600',
        'low': 'text-green-600'
      };
      return colors[priority] || 'text-gray-600';
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        {/* En-tête */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
          </div>
          <div className="ml-4 flex flex-col items-end gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'in_progress' ? 'En cours' :
               task.status === 'completed' ? 'Terminée' :
               task.status === 'validation_pending' ? 'En validation' :
               task.status === 'pending' ? 'En attente' :
               task.status === 'todo' ? 'À faire' :
               task.status === 'open' ? 'Ouverte' : task.status}
            </span>
            {task.priority && (
              <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'Haute' :
                 task.priority === 'medium' ? 'Moyenne' :
                 task.priority === 'low' ? 'Basse' : task.priority}
              </span>
            )}
          </div>
        </div>

        {/* Métadonnées */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {task.xpReward && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-yellow-600">
                  {Math.floor(task.xpReward / Math.max((task.assignedTo || []).length, 1))} XP
                </span>
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>
        </div>

        {/* Utilisateurs assignés */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="font-medium">
                {task.assignedTo.length > 1 ? 'Collaborateurs' : 'Assigné à'} :
              </span>
            </div>
            <AssignedUsersList userIds={task.assignedTo} maxDisplay={2} task={task} />
          </div>
        )}

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
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 flex-wrap">
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
              
              {canManageCollaboration && (
                <button
                  onClick={() => handleManageCollaboration(task)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Collaborer
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
          {!isMyTask && !isOtherTask && canVolunteer && (
            <button
              onClick={() => handleVolunteerForTask(task.id)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Heart className="w-4 h-4" />
              Se porter volontaire
            </button>
          )}

          {/* Badge pour les tâches des autres avec option collaboration */}
          {isOtherTask && (
            <>
              <span className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <Users className="w-4 h-4" />
                Assignée à d'autres
              </span>
              {task.openToVolunteers && (
                <button
                  onClick={() => handleVolunteerForTask(task.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Rejoindre
                </button>
              )}
            </>
          )}
          
          {/* Bouton détails */}
          <button 
            onClick={() => handleViewTaskDetails(task)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm ml-auto"
          >
            <Eye className="w-4 h-4" />
            Détails
          </button>
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
                Les Autres Tâches ({taskStats.otherTotal})
              </button>
            </nav>
          </div>
        </div>

        {/* FILTRES ET RECHERCHE */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {activeTab === 'my_tasks' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="validation_pending">En validation</option>
              </select>
            )}

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
        </div>

        {/* CONTENU PRINCIPAL SELON L'ONGLET ACTIF */}
        <div className="space-y-6">
          {activeTab === 'my_tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes Tâches ({myTasks.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Tâches qui vous sont assignées
                </div>
              </div>

              {myTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune tâche assignée
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Vous n'êtes assigné à aucune tâche pour le moment. Explorez les tâches disponibles pour vous porter volontaire !
                  </p>
                  <button
                    onClick={() => setActiveTab('available_tasks')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Voir les tâches disponibles
                  </button>
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
                  Contribuez aux projets collaboratifs
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
                      <TaskCard key={task.id} task={task} isMyTask={false} isOtherTask={true} />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODALS */}
        
        {/* Modal création tâche */}
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
            onSubmit={async () => {
              setShowSubmissionModal(false);
              setSelectedTaskForSubmission(null);
              await loadAllTasks();
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
