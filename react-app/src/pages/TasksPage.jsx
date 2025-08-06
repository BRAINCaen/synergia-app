// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE GESTION DES TÂCHES - VERSION COMPLÈTE AVEC CORRECTION
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
import { userService } from '../core/services/userService.js';

// Composants
import TaskForm from '../components/tasks/TaskForm.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import TaskDetailsModal from '../components/ui/TaskDetailModal.jsx';
import CollaborationModal from '../components/collaboration/CollaborationModal.jsx';

/**
 * 🎨 COMPOSANT AVATAR UTILISATEUR
 */
const UserAvatar = ({ user, size = 'md' }) => {
  if (!user) {
    return <div className={`w-8 h-8 bg-gray-300 rounded-full`} />;
  }

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

  const displayName = user.displayName || user.email || 'User';
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      validation_pending: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      validation_pending: 'Validation en attente',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {task.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  Priorité {task.priority}
                </span>
                {task.xpReward && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {task.xpReward} XP
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.description || 'Aucune description fournie.'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Utilisateurs assignés */}
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Utilisateurs assignés
                  </h3>
                  <AssignedUsersList userIds={task.assignedTo} maxDisplay={5} task={task} />
                </div>
              )}
            </div>

            {/* Sidebar informations */}
            <div className="space-y-6">
              
              {/* Créateur */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Créé par
                </h4>
                {creator ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar user={creator} size="sm" />
                    <span className="text-gray-700">{creator.displayName || creator.email}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Créateur inconnu</span>
                )}
              </div>

              {/* Dates */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dates importantes
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Créée le:</span>
                    <br />
                    <span className="text-gray-900">{formatDate(task.createdAt)}</span>
                  </div>
                  {task.updatedAt && (
                    <div>
                      <span className="text-gray-600">Dernière maj:</span>
                      <br />
                      <span className="text-gray-900">{formatDate(task.updatedAt)}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div>
                      <span className="text-gray-600">Échéance:</span>
                      <br />
                      <span className="text-gray-900">{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Métadonnées */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Informations
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulté:</span>
                    <span className="text-gray-900">{task.difficulty || 'Non définie'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ouvert aux volontaires:</span>
                    <span className="text-gray-900">
                      {task.openToVolunteers ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projet:</span>
                    <span className="text-gray-900">
                      {task.projectId ? task.projectId : 'Aucun'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 📋 CARTE DE TÂCHE
 */
const TaskCard = ({ task, isMyTask = false }) => {
  const { user } = useAuthStore();

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
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
      return '';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'border-yellow-300 bg-yellow-50',
      in_progress: 'border-blue-300 bg-blue-50',
      validation_pending: 'border-purple-300 bg-purple-50',
      completed: 'border-green-300 bg-green-50',
      cancelled: 'border-red-300 bg-red-50'
    };
    return colors[status] || 'border-gray-300 bg-white';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <Target className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const canEditTask = (task, currentUser) => {
    if (!task || !currentUser) return false;
    
    const isAdmin = currentUser.role === 'admin' || 
                    currentUser.isAdmin === true || 
                    currentUser.email === 'alain.bochec4@gmail.com';
    const isCreator = task.createdBy === currentUser.uid;
    
    return isAdmin || isCreator;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${getStatusColor(task.status)}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {task.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {task.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {getPriorityIcon(task.priority)}
          {task.xpReward && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
              {task.xpReward} XP
            </span>
          )}
        </div>
      </div>

      {/* Assignés */}
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="mb-4">
          <AssignedUsersList userIds={task.assignedTo} maxDisplay={3} task={task} />
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
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
            onClick={() => {
              // Cette logique sera gérée par le composant parent
              console.log('Voir détails tâche:', task.id);
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {isMyTask && task.status !== 'completed' && (
            <button 
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Soumettre pour validation"
              onClick={() => {
                // Cette logique sera gérée par le composant parent
                console.log('Soumettre tâche:', task.id);
              }}
            >
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
          
          {canEditTask(task, user) && (
            <>
              <button 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Modifier"
                onClick={() => {
                  // Cette logique sera gérée par le composant parent
                  console.log('Modifier tâche:', task.id);
                }}
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button 
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
                onClick={() => {
                  // Cette logique sera gérée par le composant parent
                  console.log('Supprimer tâche:', task.id);
                }}
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
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
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
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Récompense XP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Récompense XP
              </label>
              <input
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                min="0"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Options */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="openToVolunteers"
                checked={formData.openToVolunteers}
                onChange={(e) => setFormData(prev => ({ ...prev, openToVolunteers: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="openToVolunteers" className="ml-2 text-sm text-gray-700">
                Ouverte aux volontaires
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  'Sauvegarder'
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
 * 👥 MODAL D'ASSIGNATION D'UTILISATEURS
 */
const UserAssignmentModal = ({ isOpen, task, onClose, onAssign }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const users = userService.getAllUsers().filter(u => 
        u.id !== task?.createdBy && // Exclure le créateur
        !task?.assignedTo?.includes(u.id) // Exclure les déjà assignés
      );
      setAvailableUsers(users);
      setSelectedUsers([]);
    }
  }, [isOpen, task]);

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
      await onAssign(task.id, selectedUsers);
      onClose();
    } catch (error) {
      console.error('Erreur assignation:', error);
      alert('Erreur lors de l\'assignation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Assigner des utilisateurs
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Tâche: <strong>{task.title}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sélectionnez les utilisateurs à assigner
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
            {availableUsers.map((user) => (
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
   * 📥 CHARGEMENT DE TOUTES LES TÂCHES - VERSION CORRIGÉE
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

      // ✅ CORRECTION : MES TÂCHES = SEULEMENT celles où l'utilisateur PARTICIPE (assignedTo)
      // ❌ ANCIEN CODE : task.assignedTo?.includes(user.uid) || task.createdBy === user.uid
      // ✅ NOUVEAU CODE : Seulement les tâches assignées
      const myTasks = allTasks.filter(task => 
        task.assignedTo?.includes(user.uid)
      );

      // ✅ TÂCHES DISPONIBLES = Ouvertes aux volontaires, non assignées à l'utilisateur, non complétées
      const availableTasks = allTasks.filter(task => 
        task.openToVolunteers === true && 
        !task.assignedTo?.includes(user.uid) &&
        task.status !== 'completed'
      );

      // ✅ AUTRES TÂCHES = Tout le reste (y compris les tâches créées par l'utilisateur s'il n'y participe pas)
      const otherTasks = allTasks.filter(task => 
        !myTasks.some(myTask => myTask.id === task.id) &&
        !availableTasks.some(availableTask => availableTask.id === task.id)
      );

      setMyTasks(myTasks);
      setAvailableTasks(availableTasks);
      setOtherTasks(otherTasks);
      calculateStats(myTasks, availableTasks);

      console.log('📊 Répartition des tâches après correction:', {
        myTasks: myTasks.length,
        availableTasks: availableTasks.length, 
        otherTasks: otherTasks.length,
        total: allTasks.length
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
      console.error('❌ Erreur rejoindre tâche:', error);
      alert('Erreur lors de la participation: ' + error.message);
    }
  };

  /**
   * 📤 SOUMISSION D'UNE TÂCHE POUR VALIDATION
   */
  const handleTaskSubmission = async (taskId, submissionData) => {
    try {
      console.log('📤 Soumission tâche pour validation:', { taskId, submissionData });
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'validation_pending',
        updatedAt: serverTimestamp()
      });
      
      await loadAllTasks();
      console.log('✅ Tâche soumise pour validation');
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      throw error;
    }
  };

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      await loadAllTasks();
      alert('Tâche supprimée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (user) {
      loadAllTasks();
    }
  }, [user]);

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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une tâche..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="validation_pending">En validation</option>
                <option value="completed">Terminée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                }}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* CONTENU DES ONGLETS */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'my_tasks' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes Tâches ({taskStats.myTotal})
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
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
