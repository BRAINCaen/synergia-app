// ==========================================
// 📁 react-app/src/components/tasks/TaskForm.jsx
// FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag, FileText } from 'lucide-react';

/**
 * 📝 FORMULAIRE DE TÂCHE AVEC SUPPORT VALIDATION
 */
const TaskForm = ({ task, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    difficulty: 'normal', // ✅ NOUVEAU: Difficulté pour XP
    dueDate: '',
    estimatedTime: '',
    tags: []
  });

  const [errors, setErrors] = useState({});

  // Initialiser le formulaire
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'normal',
        difficulty: task.difficulty || 'normal',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedTime: task.estimatedTime || '',
        tags: task.tags || []
      });
    }
  }, [task]);

  // Gérer les changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'La date d\'échéance ne peut pas être dans le passé';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Convertir les données
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      estimatedTime: formData.estimatedTime ? parseFloat(formData.estimatedTime) : null
    };
    
    onSubmit(submitData);
  };

  // ✅ Calculer l'XP prévu selon la difficulté
  const getExpectedXP = () => {
    const xpMap = {
      'easy': 25,
      'normal': 50,
      'hard': 100,
      'expert': 200
    };
    return xpMap[formData.difficulty] || 50;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre de la tâche"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description détaillée de la tâche..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Priorité et Difficulté */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Priorité
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">🟢 Basse</option>
                <option value="normal">🟡 Normale</option>
                <option value="high">🟠 Haute</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            {/* ✅ NOUVEAU: Difficulté pour le calcul XP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Difficulté
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">😊 Facile (+25 XP)</option>
                <option value="normal">😐 Normal (+50 XP)</option>
                <option value="hard">😤 Difficile (+100 XP)</option>
                <option value="expert">🔥 Expert (+200 XP)</option>
              </select>
            </div>
          </div>

          {/* Date d'échéance et temps estimé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date d'échéance
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dueDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Temps estimé (heures)
              </label>
              <input
                type="number"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                placeholder="Ex: 2.5"
                min="0"
                step="0.5"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* ✅ NOUVEAU: Aperçu XP */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-purple-600 font-medium">🏆 XP en attente de validation :</span>
                <span className="text-purple-800 font-bold text-lg">+{getExpectedXP()} XP</span>
              </div>
              <div className="text-xs text-purple-600">
                Sera attribué après validation admin
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{task ? 'Sauvegarder' : 'Créer la tâche'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
