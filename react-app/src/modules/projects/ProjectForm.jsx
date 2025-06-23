// ==========================================
// 📁 react-app/src/modules/projects/ProjectForm.jsx
// Formulaire complet création/édition projets - VERSION CORRIGÉE AVEC DEBUGGING
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useProjectStore } from '../../shared/stores/projectStore.js';

const ProjectForm = ({ 
  isOpen, 
  onClose, 
  editingProject = null, 
  onSuccess = null 
}) => {
  const { user } = useAuthStore();
  const { createProject, updateProject } = useProjectStore();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    icon: '📁',
    color: '#3b82f6',
    tags: [],
    priority: 'medium',
    deadline: '',
    budget: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Options prédéfinies
  const PROJECT_ICONS = [
    '📁', '🚀', '⚡', '🎯', '💎', '🔥', '⭐', '🏆',
    '📊', '💼', '🎨', '🔧', '📱', '💻', '🌟', '🔮'
  ];

  const STATUS_OPTIONS = [
    { value: 'active', label: '🟢 Actif', desc: 'Projet en cours' },
    { value: 'planning', label: '🔵 Planification', desc: 'En phase de préparation' },
    { value: 'paused', label: '⏸️ En pause', desc: 'Temporairement arrêté' },
    { value: 'completed', label: '✅ Terminé', desc: 'Projet achevé' },
    { value: 'archived', label: '📦 Archivé', desc: 'Stocké pour référence' }
  ];

  const PRIORITY_OPTIONS = [
    { value: 'low', label: '📝 Basse', color: 'text-gray-400' },
    { value: 'medium', label: '📌 Moyenne', color: 'text-blue-400' },
    { value: 'high', label: '⚡ Haute', color: 'text-orange-400' },
    { value: 'urgent', label: '🔥 Urgent', color: 'text-red-400' }
  ];

  // 🔧 CORRECTION: Fonction utilitaire pour formater les dates en sécurité
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    try {
      // Gestion des timestamps Firebase
      if (date && typeof date.toDate === 'function') {
        date = date.toDate();
      }
      
      // Gestion des objets avec seconds (Firebase Timestamp format)
      if (date && typeof date.seconds === 'number') {
        date = new Date(date.seconds * 1000);
      }
      
      const parsedDate = new Date(date);
      
      // Vérifier si la date est valide
      if (isNaN(parsedDate.getTime())) {
        console.warn('Date invalide pour input:', date);
        return '';
      }
      
      return parsedDate.toISOString().slice(0, 16);
    } catch (error) {
      console.warn('Erreur formatage date pour input:', error, 'Date reçue:', date);
      return '';
    }
  };

  // Initialiser le formulaire si édition
  useEffect(() => {
    if (editingProject) {
      console.log('🔧 Initialisation formulaire édition:', editingProject);
      setFormData({
        name: editingProject.name || '',
        description: editingProject.description || '',
        status: editingProject.status || 'active',
        icon: editingProject.icon || '📁',
        color: editingProject.color || '#3b82f6',
        tags: editingProject.tags || [],
        priority: editingProject.priority || 'medium',
        deadline: formatDateForInput(editingProject.deadline),
        budget: editingProject.budget || ''
      });
    } else {
      resetForm();
    }
  }, [editingProject, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      icon: '📁',
      color: '#3b82f6',
      tags: [],
      priority: 'medium',
      deadline: '',
      budget: ''
    });
    setErrors({});
    setTagInput('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Nom requis
    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom du projet est requis';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Le nom ne peut pas dépasser 100 caractères';
    }

    // Description optionnelle mais limitée
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    // Deadline validation - 🔧 CORRECTION: Gestion sécurisée des dates
    if (formData.deadline) {
      try {
        const deadlineDate = new Date(formData.deadline);
        if (isNaN(deadlineDate.getTime())) {
          newErrors.deadline = 'Format de date invalide';
        } else {
          const now = new Date();
          if (deadlineDate < now && formData.status !== 'completed') {
            newErrors.deadline = 'La deadline ne peut pas être dans le passé pour un projet actif';
          }
        }
      } catch (error) {
        console.warn('Erreur validation deadline:', error);
        newErrors.deadline = 'Format de date invalide';
      }
    }

    // Budget validation
    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Le budget doit être un nombre valide';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    // 🔧 DEBUG: Log validation results
    console.log('=== VALIDATION ===');
    console.log('Errors found:', newErrors);
    console.log('Form is valid:', isValid);
    console.log('Form data:', formData);
    
    return isValid;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔧 DEBUG: Log submit attempt
    console.log('=== SUBMIT ATTEMPT ===');
    console.log('Form data:', formData);
    console.log('User:', user);
    console.log('Loading state:', loading);
    
    // Validation
    const isValidForm = validateForm();
    console.log('Form validation result:', isValidForm);
    
    if (!isValidForm) {
      console.log('❌ Validation failed, stopping submit');
      return;
    }
    
    if (!user?.uid) {
      console.log('❌ No user found, stopping submit');
      setErrors({ general: 'Utilisateur non connecté' });
      return;
    }

    setLoading(true);
    console.log('🔄 Starting project save...');
    
    try {
      // 🔧 CORRECTION: Gestion sécurisée de la deadline
      const projectData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline ? (() => {
          try {
            const date = new Date(formData.deadline);
            return isNaN(date.getTime()) ? null : date;
          } catch (error) {
            console.warn('Erreur parsing deadline:', error);
            return null;
          }
        })() : null,
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      console.log('📤 Sending project data:', projectData);

      let result;
      if (editingProject) {
        console.log('📝 Updating existing project:', editingProject.id);
        result = await updateProject(editingProject.id, projectData);
      } else {
        console.log('➕ Creating new project');
        result = await createProject(projectData, user.uid);
      }

      console.log('✅ Project saved successfully:', result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      onClose();
      
    } catch (error) {
      console.error('❌ Error saving project:', error);
      setErrors({ 
        general: error.message || 'Erreur lors de la sauvegarde du projet' 
      });
    } finally {
      setLoading(false);
      console.log('🏁 Submit process completed');
    }
  };

  // 🔧 DEBUG: Log component state
  console.log('=== COMPONENT STATE ===');
  console.log('Is open:', isOpen);
  console.log('Form data name:', formData.name);
  console.log('Form data name trimmed:', formData.name?.trim());
  console.log('Loading:', loading);
  console.log('Errors:', errors);
  console.log('Button should be disabled:', loading || !formData.name?.trim());
  console.log('User UID:', user?.uid);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">{formData.icon}</span>
            {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <span className="text-gray-400 text-xl">✕</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Erreur générale */}
            {errors.general && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* 🔧 DEBUG: Status display */}
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
              <p className="text-blue-400 text-sm">
                <strong>Debug Info:</strong> Nom="{formData.name}" | 
                Trimmed="{formData.name?.trim()}" | 
                Valid={formData.name?.trim()?.length >= 3} | 
                User={!!user?.uid} | 
                Loading={loading}
              </p>
            </div>

            {/* Ligne 1: Icône + Nom */}
            <div className="grid grid-cols-12 gap-4">
              {/* Icône */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icône
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {PROJECT_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-2 text-xl rounded-lg transition-colors ${
                        formData.icon === icon 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      disabled={loading}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nom du projet */}
              <div className="col-span-10">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    console.log('Name input changed to:', e.target.value);
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    // Clear name error when typing
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="Mon super projet..."
                  className={`w-full px-3 py-2 bg-gray-700 border text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre projet..."
                rows={3}
                className={`w-full px-3 py-2 bg-gray-700 border text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Ligne 2: Statut + Priorité */}
            <div className="grid grid-cols-2 gap-4">
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne 3: Couleur + Deadline */}
            <div className="grid grid-cols-2 gap-4">
              {/* Couleur */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Couleur du projet
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date limite
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className={`w-full px-3 py-2 bg-gray-700 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.deadline ? 'border-red-500' : 'border-gray-600'
                  }`}
                  disabled={loading}
                />
                {errors.deadline && (
                  <p className="text-red-400 text-sm mt-1">{errors.deadline}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0.00"
                className={`w-full px-3 py-2 bg-gray-700 border text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budget ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={loading}
              />
              {errors.budget && (
                <p className="text-red-400 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              
              {/* Tags existants */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-blue-200 ml-1"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Ajouter nouveau tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log('Add tag button clicked, tagInput:', tagInput);
                    handleAddTag();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !tagInput.trim()}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={(e) => {
              console.log('Main submit button clicked!');
              console.log('Current form state:', {
                name: formData.name,
                nameTrimmed: formData.name?.trim(),
                loading,
                userUid: user?.uid
              });
              handleSubmit(e);
            }}
            disabled={loading || !formData.name?.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            {editingProject ? 'Mettre à jour' : 'Créer le projet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
