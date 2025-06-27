// ==========================================
// 📁 react-app/src/components/admin/AdminBadgeCreator.jsx
// INTERFACE ADMIN POUR CRÉER DES BADGES PERSONNALISÉS
// ==========================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  Save, 
  X, 
  Image as ImageIcon, 
  Zap, 
  Crown, 
  Trophy,
  Star,
  Target,
  Award,
  Gem,
  Palette,
  Eye,
  AlertCircle
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🎨 CRÉATEUR DE BADGES ADMIN
 */
const AdminBadgeCreator = ({ isOpen, onClose, onBadgeCreated }) => {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  
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
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Options de configuration
  const roleOptions = [
    'Général',
    'Game Master',
    'Entretien & Maintenance', 
    'Gestion des Avis',
    'Gestion des Stocks',
    'Organisation Interne',
    'Création de Contenu',
    'Mentorat & Formation',
    'Partenariats & Référencement',
    'Communication & Réseaux Sociaux',
    'Relations B2B & Devis'
  ];

  const rarityOptions = [
    { value: 'common', label: 'Commun', color: 'from-green-500 to-emerald-500', xp: 50 },
    { value: 'rare', label: 'Rare', color: 'from-blue-500 to-cyan-500', xp: 100 },
    { value: 'epic', label: 'Épique', color: 'from-purple-500 to-violet-500', xp: 150 },
    { value: 'legendary', label: 'Légendaire', color: 'from-yellow-500 to-orange-500', xp: 200 }
  ];

  const iconPresets = [
    '🏆', '🎖️', '⭐', '🥇', '🎯', '💎', '👑', '🔥', 
    '⚡', '🌟', '🚀', '💪', '🎨', '🛠️', '📈', '🎮'
  ];

  const conditionTemplates = [
    { value: 'tasks_completed', label: 'Tâches complétées', trigger: 'nombre' },
    { value: 'projects_completed', label: 'Projets terminés', trigger: 'nombre' },
    { value: 'daily_streak', label: 'Jours consécutifs', trigger: 'nombre' },
    { value: 'login_count', label: 'Connexions', trigger: 'nombre' },
    { value: 'xp_earned', label: 'XP gagnés', trigger: 'nombre' },
    { value: 'custom_action', label: 'Action personnalisée', trigger: 'texte' }
  ];

  // Gérer les changements de formulaire
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Ajuster automatiquement l'XP selon la rareté
    if (field === 'rarity') {
      const rarityData = rarityOptions.find(r => r.value === value);
      setFormData(prev => ({
        ...prev,
        xpReward: rarityData.xp
      }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Gérer l'upload d'image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Veuillez sélectionner un fichier image valide'
        }));
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'L\'image doit faire moins de 5MB'
        }));
        return;
      }
      
      setSelectedImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du badge est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    
    if (formData.xpReward < 1 || formData.xpReward > 1000) {
      newErrors.xpReward = 'L\'XP doit être entre 1 et 1000';
    }
    
    if (!formData.condition) {
      newErrors.condition = 'Une condition est requise';
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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Plus className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Créer un Badge Personnalisé</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulaire */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-purple-500" />
                  Configuration du Badge
                </h3>

                {/* Erreur générale */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 text-sm">{errors.general}</span>
                  </div>
                )}

                {/* Nom du badge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du badge *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Ex: Maître des Tâches"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Décrivez ce que fait ce badge..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Rôle et Rareté */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle
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
                      Rareté
                    </label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => handleInputChange('rarity', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {rarityOptions.map(rarity => (
                        <option key={rarity.value} value={rarity.value}>
                          {rarity.label} ({rarity.xp} XP)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* XP Reward */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récompense XP *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.xpReward}
                    onChange={(e) => handleInputChange('xpReward', parseInt(e.target.value))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.xpReward ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.xpReward && <p className="text-red-500 text-sm mt-1">{errors.xpReward}</p>}
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition de déblocage *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.condition ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    <option value="">Sélectionner une condition</option>
                    {conditionTemplates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                </div>

                {/* Valeur déclencheur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur déclencheur
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.triggerValue}
                    onChange={(e) => handleInputChange('triggerValue', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: 10 pour 10 tâches"
                  />
                </div>

                {/* Image ou Icône */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image ou Icône
                  </label>
                  
                  <div className="space-y-4">
                    {/* Upload d'image */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {selectedImage ? 'Changer l\'image' : 'Uploader une image'}
                        </span>
                      </button>
                      {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                    </div>

                    {/* OU séparateur */}
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-gray-500 text-sm">OU</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Sélection d'emoji */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Choisir un emoji :</p>
                      <div className="grid grid-cols-8 gap-2">
                        {iconPresets.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => handleInputChange('icon', icon)}
                            className={`p-2 text-2xl rounded-lg border-2 hover:bg-gray-50 transition-colors ${
                              formData.icon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prévisualisation */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-purple-500" />
                    Aperçu du Badge
                  </h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    {showPreview ? 'Masquer' : 'Afficher'}
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

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminBadgeCreator;
