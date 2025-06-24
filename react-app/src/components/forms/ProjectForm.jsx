// src/components/forms/ProjectForm.jsx
// Modal complète pour créer/éditer des projets
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Target, AlertCircle, Upload, Tag } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { useUsers } from '../../shared/hooks/useUsers.js';

const ProjectForm = ({ 
  isOpen, 
  onClose, 
  project = null, 
  onSave,
  loading = false 
}) => {
  const { user } = useAuthStore();
  const { users: availableUsers } = useUsers({ autoLoad: true, limitCount: 100 });

  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    category: '',
    startDate: '',
    endDate: '',
    estimatedHours: '',
    assignedMembers: [],
    tags: [],
    objectives: [''],
    budget: '',
    resources: []
  });

  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');

  // Options pour les sélects
  const statusOptions = [
    { value: 'planning', label: 'Planification', color: 'bg-gray-500' },
    { value: 'active', label: 'En cours', color: 'bg-blue-500' },
    { value: 'on-hold', label: 'En pause', color: 'bg-yellow-500' },
    { value: 'completed', label: 'Terminé', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Annulé', color: 'bg-red-500' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: 'text-green-400' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-400' },
    { value: 'high', label: 'Haute', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-400' }
  ];

  const categoryOptions = [
    { value: 'web', label: 'Développement Web' },
    { value: 'mobile', label: 'Application Mobile' },
    { value: 'design', label: 'Design & UX' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'research', label: 'Recherche & Développement' },
    { value: 'internal', label: 'Projet Interne' },
    { value: 'client', label: 'Projet Client' },
    { value: 'other', label: 'Autre' }
  ];

  // Initialiser le formulaire quand le projet change
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        category: project.category || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        estimatedHours: project.estimatedHours || '',
        assignedMembers: project.assignedMembers || [],
        tags: project.tags || [],
        objectives: project.objectives?.length > 0 ? project.objectives : [''],
        budget: project.budget || '',
        resources: project.resources || []
      });
    } else {
      // Réinitialiser pour un nouveau projet
      setFormData({
        title: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        category: '',
        startDate: '',
        endDate: '',
        estimatedHours: '',
        assignedMembers: [user?.uid].filter(Boolean), // Ajouter l'utilisateur actuel par défaut
        tags: [],
        objectives: [''],
        budget: '',
        resources: []
      });
    }
    setErrors({});
  }, [project, user?.uid]);

  // Gestion des changements d'input
  const handleInputChange = (e) => {
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

  // Gestion des membres assignés
  const toggleMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.includes(memberId)
        ? prev.assignedMembers.filter(id => id !== memberId)
        : [...prev.assignedMembers, memberId]
    }));
  };

  // Gestion des tags
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Gestion des objectifs
  const updateObjective = (index, value) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index) => {
    if (formData.objectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }

    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours <= 0)) {
      newErrors.estimatedHours = 'Le nombre d\'heures doit être un nombre positif';
    }

    if (formData.budget && (isNaN(formData.budget) || formData.budget < 0)) {
      newErrors.budget = 'Le budget doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Nettoyer les données
    const cleanedData = {
      ...formData,
      objectives: formData.objectives.filter(obj => obj.trim()),
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      createdBy: user?.uid,
      updatedAt: new Date()
    };

    if (!project) {
      cleanedData.createdAt = new Date();
      cleanedData.id = Date.now().toString(); // Temporaire, sera remplacé par Firebase
    }

    try {
      await onSave(cleanedData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  // Obtenir l'utilisateur par ID
  const getUserById = (userId) => {
    return availableUsers.find(u => u.id === userId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {project ? '✏️ Modifier le projet' : '🚀 Nouveau projet'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Informations de base */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Titre */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre du projet *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Ex: Refonte du site web"
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Décrivez les objectifs et le contexte du projet..."
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(option => (
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
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Heures estimées */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Heures estimées
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.estimatedHours ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="ex: 120"
                />
                {errors.estimatedHours && <p className="text-red-400 text-sm mt-1">{errors.estimatedHours}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date de début
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date de fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Membres assignés */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Users className="w-4 h-4 inline mr-1" />
                Membres assignés ({formData.assignedMembers.length})
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
                {availableUsers.map(member => (
                  <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedMembers.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white">
                        {member.photoURL ? (
                          <img src={member.photoURL} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          member.displayName?.charAt(0) || '?'
                        )}
                      </div>
                      <span className="text-sm text-gray-300 truncate">{member.displayName}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Objectifs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Objectifs du projet
              </label>
              <div className="space-y-2">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder={`Objectif ${index + 1}...`}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addObjective}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  + Ajouter un objectif
                </button>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget estimé (€)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.budget ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ex: 15000"
              />
              {errors.budget && <p className="text-red-400 text-sm mt-1">{errors.budget}</p>}
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Sauvegarde...' : project ? 'Mettre à jour' : 'Créer le projet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
