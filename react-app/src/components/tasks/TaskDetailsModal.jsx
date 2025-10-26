// ==========================================
// 📁 react-app/src/components/tasks/TaskDetailsModal.jsx  
// MODAL DÉTAILS TÂCHE - VERSION RESPONSIVE MOBILE
// ==========================================

import React, { useState } from 'react';
import { X, Users, Calendar, Trophy, Clock, Tag, CheckCircle, FileText, Upload, ExternalLink, MessageCircle, Info as InfoIcon } from 'lucide-react';

/**
 * 📋 MODAL DÉTAILS D'UNE TÂCHE - VERSION RESPONSIVE
 */
const TaskDetailModal = ({ task, isOpen, onClose, onSubmit, showActions = true }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !task) return null;

  const isAssignedToMe = task.isAssignedToMe || false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start sm:items-center sm:justify-center z-50 p-0 sm:p-4">
      <div className="bg-gray-900 rounded-none sm:rounded-xl w-full max-w-[375px] sm:max-w-[95vw] md:max-w-4xl h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header - RESPONSIVE */}
        <div className="bg-gray-800 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 break-words">
                {task.title}
              </h2>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-600 text-white' :
                  task.priority === 'medium' ? 'bg-yellow-600 text-white' :
                  'bg-green-600 text-white'
                }`}>
                  {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>
                <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' ? 'bg-green-600 text-white' :
                  task.status === 'in_progress' ? 'bg-blue-600 text-white' :
                  task.status === 'validation_pending' ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {task.status === 'completed' ? 'Terminée' :
                   task.status === 'in_progress' ? 'En cours' :
                   task.status === 'validation_pending' ? 'En validation' :
                   'À faire'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Onglets - RESPONSIVE */}
          <div className="flex gap-1 sm:gap-4 mt-3 sm:mt-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <InfoIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Commentaires
            </button>
          </div>
        </div>

        {/* Contenu scrollable - RESPONSIVE */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {activeTab === 'details' && (
            <div className="space-y-3 sm:space-y-6">
              
              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium mb-2 text-white">
                    Description
                  </h4>
                  <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">
                      {task.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Informations principales - RESPONSIVE GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                
                {/* Assignation */}
                <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                    <h4 className="text-sm sm:text-base font-medium text-white">Assignation</h4>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
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

                {/* Dates */}
                <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                    <h4 className="text-sm sm:text-base font-medium text-white">Planning</h4>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    {task.dueDate && (
                      <div>
                        <span className="text-gray-400">Échéance :</span>
                        <span className="ml-2 text-gray-200">
                          {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    {task.estimatedTime && (
                      <div>
                        <span className="text-gray-400">Durée :</span>
                        <span className="ml-2 text-gray-200">{task.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Récompense XP */}
              {task.xpReward && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-3 sm:p-4 border border-yellow-600/30">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-yellow-400">
                        +{task.xpReward} XP
                      </div>
                      <div className="text-xs text-yellow-300/80">
                        Récompense à la validation
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center text-white">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 sm:py-1 bg-blue-900/30 border border-blue-600/50 rounded-full text-blue-300 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pièces jointes */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center text-white">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-400" />
                    Pièces jointes
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {task.attachments.map((attachment, index) => (
                      <div key={index} className="bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-700 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Upload className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-white truncate">{attachment.name}</div>
                          <div className="text-xs text-gray-400">{attachment.size}</div>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-white flex-shrink-0">
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center text-white">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-400" />
                    Notes
                  </h3>
                  <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">
                      {task.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Commentaires */}
          {activeTab === 'comments' && (
            <div className="text-center text-gray-400 py-8 sm:py-12 text-xs sm:text-sm">
              Aucun commentaire pour le moment
            </div>
          )}
        </div>

        {/* Footer d'actions - RESPONSIVE */}
        <div className="bg-gray-900 border-t border-gray-700 p-2 sm:p-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
            
            {showActions && isAssignedToMe && task.status !== 'completed' && onSubmit && (
              <button
                onClick={() => onSubmit(task.id)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Marquer terminé
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
