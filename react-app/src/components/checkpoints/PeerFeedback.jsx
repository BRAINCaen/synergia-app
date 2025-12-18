// ==========================================
// react-app/src/components/checkpoints/PeerFeedback.jsx
// Système de feedback entre pairs pour le checkpoint
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  X,
  Star,
  Heart,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { PEER_FEEDBACK_QUESTIONS } from '../../core/services/checkpointService';

const PeerFeedback = ({
  checkpoint,
  currentUserId,
  teamMembers = [],
  onRequestFeedback,
  onSubmitFeedback,
  isLoading = false,
  mode = 'request' // 'request' ou 'give'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [feedbackAnswers, setFeedbackAnswers] = useState({});
  const [showGivenFeedbacks, setShowGivenFeedbacks] = useState(false);
  const [error, setError] = useState(null);

  const peerFeedback = checkpoint?.peerFeedback || {
    requestedPeers: [],
    receivedFeedbacks: [],
    minRequired: 2,
    maxAllowed: 3
  };

  const requestedPeers = peerFeedback.requestedPeers || [];
  const receivedFeedbacks = peerFeedback.receivedFeedbacks || [];
  const minRequired = peerFeedback.minRequired;
  const maxAllowed = peerFeedback.maxAllowed;

  // Filtrer les membres de l'équipe pour la recherche
  const filteredMembers = teamMembers.filter(member => {
    if (member.uid === currentUserId) return false; // Exclure soi-même
    if (requestedPeers.includes(member.uid)) return false; // Exclure les déjà sollicités

    const searchLower = searchTerm.toLowerCase();
    return (
      member.displayName?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleRequestFeedback = async (peerId) => {
    if (requestedPeers.length >= maxAllowed) {
      setError(`Maximum ${maxAllowed} peers peuvent être sollicités`);
      return;
    }

    setError(null);
    if (onRequestFeedback) {
      await onRequestFeedback(peerId);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setFeedbackAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitFeedback = async () => {
    // Vérifier que les questions requises sont remplies
    const missingRequired = PEER_FEEDBACK_QUESTIONS
      .filter(q => q.required)
      .some(q => !feedbackAnswers[q.id] || feedbackAnswers[q.id].trim().length < 10);

    if (missingRequired) {
      setError('Merci de répondre à toutes les questions requises (minimum 10 caractères)');
      return;
    }

    setError(null);
    if (onSubmitFeedback) {
      await onSubmitFeedback(feedbackAnswers);
      setFeedbackAnswers({});
    }
  };

  // ==========================================
  // MODE DEMANDE DE FEEDBACK
  // ==========================================
  if (mode === 'request') {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Feedbacks peers</h3>
              <p className="text-sm text-gray-400">
                {receivedFeedbacks.length}/{minRequired} feedbacks reçus (min. requis)
              </p>
            </div>
          </div>

          {/* Toggle pour voir les feedbacks reçus */}
          {receivedFeedbacks.length > 0 && (
            <button
              onClick={() => setShowGivenFeedbacks(!showGivenFeedbacks)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
            >
              {showGivenFeedbacks ? <EyeOff size={16} /> : <Eye size={16} />}
              {showGivenFeedbacks ? 'Masquer' : 'Voir'} les feedbacks
            </button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="relative">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${(receivedFeedbacks.length / minRequired) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0</span>
            <span>{minRequired} (minimum)</span>
          </div>
        </div>

        {/* Liste des peers sollicités */}
        {requestedPeers.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-yellow-400" />
              Peers sollicités ({requestedPeers.length}/{maxAllowed})
            </h4>
            <div className="space-y-2">
              {requestedPeers.map((peerId) => {
                const peer = teamMembers.find(m => m.uid === peerId);
                const hasFeedback = receivedFeedbacks.some(f => f.fromUserId === peerId);

                return (
                  <div
                    key={peerId}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      hasFeedback ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {peer?.photoURL ? (
                        <img
                          src={peer.photoURL}
                          alt={peer.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-300">
                            {peer?.displayName?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <span className="text-gray-200">{peer?.displayName || 'Aventurier'}</span>
                    </div>
                    {hasFeedback ? (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle size={16} />
                        Reçu
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Clock size={16} />
                        En attente
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedbacks reçus (toggle) */}
        <AnimatePresence>
          {showGivenFeedbacks && receivedFeedbacks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {receivedFeedbacks.map((feedback, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl p-5 border border-pink-500/30"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                      <Heart size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{feedback.fromUserName}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(feedback.submittedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {PEER_FEEDBACK_QUESTIONS.map((question) => (
                      feedback.answers[question.id] && (
                        <div key={question.id}>
                          <div className="text-sm text-pink-300 mb-1">{question.question}</div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap">
                            {feedback.answers[question.id]}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ajouter un peer */}
        {requestedPeers.length < maxAllowed && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <UserPlus size={16} className="text-indigo-400" />
              Demander un feedback
            </h4>

            {/* Recherche */}
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un collègue..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Liste des membres */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {searchTerm ? 'Aucun résultat' : 'Tous les collègues ont été sollicités'}
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.uid}
                    onClick={() => handleRequestFeedback(member.uid)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={member.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-300">
                            {member.displayName?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <span className="text-gray-200">{member.displayName}</span>
                    </div>
                    <UserPlus size={18} className="text-indigo-400" />
                  </button>
                ))
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Message si assez de feedbacks */}
        {receivedFeedbacks.length >= minRequired && (
          <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
            <CheckCircle size={24} className="text-green-400" />
            <div>
              <div className="font-medium text-green-300">
                Feedbacks suffisants reçus !
              </div>
              <div className="text-sm text-green-400/80">
                Tu peux passer à l'étape suivante
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // ==========================================
  // MODE DONNER UN FEEDBACK
  // ==========================================
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
          <MessageSquare size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Donner ton feedback</h3>
          <p className="text-sm text-gray-400">
            Aide ton collègue dans sa progression
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {PEER_FEEDBACK_QUESTIONS.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50"
          >
            <label className="block mb-3">
              <span className="text-white font-medium">
                {question.question}
                {question.required && <span className="text-red-400 ml-1">*</span>}
              </span>
              {!question.required && (
                <span className="text-xs text-gray-500 ml-2">(Optionnel)</span>
              )}
            </label>
            <textarea
              value={feedbackAnswers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 resize-none"
            />
          </motion.div>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Bouton d'envoi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400">
          <Sparkles size={18} />
          <span className="text-sm font-medium">+20 XP pour toi</span>
        </div>
        <button
          onClick={handleSubmitFeedback}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-xl text-white font-medium transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Envoi...
            </>
          ) : (
            <>
              <Send size={18} />
              Envoyer mon feedback
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default PeerFeedback;
