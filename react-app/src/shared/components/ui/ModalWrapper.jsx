/* ==========================================
   🎯 MODAL WRAPPER - SYNERGIA v3.5
   ==========================================
   Fichier: react-app/src/shared/components/ui/ModalWrapper.jsx
   
   Composant wrapper pour toutes les modales afin de garantir
   une visibilité parfaite du texte et des éléments
   ========================================== */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  showCloseButton = true,
  closeOnOverlayClick = true,
  preventBodyScroll = true
}) => {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-md', 
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  useEffect(() => {
    if (isOpen && preventBodyScroll) {
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
      
      // Gérer la touche Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, onClose, preventBodyScroll]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* Modal Container */}
        <div 
          className={`
            relative w-full rounded-lg shadow-xl animate-fade-in
            ${sizes[size]} ${className}
          `}
          style={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            color: '#f9fafb'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: '#374151' }}
            >
              {title && (
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: '#ffffff' }}
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-md transition-colors hover:bg-gray-700"
                  style={{ color: '#9ca3af' }}
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="modal-content-wrapper" style={{ color: '#e5e7eb' }}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ==========================================
   🎯 COMPOSANTS SPÉCIALISÉS
   ========================================== */

/**
 * Modal pour les détails de tâche
 */
export const TaskDetailModal = ({ task, isOpen, onClose, onEdit, onDelete, onToggleStatus }) => {
  if (!task) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Description */}
        {task.description && (
          <div>
            <h4 className="font-medium mb-2" style={{ color: '#ffffff' }}>
              Description
            </h4>
            <p style={{ color: '#e5e7eb' }}>{task.description}</p>
          </div>
        )}

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>Priorité :</span>
            <span 
              className={`ml-2 px-2 py-1 text-xs rounded ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}
            >
              {task.priority}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>Statut :</span>
            <span 
              className={`ml-2 px-2 py-1 text-xs rounded ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {task.status === 'completed' ? 'Terminée' : 'En cours'}
            </span>
          </div>
        </div>

        {/* Zone de commentaires */}
        <div>
          <h4 className="font-medium mb-3" style={{ color: '#ffffff' }}>
            Commentaires
          </h4>
          <div 
            className="border rounded-lg p-4 min-h-24"
            style={{ 
              backgroundColor: '#111827', 
              borderColor: '#374151',
              color: '#9ca3af'
            }}
          >
            <p className="text-center italic">Aucun commentaire pour le moment</p>
          </div>
          
          {/* Zone de saisie */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: '#374151',
                borderColor: '#4b5563',
                color: '#ffffff'
              }}
            />
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff'
              }}
            >
              Envoyer
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#374151' }}>
          <button
            onClick={() => onToggleStatus(task.id)}
            className={`px-4 py-2 rounded-lg font-medium ${
              task.status === 'completed' 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {task.status === 'completed' ? 'Rouvrir' : 'Marquer terminée'}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(task.id)}
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
        {/* Description */}
        {project.description && (
          <div>
            <h4 className="font-medium mb-2" style={{ color: '#ffffff' }}>
              Description
            </h4>
            <p style={{ color: '#e5e7eb' }}>{project.description}</p>
          </div>
        )}

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>Priorité :</span>
            <span 
              className={`ml-2 px-2 py-1 text-xs rounded ${
                project.priority === 'high' ? 'bg-red-100 text-red-800' :
                project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}
            >
              {project.priority}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>Statut :</span>
            <span 
              className={`ml-2 px-2 py-1 text-xs rounded ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {project.status === 'completed' ? 'Terminé' : 'Actif'}
            </span>
          </div>
        </div>

        {/* Zone de collaboration */}
        <div>
          <h4 className="font-medium mb-3" style={{ color: '#ffffff' }}>
            Collaboration
          </h4>
          <div 
            className="border rounded-lg p-4 min-h-24"
            style={{ 
              backgroundColor: '#111827', 
              borderColor: '#374151',
              color: '#9ca3af'
            }}
          >
            <p className="text-center italic">Aucun commentaire pour le moment</p>
          </div>
          
          {/* Zone de saisie */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: '#374151',
                borderColor: '#4b5563',
                color: '#ffffff'
              }}
            />
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff'
              }}
            >
              Envoyer
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#374151' }}>
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
 * Modal pour l'édition de profil
 */
export const ProfileEditModal = ({ user, isOpen, onClose, onSave }) => {
  if (!user) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le profil"
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
              Nom d'affichage
            </label>
            <input
              type="text"
              defaultValue={user.displayName || ''}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: '#374151',
                borderColor: '#4b5563',
                color: '#ffffff'
              }}
              placeholder="Votre nom d'affichage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
              Bio
            </label>
            <textarea
              rows={3}
              defaultValue={user.bio || ''}
              className="w-full px-3 py-2 rounded-lg border resize-none"
              style={{
                backgroundColor: '#374151',
                borderColor: '#4b5563',
                color: '#ffffff'
              }}
              placeholder="Parlez-nous de vous..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
              Département
            </label>
            <input
              type="text"
              defaultValue={user.department || ''}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: '#374151',
                borderColor: '#4b5563',
                color: '#ffffff'
              }}
              placeholder="Votre département"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#374151' }}>
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
