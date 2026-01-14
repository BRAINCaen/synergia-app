// ==========================================
// 📁 components/mentoring/modals/CreateSessionModal.jsx
// MODAL CRÉATION SESSION DE MENTORAT
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, X } from 'lucide-react';

const CreateSessionModal = ({
  isOpen,
  onClose,
  onCreate,
  availableUsers,
  currentUser,
  SESSION_TYPES,
  MENTORING_TOPICS,
  DIFFICULTY_LEVELS
}) => {
  const [form, setForm] = useState({
    menteeId: '',
    menteeName: '',
    type: 'skill_transfer',
    topic: 'technical',
    difficulty: 'beginner',
    title: '',
    description: '',
    objectives: [''],
    scheduledDate: '',
    duration: 45
  });
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleAddObjective = () => {
    setForm(f => ({ ...f, objectives: [...f.objectives, ''] }));
  };

  const handleRemoveObjective = (index) => {
    setForm(f => ({ ...f, objectives: f.objectives.filter((_, i) => i !== index) }));
  };

  const handleObjectiveChange = (index, value) => {
    setForm(f => ({
      ...f,
      objectives: f.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.menteeId || !form.title) return;

    setCreating(true);
    const result = await onCreate({
      ...form,
      mentorId: currentUser.uid,
      mentorName: currentUser.displayName || currentUser.email,
      objectives: form.objectives.filter(o => o.trim())
    });

    if (result.success) {
      onClose();
      setForm({
        menteeId: '',
        menteeName: '',
        type: 'skill_transfer',
        topic: 'technical',
        difficulty: 'beginner',
        title: '',
        description: '',
        objectives: [''],
        scheduledDate: '',
        duration: 45
      });
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Nouvelle Session de Mentorat
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mentee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mentee *
            </label>
            <select
              value={form.menteeId}
              onChange={(e) => {
                const selectedUser = availableUsers.find(u => u.id === e.target.value);
                setForm(f => ({
                  ...f,
                  menteeId: e.target.value,
                  menteeName: selectedUser?.displayName || ''
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="">Selectionnez un mentee</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.avatar} {user.displayName} (Niveau {user.level})
                </option>
              ))}
            </select>
          </div>

          {/* Type de session */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de session
              </label>
              <select
                value={form.type}
                onChange={(e) => {
                  const type = SESSION_TYPES[e.target.value];
                  setForm(f => ({
                    ...f,
                    type: e.target.value,
                    duration: type?.duration || 30
                  }));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {Object.values(SESSION_TYPES).map(type => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sujet
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm(f => ({ ...f, topic: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {MENTORING_TOPICS.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.emoji} {topic.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Niveau de difficulté */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Niveau de difficulté
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTY_LEVELS && Object.values(DIFFICULTY_LEVELS).map(level => {
                const isSelected = form.difficulty === level.id;
                const sessionType = SESSION_TYPES[form.type];
                const baseXP = sessionType?.xpMentee || 35;
                const xpWithMultiplier = Math.round(baseXP * level.xpMultiplier);

                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, difficulty: level.id }))}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `${level.bgColor} border-${level.color}-500/50`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">{level.emoji}</div>
                    <div className={`text-sm font-medium ${isSelected ? level.textColor : 'text-white'}`}>
                      {level.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      +{xpWithMultiplier} XP
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la session *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Introduction aux bonnes pratiques..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez le contenu de la session..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Objectifs
            </label>
            <div className="space-y-2">
              {form.objectives.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder={`Objectif ${index + 1}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  {form.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(index)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
              >
                + Ajouter un objectif
              </button>
            </div>
          </div>

          {/* Date et durée */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date et heure
              </label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Durée (minutes)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                min={15}
                max={180}
                step={15}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* XP Preview */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-300">XP à gagner à la complétion</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">
                  Vous: +{SESSION_TYPES[form.type]?.xpMentor || 40} XP
                </span>
                <span className="text-emerald-400">
                  Mentee: +{SESSION_TYPES[form.type]?.xpMentee || 35} XP
                </span>
              </div>
            </div>
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
              disabled={creating || !form.menteeId || !form.title}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Création...' : 'Créer la session'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSessionModal;
