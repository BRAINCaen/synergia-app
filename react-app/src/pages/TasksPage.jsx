// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// SYSTÈME COLLABORATIF AVEC PARTAGE XP ET GESTION DES VOLONTAIRES
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
 * 👥 SERVICE DE GESTION DES UTILISATEURS (même que précédemment)
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
      displayName: `User ${userId.substring(0, 8)}...`,
      email: '',
      photoURL: null
    };
  }

  getUsers(userIds) {
    return userIds.map(id => this.getUser(id));
  }

  getAllUsers() {
    return Array.from(this.userCache.values());
  }
}

const userService = new UserService();

/**
 * 🎨 COMPOSANT AVATAR UTILISATEUR (même que précédemment)
 */
const UserAvatar = ({ user, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
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
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-medium`}>
      {initials}
    </div>
  );
};

/**
 * 🎨 COMPOSANT LISTE D'ASSIGNÉS AVEC XP PARTAGÉ
 */
const AssignedUsersList = ({ userIds, maxDisplay = 3, task }) => {
  const users = userService.getUsers(userIds);
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  // ✅ CALCUL XP PARTAGÉ
  const totalXP = task?.xpReward || 0;
  const xpPerUser = users.length > 0 ? Math.floor(totalXP / users.length) : 0;
  const remainingXP = totalXP - (xpPerUser * users.length);

  if (users.length === 0) {
    return (
      <span className="text-gray-500 text-sm">Non assigné</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Avatars */}
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative"
            title={`${user.displayName} - ${xpPerUser}${index === 0 && remainingXP > 0 ? '+' + remainingXP : ''} XP`}
          >
            <UserAvatar user={user} size="sm" />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium">
            +{remainingCount}
          </div>
        )}
      </div>
      
      {/* Noms et XP */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {displayUsers.map(user => user.displayName).join(', ')}
          {remainingCount > 0 && ` et ${remainingCount} autre${remainingCount > 1 ? 's' : ''}`}
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
 * 🤝 MODAL DE COLLABORATION - NOUVEAU
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
    
    // Filtrer les utilisateurs déjà assignés
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

      // ✅ RECALCULER LES XP AUTOMATIQUEMENT
      if (newAssignees.length > currentAssignees.length) {
        const totalXP = task.xpReward || 0;
        const xpPerUser = Math.floor(totalXP / newAssignees.length);
        
        updateData.xpPerUser = xpPerUser;
        updateData.xpDistribution = newAssignees.reduce((acc, userId) => {
          acc[userId] = xpPerUser;
          return acc;
        }, {});
        
        console.log('💰 XP redistribué:', xpPerUser, 'XP par personne');
      }

      await updateDoc(taskRef, updateData);

      // Créer des notifications pour les nouveaux collaborateurs
      for (const newUser of selectedUsers) {
        await addDoc(collection(db, 'notifications'), {
          userId: newUser.id,
          type: 'collaboration_invite',
          title: 'Invitation à collaborer',
          message: `${user.displayName || user.email} vous a invité à collaborer sur "${task.title}"`,
          taskId: task.id,
          taskTitle: task.title,
          invitedBy: user.uid,
          createdAt: serverTimestamp(),
          read: false
        });
      }

      console.log('✅ Collaboration mise à jour');
      onUpdate && onUpdate();
      onClose();

    } catch (error) {
      console.error('❌ Erreur ajout collaborateurs:', error);
      alert('Erreur lors de l\'ajout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gérer la collaboration</h2>
            <p className="text-gray-600 mt-1">{task?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* XP actuels */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Répartition XP</h3>
            </div>
            <p className="text-yellow-700">
              <strong>{task?.xpReward || 0} XP total</strong> - 
              {(task?.assignedTo || []).length > 0 && (
                <span> {Math.floor((task?.xpReward || 0) / (task?.assignedTo || []).length)} XP par personne actuellement</span>
              )}
            </p>
          </div>

          {/* Assignés actuels */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Collaborateurs actuels ({(task?.assignedTo || []).length})
            </h3>
            {(task?.assignedTo || []).length > 0 ? (
              <div className="space-y-2">
                {userService.getUsers(task.assignedTo).map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <UserAvatar user={user} size="md" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">
                      {Math.floor((task?.xpReward || 0) / (task?.assignedTo || []).length)} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucun collaborateur</p>
            )}
          </div>

          {/* Ajouter des collaborateurs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ajouter des collaborateurs</h3>
            
            {availableUsers.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableUsers.map(availableUser => (
                  <div
                    key={availableUser.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.some(u => u.id === availableUser.id)
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedUsers(prev => 
                        prev.some(u => u.id === availableUser.id)
                          ? prev.filter(u => u.id !== availableUser.id)
                          : [...prev, availableUser]
                      );
                    }}
                  >
                    <UserAvatar user={availableUser} size="md" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{availableUser.displayName}</p>
                      <p className="text-sm text-gray-500">{availableUser.email}</p>
                    </div>
                    {selectedUsers.some(u => u.id === availableUser.id) && (
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tous les utilisateurs sont déjà assignés</p>
            )}

            {selectedUsers.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedUsers.length} personne{selectedUsers.length > 1 ? 's' : ''} sélectionnée{selectedUsers.length > 1 ? 's' : ''}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Nouveau XP par personne: {Math.floor((task?.xpReward || 0) / ((task?.assignedTo || []).length + selectedUsers.length))} XP
                </p>
              </div>
            )}
          </div>

          {/* Option volontaires */}
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

        {/* Actions */}
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mise à jour...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Mettre à jour
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * 🎨 MODAL DÉTAILS DE TÂCHE AMÉLIORÉE (même que précédemment mais avec XP partagé)
 */
const TaskDetailsModal = ({ isOpen, task, onClose }) => {
  if (!isOpen || !task) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'validation_pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'open': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const assignedUsers = userService.getUsers(task.assignedTo || []);
  const totalXP = task.xpReward || 0;
  const xpPerUser = assignedUsers.length > 0 ? Math.floor(totalXP / assignedUsers.length) : totalXP;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {task.status === 'completed' && 'Terminé'}
                {task.status === 'in_progress' && 'En cours'}
                {task.status === 'validation_pending' && 'En validation'}
                {task.status === 'pending' && 'En attente'}
                {task.status === 'open' && 'Ouvert'}
              </span>
              {task.openToVolunteers && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Ouvert aux volontaires
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          
          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {task.description || 'Aucune description fournie.'}
            </p>
          </div>

          {/* Métadonnées principales avec XP partagé */}
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

          {/* Assignés avec XP détaillé */}
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

          {/* Tags */}
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

          {/* Informations temporelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Créé le</span>
              </div>
              <p className="text-sm text-gray-600">
                {task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Date inconnue'}
              </p>
            </div>

            {task.dueDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Échéance</span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(task.dueDate.seconds * 1000).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Créateur */}
          {task.createdBy && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Créateur</h4>
              <div className="flex items-center gap-3">
                <UserAvatar user={userService.getUser(task.createdBy)} size="md" />
                <div>
                  <p className="font-medium text-blue-800">{userService.getUser(task.createdBy).displayName}</p>
                  <p className="text-sm text-blue-600">{userService.getUser(task.createdBy).email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * ✅ TASKS PAGE PRINCIPALE AVEC SYSTÈME COLLABORATIF
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
   * 📊 CHARGER TOUTES LES TÂCHES - LOGIQUE CORRIGÉE
   */
  const loadAllTasks = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement de toutes les tâches pour:', user.uid);
      
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
      
      console.log('📊 Total tâches trouvées:', allTasks.length);
      
      // ✅ CORRECTION 1: Mes tâches (assignées à moi OU créées par moi)
      const myTasksList = allTasks.filter(task => {
        const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
        const isCreatedByMe = task.createdBy === user.uid;
        return isAssignedToMe || isCreatedByMe;
      });
      
      // ✅ CORRECTION 2: Tâches disponibles (ouvertes aux volontaires ET pas assignées à moi)
      const availableTasksList = allTasks.filter(task => {
        const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
        const isCreatedByMe = task.createdBy === user.uid;
        const hasAssignees = (task.assignedTo || []).length > 0;
        
        // Disponible si :
        // - Pas assignée à moi ET pas créée par moi
        // - ET (pas d'assignés OU ouverte aux volontaires)
        // - ET statut ouvert
        const isAvailableStatus = ['pending', 'open'].includes(task.status);
        const isOpenForVolunteers = !hasAssignees || task.openToVolunteers;
        
        return !isAssignedToMe && !isCreatedByMe && isAvailableStatus && isOpenForVolunteers;
      });

      // ✅ CORRECTION 3: Tâches des autres (assignées à d'autres ET pas créées par moi)
      const otherTasksList = allTasks.filter(task => {
        const isAssignedToMe = (task.assignedTo || []).includes(user.uid);
        const isCreatedByMe = task.createdBy === user.uid;
        const hasAssignees = (task.assignedTo || []).length > 0;
        
        return hasAssignees && !isAssignedToMe && !isCreatedByMe;
      });
      
      console.log('✅ Mes tâches:', myTasksList.length);
      console.log('✅ Tâches disponibles:', availableTasksList.length);
      console.log('✅ Tâches des autres:', otherTasksList.length);
      
      setMyTasks(myTasksList);
      setAvailableTasks(availableTasksList);
      setOtherTasks(otherTasksList);
      
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
   * 🙋 SE PORTER VOLONTAIRE POUR UNE TÂCHE - AVEC RECALCUL XP
   */
  const handleVolunteerForTask = async (taskId) => {
    try {
      console.log('🙋 Volontariat pour tâche:', taskId);
      
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        alert('Tâche introuvable');
        return;
      }
      
      const currentTask = taskDoc.data();
      const currentAssignees = currentTask.assignedTo || [];
      const newAssignees = [...currentAssignees, user.uid];
      
      // ✅ RECALCUL AUTOMATIQUE DES XP
      const totalXP = currentTask.xpReward || 0;
      const xpPerUser = Math.floor(totalXP / newAssignees.length);
      
      const updateData = {
        assignedTo: newAssignees,
        status: 'in_progress',
        volunteerDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        xpPerUser: xpPerUser,
        xpDistribution: newAssignees.reduce((acc, userId) => {
          acc[userId] = xpPerUser;
          return acc;
        }, {})
      };
      
      await updateDoc(taskRef, updateData);
      
      console.log('✅ Volontariat enregistré - XP redistribué:', xpPerUser, 'par personne');
      await loadAllTasks();
      
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      alert('Erreur lors du volontariat: ' + error.message);
    }
  };

  /**
   * 🚪 SE RETIRER D'UNE TÂCHE - AVEC RECALCUL XP
   */
  const handleWithdrawFromTask = async (taskId) => {
    try {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vous retirer de cette tâche ?');
      if (!confirmed) return;
      
      console.log('🚪 [DEBUG] Début retrait de tâche:', taskId);
      
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        alert('Tâche introuvable');
        return;
      }
      
      const currentTask = taskDoc.data();
      const currentAssignees = currentTask.assignedTo || [];
      const newAssignees = currentAssignees.filter(id => id !== user.uid);
      
      // ✅ RECALCUL AUTOMATIQUE DES XP
      const totalXP = currentTask.xpReward || 0;
      const xpPerUser = newAssignees.length > 0 ? Math.floor(totalXP / newAssignees.length) : totalXP;
      
      const updateData = {
        assignedTo: newAssignees,
        updatedAt: serverTimestamp(),
        lastWithdrawAt: serverTimestamp(),
        lastWithdrawBy: user.uid,
        xpPerUser: xpPerUser,
        xpDistribution: newAssignees.reduce((acc, userId) => {
          acc[userId] = xpPerUser;
          return acc;
        }, {})
      };
      
      // Si plus personne n'est assigné, remettre la tâche disponible
      if (newAssignees.length === 0) {
        updateData.status = 'open';
        updateData.openToVolunteers = true;
      }
      
      await updateDoc(taskRef, updateData);
      
      console.log('✅ Retrait réussi - XP redistribué:', xpPerUser, 'par personne restante');
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
    const canSubmit = isAssignedToMe && task.status === 'in_progress';
    const canComplete = isAssignedToMe && ['in_progress', 'validation_pending'].includes(task.status);
    const canManageCollaboration = isAssignedToMe || isCreatedByMe;
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200';
        case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'validation_pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'open': return 'bg-purple-100 text-purple-800 border-purple-200';
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
          
          <div className="flex flex-col gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {task.status === 'completed' && 'Terminé'}
              {task.status === 'in_progress' && 'En cours'}
              {task.status === 'validation_pending' && 'En validation'}
              {task.status === 'pending' && 'En attente'}
              {task.status === 'open' && 'Ouvert'}
            </span>
            {task.openToVolunteers && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                🤝 Collaboratif
              </span>
            )}
          </div>
        </div>

        {/* Métadonnées */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            {getPriorityIcon(task.priority)}
            <span className="capitalize">{task.priority || 'medium'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>
              {task.xpReward || 0} XP
              {(task.assignedTo || []).length > 1 && (
                <span className="text-xs"> ({Math.floor((task.xpReward || 0) / (task.assignedTo || []).length)} chacun)</span>
              )}
            </span>
          </div>
        </div>

        {/* ✅ ASSIGNÉS avec noms dans l'aperçu + XP partagé */}
        {(task.assignedTo || []).length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {(task.assignedTo || []).length > 1 ? 'Collaborateurs' : 'Assigné à'} :
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
                <p className="text-gray-600">Mes tâches</p>
              </div>
            </div>
          </div>

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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{taskStats.totalXpEarned}</h3>
                <p className="text-gray-600">XP gagnés (partagés)</p>
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
          <div className="flex flex-col sm:flex-row gap-4">
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

        {/* CONTENU PRINCIPAL */}
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
                    Vous n'avez pas encore de tâches assignées. Explorez les tâches disponibles pour commencer !
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
                  Les Autres Tâches ({otherTasks.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Tâches assignées à d'autres personnes
                </div>
              </div>

              {otherTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune autre tâche
                  </h3>
                  <p className="text-gray-500">
                    Il n'y a pas de tâches assignées à d'autres personnes en ce moment.
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

        {/* ✅ NOUVEAU: Modal collaboration */}
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
