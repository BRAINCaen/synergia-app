// ==========================================
// 📁 react-app/src/components/collaboration/CollaborationPanel.jsx
// Panneau de collaboration intégré pour tâches et projets
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentSection from './CommentSection.jsx';
import ActivityFeed from './ActivityFeed.jsx';
import NotificationCenter from './NotificationCenter.jsx';

/**
 * 🤝 PANNEAU DE COLLABORATION
 * 
 * Composant intégré qui combine :
 * - Section commentaires
 * - Flux d'activité
 * - Notifications
 * - Onglets de navigation
 */
const CollaborationPanel = ({ 
  entityType, 
  entityId, 
  entityTitle = '',
  className = '',
  defaultTab = 'comments'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    {
      id: 'comments',
      label: 'Commentaires',
      icon: '💬',
      component: (
        <CommentSection 
          entityType={entityType} 
          entityId={entityId}
          className="max-h-96 overflow-y-auto"
        />
      )
    },
    {
      id: 'activity',
      label: 'Activité',
      icon: '📈',
      component: (
        <ActivityFeed 
          entityType={entityType} 
          entityId={entityId}
          maxItems={15}
          className="max-h-96 overflow-y-auto"
        />
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      component: (
        <NotificationCenter 
          className="max-h-96 overflow-y-auto"
        />
      )
    }
  ];

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
      {/* En-tête du panneau */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🤝 Collaboration
            </h3>
            {entityTitle && (
              <p className="text-sm text-gray-500 mt-1">
                {entityType === 'task' ? '📝' : '📁'} {entityTitle}
              </p>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isCollapsed ? '🔽' : '🔼'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Navigation par onglets */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-0">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenu de l'onglet actif */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {tabs.find(tab => tab.id === activeTab)?.component}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 🔔 COMPOSANT WIDGET DE COLLABORATION COMPACT
 * Version réduite pour les dashboards
 */
export const CollaborationWidget = ({ 
  entityType, 
  entityId, 
  maxItems = 3,
  className = '' 
}) => {
  const [activeView, setActiveView] = useState('activity');

  if (!entityType || !entityId) {
    return null;
  }

  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">🤝 Collaboration</h4>
        
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveView('activity')}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${activeView === 'activity' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-500 hover:bg-gray-100'
              }
            `}
          >
            📈
          </button>
          <button
            onClick={() => setActiveView('comments')}
            className={`
              px-2 py-1 text-xs rounded transition-colors
              ${activeView === 'comments' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-500 hover:bg-gray-100'
              }
            `}
          >
            💬
          </button>
        </div>
      </div>

      <div className="max-h-32 overflow-y-auto">
        {activeView === 'activity' ? (
          <ActivityFeed 
            entityType={entityType} 
            entityId={entityId}
            maxItems={maxItems}
            showUserFilter={false}
          />
        ) : (
          <CommentSection 
            entityType={entityType} 
            entityId={entityId}
          />
        )}
      </div>
    </div>
  );
};

/**
 * 🚀 COMPOSANT BOUTON FLOTTANT DE COLLABORATION
 * Bouton d'accès rapide pour ouvrir le panneau
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
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`
        fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-colors
        ${isOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-blue-500 hover:bg-blue-600'
        }
        text-white flex items-center justify-center text-xl
      `}
    >
      {isOpen ? '✕' : '🤝'}
    </motion.button>
  );
};

/**
 * 📱 COMPOSANT MODAL DE COLLABORATION
 * Version modal pour les petits écrans
 */
export const CollaborationModal = ({ 
  isOpen, 
  onClose, 
  entityType, 
  entityId, 
  entityTitle 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* En-tête modal */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  🤝 Collaboration
                </h3>
                {entityTitle && (
                  <p className="text-sm text-gray-500 mt-1">
                    {entityType === 'task' ? '📝' : '📁'} {entityTitle}
                  </p>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenu modal */}
          <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
            <CollaborationPanel
              entityType={entityType}
              entityId={entityId}
              entityTitle={entityTitle}
              className="border-0 shadow-none"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
