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
  RefreshCw,
  MessageSquare,
  X,
  Send,
  Bell,
  UserCheck,
  Plus,
  AlertTriangle,
  Eye
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

  // États pour les feedbacks à donner
  const [pendingFeedbackRequests, setPendingFeedbackRequests] = useState([]);
  const [selectedFeedbackRequest, setSelectedFeedbackRequest] = useState(null);
  const [showGiveFeedbackModal, setShowGiveFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // États pour les entretiens
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newInterview, setNewInterview] = useState({
    type: 'annual',
    employeeId: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: ''
  });

  // Types d'entretiens
  const interviewTypes = [
    { id: 'annual', label: 'Entretien annuel', color: 'blue', duration: '1h30' },
    { id: 'professional', label: 'Entretien professionnel', color: 'purple', duration: '1h' },
    { id: 'probation', label: 'Fin de période d\'essai', color: 'orange', duration: '45min' },
    { id: 'followup', label: 'Suivi', color: 'green', duration: '30min' },
    { id: 'return', label: 'Retour absence longue', color: 'yellow', duration: '45min' }
  ];

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

        // Charger les demandes de feedback en attente
        await loadPendingFeedbackRequests();

        // Charger les entretiens
        await loadInterviews();

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

  // Charger les demandes de feedback en attente pour l'utilisateur courant
  const loadPendingFeedbackRequests = async () => {
    try {
      const requests = await checkpointService.getPendingFeedbackRequests(user?.uid);

      // Enrichir avec les infos utilisateur
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const userMember = teamMembers.find(m => m.uid === request.userId);
          if (userMember) {
            return { ...request, user: userMember };
          }
          // Si pas trouvé dans teamMembers, récupérer depuis Firebase
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../core/firebase');
            const userDoc = await getDoc(doc(db, 'users', request.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                ...request,
                user: {
                  uid: request.userId,
                  displayName: userData.displayName || userData.email || 'Aventurier',
                  email: userData.email,
                  photoURL: userData.photoURL
                }
              };
            }
          } catch (e) {
            console.error('Erreur récupération user:', e);
          }
          return { ...request, user: { uid: request.userId, displayName: 'Aventurier' } };
        })
      );

      setPendingFeedbackRequests(enrichedRequests);
    } catch (err) {
      console.error('Erreur chargement demandes feedback:', err);
    }
  };

  // Charger les entretiens
  const loadInterviews = async () => {
    try {
      setInterviewsLoading(true);
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../core/firebase');

      const interviewsRef = collection(db, 'hr_interviews');
      const snapshot = await getDocs(query(interviewsRef, orderBy('scheduledDate', 'desc')));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInterviews(data);
    } catch (error) {
      console.error('Erreur chargement entretiens:', error);
    } finally {
      setInterviewsLoading(false);
    }
  };

  // Créer un nouvel entretien
  const handleCreateInterview = async () => {
    if (!newInterview.employeeId || !newInterview.scheduledDate || !newInterview.scheduledTime) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../core/firebase');

      const scheduledDateTime = new Date(`${newInterview.scheduledDate}T${newInterview.scheduledTime}`);

      await addDoc(collection(db, 'hr_interviews'), {
        type: newInterview.type,
        employeeId: newInterview.employeeId,
        scheduledDate: scheduledDateTime,
        notes: newInterview.notes,
        status: 'scheduled',
        createdBy: user?.uid,
        createdAt: serverTimestamp()
      });

      // Reset et fermer
      setNewInterview({
        type: 'annual',
        employeeId: '',
        scheduledDate: '',
        scheduledTime: '',
        notes: ''
      });
      setShowNewInterviewModal(false);

      // Recharger
      await loadInterviews();
    } catch (err) {
      console.error('Erreur création entretien:', err);
      setError('Erreur lors de la création de l\'entretien');
    }
  };

  // Stats des entretiens
  const interviewStats = {
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    overdue: interviews.filter(i => {
      const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate);
      return date < new Date() && i.status === 'scheduled';
    }).length,
    thisMonth: interviews.filter(i => {
      const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  // Employés sans entretien annuel cette année
  const employeesWithoutAnnualReview = teamMembers.filter(emp => {
    return !interviews.some(i =>
      i.employeeId === emp.uid &&
      i.type === 'annual' &&
      new Date(i.scheduledDate?.toDate?.() || i.scheduledDate).getFullYear() === selectedYear
    );
  });

  // Soumettre un feedback pour un collègue
  const handleSubmitPeerFeedback = async (answers) => {
    if (!selectedFeedbackRequest) return;

    setIsSubmittingFeedback(true);
    try {
      await checkpointService.submitPeerFeedback(
        selectedFeedbackRequest.checkpointId,
        user?.uid,
        user?.displayName || user?.email || 'Aventurier',
        answers
      );

      // Fermer le modal et rafraîchir
      setShowGiveFeedbackModal(false);
      setSelectedFeedbackRequest(null);

      // Recharger les demandes en attente
      await loadPendingFeedbackRequests();

    } catch (err) {
      console.error('Erreur soumission feedback:', err);
      setError(err.message || 'Erreur lors de l\'envoi du feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Ouvrir le modal pour donner un feedback
  const openGiveFeedbackModal = (request) => {
    setSelectedFeedbackRequest(request);
    setShowGiveFeedbackModal(true);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Chargement du checkpoint...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isCompleted = checkpoint?.status === CHECKPOINT_STATUS.COMPLETED;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500/30 to-purple-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <Flag className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                    🎓 Académie
                  </h1>
                  <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mt-0.5">
                    <Calendar size={14} />
                    <span>{CHECKPOINT_QUARTERS[checkpoint?.quarter]?.label} {checkpoint?.year}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Bouton historique */}
                {pastCheckpoints.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-xl text-gray-300 transition-all text-sm"
                  >
                    <History size={16} />
                    <span className="hidden sm:inline">Historique</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 flex items-center gap-3 p-3 sm:p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl"
            >
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300 p-1"
              >
                <span className="text-lg">×</span>
              </button>
            </motion.div>
          )}

          {/* 🔔 SECTION FEEDBACKS À DONNER */}
          {pendingFeedbackRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 bg-gradient-to-br from-pink-500/10 to-rose-500/5 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Bell size={20} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {pendingFeedbackRequests.length}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Feedbacks à donner</h3>
                  <p className="text-sm text-gray-400">
                    Des collègues attendent ton retour
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {pendingFeedbackRequests.map((request) => (
                  <motion.button
                    key={request.checkpointId}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openGiveFeedbackModal(request)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {request.user?.photoURL ? (
                        <img
                          src={request.user.photoURL}
                          alt={request.user.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500/30 to-rose-500/30 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {request.user?.displayName?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-white font-medium">
                          {request.user?.displayName || 'Aventurier'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Checkpoint {CHECKPOINT_QUARTERS[request.quarter]?.label} {request.year}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-pink-400 text-sm">
                      <MessageSquare size={16} />
                      <span className="hidden sm:inline">Donner mon feedback</span>
                      <ChevronRight size={16} />
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <Sparkles size={14} />
                <span>+20 XP par feedback donné</span>
              </div>
            </motion.div>
          )}

          {/* Status si complété */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 sm:mb-8 text-center p-6 sm:p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl border border-green-500/20 rounded-2xl"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <CheckCircle size={28} className="text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                Checkpoint terminé !
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Validé par {checkpoint?.managerReview?.managerName || 'le Maître de Guilde'}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/20 rounded-full text-green-400 text-sm">
                <Sparkles size={16} />
                <span className="font-medium">+{checkpoint?.xpEarned || 0} XP gagnés</span>
              </div>
            </motion.div>
          )}

          {/* Barre de progression des étapes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between relative">
              {/* Ligne de connexion */}
              <div className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 bg-white/10 mx-10 sm:mx-16">
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
                    className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2"
                  >
                    <motion.div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
                        isComplete
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25'
                          : isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 ring-2 sm:ring-4 ring-indigo-500/30 shadow-lg shadow-indigo-500/25'
                          : isLocked
                          ? 'bg-white/5 border border-white/10 opacity-50'
                          : 'bg-white/10 border border-white/10 hover:bg-white/20'
                      }`}
                      whileHover={!isLocked ? { scale: 1.05 } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                    >
                      {isComplete ? (
                        <CheckCircle size={20} className="text-white" />
                      ) : isLocked ? (
                        <Lock size={16} className="text-gray-500" />
                      ) : (
                        <Icon size={20} className="text-white" />
                      )}
                    </motion.div>
                    <span className={`text-[10px] sm:text-xs font-medium ${
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
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
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
                    <div className="flex justify-end mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
                      >
                        Commencer l'auto-réflexion
                        <ChevronRight size={18} />
                      </motion.button>
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
                    <div className="flex justify-end mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
                      >
                        Définir mes objectifs
                        <ChevronRight size={18} />
                      </motion.button>
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
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-yellow-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-yellow-300 text-sm">En attente de validation</div>
                          <div className="text-xs sm:text-sm text-yellow-400/80">
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
              className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
                whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${
                  currentStep === 0
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'
                }`}
              >
                <ChevronLeft size={16} />
                Précédent
              </motion.button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <Clock size={14} />
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
                className="mt-4 sm:mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <History size={18} className="text-indigo-400" />
                  Historique des checkpoints
                </h3>

                <div className="space-y-2 sm:space-y-3">
                  {pastCheckpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                          cp.status === CHECKPOINT_STATUS.COMPLETED
                            ? 'bg-green-500/20 border border-green-500/20'
                            : 'bg-white/5 border border-white/10'
                        }`}>
                          {cp.status === CHECKPOINT_STATUS.COMPLETED ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <Clock size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {CHECKPOINT_QUARTERS[cp.quarter]?.label} {cp.year}
                          </div>
                          <div className="text-xs text-gray-400">
                            {cp.status === CHECKPOINT_STATUS.COMPLETED
                              ? `+${cp.xpEarned || 0} XP`
                              : 'Non terminé'
                            }
                          </div>
                        </div>
                      </div>

                      <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        cp.status === CHECKPOINT_STATUS.COMPLETED
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                          : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}>
                        {cp.status === CHECKPOINT_STATUS.COMPLETED ? 'Terminé' : 'Incomplet'}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ==========================================
              📋 SECTION ENTRETIENS
              ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 backdrop-blur-xl border border-white/10 rounded-xl">
                  <UserCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Entretiens</h2>
                  <p className="text-gray-400 text-sm">Entretiens annuels et professionnels</p>
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year} className="bg-gray-900">{year}</option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewInterviewModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4" />
                  Planifier
                </motion.button>
              </div>
            </div>

            {/* Stats Entretiens */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Planifiés</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-blue-400">{interviewStats.scheduled}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">Complétés</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-400">{interviewStats.completed}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">En retard</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-orange-400">{interviewStats.overdue}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Ce mois</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-purple-400">{interviewStats.thisMonth}</div>
              </div>
            </div>

            {/* Alerte employés sans entretien */}
            {employeesWithoutAnnualReview.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-1">
                      {employeesWithoutAnnualReview.length} salarié(s) sans entretien annuel en {selectedYear}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {employeesWithoutAnnualReview.slice(0, 5).map(emp => (
                        <span key={emp.uid} className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300 text-xs">
                          {emp.displayName}
                        </span>
                      ))}
                      {employeesWithoutAnnualReview.length > 5 && (
                        <span className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300 text-xs">
                          +{employeesWithoutAnnualReview.length - 5} autres
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Types d'entretiens */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {interviewTypes.map((type) => (
                <div
                  key={type.id}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-colors"
                >
                  <div className={`text-${type.color}-400 font-medium text-sm mb-1`}>{type.label}</div>
                  <div className="text-gray-500 text-xs">~{type.duration}</div>
                </div>
              ))}
            </div>

            {/* Liste des entretiens */}
            {interviewsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
                <p className="text-gray-400">Chargement des entretiens...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Aucun entretien planifié</p>
                <p className="text-gray-500 text-sm mb-4">Planifiez vos entretiens annuels et professionnels</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewInterviewModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Planifier un entretien
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 10).map((interview) => {
                  const employee = teamMembers.find(e => e.uid === interview.employeeId);
                  const type = interviewTypes.find(t => t.id === interview.type) || interviewTypes[0];
                  const date = interview.scheduledDate?.toDate?.() || new Date(interview.scheduledDate);
                  const isOverdue = date < new Date() && interview.status === 'scheduled';

                  return (
                    <motion.div
                      key={interview.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 rounded-xl border ${
                        isOverdue
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-${type.color}-500/20 rounded-full flex items-center justify-center`}>
                            <UserCheck className={`w-5 h-5 text-${type.color}-400`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-white">
                                {employee?.displayName || 'Employé inconnu'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs bg-${type.color}-500/20 text-${type.color}-400`}>
                                {type.label}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                              En retard
                            </span>
                          )}
                          {interview.status === 'completed' && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              Complété
                            </span>
                          )}
                          <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* 📝 MODAL DONNER UN FEEDBACK */}
        <AnimatePresence>
          {showGiveFeedbackModal && selectedFeedbackRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => {
                  setShowGiveFeedbackModal(false);
                  setSelectedFeedbackRequest(null);
                }}
              />

              {/* Modal content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border border-white/10 rounded-2xl shadow-2xl"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    {selectedFeedbackRequest.user?.photoURL ? (
                      <img
                        src={selectedFeedbackRequest.user.photoURL}
                        alt={selectedFeedbackRequest.user.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {selectedFeedbackRequest.user?.displayName?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Feedback pour {selectedFeedbackRequest.user?.displayName || 'Aventurier'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Checkpoint {CHECKPOINT_QUARTERS[selectedFeedbackRequest.quarter]?.label} {selectedFeedbackRequest.year}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowGiveFeedbackModal(false);
                      setSelectedFeedbackRequest(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Feedback Form using PeerFeedback component */}
                <div className="p-4 sm:p-6">
                  <PeerFeedback
                    checkpoint={null}
                    currentUserId={user?.uid}
                    teamMembers={[]}
                    onSubmitFeedback={handleSubmitPeerFeedback}
                    isLoading={isSubmittingFeedback}
                    mode="give"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📋 MODAL NOUVEAU ENTRETIEN */}
        <AnimatePresence>
          {showNewInterviewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setShowNewInterviewModal(false)}
              />

              {/* Modal content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 border border-white/10 rounded-2xl shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Planifier un entretien</h3>
                      <p className="text-sm text-gray-400">Nouveau rendez-vous</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewInterviewModal(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Formulaire */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Type d'entretien */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type d'entretien *
                    </label>
                    <select
                      value={newInterview.type}
                      onChange={(e) => setNewInterview({ ...newInterview, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {interviewTypes.map(type => (
                        <option key={type.id} value={type.id} className="bg-gray-900">
                          {type.label} (~{type.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employé */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Collaborateur *
                    </label>
                    <select
                      value={newInterview.employeeId}
                      onChange={(e) => setNewInterview({ ...newInterview, employeeId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="" className="bg-gray-900">Sélectionner un collaborateur</option>
                      {teamMembers.map(emp => (
                        <option key={emp.uid} value={emp.uid} className="bg-gray-900">
                          {emp.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date et heure */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={newInterview.scheduledDate}
                        onChange={(e) => setNewInterview({ ...newInterview, scheduledDate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Heure *
                      </label>
                      <input
                        type="time"
                        value={newInterview.scheduledTime}
                        onChange={(e) => setNewInterview({ ...newInterview, scheduledTime: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={newInterview.notes}
                      onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
                      rows={3}
                      placeholder="Points à aborder, préparation..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-white/10">
                  <button
                    onClick={() => setShowNewInterviewModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateInterview}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    <Plus size={18} />
                    Planifier
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default CheckpointsPage;
