// ==========================================
// 📁 react-app/src/shared/components/ui/ModalWrapper.jsx
// WRAPPER MODAL - VERSION RESPONSIVE
// ==========================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Calendar, Target, Trophy, Clock, Tag, Send, MessageCircle, User, AlertCircle } from 'lucide-react';

import { collaborationService } from '../../../core/services/collaborationService.js';
import { useAuthStore } from '../../stores/authStore.js';

/**
 * 🎯 WRAPPER MODAL RÉUTILISABLE
 */
const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-[375px] sm:max-w-[95vw] md:max-w-md',
    md: 'max-w-[375px] sm:max-w-[95vw] md:max-w-lg',
    lg: 'max-w-[375px] sm:max-w-[95vw] md:max-w-2xl',
    xl: 'max-w-[375px] sm:max-w-[95vw] md:max-w-4xl',
    full: 'max-w-[375px] sm:max-w-[95vw] md:max-w-7xl'
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="flex items-start justify-start sm:items-center sm:justify-center min-h-screen px-0 sm:px-4 pt-0 sm:pt-4 pb-0 sm:pb-20">
        <div 
          className={`relative w-full ${sizeClasses[size]} bg-gray-900 rounded-none sm:rounded-lg shadow-xl border-0 sm:border border-gray-700 h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden flex flex-col`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div 
              className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0"
            >
              {title && (
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          )}

          {/* Body avec scroll */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * 📋 MODAL DE DÉTAILS DE TÂCHE
 */
export const TaskDetailModal = ({ task, isOpen, onClose, onEdit, onDelete }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (isOpen && task && activeTab === 'comments') {
      loadComments();
    }
  }, [isOpen, task, activeTab]);

  const loadComments = async () => {
    if (!task?.id) return;
    
    setLoadingComments(true);
    try {
      const taskComments = await collaborationService.getTaskComments(task.id);
      setComments(taskComments || []);
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !task?.id || !user) return;
    
    setSendingComment(true);
    try {
      await collaborationService.addTaskComment(
        task.id,
        newComment.trim(),
        user.uid,
        user.displayName || user.email
      );
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Erreur envoi commentaire:', error);
    } finally {
      setSendingComment(false);
    }
  };

  if (!task) return null;

  const isAssignedToMe = task.assignedTo?.includes(user?.uid);

  const CommentsSection = () => (
    <div className="p-6 space-y-4">
      <div className="space-y-3">
        {loadingComments ? (
          <div className="text-center py-8 text-gray-400">
            Chargement des commentaires...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            Aucun commentaire pour le moment
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {comment.userName || 'Utilisateur'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt?.toDate?.().toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
          placeholder="Ajouter un commentaire..."
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={sendingComment}
        />
        <button
          onClick={handleSendComment}
          disabled={!newComment.trim() || sendingComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      size="xl"
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              task.status === 'completed' ? 'bg-green-800/50 text-green-300 border-green-600' :
              task.status === 'in_progress' ? 'bg-blue-800/50 text-blue-300 border-blue-600' :
              task.status === 'pending' ? 'bg-yellow-800/50 text-yellow-300 border-yellow-600' :
              'bg-gray-800/50 text-gray-300 border-gray-600'
            }`}>
              {task.status === 'completed' ? 'Terminé' :
               task.status === 'in_progress' ? 'En cours' :
               task.status === 'pending' ? 'En attente' :
               task.status}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              task.difficulty === 'easy' ? 'bg-green-800/50 text-green-300 border-green-600' :
              task.difficulty === 'normal' ? 'bg-blue-800/50 text-blue-300 border-blue-600' :
              task.difficulty === 'hard' ? 'bg-red-800/50 text-red-300 border-red-600' :
              'bg-gray-800/50 text-gray-300 border-gray-600'
            }`}>
              {task.difficulty === 'easy' ? 'Facile' :
               task.difficulty === 'normal' ? 'Normal' :
               task.difficulty === 'hard' ? 'Difficile' :
               task.difficulty}
            </span>

            {task.xpReward && (
              <span className="px-3 py-1 bg-purple-800/50 text-purple-300 rounded-full text-xs font-medium border border-purple-600">
                <Trophy className="w-3 h-3 inline mr-1" />
                {task.xpReward} XP
              </span>
            )}
          </div>
        </div>

        <div className="border-b border-gray-700 flex-shrink-0">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'comments'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Commentaires ({comments.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {task.description && (
                <div>
                  <h4 className="font-medium mb-2 text-white">
                    Description
                  </h4>
                  <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-300">{task.description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Assignation</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Créé par :</span>
                      <span className="ml-2 text-gray-200">{task.creatorName || 'Utilisateur'}</span>
                    </div>
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div>
                        <span className="text-gray-400">Assigné à :</span>
                        <span className="ml-2 text-gray-200">{task.assignedTo.length} personne(s)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-white">Caractéristiques</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulté :</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        task.difficulty === 'easy' ? 'bg-green-800/50 text-green-300 border-green-600' :
                        task.difficulty === 'normal' ? 'bg-blue-800/50 text-blue-300 border-blue-600' :
                        task.difficulty === 'hard' ? 'bg-orange-800/50 text-orange-300 border-orange-600' :
                        'bg-gray-800/50 text-gray-300 border-gray-600'
                      }`}>
                        {task.difficulty === 'easy' ? 'Facile' :
                         task.difficulty === 'normal' ? 'Normal' :
                         task.difficulty === 'hard' ? 'Difficile' :
                         task.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP :</span>
                      <span className="text-purple-400 font-medium">{task.xpReward || 25} XP</span>
                    </div>
                  </div>
                </div>
              </div>

              {task.tags && task.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-white">
                    <Tag className="w-4 h-4 inline mr-2 text-blue-400" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.notes && (
                <div>
                  <h4 className="font-medium mb-2 text-white">Notes</h4>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap">{task.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && <CommentsSection />}
        </div>

        <div className="bg-gray-900 border-t border-gray-700 p-4 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

/**
 * Modal pour les détails de projet
 */
export const ProjectDetailModal = ({ project, isOpen, onClose, onEdit, onDelete }) => {
  if (!project) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {project.description && (
          <div>
            <h4 className="font-medium mb-2 text-white">
              Description
            </h4>
            <p className="text-gray-300">{project.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-400">Priorité :</span>
            <span 
              className={`ml-2 px-2 py-1 text-xs rounded border ${
                project.priority === 'high' ? 'bg-red-800/50 text-red-300 border-red-600' :
                project.priority === 'medium' ? 'bg-yellow-800/50 text-yellow-300 border-yellow-600' :
                'bg-green-800/50 text-green-300 border-green-600'
              }`}
            >
              {project.priority}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={() => onEdit(project)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

/**
 * Modal pour l'édition de profil utilisateur
 */
export const UserProfileModal = ({ user, isOpen, onClose, onSave }) => {
  if (!user) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le profil"
      size="md"
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Nom complet
          </label>
          <input
            type="text"
            defaultValue={user.displayName || ''}
            className="w-full px-3 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white"
            placeholder="Votre nom complet"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Email
          </label>
          <input
            type="email"
            defaultValue={user.email || ''}
            className="w-full px-3 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Département
          </label>
          <input
            type="text"
            defaultValue={user.department || ''}
            className="w-full px-3 py-2 rounded-lg border bg-gray-800 border-gray-600 text-white"
            placeholder="Votre département"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ModalWrapper;
