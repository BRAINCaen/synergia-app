// ==========================================
// 📁 react-app/src/components/challenges/ChallengeModal.jsx
// MODAL CRÉATION DÉFI PERSONNEL - SYNERGIA v4.0
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import {
  CHALLENGE_TYPES,
  CHALLENGE_DIFFICULTY
} from '../../core/services/challengeService.js';

const ChallengeModal = ({
  isOpen,
  onClose,
  onSubmit,
  campaignId = null,
  campaignTitle = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'competence',
    difficulty: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Le titre doit faire au moins 5 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Decrivez votre defi en au moins 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        campaignId
      });

      setSuccess(true);

      // Reset après animation
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          type: 'competence',
          difficulty: 'medium'
        });
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Erreur creation defi:', error);
      setErrors({ submit: error.message || 'Erreur lors de la creation' });
    } finally {
      setLoading(false);
    }
  };

  const selectedType = CHALLENGE_TYPES[formData.type];
  const selectedDifficulty = CHALLENGE_DIFFICULTY[formData.difficulty];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nouveau Defi Personnel</h2>
                {campaignTitle && (
                  <p className="text-sm text-gray-400">Campagne : {campaignTitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Success State */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="text-green-400" size={40} />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Defi cree !</h3>
              <p className="text-gray-400">
                En attente du Sceau du Maitre de Guilde
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre du defi *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ex: Maitriser Premiere Pro"
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-600 focus:ring-purple-500/50'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description detaillee *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Decrivez votre defi : qu'allez-vous accomplir ? Comment saurez-vous que c'est reussi ?"
                  rows={4}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.description
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-600 focus:ring-purple-500/50'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Type de défi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Type de defi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(CHALLENGE_TYPES).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleChange('type', type.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.type === type.id
                          ? `border-transparent bg-gradient-to-br ${type.color} text-white`
                          : 'border-gray-700 bg-gray-700/30 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.emoji}</span>
                        <div>
                          <p className="font-semibold">{type.label}</p>
                          <p className={`text-xs ${formData.type === type.id ? 'text-white/80' : 'text-gray-400'}`}>
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulté */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Difficulte
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(CHALLENGE_DIFFICULTY).map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => handleChange('difficulty', diff.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        formData.difficulty === diff.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{diff.emoji}</span>
                      <p className={`font-semibold ${formData.difficulty === diff.id ? 'text-white' : 'text-gray-300'}`}>
                        {diff.label}
                      </p>
                      <p className="text-yellow-400 text-sm font-bold mt-1">
                        +{diff.xpReward} XP
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aperçu */}
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Apercu du defi</h4>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {selectedType.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">
                      {formData.title || 'Titre du defi'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {formData.description || 'Description du defi...'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-sm ${selectedDifficulty.color}`}>
                        {selectedDifficulty.emoji} {selectedDifficulty.label}
                      </span>
                      <span className="text-yellow-400 text-sm font-bold">
                        +{selectedDifficulty.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info validation */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium">Comment ca marche ?</p>
                    <ol className="text-blue-200/80 mt-2 space-y-1 list-decimal list-inside">
                      <li>Vous proposez votre defi</li>
                      <li>Le Maitre de Guilde valide (ou ajuste)</li>
                      <li>Vous accomplissez le defi</li>
                      <li>Vous soumettez votre preuve</li>
                      <li>XP attribue apres validation !</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Erreur générale */}
              {errors.submit && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 flex items-center gap-2">
                    <AlertCircle size={18} />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creation...
                    </>
                  ) : (
                    <>
                      <Target size={18} />
                      Proposer mon defi
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeModal;
