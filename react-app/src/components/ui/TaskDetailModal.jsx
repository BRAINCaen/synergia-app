// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS COMPLETS D'UNE TÂCHE
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

// Import des rôles Synergia pour l'affichage
const SYNERGIA_ROLES = {
  stock: { id: 'stock', name: 'Gestion des Stocks', icon: '📦', color: 'bg-orange-500' },
  maintenance: { id: 'maintenance', name: 'Maintenance & Technique', icon: '🔧', color: 'bg-blue-500' },
  organization: { id: 'organization', name: 'Organisation & Planning', icon: '📋', color: 'bg-green-500' },
  reputation: { id: 'reputation', name: 'Réputation & Avis', icon: '⭐', color: 'bg-yellow-500' },
  content: { id: 'content', name: 'Contenu & Documentation', icon: '📝', color: 'bg-purple-500' },
  mentoring: { id: 'mentoring', name: 'Encadrement & Formation', icon: '🎓', color: 'bg-indigo-500' },
  partnerships: { id: 'partnerships', name: 'Partenariats & Référencement', icon: '🤝', color: 'bg-pink-500' },
  communication: { id: 'communication', name: 'Communication & Réseaux Sociaux', icon: '📱', color: 'bg-cyan-500' },
  b2b: { id: 'b2b', name: 'Relations B2B & Devis', icon: '💼', color: 'bg-slate-500' }
};

const WEEKDAYS = {
  monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi',
  friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
};

/**
 * 🎨 MODAL DÉTAILS COMPLETS DE TÂCHE
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

  if (!isOpen || !task) return null;

  // 🎯 Couleur selon priorité
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100', 
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.medium;
  };

  // 🎨 Couleur selon statut
  const getStatusColor = (status) => {
    const colors = {
      'todo': 'text-gray-600 bg-gray-100',
      'in_progress': 'text-blue-600 bg-blue-100',
      'validation_pending': 'text-purple-600 bg-purple-100',
      'completed': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100'
    };
    return colors[status] || colors.todo;
  };

  // 📅 Formater la date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Non définie';
    
    try {
      let date;
      if (dateValue.toDate) {
        date = dateValue.toDate();
      } else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      } else {
        date = new Date(dateValue);
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // 🏷️ Traduire statut
  const translateStatus = (status) => {
    const translations = {
      'todo': 'À faire',
      'in_progress': 'En cours',
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
                  <Target className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {translateStatus(task.status)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {translatePriority(task.priority)}
                  </span>
                  {task.roleId && SYNERGIA_ROLES[task.roleId] && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-600 flex items-center gap-1">
                      <span>{SYNERGIA_ROLES[task.roleId].icon}</span>
                      {SYNERGIA_ROLES[task.roleId].name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Description</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {task.description || 'Aucune description fournie.'}
                </p>
              </div>

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
                        <span className="ml-2 text-sm font-medium">{task.createdBy || 'Inconnu'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Assignée à :</span>
                        <span className="ml-2 text-sm font-medium">
                          {task.assignedTo && task.assignedTo.length > 0 
                            ? task.assignedTo.join(', ') 
                            : 'Personne (disponible)'
                          }
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
                      <div>
                        <span className="text-sm text-gray-600">Temps estimé :</span>
                        <span className="ml-2 text-sm font-medium">{task.estimatedTime || 1}h</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  
                  {/* Récompenses */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <h4 className="font-medium text-gray-900">Récompenses</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">XP :</span>
                        <span className="ml-2 text-sm font-bold text-yellow-600">{task.xpReward || 25} XP</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Difficulté :</span>
                        <span className="ml-2 text-sm font-medium">{translateDifficulty(task.difficulty)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Récurrence */}
                  {task.isRecurring && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Repeat className="w-4 h-4 text-purple-600" />
                        <h4 className="font-medium text-gray-900">Récurrence</h4>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Type :</span>
                          <span className="ml-2 text-sm font-medium">
                            {task.recurrenceType === 'daily' ? 'Quotidienne' :
                             task.recurrenceType === 'weekly' ? 'Hebdomadaire' :
                             task.recurrenceType === 'monthly' ? 'Mensuelle' :
                             task.recurrenceType}
                          </span>
                        </div>
                        {task.recurrenceInterval > 1 && (
                          <div>
                            <span className="text-sm text-gray-600">Intervalle :</span>
                            <span className="ml-2 text-sm font-medium">Tous les {task.recurrenceInterval}</span>
                          </div>
                        )}
                        {task.recurrenceDays && task.recurrenceDays.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Jours :</span>
                            <span className="ml-2 text-sm font-medium">
                              {task.recurrenceDays.map(day => WEEKDAYS[day] || day).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Fichier joint */}
              {task.mediaAttachment && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Fichier joint</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{task.mediaAttachment.filename}</p>
                      <p className="text-xs text-gray-500">
                        {task.mediaAttachment.size ? `${(task.mediaAttachment.size / 1024 / 1024).toFixed(1)} MB` : ''}
                      </p>
                    </div>
                    <a
                      href={task.mediaAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Notes supplémentaires */}
              {task.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Notes supplémentaires</h4>
                  </div>
                  <p className="text-gray-700 text-sm">{task.notes}</p>
                </div>
              )}

              {/* Projet lié */}
              {task.projectId && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-medium text-gray-900">Projet lié</h4>
                  </div>
                  <p className="text-sm font-medium text-indigo-700">{task.projectId}</p>
                </div>
              )}

            </div>
          </div>

          {/* Footer avec actions */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              
              {/* Informations de dernière modification */}
              <div className="text-xs text-gray-500">
                {task.updatedAt && (
                  <span>Modifiée le {formatDate(task.updatedAt)}</span>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3">
                
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
    </div>
  );
};

export default TaskDetailModal;
