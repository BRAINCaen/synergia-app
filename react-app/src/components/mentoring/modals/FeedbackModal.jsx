// ==========================================
// 📁 components/mentoring/modals/FeedbackModal.jsx
// MODAL FEEDBACK SESSION
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, session, onSubmit, FEEDBACK_RATINGS }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    const result = await onSubmit(session.id, { rating, comment });
    if (result.success) {
      onClose();
      setRating('');
      setComment('');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Feedback Session
            </h2>
            <p className="text-sm text-gray-400 mt-1">{session.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Comment s'est passée la session ?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.values(FEEDBACK_RATINGS).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRating(r.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    rating === r.id
                      ? 'border-amber-400 bg-amber-500/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-2xl text-center">{r.emoji}</div>
                  <div className="text-xs text-gray-400 text-center mt-1">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !rating}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Envoi...' : 'Envoyer le feedback'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FeedbackModal;
