// ==========================================
// react-app/src/components/checkpoints/GoalSetting.jsx
// Définition des objectifs pour le prochain trimestre
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Target,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  Edit3,
  Save,
  X,
  Sparkles,
  Flag,
  Calendar,
  AlertCircle
} from 'lucide-react';

const GOAL_CATEGORIES = [
  { id: 'skills', label: 'Compétences', emoji: '🎯', color: 'from-blue-500 to-cyan-500' },
  { id: 'projects', label: 'Projets', emoji: '🚀', color: 'from-purple-500 to-pink-500' },
  { id: 'team', label: 'Équipe', emoji: '🤝', color: 'from-green-500 to-emerald-500' },
  { id: 'personal', label: 'Personnel', emoji: '🌟', color: 'from-yellow-500 to-orange-500' }
];

const GoalSetting = ({
  initialGoals = [],
  isValidated = false,
  onSave,
  isLoading = false,
  nextQuarter
}) => {
  const [goals, setGoals] = useState(initialGoals);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'skills', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialGoals && initialGoals.length > 0) {
      setGoals(initialGoals);
    }
  }, [initialGoals]);

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      setError('Le titre de l\'objectif est requis');
      return;
    }

    const goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      category: newGoal.category,
      description: newGoal.description.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', category: 'skills', description: '' });
    setShowAddForm(false);
    setError(null);
  };

  const handleRemoveGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const handleEditGoal = (goal) => {
    setEditingId(goal.id);
    setEditingGoal({ ...goal });
  };

  const handleSaveEdit = () => {
    if (!editingGoal.title.trim()) {
      setError('Le titre de l\'objectif est requis');
      return;
    }

    setGoals(goals.map(g =>
      g.id === editingId ? { ...editingGoal, title: editingGoal.title.trim() } : g
    ));
    setEditingId(null);
    setEditingGoal(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingGoal(null);
  };

  const handleSave = async () => {
    if (goals.length === 0) {
      setError('Ajoute au moins un objectif pour le prochain trimestre');
      return;
    }

    if (onSave) {
      await onSave(goals);
    }
  };

  const getCategoryConfig = (categoryId) => {
    return GOAL_CATEGORIES.find(c => c.id === categoryId) || GOAL_CATEGORIES[0];
  };

  // Mode lecture seule si validé
  if (isValidated) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
          <CheckCircle size={24} className="text-green-400" />
          <div>
            <div className="font-medium text-green-300">Objectifs validés</div>
            <div className="text-sm text-green-400/80">
              Par le Maître de Guilde
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {goals.map((goal, index) => {
            const category = getCategoryConfig(goal.category);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-lg">{category.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                    )}
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                      {category.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Objectifs {nextQuarter}</h3>
            <p className="text-sm text-gray-400">
              {goals.length} objectif{goals.length !== 1 ? 's' : ''} défini{goals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading || goals.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          Sauvegarder
        </button>
      </div>

      {/* Conseil */}
      <div className="flex items-start gap-3 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
        <Sparkles size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-300">
          <strong>Conseil :</strong> Définis 3 à 5 objectifs réalistes et motivants.
          C'est toi qui choisis, le Maître de Guilde t'aidera à les affiner.
        </div>
      </div>

      {/* Liste des objectifs avec drag & drop */}
      {goals.length > 0 && (
        <Reorder.Group
          axis="y"
          values={goals}
          onReorder={setGoals}
          className="space-y-3"
        >
          {goals.map((goal) => {
            const category = getCategoryConfig(goal.category);
            const isEditing = editingId === goal.id;

            return (
              <Reorder.Item
                key={goal.id}
                value={goal}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
              >
                {isEditing ? (
                  // Mode édition
                  <div className="p-4 space-y-4">
                    <input
                      type="text"
                      value={editingGoal.title}
                      onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Titre de l'objectif"
                    />

                    <select
                      value={editingGoal.category}
                      onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {GOAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.label}
                        </option>
                      ))}
                    </select>

                    <textarea
                      value={editingGoal.description}
                      onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                      rows={2}
                      placeholder="Description (optionnel)"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white text-sm"
                      >
                        <CheckCircle size={14} />
                        Valider
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex items-center gap-3 p-4">
                    <div className="cursor-grab text-gray-600 hover:text-gray-400">
                      <GripVertical size={20} />
                    </div>

                    <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-lg">{category.emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-400 truncate">{goal.description}</p>
                      )}
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
                        {category.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveGoal(goal.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Formulaire d'ajout */}
      <AnimatePresence>
        {showAddForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800/50 rounded-xl p-5 border border-indigo-500/30"
          >
            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Nouvel objectif
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Titre *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Ex: Améliorer ma communication client"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Catégorie</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {GOAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewGoal({ ...newGoal, category: cat.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newGoal.category === cat.id
                          ? `border-transparent bg-gradient-to-r ${cat.color}`
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <div className={`text-xs mt-1 ${
                        newGoal.category === cat.id ? 'text-white' : 'text-gray-400'
                      }`}>
                        {cat.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (optionnel)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  rows={2}
                  placeholder="Détails sur cet objectif..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewGoal({ title: '', category: 'skills', description: '' });
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddGoal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-lg text-white transition-all"
                >
                  <Plus size={18} />
                  Ajouter
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 border-2 border-dashed border-gray-700 hover:border-indigo-500/50 rounded-xl text-gray-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Ajouter un objectif
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message si pas d'objectifs */}
      {goals.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <Flag size={40} className="mx-auto mb-3 opacity-50" />
          <p>Aucun objectif défini</p>
          <p className="text-sm">Clique sur "Ajouter un objectif" pour commencer</p>
        </div>
      )}
    </motion.div>
  );
};

export default GoalSetting;
