// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx - VERSION CORRIGÉE
// CORRECTION ERREUR SYNTAXE LIGNE 681
// ==========================================

import React, { useState, useEffect } from 'react';
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
import { useAuthStore } from '../shared/stores/authStore.js';
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
  UserCheck,
  Edit
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

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'Utilisateur'}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  const displayName = user?.displayName || 'U';
  const initials = displayName
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
        {task?.xpReward && users.length > 0 && (
          <span className="ml-2">
            ({Math.round(task.xpReward / users.length)} XP/personne)
          </span>
        )}
      </div>
    </div>
  );
};

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

  // Récupérer les infos du créateur - PROTECTION AJOUTÉE
  const creator = task.createdBy ? userService.getUser(task.createdBy) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
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
      </div>
    </div>
  );
};

/**
 * ✏️ MODAL D'ÉDITION DE TÂCHE
 */
const TaskEditModal = ({ isOpen, task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    xpReward: 0,
    openToVolunteers: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        xpReward: task.xpReward || 0,
        openToVolunteers: task.openToVolunteers || false
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    setLoading(true);
    try {
      await onSave(task.id, formData);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Modifier la tâche
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titre de la tâche"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Description détaillée..."
              />
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>

            {/* XP Reward */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Récompense XP
              </label>
              <input
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            {/* Ouvrir aux volontaires */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="openToVolunteers"
                checked={formData.openToVolunteers}
                onChange={(e) => setFormData(prev => ({ ...prev, openToVolunteers: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="openToVolunteers" className="ml-2 text-sm text-gray-700">
                Ouvrir cette tâche aux volontaires
              </label>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
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
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
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
  const [showEditModal, setShowEditModal] = useState(false);
  
  // États pour les tâches sélectionnées
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForCollaboration, setSelectedTaskForCollaboration] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  // Statistiques calculées
  const [taskStats, setTaskStats] = useState({
    myTotal: 0,
    myCompleted: 0,
    completionRate: 0,
    totalXpEarned: 0,
    availableTotal: 0
  });

  /**
   * 🛡️ VÉRIFIER SI L'UTILISATEUR PEUT MODIFIER UNE TÂCHE
   */
  const canEditTask = (task, currentUser) => {
    if (!task || !currentUser) return false;
    
    // Admin peut tout modifier
    const isAdmin = currentUser.role === 'admin' || 
                    currentUser.isAdmin === true || 
                    currentUser.email === 'alain.bochec4@gmail.com';
    
    // Créateur peut modifier ses tâches
    const isCreator = task.createdBy === currentUser.uid;
    
    return isAdmin || isCreator;
  };

  /**
   * ✏️ OUVRIR L'ÉDITEUR DE TÂCHE
   */
  const handleEditTask = (task) => {
    console.log('✏️ Ouverture éditeur pour tâche:', task.id);
    setSelectedTaskForEdit(task);
    setShowEditModal(true);
  };

  /**
   * 💾 SAUVEGARDER LES MODIFICATIONS DE TÂCHE
   */
  const handleSaveTaskEdit = async (taskId, updatedData) => {
    try {
      console.log('💾 Sauvegarde modifications tâche:', { taskId, updatedData });
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
        lastEditedBy: user.uid,
        lastEditedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche modifiée avec succès');
      setShowEditModal(false);
      setSelectedTaskForEdit(null);
      await loadAllTasks();
      
      alert('Tâche modifiée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur modification tâche:', error);
      alert('Erreur lors de la modification: ' + error.message);
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
   * 📥 CHARGEMENT DE TOUTES LES TÂCHES
   */
  const loadAllTasks = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      if (userService.getAllUsers().length === 0) {
        await userService.loadAllUsers();
      }

      const tasksQuery = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc')
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      const allTasks = [];
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        allTasks.push({
          id: doc.id,
          ...taskData
        });
      });

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

      setMyTasks(myTasks);
      setAvailableTasks(availableTasks);
      setOtherTasks(otherTasks);
      calculateStats(myTasks, availableTasks);

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

      await addDoc(collection(db, 'task_submissions'), submissionRecord);

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
   * 🎨 COMPOSANT CARTE DE TÂCHE AVEC ÉDITION
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

    const creator = task.createdBy ? userService.getUser(task.createdBy) : null;
    const canEdit = canEditTask(task, user);

    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 transform transition-transform hover:scale-[1.02]">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                {canEdit && (
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Modifier cette tâche"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
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

          {/* AFFICHAGE CRÉATEUR */}
          {creator && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Créé par :</span>
                <UserAvatar user={creator} size="sm" />
                <span className="text-sm font-medium text-gray-700">{creator.displayName}</span>
                {canEdit && task.createdBy === user.uid && (
                  <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    Vous pouvez modifier
                  </span>
                )}
              </div>
            </div>
          )}

          {/* AFFICHAGE ASSIGNÉS */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="mb-4 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-blue-600 mb-1">
                    {task.assignedTo.length === 1 ? 'Assigné à :' : 'Assignés :'}
                  </div>
                  <AssignedUsersList userIds={task.assignedTo} maxDisplay={2} task={task} />
                </div>
              </div>
            </div>
          )}

          {/* Métadonnées et historique de modification */}
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
            </div>
            {task.lastEditedAt && (
              <span className="text-xs text-gray-400">
                Modifié le {formatDate(task.lastEditedAt)}
              </span>
            )}
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
      </div>
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
              </div>

              {myTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune tâche assignée
                  </h3>
                  <p className="text-gray-500">
                    Vous n'avez pas encore de tâches assignées.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myTasks
                    .filter(task => {
                      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
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
              </div>

              {availableTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune tâche disponible
                  </h3>
                  <p className="text-gray-500">
                    Il n'y a pas de tâches disponibles pour le volontariat.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableTasks.map(task => (
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
              </div>

              {otherTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune autre tâche
                  </h3>
                  <p className="text-gray-500">
                    Il n'y a pas d'autres tâches à afficher.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {otherTasks.map(task => (
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
                  status: 'pending',
                  assignedTo: taskData.assignedTo || [],
                  openToVolunteers: taskData.openToVolunteers || false
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

        {/* Modal soumission */}
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
                alert('Tâche soumise avec succès !');
              } catch (error) {
                console.error('❌ Erreur soumission:', error);
                alert('Erreur lors de la soumission: ' + error.message);
              }
            }}
          />
        )}

        {/* Modal d'édition */}
        {showEditModal && selectedTaskForEdit && (
          <TaskEditModal
            isOpen={showEditModal}
            task={selectedTaskForEdit}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTaskForEdit(null);
            }}
            onSave={handleSaveTaskEdit}
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

export default TasksPage;
