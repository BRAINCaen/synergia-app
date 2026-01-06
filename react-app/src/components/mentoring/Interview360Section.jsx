// ==========================================
// 📁 react-app/src/components/mentoring/Interview360Section.jsx
// SECTION ENTRETIENS 360° RÉGULIERS
// Feedback à 360° : managers, collègues, équipe
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, Clock, Plus, X, Check, MessageSquare,
  Star, TrendingUp, ChevronRight, ChevronDown, AlertCircle,
  UserCheck, Send, RefreshCw, Target, Award, Eye, Edit3, Trash2
} from 'lucide-react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// ==========================================
// CONSTANTES
// ==========================================

const INTERVIEW_360_TYPES = {
  quarterly: {
    id: 'quarterly',
    label: 'Trimestriel',
    frequency: 90, // jours
    emoji: '📅',
    color: 'blue',
    description: 'Feedback régulier tous les 3 mois'
  },
  biannual: {
    id: 'biannual',
    label: 'Semestriel',
    frequency: 180,
    emoji: '📆',
    color: 'purple',
    description: 'Bilan complet tous les 6 mois'
  },
  annual: {
    id: 'annual',
    label: 'Annuel',
    frequency: 365,
    emoji: '🎯',
    color: 'amber',
    description: 'Évaluation annuelle complète'
  },
  onboarding: {
    id: 'onboarding',
    label: 'Intégration',
    frequency: 30,
    emoji: '🚀',
    color: 'green',
    description: 'Suivi d\'intégration (30/60/90 jours)'
  }
};

const FEEDBACK_SOURCES = {
  manager: { id: 'manager', label: 'Manager', emoji: '👔', color: 'purple' },
  peer: { id: 'peer', label: 'Collègue', emoji: '🤝', color: 'blue' },
  subordinate: { id: 'subordinate', label: 'Collaborateur', emoji: '👥', color: 'green' },
  self: { id: 'self', label: 'Auto-évaluation', emoji: '🪞', color: 'amber' },
  external: { id: 'external', label: 'Client/Partenaire', emoji: '🌐', color: 'cyan' }
};

const RATING_SCALE = [
  { value: 1, label: 'À améliorer', emoji: '😟', color: 'red' },
  { value: 2, label: 'En progrès', emoji: '🤔', color: 'orange' },
  { value: 3, label: 'Satisfaisant', emoji: '😊', color: 'yellow' },
  { value: 4, label: 'Très bien', emoji: '😄', color: 'green' },
  { value: 5, label: 'Excellent', emoji: '🌟', color: 'emerald' }
];

const DEFAULT_CRITERIA = [
  { id: 'communication', label: 'Communication', description: 'Clarté, écoute, feedback' },
  { id: 'collaboration', label: 'Collaboration', description: 'Travail en équipe, entraide' },
  { id: 'performance', label: 'Performance', description: 'Qualité du travail, résultats' },
  { id: 'initiative', label: 'Initiative', description: 'Proactivité, propositions' },
  { id: 'adaptability', label: 'Adaptabilité', description: 'Flexibilité, gestion du changement' },
  { id: 'leadership', label: 'Leadership', description: 'Influence, motivation d\'équipe' }
];

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const Interview360Section = ({ user, allUsers = [] }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, pending, completed
  const [expandedId, setExpandedId] = useState(null);

  // Charger les entretiens
  useEffect(() => {
    loadInterviews();
  }, [user?.uid]);

  const loadInterviews = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const interviewsRef = collection(db, 'interviews_360');
      // Requête simple sans orderBy pour éviter les problèmes d'index
      const snapshot = await getDocs(interviewsRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('📋 Entretiens 360 chargés:', data.length, data);

      // Admin voit TOUT, sinon filtrer par utilisateur concerné
      const isAdmin = user.isAdmin || user.role === 'admin';

      const userInterviews = isAdmin
        ? data
        : data.filter(interview =>
            interview.subjectId === user.uid ||
            interview.createdBy === user.uid ||
            interview.feedbackRequests?.some(fr => fr.reviewerId === user.uid)
          );

      console.log('📋 Entretiens visibles:', userInterviews.length, isAdmin ? '(admin)' : '(filtré)');

      // Trier par date (plus récent en premier)
      userInterviews.sort((a, b) => {
        const dateA = a.scheduledDate?.toDate?.() || new Date(a.scheduledDate);
        const dateB = b.scheduledDate?.toDate?.() || new Date(b.scheduledDate);
        return dateB - dateA;
      });

      setInterviews(userInterviews);
    } catch (error) {
      console.error('Erreur chargement entretiens 360:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer par statut
  const filteredInterviews = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Début de journée pour inclure aujourd'hui

    return interviews.filter(interview => {
      const scheduledDate = interview.scheduledDate?.toDate?.() || new Date(interview.scheduledDate);
      const isCompleted = interview.status === 'completed';
      const hasPendingFeedback = interview.feedbackRequests?.some(
        fr => fr.reviewerId === user?.uid && !fr.completed
      );

      switch (activeTab) {
        case 'upcoming':
          // Tous les entretiens non complétés (aujourd'hui et futurs)
          return !isCompleted;
        case 'pending':
          return hasPendingFeedback;
        case 'completed':
          return isCompleted;
        default:
          return true;
      }
    });
  }, [interviews, activeTab, user?.uid]);

  // Stats
  const stats = useMemo(() => {
    const isAdmin = user?.isAdmin || user?.role === 'admin';

    const pendingFeedbacks = interviews.filter(i =>
      i.feedbackRequests?.some(fr => fr.reviewerId === user?.uid && !fr.completed)
    ).length;

    // Admin voit tous les entretiens, sinon seulement les siens
    const myInterviews = isAdmin
      ? interviews
      : interviews.filter(i => i.subjectId === user?.uid || i.createdBy === user?.uid);

    const upcomingCount = myInterviews.filter(i => i.status !== 'completed').length;
    const completedCount = myInterviews.filter(i => i.status === 'completed').length;

    // Moyenne des scores reçus
    let avgScore = 0;
    let totalRatings = 0;
    myInterviews.forEach(interview => {
      interview.feedbackResponses?.forEach(response => {
        Object.values(response.ratings || {}).forEach(rating => {
          avgScore += rating;
          totalRatings++;
        });
      });
    });
    avgScore = totalRatings > 0 ? (avgScore / totalRatings).toFixed(1) : '-';

    return { pendingFeedbacks, upcomingCount, completedCount, avgScore };
  }, [interviews, user?.uid]);

  // Créer un entretien
  const handleCreateInterview = async (formData) => {
    try {
      console.log('📝 Création entretien 360 avec données:', formData);

      const interviewData = {
        ...formData,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        status: 'scheduled',
        feedbackRequests: formData.reviewers.map(reviewer => ({
          reviewerId: reviewer.id,
          reviewerName: reviewer.name,
          sourceType: reviewer.sourceType,
          completed: false,
          requestedAt: new Date().toISOString()
        })),
        feedbackResponses: []
      };

      console.log('📝 Données à sauvegarder:', interviewData);

      const docRef = await addDoc(collection(db, 'interviews_360'), interviewData);

      console.log('✅ Entretien créé avec ID:', docRef.id);

      // Ajouter à la liste locale avec l'ID
      const newInterview = {
        id: docRef.id,
        ...interviewData,
        createdAt: new Date() // Pour l'affichage local
      };

      setInterviews(prev => [newInterview, ...prev]);
      setShowCreateModal(false);

      // Recharger les entretiens pour s'assurer de la synchro
      await loadInterviews();

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur création entretien:', error);
      alert('Erreur lors de la création: ' + error.message);
      return { success: false, error };
    }
  };

  // Soumettre un feedback
  const handleSubmitFeedback = async (interviewId, feedbackData) => {
    try {
      const interviewRef = doc(db, 'interviews_360', interviewId);
      const interview = interviews.find(i => i.id === interviewId);

      // Ajouter la réponse
      const updatedResponses = [
        ...(interview.feedbackResponses || []),
        {
          ...feedbackData,
          reviewerId: user.uid,
          reviewerName: user.displayName || user.email,
          submittedAt: new Date().toISOString()
        }
      ];

      // Marquer comme complété
      const updatedRequests = interview.feedbackRequests.map(fr =>
        fr.reviewerId === user.uid ? { ...fr, completed: true, completedAt: new Date().toISOString() } : fr
      );

      // Vérifier si tous les feedbacks sont reçus
      const allCompleted = updatedRequests.every(fr => fr.completed);

      await updateDoc(interviewRef, {
        feedbackResponses: updatedResponses,
        feedbackRequests: updatedRequests,
        status: allCompleted ? 'completed' : 'in_progress',
        updatedAt: serverTimestamp()
      });

      setInterviews(prev => prev.map(i =>
        i.id === interviewId
          ? {
              ...i,
              feedbackResponses: updatedResponses,
              feedbackRequests: updatedRequests,
              status: allCompleted ? 'completed' : 'in_progress'
            }
          : i
      ));

      setShowFeedbackModal(false);
      setSelectedInterview(null);
      return { success: true };
    } catch (error) {
      console.error('Erreur soumission feedback:', error);
      return { success: false, error };
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="ml-3 text-gray-400">Chargement des entretiens 360°...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 backdrop-blur-xl border border-white/10 rounded-xl">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Entretiens 360°</h2>
            <p className="text-gray-400 text-sm">Feedback régulier à 360 degrés</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Programmer
        </motion.button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">À venir</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.upcomingCount}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400">Feedbacks en attente</span>
          </div>
          <div className="text-xl font-bold text-amber-400">{stats.pendingFeedbacks}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Complétés</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.completedCount}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Score moyen</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.avgScore}/5</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { id: 'upcoming', label: 'À venir', icon: Calendar },
          { id: 'pending', label: 'Mes feedbacks', icon: MessageSquare, badge: stats.pendingFeedbacks },
          { id: 'completed', label: 'Historique', icon: Check }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Liste des entretiens */}
      <div className="space-y-3">
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {activeTab === 'pending'
                ? 'Aucun feedback en attente'
                : activeTab === 'upcoming'
                  ? 'Aucun entretien programmé'
                  : 'Aucun entretien terminé'}
            </p>
          </div>
        ) : (
          filteredInterviews.map(interview => (
            <Interview360Card
              key={interview.id}
              interview={interview}
              user={user}
              expanded={expandedId === interview.id}
              onToggle={() => setExpandedId(expandedId === interview.id ? null : interview.id)}
              onGiveFeedback={() => {
                setSelectedInterview(interview);
                setShowFeedbackModal(true);
              }}
            />
          ))
        )}
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateInterview360Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateInterview}
            allUsers={allUsers}
            currentUser={user}
          />
        )}
      </AnimatePresence>

      {/* Modal feedback */}
      <AnimatePresence>
        {showFeedbackModal && selectedInterview && (
          <FeedbackModal360
            isOpen={showFeedbackModal}
            onClose={() => {
              setShowFeedbackModal(false);
              setSelectedInterview(null);
            }}
            interview={selectedInterview}
            onSubmit={handleSubmitFeedback}
            currentUser={user}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// CARTE ENTRETIEN 360
// ==========================================

const Interview360Card = ({ interview, user, expanded, onToggle, onGiveFeedback }) => {
  const type = INTERVIEW_360_TYPES[interview.type] || INTERVIEW_360_TYPES.quarterly;
  const scheduledDate = interview.scheduledDate?.toDate?.() || new Date(interview.scheduledDate);
  const isSubject = interview.subjectId === user?.uid;
  const myFeedbackRequest = interview.feedbackRequests?.find(fr => fr.reviewerId === user?.uid);
  const needsMyFeedback = myFeedbackRequest && !myFeedbackRequest.completed;

  // Calcul progression feedback
  const totalRequests = interview.feedbackRequests?.length || 0;
  const completedRequests = interview.feedbackRequests?.filter(fr => fr.completed).length || 0;
  const progressPercent = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

  return (
    <motion.div
      layout
      className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${
        needsMyFeedback ? 'border-amber-500/50' : 'border-white/10'
      }`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${type.color}-500/20 rounded-lg`}>
              <span className="text-xl">{type.emoji}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">
                  {interview.title || `Entretien ${type.label}`}
                </h4>
                {isSubject && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                    Mon entretien
                  </span>
                )}
                {needsMyFeedback && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full animate-pulse">
                    Feedback requis
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {scheduledDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {interview.subjectName || 'Collaborateur'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progression */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{completedRequests}/{totalRequests}</span>
            </div>

            {needsMyFeedback && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onGiveFeedback();
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Donner feedback
              </motion.button>
            )}

            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Contenu étendu */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Description */}
              {interview.description && (
                <p className="text-gray-400 text-sm">{interview.description}</p>
              )}

              {/* Feedbacks demandés */}
              <div>
                <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Feedbacks ({completedRequests}/{totalRequests})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {interview.feedbackRequests?.map((request, index) => {
                    const source = FEEDBACK_SOURCES[request.sourceType] || FEEDBACK_SOURCES.peer;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          request.completed ? 'bg-green-500/10' : 'bg-white/5'
                        }`}
                      >
                        <span>{source.emoji}</span>
                        <span className="text-sm text-white flex-1">{request.reviewerName}</span>
                        {request.completed ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Résultats si complété et sujet */}
              {interview.status === 'completed' && isSubject && interview.feedbackResponses?.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <h5 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Synthèse des résultats
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DEFAULT_CRITERIA.map(criterion => {
                      const ratings = interview.feedbackResponses
                        .map(r => r.ratings?.[criterion.id])
                        .filter(r => r !== undefined);
                      const avg = ratings.length > 0
                        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                        : '-';

                      return (
                        <div key={criterion.id} className="text-center">
                          <div className="text-lg font-bold text-white">{avg}</div>
                          <div className="text-xs text-gray-400">{criterion.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// MODAL CRÉATION ENTRETIEN 360
// ==========================================

const CreateInterview360Modal = ({ isOpen, onClose, onCreate, allUsers, currentUser }) => {
  const [form, setForm] = useState({
    subjectId: '',
    subjectName: '',
    type: 'quarterly',
    title: '',
    description: '',
    scheduledDate: '',
    reviewers: []
  });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter(u =>
    u.id !== form.subjectId &&
    !form.reviewers.some(r => r.id === u.id) &&
    (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addReviewer = (user, sourceType) => {
    setForm(f => ({
      ...f,
      reviewers: [...f.reviewers, {
        id: user.id,
        name: user.displayName || user.email,
        sourceType
      }]
    }));
    setSearchTerm('');
  };

  const removeReviewer = (userId) => {
    setForm(f => ({
      ...f,
      reviewers: f.reviewers.filter(r => r.id !== userId)
    }));
  };

  const handleSubmit = async () => {
    if (!form.subjectId || !form.scheduledDate || form.reviewers.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    console.log('🚀 Soumission formulaire entretien 360:', form);

    setSaving(true);
    try {
      const result = await onCreate({
        ...form,
        scheduledDate: new Date(form.scheduledDate)
      });

      if (result?.success) {
        console.log('✅ Entretien créé avec succès');
      } else {
        console.error('❌ Échec création:', result?.error);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header fixe */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-xl">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Programmer un Entretien 360°</h3>
              <p className="text-gray-400 text-sm">Collectez des feedbacks de multiples sources</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Contenu scrollable - flex-1 et min-h-0 pour permettre le scroll */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Sujet de l'entretien */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collaborateur évalué *
            </label>
            <select
              value={form.subjectId}
              onChange={(e) => {
                const user = allUsers.find(u => u.id === e.target.value);
                setForm(f => ({
                  ...f,
                  subjectId: e.target.value,
                  subjectName: user?.displayName || user?.email || ''
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              required
            >
              <option value="">Sélectionner un collaborateur</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.displayName || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Type et date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              >
                {Object.values(INTERVIEW_360_TYPES).map(type => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Titre et description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Titre (optionnel)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Bilan Q1 2024"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Reviewers */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Personnes sollicitées * ({form.reviewers.length})
            </label>

            {/* Liste des reviewers ajoutés */}
            {form.reviewers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.reviewers.map(reviewer => {
                  const source = FEEDBACK_SOURCES[reviewer.sourceType];
                  return (
                    <div
                      key={reviewer.id}
                      className={`flex items-center gap-2 px-3 py-1.5 bg-${source.color}-500/20 border border-${source.color}-500/30 rounded-full`}
                    >
                      <span className="text-sm">{source.emoji}</span>
                      <span className="text-sm text-white">{reviewer.name}</span>
                      <button
                        type="button"
                        onClick={() => removeReviewer(reviewer.id)}
                        className="p-0.5 hover:bg-white/20 rounded-full"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recherche */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un collaborateur..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />

              {searchTerm && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                  {filteredUsers.slice(0, 5).map(user => (
                    <div key={user.id} className="p-2 hover:bg-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{user.displayName || user.email}</span>
                      </div>
                      <div className="flex gap-1">
                        {Object.values(FEEDBACK_SOURCES).map(source => (
                          <button
                            key={source.id}
                            type="button"
                            onClick={() => addReviewer(user, source.id)}
                            className={`px-2 py-1 text-xs bg-${source.color}-500/20 hover:bg-${source.color}-500/30 text-${source.color}-300 rounded-lg flex items-center gap-1`}
                          >
                            {source.emoji} {source.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ajoutez au moins une personne pour chaque type de feedback souhaité
            </p>
          </div>
        </div>

        {/* Footer avec boutons - toujours visible en bas */}
        <div className="p-4 sm:p-6 border-t border-white/10 flex justify-end gap-3 bg-gray-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !form.subjectId || !form.scheduledDate || form.reviewers.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            Programmer l'entretien
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// MODAL FEEDBACK 360
// ==========================================

const FeedbackModal360 = ({ isOpen, onClose, interview, onSubmit, currentUser }) => {
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [globalComment, setGlobalComment] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier qu'au moins 3 critères sont notés
    if (Object.keys(ratings).length < 3) {
      alert('Veuillez noter au moins 3 critères');
      return;
    }

    setSaving(true);
    await onSubmit(interview.id, {
      ratings,
      comments,
      globalComment,
      sourceType: interview.feedbackRequests?.find(fr => fr.reviewerId === currentUser.uid)?.sourceType || 'peer'
    });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <MessageSquare className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Donner mon feedback</h3>
                <p className="text-gray-400 text-sm">Pour {interview.subjectName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Critères d'évaluation */}
          <div className="space-y-4">
            {DEFAULT_CRITERIA.map(criterion => (
              <div key={criterion.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{criterion.label}</h4>
                    <p className="text-gray-500 text-sm">{criterion.description}</p>
                  </div>
                </div>

                {/* Échelle de notation */}
                <div className="flex justify-between gap-1 mb-3">
                  {RATING_SCALE.map(rating => (
                    <button
                      key={rating.value}
                      type="button"
                      onClick={() => setRatings(r => ({ ...r, [criterion.id]: rating.value }))}
                      className={`flex-1 p-2 rounded-lg text-center transition-all ${
                        ratings[criterion.id] === rating.value
                          ? `bg-${rating.color}-500/30 border border-${rating.color}-500/50`
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{rating.emoji}</div>
                      <div className="text-xs text-gray-400">{rating.value}</div>
                    </button>
                  ))}
                </div>

                {/* Commentaire optionnel */}
                <input
                  type="text"
                  value={comments[criterion.id] || ''}
                  onChange={(e) => setComments(c => ({ ...c, [criterion.id]: e.target.value }))}
                  placeholder="Commentaire (optionnel)..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Commentaire global */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commentaire général
            </label>
            <textarea
              value={globalComment}
              onChange={(e) => setGlobalComment(e.target.value)}
              placeholder="Points forts, axes d'amélioration, observations..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || Object.keys(ratings).length < 3}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Envoyer le feedback
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Interview360Section;
