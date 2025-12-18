// ==========================================
// react-app/src/pages/CheckpointsPage.jsx
// Page principale des Checkpoints trimestriels
// CONFORME CHARTE GRAPHIQUE SYNERGIA v3.5
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Clock,
  Users,
  Target,
  Brain,
  Trophy,
  Sparkles,
  AlertCircle,
  Lock,
  History,
  RefreshCw
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../shared/stores/authStore';
import {
  checkpointService,
  CHECKPOINT_STATUS,
  CHECKPOINT_QUARTERS
} from '../core/services/checkpointService';
import {
  CheckpointRecap,
  SelfReflection,
  PeerFeedback,
  GoalSetting
} from '../components/checkpoints';

// Configuration des étapes
const STEPS = [
  {
    id: 'recap',
    label: 'Récap',
    icon: Trophy,
    description: 'Ton parcours ce trimestre'
  },
  {
    id: 'reflection',
    label: 'Auto-réflexion',
    icon: Brain,
    description: 'Prends le temps de réfléchir'
  },
  {
    id: 'feedback',
    label: 'Feedbacks',
    icon: Users,
    description: 'Retours de tes collègues'
  },
  {
    id: 'goals',
    label: 'Objectifs',
    icon: Target,
    description: 'Tes défis à venir'
  }
];

const CheckpointsPage = () => {
  const { user } = useAuthStore();
  const [checkpoint, setCheckpoint] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pastCheckpoints, setPastCheckpoints] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Charger le checkpoint actuel
  useEffect(() => {
    const loadCheckpoint = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      setError(null);

      try {
        const currentCheckpoint = await checkpointService.getOrCreateCheckpoint(user.uid);
        setCheckpoint(currentCheckpoint);

        // Déterminer l'étape actuelle basée sur le statut
        const stepIndex = determineCurrentStep(currentCheckpoint);
        setCurrentStep(stepIndex);

        // Charger les checkpoints passés
        const history = await checkpointService.getUserCheckpoints(user.uid);
        setPastCheckpoints(history.filter(cp => cp.id !== currentCheckpoint.id));

        // Charger les membres de l'équipe (pour feedbacks)
        await loadTeamMembers();

      } catch (err) {
        console.error('Erreur chargement checkpoint:', err);
        setError('Impossible de charger ton checkpoint');
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckpoint();
  }, [user?.uid]);

  // Charger les membres de l'équipe
  const loadTeamMembers = async () => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../core/firebase');

      const snapshot = await getDocs(collection(db, 'users'));
      const members = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (doc.id !== user?.uid) {
          members.push({
            uid: doc.id,
            displayName: data.displayName || data.email || 'Aventurier',
            email: data.email,
            photoURL: data.photoURL
          });
        }
      });

      setTeamMembers(members);
    } catch (err) {
      console.error('Erreur chargement équipe:', err);
    }
  };

  // Déterminer l'étape courante
  const determineCurrentStep = (cp) => {
    if (!cp) return 0;

    if (cp.status === CHECKPOINT_STATUS.COMPLETED) return 3;
    if (cp.status === CHECKPOINT_STATUS.REVIEW) return 3;
    if (cp.status === CHECKPOINT_STATUS.FEEDBACK) {
      return cp.selfReflection?.completed ? 2 : 1;
    }
    return cp.selfReflection?.completed ? 1 : 0;
  };

  // Sauvegarder l'auto-réflexion
  const handleSaveReflection = async (answers, isComplete) => {
    setIsSaving(true);
    try {
      const result = await checkpointService.saveSelfReflection(
        checkpoint.id,
        answers,
        isComplete
      );

      // Recharger le checkpoint
      const updated = await checkpointService.getCheckpoint(checkpoint.id);
      setCheckpoint(updated);

      if (isComplete) {
        setCurrentStep(2); // Passer aux feedbacks
      }

      return result;
    } catch (err) {
      console.error('Erreur sauvegarde réflexion:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Demander un feedback peer
  const handleRequestFeedback = async (peerId) => {
    setIsSaving(true);
    try {
      await checkpointService.requestPeerFeedback(checkpoint.id, peerId);

      // Recharger le checkpoint
      const updated = await checkpointService.getCheckpoint(checkpoint.id);
      setCheckpoint(updated);
    } catch (err) {
      console.error('Erreur demande feedback:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Sauvegarder les objectifs
  const handleSaveGoals = async (goals) => {
    setIsSaving(true);
    try {
      await checkpointService.setGoals(checkpoint.id, goals);

      // Recharger le checkpoint
      const updated = await checkpointService.getCheckpoint(checkpoint.id);
      setCheckpoint(updated);
    } catch (err) {
      console.error('Erreur sauvegarde objectifs:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Obtenir le prochain trimestre
  const getNextQuarter = () => {
    if (!checkpoint) return '';
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentIndex = quarters.indexOf(checkpoint.quarter);
    const nextIndex = (currentIndex + 1) % 4;
    const nextYear = nextIndex === 0 ? checkpoint.year + 1 : checkpoint.year;
    return `${quarters[nextIndex]} ${nextYear}`;
  };

  // État de chargement
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement du checkpoint...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isCompleted = checkpoint?.status === CHECKPOINT_STATUS.COMPLETED;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <Flag className="w-8 h-8 text-white" />
                </div>
                Checkpoint
              </h1>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={16} />
                <span>{CHECKPOINT_QUARTERS[checkpoint?.quarter]?.label} {checkpoint?.year}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Bouton historique */}
              {pastCheckpoints.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-300 transition-colors"
                >
                  <History size={18} />
                  Historique
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 p-4 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl"
          >
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Status si complété */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 text-center p-8 bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 rounded-2xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Checkpoint terminé !
            </h2>
            <p className="text-gray-400 mb-4">
              Validé par {checkpoint?.managerReview?.managerName || 'le Maître de Guilde'}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400">
              <Sparkles size={18} />
              <span className="font-medium">+{checkpoint?.xpEarned || 0} XP gagnés</span>
            </div>
          </motion.div>
        )}

        {/* Barre de progression des étapes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between relative">
            {/* Ligne de connexion */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-700 mx-16">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep || isCompleted;
              const isLocked = index > currentStep && !isCompleted;

              return (
                <button
                  key={step.id}
                  onClick={() => !isLocked && setCurrentStep(index)}
                  disabled={isLocked}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <motion.div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 ring-4 ring-indigo-500/30'
                        : isLocked
                        ? 'bg-gray-800 opacity-50'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    whileHover={!isLocked ? { scale: 1.05 } : {}}
                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                  >
                    {isComplete ? (
                      <CheckCircle size={24} className="text-white" />
                    ) : isLocked ? (
                      <Lock size={20} className="text-gray-500" />
                    ) : (
                      <Icon size={24} className="text-white" />
                    )}
                  </motion.div>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-indigo-400' : isComplete ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Contenu de l'étape actuelle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6"
        >
          <AnimatePresence mode="wait">
            {/* Étape 0: Récap */}
            {currentStep === 0 && (
              <motion.div
                key="recap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <CheckpointRecap
                  recap={checkpoint?.recap}
                  userName={user?.displayName?.split(' ')[0] || 'Aventurier'}
                />

                {!isCompleted && (
                  <div className="flex justify-end mt-6 pt-6 border-t border-gray-700/50">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-xl text-white font-medium transition-all"
                    >
                      Commencer l'auto-réflexion
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Étape 1: Auto-réflexion */}
            {currentStep === 1 && (
              <motion.div
                key="reflection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SelfReflection
                  initialAnswers={checkpoint?.selfReflection?.answers || {}}
                  isCompleted={checkpoint?.selfReflection?.completed}
                  onSave={(answers) => handleSaveReflection(answers, false)}
                  onComplete={(answers) => handleSaveReflection(answers, true)}
                  isLoading={isSaving}
                />
              </motion.div>
            )}

            {/* Étape 2: Feedbacks */}
            {currentStep === 2 && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PeerFeedback
                  checkpoint={checkpoint}
                  currentUserId={user?.uid}
                  teamMembers={teamMembers}
                  onRequestFeedback={handleRequestFeedback}
                  isLoading={isSaving}
                  mode="request"
                />

                {checkpoint?.peerFeedback?.receivedFeedbacks?.length >= checkpoint?.peerFeedback?.minRequired && (
                  <div className="flex justify-end mt-6 pt-6 border-t border-gray-700/50">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-xl text-white font-medium transition-all"
                    >
                      Définir mes objectifs
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Étape 3: Objectifs */}
            {currentStep === 3 && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GoalSetting
                  initialGoals={checkpoint?.goals?.items || []}
                  isValidated={checkpoint?.goals?.validatedByManager}
                  onSave={handleSaveGoals}
                  isLoading={isSaving}
                  nextQuarter={getNextQuarter()}
                />

                {!isCompleted && checkpoint?.status === CHECKPOINT_STATUS.REVIEW && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-yellow-400" />
                      <div>
                        <div className="font-medium text-yellow-300">En attente de validation</div>
                        <div className="text-sm text-yellow-400/80">
                          Le Maître de Guilde va bientôt valider ton checkpoint
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation entre étapes */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-between items-center"
          >
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                currentStep === 0
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300'
              }`}
            >
              <ChevronLeft size={18} />
              Précédent
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              Deadline: {checkpoint?.deadline?.toDate?.()?.toLocaleDateString('fr-FR') || 'Non définie'}
            </div>
          </motion.div>
        )}

        {/* Historique des checkpoints */}
        <AnimatePresence>
          {showHistory && pastCheckpoints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <History size={20} className="text-indigo-400" />
                Historique des checkpoints
              </h3>

              <div className="space-y-3">
                {pastCheckpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        cp.status === CHECKPOINT_STATUS.COMPLETED
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                          : 'bg-gray-700'
                      }`}>
                        {cp.status === CHECKPOINT_STATUS.COMPLETED ? (
                          <CheckCircle size={20} className="text-green-400" />
                        ) : (
                          <Clock size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {CHECKPOINT_QUARTERS[cp.quarter]?.label} {cp.year}
                        </div>
                        <div className="text-sm text-gray-400">
                          {cp.status === CHECKPOINT_STATUS.COMPLETED
                            ? `+${cp.xpEarned || 0} XP`
                            : 'Non terminé'
                          }
                        </div>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cp.status === CHECKPOINT_STATUS.COMPLETED
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {cp.status === CHECKPOINT_STATUS.COMPLETED ? 'Terminé' : 'Incomplet'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default CheckpointsPage;
