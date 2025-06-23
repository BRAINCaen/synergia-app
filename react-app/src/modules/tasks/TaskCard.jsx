import React, { useState } from 'react';
import { Calendar, Clock, Flag, User, CheckCircle, XCircle, Edit, Trash2, Award, ExternalLink } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
import { xpValidationService } from '../../core/services/xpValidationService';

const TaskCard = ({ task, onEdit, onDelete, showProject = false }) => {
  const { updateTask } = useTaskStore();
  const { user } = useAuthStore();
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [showXPRequest, setShowXPRequest] = useState(false);
  const [xpRequestData, setXpRequestData] = useState({
    description: '',
    evidenceUrl: '',
    customXP: task.xpReward || 10
  });
  const [submittingXP, setSubmittingXP] = useState(false);

  // Fonction pour marquer comme terminé
  const handleToggleComplete = async () => {
    if (task.status === 'completed') {
      // Si déjà terminé, revenir en cours
      await updateTask(task.id, { 
        status: 'in_progress',
        completedAt: null 
      });
    } else {
      // Marquer comme terminé mais demander validation XP
      setIsCompletingTask(true);
      await updateTask(task.id, { 
        status: 'completed',
        completedAt: new Date() 
      });
      
      // Afficher le formulaire de demande XP
      setShowXPRequest(true);
      setXpRequestData(prev => ({
        ...prev,
        description: `Tâche terminée: ${task.title}`
      }));
    }
  };

  // Fonction pour soumettre une demande XP
  const handleSubmitXPRequest = async () => {
    if (!xpRequestData.description.trim()) {
      alert('Veuillez décrire ce que vous avez accompli');
      return;
    }

    setSubmittingXP(true);
    
    try {
      await xpValidationService.createXPRequest(
        user.uid,
        task.id,
        xpRequestData.description,
        xpRequestData.customXP,
        xpRequestData.evidenceUrl || null,
        {
          title: task.title,
          priority: task.priority,
          projectId: task.projectId
        }
      );

      setShowXPRequest(false);
      setXpRequestData({
        description: '',
        evidenceUrl: '',
        customXP: task.xpReward || 10
      });

      // Afficher une confirmation
      alert('🎉 Demande XP soumise ! Un administrateur va la valider.');

    } catch (error) {
      console.error('Erreur soumission XP:', error);
      alert('Erreur lors de la soumission de la demande XP');
    } finally {
      setSubmittingXP(false);
    }
  };

  // Annuler la demande XP et remettre la tâche en cours
  const handleCancelXPRequest = async () => {
    setShowXPRequest(false);
    setIsCompletingTask(false);
    
    // Remettre la tâche en cours
    await updateTask(task.id, { 
      status: 'in_progress',
      completedAt: null 
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'todo': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`rounded-xl border p-6 transition-all duration-200 hover:border-gray-600 ${getPriorityColor(task.priority)}`}>
      
      {/* En-tête avec titre et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
          )}
        </div>
        
        {/* Bouton statut */}
        <button
          onClick={handleToggleComplete}
          disabled={isCompletingTask}
          className={`p-2 rounded-lg transition-colors ${
            task.status === 'completed'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          title={task.status === 'completed' ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
        >
          {task.status === 'completed' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Informations tâche */}
      <div className="space-y-3 mb-4">
        
        {/* Projet si affiché */}
        {showProject && task.projectTitle && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Projet: {task.projectTitle}</span>
          </div>
        )}
        
        {/* Date d'échéance */}
        {task.dueDate && (
          <div className={`flex items-center gap-2 text-sm ${
            isOverdue ? 'text-red-400' : 'text-gray-400'
          }`}>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(task.dueDate)}</span>
            {isOverdue && <span className="text-red-400 font-medium">(En retard)</span>}
          </div>
        )}
        
        {/* Assigné à */}
        {task.assignedTo && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span>Assigné à: {task.assignedToName || 'Utilisateur'}</span>
          </div>
        )}
        
        {/* XP Reward */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <Award className="w-4 h-4" />
            <span>+{task.xpReward || 10} XP</span>
          </div>
          
          {/* Statut */}
          <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
            {task.status === 'completed' ? '✅ Terminé' : 
             task.status === 'in_progress' ? '🔄 En cours' : '📋 À faire'}
          </span>
        </div>
        
        {/* Priorité */}
        <div className="flex items-center gap-2">
          <Flag className={`w-4 h-4 ${
            task.priority === 'high' ? 'text-red-400' :
            task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
          }`} />
          <span className="text-sm text-gray-400 capitalize">{task.priority || 'normal'}</span>
        </div>
      </div>

      {/* Modal Demande XP */}
      {showXPRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              🎉 Demander Validation XP
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Décrivez ce que vous avez accompli *
                </label>
                <textarea
                  value={xpRequestData.description}
                  onChange={(e) => setXpRequestData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: J'ai terminé la tâche en implémentant la fonctionnalité X et en corrigeant 3 bugs..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm resize-none focus:border-blue-500 focus:outline-none"
                  rows="4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preuve/Lien (optionnel)
                </label>
                <input
                  type="url"
                  value={xpRequestData.evidenceUrl}
                  onChange={(e) => setXpRequestData(prev => ({ ...prev, evidenceUrl: e.target.value }))}
                  placeholder="https://github.com/... ou lien vers screenshot"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  XP Demandés
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={xpRequestData.customXP}
                  onChange={(e) => setXpRequestData(prev => ({ ...prev, customXP: parseInt(e.target.value) || 10 }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  XP suggérés pour cette tâche: {task.xpReward || 10}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelXPRequest}
                disabled={submittingXP}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitXPRequest}
                disabled={submittingXP || !xpRequestData.description.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submittingXP ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Demander {xpRequestData.customXP} XP
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg text-sm text-blue-300">
              💡 Un administrateur va valider votre demande. Vous recevrez une notification avec la décision.
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {/* Bouton éditer */}
        <button
          onClick={() => onEdit(task)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Éditer
        </button>
        
        {/* Bouton supprimer */}
        <button
          onClick={() => onDelete(task.id)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        
        {/* Bouton demander XP manuellement si déjà terminé */}
        {task.status === 'completed' && !showXPRequest && (
          <button
            onClick={() => {
              setShowXPRequest(true);
              setXpRequestData(prev => ({
                ...prev,
                description: `Tâche terminée: ${task.title}`
              }));
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-1"
            title="Demander validation XP"
          >
            <Award className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Indicateur si tâche terminée récemment */}
      {task.status === 'completed' && task.completedAt && (
        <div className="mt-3 text-xs text-green-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Terminé le {formatDate(task.completedAt)}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
