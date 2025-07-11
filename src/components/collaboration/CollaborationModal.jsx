// ==========================================
// 🤝 COLLABORATION MODAL - VERSION SIMPLE
// ==========================================
// Fichier: react-app/src/components/collaboration/CollaborationModal.jsx
// Version simplifiée sans framer-motion
// ==========================================

import React, { useState } from 'react';
import { X, MessageSquare, Activity, Bell } from 'lucide-react';

/**
 * 📱 MODAL DE COLLABORATION SIMPLE
 * Version sans dépendances externes
 */
export const CollaborationModal = ({ 
  isOpen, 
  onClose, 
  entityType, 
  entityId, 
  entityTitle 
}) => {
  const [activeTab, setActiveTab] = useState('comments');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div 
          className="relative rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          {/* En-tête modal */}
          <div className="border-b p-4" style={{ borderColor: '#374151' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                  🤝 Collaboration
                </h3>
                {entityTitle && (
                  <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
                    {entityType === 'task' ? '📝' : '📁'} {entityTitle}
                  </p>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${
                  activeTab === 'comments' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MessageSquare size={16} />
                Commentaires
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${
                  activeTab === 'activity' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Activity size={16} />
                Activité
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4">
            {activeTab === 'comments' ? (
              <CommentsSection entityType={entityType} entityId={entityId} />
            ) : (
              <ActivitySection entityType={entityType} entityId={entityId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 💬 SECTION COMMENTAIRES
 */
const CommentsSection = ({ entityType, entityId }) => {
  const [newComment, setNewComment] = useState('');
  const [comments] = useState([]); // En attendant l'implémentation Firebase

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // TODO: Implémenter l'ajout de commentaire via Firebase
    console.log('Nouveau commentaire:', newComment);
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* Liste des commentaires */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div 
            className="text-center py-8 border-2 border-dashed rounded-lg"
            style={{ borderColor: '#374151', color: '#9ca3af' }}
          >
            <MessageSquare className="mx-auto mb-2" size={24} />
            <p>Aucun commentaire pour le moment</p>
            <p className="text-sm mt-1">Soyez le premier à commenter !</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div 
              key={index}
              className="border rounded-lg p-3"
              style={{ backgroundColor: '#111827', borderColor: '#374151' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {comment.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium" style={{ color: '#ffffff' }}>
                      {comment.author}
                    </span>
                    <span className="text-xs" style={{ color: '#6b7280' }}>
                      {comment.timestamp}
                    </span>
                  </div>
                  <p style={{ color: '#e5e7eb' }}>{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulaire nouveau commentaire */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border resize-none"
          style={{
            backgroundColor: '#374151',
            borderColor: '#4b5563',
            color: '#ffffff'
          }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Publier
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * 📈 SECTION ACTIVITÉ
 */
const ActivitySection = ({ entityType, entityId }) => {
  const [activities] = useState([
    {
      id: 1,
      type: 'comment',
      author: 'Alan Boehme',
      action: 'a ajouté un commentaire',
      timestamp: 'Il y a 2 heures',
      icon: '💬'
    },
    {
      id: 2,
      type: 'status',
      author: 'Système',
      action: `${entityType === 'task' ? 'Tâche' : 'Projet'} créé(e)`,
      timestamp: 'Il y a 1 jour',
      icon: '✨'
    }
  ]);

  return (
    <div className="space-y-4">
      <h4 className="font-medium" style={{ color: '#ffffff' }}>
        Activité récente
      </h4>

      {activities.length === 0 ? (
        <div 
          className="text-center py-8 border-2 border-dashed rounded-lg"
          style={{ borderColor: '#374151', color: '#9ca3af' }}
        >
          <Activity className="mx-auto mb-2" size={24} />
          <p>Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: '#111827' }}
            >
              <div className="text-xl">{activity.icon}</div>
              <div className="flex-1">
                <p style={{ color: '#e5e7eb' }}>
                  <span className="font-medium">{activity.author}</span>
                  {' '}
                  <span>{activity.action}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 🚀 BOUTON FLOTTANT DE COLLABORATION
 */
export const CollaborationFloatingButton = ({ 
  entityType, 
  entityId, 
  onToggle,
  isOpen = false 
}) => {
  if (!entityType || !entityId) {
    return null;
  }

  return (
    <button
      onClick={onToggle}
      className={`
        fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-all duration-200
        ${isOpen 
          ? 'bg-red-500 hover:bg-red-600 scale-110' 
          : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
        }
        text-white flex items-center justify-center text-xl
      `}
    >
      {isOpen ? '✕' : '🤝'}
    </button>
  );
};

/**
 * 🤝 PANNEAU DE COLLABORATION (version simplifiée)
 */
const CollaborationPanel = ({ 
  entityType, 
  entityId, 
  entityTitle = '',
  className = ''
}) => {
  const [activeView, setActiveView] = useState('comments');

  if (!entityType || !entityId) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500 text-center">
          ⚠️ Aucune entité sélectionnée pour la collaboration
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">🤝 Collaboration</h4>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveView('activity')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeView === 'activity' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              📈
            </button>
            <button
              onClick={() => setActiveView('comments')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeView === 'comments' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              💬
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 max-h-48 overflow-y-auto">
        {activeView === 'comments' ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Aucun commentaire pour le moment
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            Aucune activité récente
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;
