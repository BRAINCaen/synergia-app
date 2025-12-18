// ==========================================
// react-app/src/components/challenges/TeamChallengeModal.jsx
// MODAL CREATION DEFI D'EQUIPE - SYNERGIA v4.0
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  X,
  Users,
  AlertCircle,
  CheckCircle,
  Coins,
  Calendar
} from 'lucide-react';

import {
  TEAM_CHALLENGE_TYPES,
  TEAM_CHALLENGE_REWARDS
} from '../../core/services/teamChallengeService.js';

const TeamChallengeModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'reputation',
    rewardLevel: 'medium',
    targetValue: '',
    unit: '',
    deadline: ''
  });
  const [errors, setErrors] = useState({});
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

    if (!formData.targetValue || Number(formData.targetValue) <= 0) {
      newErrors.targetValue = 'L\'objectif cible est requis et doit etre positif';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'L\'unite de mesure est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const result = await onSubmit(formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            title: '',
            description: '',
            type: 'reputation',
            rewardLevel: 'medium',
            targetValue: '',
            unit: '',
            deadline: ''
          });
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setErrors({ submit: result.error || 'Erreur lors de la creation' });
      }
    } catch (error) {
      console.error('Erreur creation defi:', error);
      setErrors({ submit: error.message || 'Erreur lors de la creation' });
    }
  };

  const selectedType = TEAM_CHALLENGE_TYPES[formData.type];
  const selectedReward = TEAM_CHALLENGE_REWARDS[formData.rewardLevel];

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
          className="bg-slate-800 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nouveau Defi d'Equipe</h2>
                <p className="text-sm text-gray-400">Objectif collectif pour toute l'equipe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
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
              <h3 className="text-2xl font-bold text-white mb-2">Defi d'equipe cree !</h3>
              <p className="text-gray-400">
                En attente de validation par l'admin
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
                  placeholder="Ex: Atteindre 2000 avis Google"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.title
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-white/20 focus:ring-purple-500/50'
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
                  Description (optionnel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Decrivez l'objectif et pourquoi c'est important pour l'equipe..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              {/* Objectif et Unite */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objectif cible *
                  </label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => handleChange('targetValue', e.target.value)}
                    placeholder="Ex: 2000"
                    min="1"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.targetValue
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-white/20 focus:ring-purple-500/50'
                    }`}
                  />
                  {errors.targetValue && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.targetValue}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unite de mesure *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    placeholder="Ex: avis, ventes, euros..."
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.unit
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-white/20 focus:ring-purple-500/50'
                    }`}
                  />
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.unit}
                    </p>
                  )}
                </div>
              </div>

              {/* Type de defi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Type de defi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(TEAM_CHALLENGE_TYPES).map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleChange('type', type.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        formData.type === type.id
                          ? `border-transparent bg-gradient-to-br ${type.color} text-white`
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{type.emoji}</span>
                        <span className="font-semibold text-sm">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Niveau de recompense */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Recompense XP Equipe
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.values(TEAM_CHALLENGE_REWARDS).map((reward) => (
                    <button
                      key={reward.id}
                      type="button"
                      onClick={() => handleChange('rewardLevel', reward.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        formData.rewardLevel === reward.id
                          ? 'border-yellow-400 bg-yellow-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{reward.emoji}</span>
                      <p className={`font-semibold text-sm ${formData.rewardLevel === reward.id ? 'text-white' : 'text-gray-300'}`}>
                        {reward.label}
                      </p>
                      <p className="text-yellow-400 font-bold mt-1">
                        +{reward.xpReward} XP
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date limite (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date limite (optionnel)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {/* Apercu */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Apercu du defi</h4>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {selectedType.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">
                      {formData.title || 'Titre du defi'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Objectif: <strong className="text-white">{formData.targetValue || '0'} {formData.unit || 'unites'}</strong>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-400">{selectedType.label}</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        +{selectedReward.xpReward} XP Equipe
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium">Comment ca marche ?</p>
                    <ul className="text-blue-200/80 mt-2 space-y-1 list-disc list-inside">
                      <li>L'admin valide le defi</li>
                      <li>Tous les membres peuvent contribuer</li>
                      <li>Quand l'objectif est atteint, les XP vont dans la cagnotte d'equipe !</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Erreur */}
              {errors.submit && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                  <p className="text-red-400 flex items-center gap-2">
                    <AlertCircle size={18} />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creation...
                    </>
                  ) : (
                    <>
                      <Target size={18} />
                      Proposer le defi
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

export default TeamChallengeModal;
