// ==========================================
// 📁 react-app/src/components/tasks/TaskAssignmentModal.jsx
// CORRECTION PARAMÈTRES D'ASSIGNATION
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Check, 
  User, 
  Trophy,
  Percent,
  UserPlus,
  AlertTriangle,
  Info
} from 'lucide-react';
import { taskAssignmentService } from '../../core/services/taskAssignmentService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 👥 MODAL D'ASSIGNATION MULTIPLE CORRIGÉE
 */
const TaskAssignmentModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onAssignmentSuccess 
}) => {
  const { user } = useAuthStore();
  
  // États
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Sélection, 2: Pourcentages

  // Charger les membres disponibles
  useEffect(() => {
    if (isOpen) {
      loadAvailableMembers();
    }
  }, [isOpen]);

  const loadAvailableMembers = async () => {
    try {
      setLoading(true);
      console.log('👥 Chargement des membres disponibles...');
      
      const members = await taskAssignmentService.getAvailableMembers();
      setAvailableMembers(members);
      
      console.log('✅ Membres chargés:', members.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement membres:', error);
      setError('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sélection d'un membre
  const toggleMemberSelection = (member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.find(m => m.id === member.id);
      let newSelection;
      
      if (isSelected) {
        // Désélectionner
        newSelection = prev.filter(m => m.id !== member.id);
        // Supprimer la contribution
        const newContributions = { ...contributions };
        delete newContributions[member.id];
        setContributions(newContributions);
      } else {
        // Sélectionner
        newSelection = [...prev, member];
      }
      
      // Réinitialiser les contributions quand la sélection change
      if (newSelection.length > 1) {
        const equalPercentage = Math.floor(100 / newSelection.length);
        const newContributions = {};
        newSelection.forEach((m, index) => {
          if (index === newSelection.length - 1) {
            // Le dernier membre récupère le reste pour atteindre 100%
            newContributions[m.id] = 100 - (equalPercentage * (newSelection.length - 1));
          } else {
            newContributions[m.id] = equalPercentage;
          }
        });
        setContributions(newContributions);
      } else {
        setContributions({});
      }
      
      return newSelection;
    });
  };

  // Calculer le total des pourcentages
  const getTotalPercentage = () => {
    return Object.values(contributions).reduce((sum, val) => sum + (val || 0), 0);
  };

  // Égaliser les contributions
  const equalizeContributions = () => {
    if (selectedMembers.length === 0) return;
    
    const equalPercentage = Math.floor(100 / selectedMembers.length);
    const newContributions = {};
    
    selectedMembers.forEach((member, index) => {
      if (index === selectedMembers.length - 1) {
        // Le dernier membre récupère le reste
        newContributions[member.id] = 100 - (equalPercentage * (selectedMembers.length - 1));
      } else {
        newContributions[member.id] = equalPercentage;
      }
    });
    
    setContributions(newContributions);
  };

  // Mettre à jour une contribution individuelle
  const updateContribution = (memberId, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    
    setContributions(prev => ({
      ...prev,
      [memberId]: clampedValue
    }));
  };

  // Gérer la soumission
  const handleSubmitAssignment = async () => {
    // Validation des paramètres
    if (!task || !task.id) {
      setError('Tâche invalide');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Veuillez sélectionner au moins un membre');
      return;
    }

    // Si étape 1 et sélection multiple, passer à l'étape 2
    if (step === 1 && selectedMembers.length > 1) {
      setStep(2);
      return;
    }

    // Validation des pourcentages pour assignation multiple
    if (selectedMembers.length > 1 && getTotalPercentage() !== 100) {
      setError('Les pourcentages doivent totaliser 100%');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('🎯 Soumission assignation corrigée:', {
        taskId: task.id,
        selectedMembers: selectedMembers.map(m => ({ id: m.id, name: m.name })),
        contributions,
        totalPercentage: getTotalPercentage()
      });

      // ✅ PARAMÈTRES CORRIGÉS
      const assignmentData = {
        taskId: task.id,
        assignedUserIds: selectedMembers.map(m => m.id), // ✅ Array d'IDs
        contributionPercentages: selectedMembers.length > 1 ? contributions : null, // ✅ Null si un seul membre
        assignedBy: user.uid
      };

      // Validation finale avant envoi
      if (!assignmentData.assignedUserIds || assignmentData.assignedUserIds.length === 0) {
        throw new Error('Aucun membre sélectionné');
      }

      // Assigner la tâche avec le service
      const result = await taskAssignmentService.assignTaskToMembers(
        task.id,
        assignmentData.assignedUserIds,
        user.uid
      );

      // Gérer les pourcentages si assignation multiple
      if (selectedMembers.length > 1 && contributions) {
        try {
          await taskAssignmentService.updateContributionPercentages(task.id, contributions);
          console.log('✅ Pourcentages mis à jour');
        } catch (percentageError) {
          console.warn('⚠️ Erreur mise à jour pourcentages:', percentageError);
          // Continuer quand même, l'assignation principale a réussi
        }
      }

      console.log('✅ Assignation réussie:', result);
      
      // ✅ SUCCÈS - Notifier le parent avec données corrigées
      if (onAssignmentSuccess) {
        onAssignmentSuccess({
          ...assignmentData,
          success: true,
          assignedCount: assignmentData.assignedUserIds.length,
          assignments: result.assignments || []
        });
      }
      
      // Fermer le modal
      handleClose();
      
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      setError(error.message || 'Erreur lors de l\'assignation');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset lors de la fermeture
  const handleClose = () => {
    if (submitting) return;
    
    setSelectedMembers([]);
    setContributions({});
    setError('');
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Assigner la tâche
                </h2>
                <p className="text-gray-600 mt-1">"{task?.title}"</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Indicateur d'étape */}
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </span>
                  <span className="text-sm text-gray-600">Sélection</span>
                  
                  <div className="w-8 h-px bg-gray-300"></div>
                  
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </span>
                  <span className="text-sm text-gray-600">Répartition</span>
                </div>
                
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            
            {/* Étape 1: Sélection des membres */}
            {step === 1 && (
              <div className="space-y-6">
                
                {/* Header de sélection */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez les membres à assigner
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cliquez sur les membres que vous souhaitez assigner à cette tâche
                  </p>
                </div>

                {/* Membres sélectionnés */}
                {selectedMembers.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Membres sélectionnés ({selectedMembers.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map(member => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <User className="w-3 h-3" />
                          {member.name}
                          <button
                            onClick={() => toggleMemberSelection(member)}
                            className="hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Liste des membres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="col-span-2 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Chargement des membres...</p>
                    </div>
                  ) : availableMembers.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Aucun membre disponible</p>
                    </div>
                  ) : (
                    availableMembers.map(member => {
                      const isSelected = selectedMembers.find(m => m.id === member.id);
                      
                      return (
                        <div
                          key={member.id}
                          onClick={() => toggleMemberSelection(member)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              isSelected ? 'bg-blue-600' : 'bg-gray-400'
                            }`}>
                              {isSelected ? <Check className="w-5 h-5" /> : member.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-600">{member.email}</div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  Niveau {member.level}
                                </span>
                                <span>{member.totalXp} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Étape 2: Répartition des contributions */}
            {step === 2 && (
              <div className="space-y-6">
                
                {/* Informations XP */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900">Répartition des XP</h3>
                      <p className="text-yellow-800 text-sm mt-1">
                        Les XP seront distribués selon les pourcentages définis ci-dessous. 
                        Total XP de la tâche : <strong>+{task?.xpReward || 25} XP</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Résumé des pourcentages */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Total : {getTotalPercentage()}%</h3>
                    <button
                      onClick={equalizeContributions}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Égaliser automatiquement
                    </button>
                  </div>
                  
                  {getTotalPercentage() !== 100 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Les pourcentages doivent totaliser 100%</span>
                    </div>
                  )}
                </div>

                {/* Répartition pour chaque membre */}
                <div className="space-y-4">
                  {selectedMembers.map(member => {
                    const percentage = contributions[member.id] || 0;
                    const xpAmount = Math.round((task?.xpReward || 25) * (percentage / 100));
                    
                    return (
                      <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-600">{member.email}</div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={percentage}
                                  onChange={(e) => updateContribution(member.id, e.target.value)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                />
                                <Percent className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                = {xpAmount} XP
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Affichage d'erreur */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Erreur</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer avec actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {step === 1 ? (
                  selectedMembers.length > 0 ? (
                    `${selectedMembers.length} membre${selectedMembers.length > 1 ? 's' : ''} sélectionné${selectedMembers.length > 1 ? 's' : ''}`
                  ) : (
                    'Sélectionnez au moins un membre'
                  )
                ) : (
                  `Répartition pour ${selectedMembers.length} membre${selectedMembers.length > 1 ? 's' : ''}`
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Retour
                  </button>
                )}
                
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmitAssignment}
                  disabled={submitting || selectedMembers.length === 0 || (step === 2 && getTotalPercentage() !== 100)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {step === 1 ? (
                    selectedMembers.length > 1 ? 'Définir la répartition' : 'Assigner'
                  ) : (
                    submitting ? 'Assignation...' : 'Confirmer l\'assignation'
                  )}
                  {step === 1 && selectedMembers.length > 0 && <UserPlus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskAssignmentModal;
