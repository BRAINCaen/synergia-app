// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS COMPLETS AVEC AFFICHAGE NOMS UTILISATEURS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Users,
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Target, 
  FileText,
  Trophy,
  Upload,
  CheckCircle,
  AlertCircle,
  Star,
  ExternalLink,
  MessageCircle,
  Shield,
  Repeat,
  MapPin,
  Paperclip,
  Send,
  Info
} from 'lucide-react';

// Import Firebase pour résolution des noms
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 🎨 MODAL DÉTAILS COMPLETS DE TÂCHE AVEC NOMS UTILISATEURS
 */
const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  task, 
  currentUser,
  onEdit, 
  onDelete,
  onSubmit,
  onTaskUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [creatorName, setCreatorName] = useState('Chargement...');
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // ✅ RÉSOUDRE LES NOMS DES UTILISATEURS DIRECTEMENT AVEC FIREBASE
  useEffect(() => {
    const resolveUserNames = async () => {
      if (!task) return;
      
      setLoadingUsers(true);
      
      try {
        // Résoudre le créateur
        if (task.createdBy) {
          try {
            const creatorDoc = await getDoc(doc(db, 'users', task.createdBy));
            if (creatorDoc.exists()) {
              const creatorData = creatorDoc.data();
              setCreatorName(creatorData.displayName || creatorData.email || 'Utilisateur');
            } else {
              setCreatorName('Utilisateur introuvable');
            }
          } catch (error) {
            console.error('❌ Erreur récupération créateur:', error);
            setCreatorName('Erreur chargement');
          }
        }
        
        // Résoudre les assignés
        if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
          const assigneePromises = task.assignedTo.map(async (userId) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.displayName || userData.email || 'Utilisateur';
              } else {
                return 'Utilisateur introuvable';
              }
            } catch (error) {
              console.error('❌ Erreur récupération assigné:', userId, error);
              return 'Erreur chargement';
            }
          });
          
          const resolvedNames = await Promise.all(assigneePromises);
          setAssigneeNames(resolvedNames);
        } else {
          setAssigneeNames([]);
        }
      } catch (error) {
        console.error('❌ Erreur générale résolution noms:', error);
        setCreatorName('Erreur chargement');
        setAssigneeNames([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen && task) {
      resolveUserNames();
    }
  }, [isOpen, task]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // ✅ VALIDATION OBLIGATOIRE
  if (!isOpen || !task) return null;

  // 🎯 Formatage date
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // 🎯 Couleurs par statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'validation_pending':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // 🎯 Traduire statut
  const translateStatus = (status) => {
    const translations = {
      'pending': 'En attente',
      'assigned': 'Assignée',
      'in_progress': 'En cours',
      'under_review': 'En révision',
      'validation_pending': 'En validation',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return translations[status] || status;
  };

  // 🎯 Traduire priorité
  const translatePriority = (priority) => {
    const translations = {
      'low': 'Faible',
      'medium': 'Moyenne',
      'high': 'Élevée', 
      'urgent': 'Urgente'
    };
    return translations[priority] || priority;
  };

  // 🎯 Traduire difficulté
  const translateDifficulty = (difficulty) => {
    const translations = {
      'easy': 'Facile',
      'medium': 'Moyen',
      'hard': 'Difficile',
      'expert': 'Expert'
    };
    return translations[difficulty] || difficulty;
  };

  // Vérifier les permissions
  const canEdit = task.createdBy === currentUser?.uid || 
                  (task.assignedTo && task.assignedTo.includes(currentUser?.uid));

  const canDelete = task.createdBy === currentUser?.uid;

  const canSubmit = task.assignedTo && task.assignedTo.includes(currentUser?.uid) && 
                    task.status !== 'completed' && task.status !== 'validation_pending';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0" 
          onClick={onClose}
          aria-label="Fermer la modal"
        />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="w-5 h-5" />
                ) : task.status === 'validation_pending' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                    {translateStatus(task.status)}
                  </span>
                  {task.priority && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {translatePriority(task.priority)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Colonne gauche */}
              <div className="space-y-4">
                
                {/* Assignation */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Assignation</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Créée par :</span>
                      <span className="ml-2 text-sm font-medium">
                        {loadingUsers ? (
                          <span className="text-gray-400">Chargement...</span>
                        ) : (
                          creatorName
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Assignée à :</span>
                      <span className="ml-2 text-sm font-medium">
                        {loadingUsers ? (
                          <span className="text-gray-400">Chargement...</span>
                        ) : assigneeNames.length > 0 ? (
                          assigneeNames.join(', ')
                        ) : (
                          <span className="text-green-600">Personne (disponible)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Planification */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">Planification</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Créée le :</span>
                      <span className="ml-2 text-sm font-medium">{formatDate(task.createdAt)}</span>
                    </div>
                    {task.dueDate && (
                      <div>
                        <span className="text-sm text-gray-600">Échéance :</span>
                        <span className="ml-2 text-sm font-medium">{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    {task.updatedAt && (
                      <div>
                        <span className="text-sm text-gray-600">Modifiée le :</span>
                        <span className="ml-2 text-sm font-medium">{formatDate(task.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-4">
                
                {/* Métadonnées */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-gray-900">Métadonnées</h4>
                  </div>
                  <div className="space-y-2">
                    {task.difficulty && (
                      <div>
                        <span className="text-sm text-gray-600">Difficulté :</span>
                        <span className="ml-2 text-sm font-medium">{translateDifficulty(task.difficulty)}</span>
                      </div>
                    )}
                    {task.xpReward && (
                      <div>
                        <span className="text-sm text-gray-600">Récompense XP :</span>
                        <span className="ml-2 text-sm font-medium text-yellow-600">+{task.xpReward} XP</span>
                      </div>
                    )}
                    {task.category && (
                      <div>
                        <span className="text-sm text-gray-600">Catégorie :</span>
                        <span className="ml-2 text-sm font-medium">{task.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {task.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  {task.notes}
                </p>
              </div>
            )}

            {/* Fichiers attachés */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fichiers attachés</h3>
                <div className="space-y-2">
                  {task.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations système */}
            <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <div>ID: {task.id}</div>
              {task.projectId && <div>Projet: {task.projectId}</div>}
              <div>Version: {task.version || '1.0'}</div>
            </div>
          </div>

          {/* Footer avec actions */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Dernière modification : {formatDate(task.updatedAt || task.createdAt)}
            </div>
            
            <div className="flex gap-3">
              
              {/* Soumettre pour validation */}
              {canSubmit && (
                <button
                  onClick={() => {
                    onSubmit(task.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Soumettre
                </button>
              )}
              
              {/* Modifier */}
              {canEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              )}
              
              {/* Supprimer */}
              {canDelete && (
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                      onDelete(task.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
              
              {/* Fermer */}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
