// ==========================================
// react-app/src/pages/FeedbackPage.jsx
// PAGE DE FEEDBACK UTILISATEUR - DESIGN GLASSMORPHISM
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  Heart,
  Send,
  Star,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { db } from '../core/firebase/firebase.js';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import Layout from '../components/layout/Layout.jsx';

// Types de feedback avec icones et couleurs
const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug / Problème', icon: Bug, color: 'red', bgColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'yellow', bgColor: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)' },
  { id: 'question', label: 'Question', icon: HelpCircle, color: 'blue', bgColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' },
  { id: 'compliment', label: 'Compliment', icon: Heart, color: 'pink', bgColor: 'rgba(236, 72, 153, 0.15)', borderColor: 'rgba(236, 72, 153, 0.3)' }
];

// Statuts de feedback
const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'text-yellow-400', icon: Clock },
  reviewed: { label: 'Examiné', color: 'text-blue-400', icon: AlertCircle },
  resolved: { label: 'Résolu', color: 'text-green-400', icon: CheckCircle }
};

const FeedbackPage = () => {
  const { user } = useAuthStore();
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);

  // Charger l'historique des feedbacks de l'utilisateur
  useEffect(() => {
    const loadMyFeedbacks = async () => {
      if (!user?.uid) return;

      try {
        const feedbackRef = collection(db, 'feedbacks');
        const q = query(
          feedbackRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const feedbacks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        setMyFeedbacks(feedbacks);
      } catch (err) {
        console.error('Erreur chargement feedbacks:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadMyFeedbacks();
  }, [user?.uid, submitSuccess]);

  // Soumettre le feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'feedbacks'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
        type: feedbackType,
        title: title.trim(),
        message: message.trim(),
        rating: rating,
        status: 'pending',
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      setSubmitSuccess(true);
      setTitle('');
      setMessage('');
      setRating(0);
      setFeedbackType('suggestion');

      // Reset success message après 3 secondes
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur soumission feedback:', err);
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un feedback
  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Supprimer ce feedback ?')) return;

    try {
      await deleteDoc(doc(db, 'feedbacks', feedbackId));
      setMyFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const selectedType = FEEDBACK_TYPES.find(t => t.id === feedbackType);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/10 mb-4">
              <MessageSquare className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Votre Feedback
            </h1>
            <p className="text-gray-400">
              Aidez-nous à améliorer Synergia avec vos retours
            </p>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-green-400 font-semibold">Feedback envoyé avec succès !</p>
                    <p className="text-green-400/70 text-sm">Merci pour votre contribution</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  Type de feedback
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FEEDBACK_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = feedbackType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFeedbackType(type.id)}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-white/30 bg-white/10 scale-105'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                        style={isSelected ? {
                          background: type.bgColor,
                          borderColor: type.borderColor
                        } : {}}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          isSelected ? `text-${type.color}-400` : 'text-gray-400'
                        }`} style={isSelected ? { color: type.color === 'red' ? '#f87171' : type.color === 'yellow' ? '#facc15' : type.color === 'blue' ? '#60a5fa' : '#f472b6' } : {}} />
                        <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Titre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Résumez votre feedback en quelques mots..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  maxLength={100}
                />
                <p className="text-gray-500 text-xs mt-1">{title.length}/100 caractères</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre feedback en détail..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  maxLength={2000}
                />
                <p className="text-gray-500 text-xs mt-1">{message.length}/2000 caractères</p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Votre satisfaction générale (optionnel)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-gray-400 text-sm ml-2">
                      {rating === 1 ? 'Très insatisfait' :
                       rating === 2 ? 'Insatisfait' :
                       rating === 3 ? 'Neutre' :
                       rating === 4 ? 'Satisfait' : 'Très satisfait'}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-3 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer mon feedback
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* History Toggle */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between text-white hover:bg-white/10 transition-all mb-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Mes feedbacks précédents ({myFeedbacks.length})</span>
            </div>
            {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.button>

          {/* History List */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-400">Chargement...</p>
                  </div>
                ) : myFeedbacks.length === 0 ? (
                  <div className="text-center py-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">Aucun feedback envoyé</p>
                  </div>
                ) : (
                  myFeedbacks.map((feedback, index) => {
                    const type = FEEDBACK_TYPES.find(t => t.id === feedback.type) || FEEDBACK_TYPES[1];
                    const TypeIcon = type.icon;
                    const status = STATUS_CONFIG[feedback.status] || STATUS_CONFIG.pending;
                    const StatusIcon = status.icon;

                    return (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className="p-2 rounded-lg"
                              style={{ background: type.bgColor }}
                            >
                              <TypeIcon className="w-5 h-5" style={{ color: type.color === 'red' ? '#f87171' : type.color === 'yellow' ? '#facc15' : type.color === 'blue' ? '#60a5fa' : '#f472b6' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{feedback.title}</h4>
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{feedback.message}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-gray-500 text-xs">
                                  {feedback.createdAt.toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                                <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </div>
                                {feedback.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    {[...Array(feedback.rating)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(feedback.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center text-gray-500 text-sm"
          >
            <p>Vos feedbacks sont anonymisés et traités avec soin.</p>
            <p className="mt-1">Pour une urgence, contactez directement l'équipe support.</p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
