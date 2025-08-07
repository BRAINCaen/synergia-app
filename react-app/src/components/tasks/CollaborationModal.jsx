// ==========================================
// 📁 react-app/src/components/tasks/CollaborationModal.jsx
// COMPOSANT MODAL COLLABORATION - FICHIER MANQUANT
// ==========================================

import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Users, 
  Send,
  UserPlus,
  Clock,
  Star,
  AlertTriangle
} from 'lucide-react';

/**
 * 🤝 MODAL DE COLLABORATION
 */
const CollaborationModal = ({ 
  isOpen, 
  onClose, 
  userTasks = [] 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    console.log('📤 Message de collaboration envoyé:', message);
    // TODO: Implémenter l'envoi de message
    setMessage('');
  };

  const tasksByStatus = {
    inProgress: userTasks.filter(task => task.status === 'in_progress'),
    needsHelp: userTasks.filter(task => task.status === 'blocked' || task.difficulty === 'hard'),
    completed: userTasks.filter(task => task.status === 'completed'),
    pending: userTasks.filter(task => task.status === 'pending')
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Centre de Collaboration
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez vos collaborations et demandez de l'aide
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation des onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Demandes d'aide
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Équipe
            </button>
          </nav>
        </div>

        {/* Contenu */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* Onglet Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-blue-900">
                        {tasksByStatus.inProgress.length}
                      </div>
                      <div className="text-xs text-blue-600">En cours</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-orange-900">
                        {tasksByStatus.needsHelp.length}
                      </div>
                      <div className="text-xs text-orange-600">Besoin d'aide</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-green-900">
                        {tasksByStatus.completed.length}
                      </div>
                      <div className="text-xs text-green-600">Terminées</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {tasksByStatus.pending.length}
                      </div>
                      <div className="text-xs text-gray-600">En attente</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tâches nécessitant une collaboration */}
              {tasksByStatus.needsHelp.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Tâches nécessitant une collaboration
                  </h3>
                  <div className="space-y-3">
                    {tasksByStatus.needsHelp.slice(0, 3).map(task => (
                      <div key={task.id} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-orange-900">{task.title}</h4>
                            <p className="text-sm text-orange-700 mt-1">{task.description}</p>
                          </div>
                          <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                            Demander aide
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message rapide */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Message rapide à l'équipe
                </h3>
                <div className="border border-gray-300 rounded-lg">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message de collaboration..."
                    className="w-full p-3 border-0 resize-none focus:ring-0"
                    rows={3}
                  />
                  <div className="flex justify-end p-3 border-t border-gray-200">
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Demandes d'aide */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune demande d'aide active
                </h3>
                <p className="text-gray-600">
                  Vos demandes d'aide et collaborations apparaîtront ici
                </p>
              </div>
            </div>
          )}

          {/* Onglet Équipe */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Membres de l'équipe
                </h3>
                <p className="text-gray-600">
                  La liste des membres de votre équipe sera affichée ici
                </p>
                <button className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inviter un membre
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
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

export default CollaborationModal;
