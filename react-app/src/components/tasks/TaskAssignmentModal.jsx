// ==========================================
// 📁 react-app/src/components/tasks/TaskAssignmentModal.jsx
// MODAL ASSIGNATION TÂCHES - VERSION CORRIGÉE SANS BUG USER
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

  // Charger les membres quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadAvailableMembers();
      // Reset des états
      setSelectedMembers([]);
      setContributions({});
      setStep(1);
      setError('');
    }
  }, [isOpen]);

  // Gérer la fermeture
  const handleClose = () => {
    setSelectedMembers([]);
    setContributions({});
    setStep(1);
    setError('');
    onClose();
  };

  // Sélectionner/désélectionner un membre
  const toggleMemberSelection = (member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.find(m => m.id === member.id);
      
      if (isSelected) {
        // Retirer le membre
        const updated = prev.filter(m => m.id !== member.id);
        
        // Retirer de contributions si présent
        setContributions(prevContrib => {
          const newContrib = { ...prevContrib };
          delete newContrib[member.id];
          return newContrib;
        });
        
        return updated;
      } else {
        // Ajouter le membre
        return [...prev, member];
      }
    });
  };

  // Calculer le total des pourcentages
  const getTotalPercentage = () => {
    return Object.values(contributions).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  // Distribuer équitablement les pourcentages
  const distributeEqually = () => {
    if (selectedMembers.length === 0) return;
    
    const equalPercentage = Math.floor(100 / selectedMembers.length);
    const remainder = 100 - (equalPercentage * selectedMembers.length);
    
    const newContributions = {};
    selectedMembers.forEach((member, index) => {
      if (index === selectedMembers.length - 1) {
        // Le dernier membre récupère le reste
        newContributions[member.id] = equalPercentage + remainder;
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
    if (!task?.id) {
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
      distributeEqually(); // Distribuer automatiquement
      return;
    }

    // Validation des pourcentages pour assignation multiple
    if (selectedMembers.length > 1 && getTotalPercentage() !== 100) {
      setError(`Les pourcentages doivent totaliser 100% (actuellement ${getTotalPercentage()}%)`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('🎯 Soumission assignation:', {
        taskId: task.id,
        selectedMembers: selectedMembers.map(m => ({ id: m.id, name: m.name })),
        contributions: selectedMembers.length > 1 ? contributions : null
      });

      // Assigner la tâche avec le service corrigé
      const result = await taskAssignmentService.assignTaskToMembers(
        task.id,
        selectedMembers.map(m => m.id),
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
      
      // Notifier le parent
      if (onAssignmentSuccess) {
        onAssignmentSuccess({
          success: true,
          assignedMembers: selectedMembers,
          taskId: task.id,
          assignmentCount: selectedMembers.length,
          contributions: selectedMembers.length > 1 ? contributions : null
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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
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
          <div className="overflow-y-auto max-h-[60vh]">
            
            {/* Affichage des erreurs */}
            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Erreur</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
                
                {/* Bouton retry si erreur de chargement */}
                {error.includes('chargement') && (
                  <button
                    onClick={loadAvailableMembers}
                    disabled={loading}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader className="w-4 h-4 animate-spin" />}
                    Réessayer
                  </button>
                )}
              </div>
            )}

            {/* Étape 1: Sélection des membres */}
            {step === 1 && (
              <div className="p-6 space-y-6">
                
                {/* Header de sélection */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez les membres à assigner
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tâche: <span className="font-medium">{task?.title || 'Sans titre'}</span>
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
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Chargement des membres...</p>
                    </div>
                  ) : availableMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-4">Aucun membre disponible</p>
                      <button
                        onClick={loadAvailableMembers}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Recharger
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {availableMembers.map(member => {
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
                                {isSelected ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  member.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {member.name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">
                                  {member.email}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Trophy className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs text-gray-500">
                                    Niveau {member.level} • {member.totalXp} XP
                                  </span>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div className="text-blue-600">
                                  <Check className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Étape 2: Répartition des pourcentages */}
            {step === 2 && (
              <div className="p-6 space-y-6">
                
                {/* Header répartition */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Définir la répartition des contributions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Total: <span className={`font-bold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {getTotalPercentage()}%
                    </span>
                  </p>
                </div>

                {/* Bouton distribution automatique */}
                <div className="flex justify-center">
                  <button
                    onClick={distributeEqually}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Percent className="w-4 h-4" />
                    Distribuer équitablement
                  </button>
                </div>

                {/* Répartition par membre */}
                <div className="space-y-4">
                  {selectedMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={contributions[member.id] || 0}
                          onChange={(e) => updateContribution(member.id, e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation pourcentages */}
                {getTotalPercentage() !== 100 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Info className="w-5 h-5" />
                      <span className="font-medium">Attention</span>
                    </div>
                    <p className="text-orange-700 mt-1">
                      Le total doit être exactement 100%. 
                      Actuellement: {getTotalPercentage()}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer avec actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              
              {/* Info étape */}
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
              
              {/* Actions */}
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
