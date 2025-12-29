// ==========================================
// 📁 react-app/src/components/wellbeing/ClockOutMoodModal.jsx
// MODAL BIEN-ÊTRE AU DÉPOINTAGE
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare } from 'lucide-react';

/**
 * Niveaux d'humeur pour le dépointage
 */
const MOOD_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Difficile', color: 'from-red-500 to-red-600' },
  { value: 2, emoji: '😕', label: 'Compliqué', color: 'from-orange-500 to-orange-600' },
  { value: 3, emoji: '😐', label: 'Normal', color: 'from-yellow-500 to-yellow-600' },
  { value: 4, emoji: '🙂', label: 'Bien', color: 'from-green-500 to-green-600' },
  { value: 5, emoji: '😄', label: 'Excellent', color: 'from-emerald-500 to-emerald-600' }
];

/**
 * 🌟 MODAL BIEN-ÊTRE AU DÉPOINTAGE
 * Affichée quand l'utilisateur dépointe pour collecter son ressenti
 */
const ClockOutMoodModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  userName = ''
}) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const handleSubmit = () => {
    if (selectedMood === null) return;

    onSubmit({
      mood: selectedMood,
      moodLabel: MOOD_OPTIONS.find(m => m.value === selectedMood)?.label,
      comment: comment.trim() || null
    });
  };

  const handleSkip = () => {
    onSubmit(null); // Skip without mood
  };

  const resetAndClose = () => {
    setSelectedMood(null);
    setComment('');
    setShowComment(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 pb-4 text-center">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-4xl mb-3">👋</div>
            <h2 className="text-xl font-bold text-white mb-1">
              Bonne fin de journée{userName ? ` ${userName}` : ''} !
            </h2>
            <p className="text-gray-400 text-sm">
              Comment s'est passée ta journée ?
            </p>
          </div>

          {/* Mood Selection */}
          <div className="px-6 pb-4">
            <div className="flex justify-center gap-2 sm:gap-3">
              {MOOD_OPTIONS.map((mood) => (
                <motion.button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative flex flex-col items-center p-3 rounded-xl transition-all duration-200
                    ${selectedMood === mood.value
                      ? `bg-gradient-to-br ${mood.color} shadow-lg ring-2 ring-white/30`
                      : 'bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <span className="text-3xl sm:text-4xl mb-1">{mood.emoji}</span>
                  <span className={`text-xs font-medium ${selectedMood === mood.value ? 'text-white' : 'text-gray-400'}`}>
                    {mood.label}
                  </span>

                  {selectedMood === mood.value && (
                    <motion.div
                      layoutId="mood-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                      initial={false}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className="px-6 pb-4">
            {!showComment ? (
              <button
                onClick={() => setShowComment(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ajouter un commentaire (optionnel)</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Un mot sur ta journée... (optionnel)"
                  maxLength={200}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                />
                <div className="text-right text-xs text-gray-500">
                  {comment.length}/200
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 pt-2 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium transition-all"
            >
              Passer
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={selectedMood === null || isLoading}
              whileHover={{ scale: selectedMood !== null ? 1.02 : 1 }}
              whileTap={{ scale: selectedMood !== null ? 0.98 : 1 }}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all
                ${selectedMood !== null
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Footer hint */}
          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-gray-500">
              Tes réponses aident à améliorer le bien-être de l'équipe
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClockOutMoodModal;
