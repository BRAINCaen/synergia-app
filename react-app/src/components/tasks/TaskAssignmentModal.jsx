// ==========================================
// 📁 react-app/src/components/tasks/TaskAssignmentModal.jsx
// MODAL ASSIGNATION TÂCHES - VERSION CORRIGÉE RESPONSIVE
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
  Info,
  Loader
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { membersAvailableService } from '../../core/services/membersAvailableService.js';
import { taskAssignmentService } from '../../core/services/taskAssignmentService.js';

/**
 * 👥 MODAL D'ASSIGNATION MULTIPLE CORRIGÉE
 * Utilise directement membersAvailableService pour éviter les bugs
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

  // ✅ CHARGEMENT DIRECT AVEC SERVICE CORRIGÉ
  const loadAvailableMembers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('👥 Chargement des membres disponibles via service corrigé...');
      
      // Utiliser directement le service corrigé
      const members = await membersAvailableService.getAllAvailableMembers();
      
      console.log('✅ Membres chargés sans erreur:', members.length);
      
      if (members.length === 0) {
        console.log('⚠️ Aucun membre trouvé, tentative de rechargement...');
        const reloadedMembers = await membersAvailableService.forceReload();
        setAvailableMembers(reloadedMembers);
      } else {
        setAvailableMembers(members);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement membres:', error);
      setError('Erreur lors du chargement des membres. Réessayez.');
      
      // Fallback : essayer avec une méthode alternative
      try {
        console.log('🔄 Tentative de rechargement forcé...');
        const fallbackMembers = await membersAvailableService.forceReload();
        setAvailableMembers(fallbackMembers);
        setError(''); // Effacer l'erreur si le fallback fonctionne
      } catch (fallbackError) {
        console.error('❌ Erreur fallback:', fallbackError);
        setError('Impossible de charger les membres. Vérifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les membres à l'ouverture
  useEffect(() => {
    if (isOpen && user) {
      loadAvailableMembers();
    }
  }, [isOpen, user]);

  // Fermeture et réinitialisation
  const handleClose = () => {
    setSelectedMembers([]);
    setContributions({});
    setStep(1);
    setError('');
    onClose();
  };

  // Sélection/désélection d'un membre
  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        // Retirer le membre
        const updated = prev.filter(id => id !== memberId);
        // Supprimer sa contribution
        const updatedContributions = { ...contributions };
        delete updatedContributions[memberId];
        setContributions(updatedContributions);
        return updated;
      } else {
        // Ajouter le membre
        return [...prev, memberId];
      }
    });
  };

  // Mise à jour du pourcentage de contribution
  const updateContribution = (memberId, percentage) => {
    setContributions(prev => ({
      ...prev,
      [memberId]: Math.max(0, Math.min(100, parseInt(percentage) || 0))
    }));
  };

  // Distribution automatique équitable
  const distributeEqually = () => {
    if (selectedMembers.length === 0) return;
    
    const equal = Math.floor(100 / selectedMembers.length);
    const remainder = 100 - (equal * selectedMembers.length);
    
    const newContributions = {};
    selectedMembers.forEach((memberId, index) => {
      newContributions[memberId] = equal + (index === 0 ? remainder : 0);
    });
    
    setContributions(newContributions);
  };

  // Validation et soumission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Vérifications
      if (selectedMembers.length === 0) {
        setError('Veuillez sélectionner au moins un membre');
        setSubmitting(false);
        return;
      }

      // Si étape 1, passer à l'étape 2 (pourcentages)
      if (step === 1) {
        setStep(2);
        distributeEqually(); // Initialiser avec distribution équitable
        setSubmitting(false);
        return;
      }

      // Étape 2 : Valider les pourcentages
      const total = Object.values(contributions).reduce((sum, val) => sum + val, 0);
      
      if (Math.abs(total - 100) > 0.1) {
        setError(`Le total doit être égal à 100% (actuellement ${total}%)`);
        setSubmitting(false);
        return;
      }

      // Assignation via le service
      console.log('📤 Assignation de la tâche:', {
        taskId: task.id,
        members: selectedMembers,
        contributions
      });

      const result = await taskAssignmentService.assignTaskToMembers(
        task.id,
        selectedMembers,
        contributions,
        user.uid
      );

      console.log('✅ Assignation réussie:', result);

      // Callback de succès
      if (onAssignmentSuccess) {
        onAssignmentSuccess({
          taskId: task.id,
          assignedMembers: selectedMembers,
          contributions: contributions
        });
      } else if (result.success) {
        // Fallback: notification simple
        if (window.showNotification) {
          window.showNotification(
            `Tâche assignée à ${selectedMembers.length} membre(s) avec succès`,
            'success'
          );
        }
      } else {
        setError(result.message || 'Erreur lors de l\'assignation');
        setSubmitting(false);
        return;
      }

      // Si assignation partielle
      if (result.partialSuccess) {
        console.warn('⚠️ Assignation partielle:', result.failedMembers);
        if (window.showNotification) {
          window.showNotification(
            `Assignation partielle : ${result.failedMembers?.length || 0} membre(s) en erreur`,
            'warning'
          );
        }
        
        // Mettre à jour l'état avec les membres réussis uniquement
        setSelectedMembers(result.successfulMembers || []);
        setContributions(prev => {
          const updated = { ...prev };
          result.failedMembers?.forEach(memberId => {
            delete updated[memberId];
          });
          return updated;
        });
        
        // Ne pas fermer si erreur partielle
        setSubmitting(false);
        return;
      }

      // Si erreur totale
      if (!result.success) {
        setError(result.message || 'Erreur lors de l\'assignation');
        setSubmitting(false);
        return;
      }

      // Si assignation via callback (mode ancien)
      if (!result.task && !result.success && onAssignmentSuccess) {
        onAssignmentSuccess({
          taskId: task.id,
          assignedMembers: selectedMembers,
          contributions: contributions,
          contributionsEnabled: Object.keys(contributions).length > 0 ? true : null
        });
      }
      
      // Fermer le modal
      handleClose();
      
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      setError(`Erreur lors de l'assignation: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Si pas ouvert, ne rien rendre
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start sm:items-center sm:justify-center z-50 p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-none sm:rounded-xl shadow-xl w-full max-w-[375px] sm:max-w-[95vw] md:max-w-4xl h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              
              {/* Titre avec étapes */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Assigner des membres
                  </h2>
                </div>
                
                {/* Indicateur d'étapes */}
                <div className="flex items-center gap-2 ml-4">
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
                  <span className="text-sm text-gray-600">Contributions</span>
                </div>
              </div>
              
              {/* Bouton fermer */}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Info tâche */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">{task.title}</div>
                  <div className="text-sm text-blue-700 mt-1">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    {task.xpReward || 25} XP • {task.difficulty === 'easy' ? 'Facile' : task.difficulty === 'normal' ? 'Normal' : 'Difficile'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Corps avec scroll */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            <div className="p-6">
              
              {/* Erreurs */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* ÉTAPE 1: Sélection des membres */}
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Sélectionner les membres
                  </h3>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-3 text-gray-600">Chargement des membres...</span>
                    </div>
                  ) : availableMembers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Aucun membre disponible</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableMembers.map(member => {
                        const isSelected = selectedMembers.includes(member.id);
                        
                        return (
                          <div
                            key={member.id}
                            onClick={() => toggleMemberSelection(member.id)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-medium text-white
                                ${isSelected ? 'bg-blue-600' : 'bg-gray-400'}
                              `}>
                                {member.displayName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {member.displayName || 'Utilisateur'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.email}
                                </div>
                              </div>
                              
                              {isSelected && (
                                <Check className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 2: Pourcentages de contribution */}
              {step === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Percent className="w-5 h-5 text-blue-600" />
                      Répartir les contributions
                    </h3>
                    
                    <button
                      onClick={distributeEqually}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Répartir équitablement
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedMembers.map(memberId => {
                      const member = availableMembers.find(m => m.id === memberId);
                      if (!member) return null;
                      
                      const contribution = contributions[memberId] || 0;
                      
                      return (
                        <div key={memberId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-medium text-white">
                                {member.displayName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {member.displayName || 'Utilisateur'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={contribution}
                                onChange={(e) => updateContribution(memberId, e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                              <span className="text-gray-600">%</span>
                            </div>
                          </div>
                          
                          {/* Barre de progression */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${contribution}%` }}
                            />
                          </div>
                          
                          {/* XP prévu */}
                          <div className="mt-2 text-sm text-gray-600">
                            <Trophy className="w-4 h-4 inline mr-1" />
                            {Math.round((task.xpReward || 25) * contribution / 100)} XP
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">Total des contributions</span>
                      <span className={`text-lg font-bold ${
                        Math.abs(Object.values(contributions).reduce((sum, val) => sum + val, 0) - 100) < 0.1
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {Object.values(contributions).reduce((sum, val) => sum + val, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedMembers.length} membre(s) sélectionné(s)
              </div>
              
              <div className="flex gap-3">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Retour
                  </button>
                )}
                
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={selectedMembers.length === 0 || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      {step === 1 ? 'Chargement...' : 'Assignation...'}
                    </>
                  ) : (
                    <>
                      {step === 1 ? 'Suivant' : 'Assigner'}
                    </>
                  )}
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
