// ==========================================
// 📁 react-app/src/components/admin/AdminBadgeCreator.jsx
// CRÉATEUR DE BADGES ADMIN - IMPORT CORRIGÉ
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Save, 
  Eye, 
  EyeOff, 
  Zap, 
  Star,
  Crown,
  Award,
  Trophy,
  Target,
  Shield,
  Users,
  Clock,
  Heart,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
// ✅ IMPORT CORRIGÉ
import { adminBadgeService } from '../../core/services/adminBadgeService.js';

/**
 * 🎨 CRÉATEUR DE BADGES ADMIN
 */
const AdminBadgeCreator = ({ isOpen, onClose, onBadgeCreated }) => {
  const { user } = useAuthStore();

  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: 'Général',
    xpReward: 50,
    condition: '',
    triggerValue: 1,
    icon: '🏆',
    rarity: 'common',
    category: '',
    isActive: true
  });

  // États UI
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  // Options de configuration
  const rarityOptions = [
    { value: 'common', label: 'Commun', color: 'from-gray-400 to-gray-600' },
    { value: 'uncommon', label: 'Peu commun', color: 'from-green-400 to-green-600' },
    { value: 'rare', label: 'Rare', color: 'from-blue-400 to-blue-600' },
    { value: 'epic', label: 'Épique', color: 'from-purple-400 to-purple-600' },
    { value: 'legendary', label: 'Légendaire', color: 'from-yellow-400 to-orange-600' }
  ];

  const roleOptions = [
    'Général', 'Manager', 'Développeur', 'Designer', 
    'Marketing', 'Ventes', 'Support', 'Admin'
  ];

  const conditionTemplates = [
    { value: '', label: 'Aucune condition automatique' },
    { value: 'tasks_completed', label: 'Tâches terminées' },
    { value: 'projects_created', label: 'Projets créés' },
    { value: 'days_streak', label: 'Jours consécutifs' },
    { value: 'xp_earned', label: 'XP gagné' },
    { value: 'badges_earned', label: 'Badges obtenus' },
    { value: 'team_collaborations', label: 'Collaborations équipe' }
  ];

  const iconOptions = [
    '🏆', '🥇', '🎖️', '🏅', '⭐', '🌟', '💫', '✨',
    '🎯', '🚀', '💎', '👑', '🔥', '⚡', '💪', '🎊'
  ];

  // Gestion du changement de formulaire
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur si elle existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Gestion de l'upload d'image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'L\'image ne doit pas dépasser 5MB' });
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        setErrors({ image: 'Veuillez sélectionner une image valide' });
        return;
      }

      setSelectedImage(file);
      
      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Effacer l'erreur
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du badge est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.xpReward < 0 || formData.xpReward > 1000) {
      newErrors.xpReward = 'La récompense XP doit être entre 0 et 1000';
    }

    if (formData.condition && formData.triggerValue < 1) {
      newErrors.triggerValue = 'La valeur de déclenchement doit être positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Créer le badge
  const handleCreateBadge = async () => {
    if (!validateForm()) return;
    
    setIsCreating(true);
    try {
      const badgeData = {
        ...formData,
        id: `custom_${Date.now()}`,
        createdBy: user?.uid || 'admin',
        createdAt: new Date()
      };
      
      const newBadge = await adminBadgeService.createCustomBadge(badgeData, selectedImage);
      
      console.log('✅ Badge créé avec succès:', newBadge);
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        role: 'Général',
        xpReward: 50,
        condition: '',
        triggerValue: 1,
        icon: '🏆',
        rarity: 'common',
        category: '',
        isActive: true
      });
      setSelectedImage(null);
      setImagePreview(null);
      
      // Notifier le parent
      if (onBadgeCreated) {
        onBadgeCreated(newBadge);
      }
      
      // Fermer le modal
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur création badge:', error);
      setErrors({ general: 'Erreur lors de la création du badge' });
    } finally {
      setIsCreating(false);
    }
  };

  // Prévisualisation du badge
  const BadgePreview = () => {
    const rarity = rarityOptions.find(r => r.value === formData.rarity);
    
    return (
      <div className={`bg-gradient-to-br ${rarity.color} p-6 rounded-xl text-white`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 mb-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Badge" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className="text-2xl">{formData.icon}</span>
            )}
          </div>
          <h3 className="font-bold text-lg mb-2">{formData.name || 'Nom du badge'}</h3>
          <p className="text-white/90 text-sm mb-3">{formData.description || 'Description du badge'}</p>
          <div className="flex items-center justify-center space-x-1 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold">+{formData.xpReward} XP</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div>
              <h2 className="text-2xl font-bold">Créateur de Badge</h2>
              <p className="opacity-90">Concevez un nouveau badge personnalisé</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex max-h-[calc(90vh-140px)]">
            {/* Formulaire */}
            <div className="flex-1 p-6 overflow-y-auto">
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {errors.general}
                </div>
              )}

              <div className="space-y-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
                  
                  {/* Nom du badge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du badge *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Expert Collaborateur"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Décrivez ce que représente ce badge..."
                      rows={3}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  {/* Rôle et Catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle cible
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {roleOptions.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="Ex: Performance, Collaboration..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Apparence */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Apparence</h3>

                  {/* Rareté */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rareté
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {rarityOptions.map(rarity => (
                        <button
                          key={rarity.value}
                          type="button"
                          onClick={() => handleInputChange('rarity', rarity.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.rarity === rarity.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 mx-auto bg-gradient-to-br ${rarity.color} rounded-full mb-1`}></div>
                          <span className="text-xs font-medium">{rarity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icône */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icône
                    </label>
                    <div className="grid grid-cols-8 gap-2 mb-3">
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleInputChange('icon', icon)}
                          className={`p-3 rounded-lg border-2 text-xl transition-all ${
                            formData.icon === icon
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => handleInputChange('icon', e.target.value)}
                      placeholder="Ou tapez votre emoji..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>

                  {/* Upload d'image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image personnalisée (optionnel)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="badge-image-upload"
                      />
                      <label htmlFor="badge-image-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img src={imagePreview} alt="Prévisualisation" className="w-16 h-16 mx-auto rounded-full object-cover" />
                            <p className="text-sm text-gray-600">Cliquez pour changer</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-sm text-gray-600">Cliquez pour uploader une image</p>
                            <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                  </div>
                </div>

                {/* Récompenses et conditions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Récompenses et conditions</h3>

                  {/* XP Reward */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Récompense XP
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={formData.xpReward}
                        onChange={(e) => handleInputChange('xpReward', parseInt(e.target.value) || 0)}
                        className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.xpReward ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <span className="text-gray-500">XP</span>
                    </div>
                    {errors.xpReward && <p className="mt-1 text-sm text-red-600">{errors.xpReward}</p>}
                  </div>

                  {/* Condition automatique */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition de déblocage automatique
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {conditionTemplates.map(condition => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Valeur de déclenchement */}
                  {formData.condition && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valeur de déclenchement
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.triggerValue}
                        onChange={(e) => handleInputChange('triggerValue', parseInt(e.target.value) || 1)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.triggerValue ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.triggerValue && <p className="mt-1 text-sm text-red-600">{errors.triggerValue}</p>}
                    </div>
                  )}

                  {/* Badge actif */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="badge-active"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="badge-active" className="text-sm font-medium text-gray-700">
                      Badge actif (peut être attribué)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Prévisualisation */}
            <div className="w-80 p-6 bg-gray-50 border-l border-gray-200">
              <div className="sticky top-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Prévisualisation</h3>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="sr-only">{showPreview ? 'Masquer' : 'Afficher'}</span>
                  </button>
                </div>

                {(showPreview || true) && (
                  <div className="sticky top-4">
                    <BadgePreview />
                    
                    {/* Informations */}
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Informations :</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rôle :</span>
                          <span className="font-medium">{formData.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rareté :</span>
                          <span className="font-medium">{rarityOptions.find(r => r.value === formData.rarity)?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Condition :</span>
                          <span className="font-medium">{conditionTemplates.find(c => c.value === formData.condition)?.label || 'Non définie'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valeur :</span>
                          <span className="font-medium">{formData.triggerValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateBadge}
              disabled={isCreating}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isCreating ? 'Création...' : 'Créer le Badge'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminBadgeCreator;
