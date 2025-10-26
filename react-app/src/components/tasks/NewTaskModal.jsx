// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// MODAL CRÉATION/ÉDITION TÂCHES - VERSION RESPONSIVE MOBILE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Save, 
  Calendar, 
  Tag, 
  User, 
  AlertTriangle,
  Clock,
  Trophy,
  Paperclip,
  CheckCircle,
  Edit,
  Star,
  Target,
  Shield,
  Repeat,
  Users,
  Info,
  Zap,
  Flag,
  FileText,
  Upload,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { createTaskSafely } from '../../core/services/taskCreationFix.js';

/**
 * 🎭 RÔLES SYNERGIA COMPLETS
 */
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-orange-600',
    description: 'Maintenance technique et matériel'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    textColor: 'text-yellow-600',
    description: 'Gestion de la réputation et avis clients'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    description: 'Inventaires et approvisionnements'
  },
  client_experience: {
    id: 'client_experience',
    name: 'Expérience Client',
    icon: '😊',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-600',
    description: 'Satisfaction et parcours client'
  },
  communication: {
    id: 'communication',
    name: 'Communication & Marketing',
    icon: '📣',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    textColor: 'text-purple-600',
    description: 'Promotion et communication'
  },
  admin: {
    id: 'admin',
    name: 'Administration & Gestion',
    icon: '📋',
    color: 'bg-gradient-to-r from-gray-600 to-gray-700',
    textColor: 'text-gray-600',
    description: 'Tâches administratives'
  },
  environment: {
    id: 'environment',
    name: 'Développement Durable',
    icon: '🌱',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-600',
    description: 'Écologie et durabilité'
  },
  innovation: {
    id: 'innovation',
    name: 'Innovation & Amélioration',
    icon: '💡',
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textColor: 'text-cyan-600',
    description: 'Projets d\'innovation'
  }
};

/**
 * 🎯 COMPOSANT NEWTASKMODAL - VERSION RESPONSIVE MOBILE
 */
const NewTaskModal = ({ 
  isOpen, 
  onClose, 
  onTaskCreated,
  mode = 'create',
  initialTask = null
}) => {
  const { user } = useAuthStore();
  
  // 📝 ÉTAT DU FORMULAIRE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    requiredRole: '',
    dueDate: '',
    plannedDate: '',
    estimatedTime: '',
    xpReward: 0,
    tags: [],
    recurring: false,
    recurringPattern: 'daily',
    assignedTo: [],
    attachments: [],
    subtasks: [],
    notes: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  // 🔄 INITIALISER LE FORMULAIRE EN MODE ÉDITION
  useEffect(() => {
    if (mode === 'edit' && initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        priority: initialTask.priority || 'medium',
        status: initialTask.status || 'todo',
        requiredRole: initialTask.requiredRole || '',
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate.toDate()).toISOString().split('T')[0] : '',
        plannedDate: initialTask.plannedDate ? new Date(initialTask.plannedDate.toDate()).toISOString().split('T')[0] : '',
        estimatedTime: initialTask.estimatedTime || '',
        xpReward: initialTask.xpReward || 0,
        tags: initialTask.tags || [],
        recurring: initialTask.recurring || false,
        recurringPattern: initialTask.recurringPattern || 'daily',
        assignedTo: initialTask.assignedTo || [],
        attachments: initialTask.attachments || [],
        subtasks: initialTask.subtasks || [],
        notes: initialTask.notes || ''
      });
    }
  }, [mode, initialTask]);

  // 🎨 CALCULER XP AUTOMATIQUEMENT
  useEffect(() => {
    const calculateXP = () => {
      let baseXP = 10;
      
      if (formData.priority === 'high') baseXP += 20;
      else if (formData.priority === 'medium') baseXP += 10;
      
      if (formData.estimatedTime) {
        const hours = parseInt(formData.estimatedTime) || 0;
        baseXP += hours * 5;
      }
      
      if (formData.subtasks.length > 0) {
        baseXP += formData.subtasks.length * 5;
      }
      
      return baseXP;
    };

    setFormData(prev => ({
      ...prev,
      xpReward: calculateXP()
    }));
  }, [formData.priority, formData.estimatedTime, formData.subtasks.length]);

  // 📝 GESTION DES CHANGEMENTS
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 🏷️ GESTION DES TAGS
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ✅ SOUMISSION DU FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const taskData = {
        ...formData,
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        plannedDate: formData.plannedDate ? new Date(formData.plannedDate) : null
      };

      if (mode === 'edit' && initialTask) {
        // Mise à jour
        await updateDoc(doc(db, 'tasks', initialTask.id), taskData);
        console.log('✅ Tâche mise à jour');
      } else {
        // Création
        await createTaskSafely(taskData);
        console.log('✅ Tâche créée');
      }

      if (onTaskCreated) {
        onTaskCreated();
      }

      handleClose();

    } catch (error) {
      console.error('❌ Erreur formulaire:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🚪 FERMETURE
  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      requiredRole: '',
      dueDate: '',
      plannedDate: '',
      estimatedTime: '',
      xpReward: 0,
      tags: [],
      recurring: false,
      recurringPattern: 'daily',
      assignedTo: [],
      attachments: [],
      subtasks: [],
      notes: ''
    });
    setError('');
    setCurrentTag('');
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header - RESPONSIVE */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                  {mode === 'edit' ? 
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold truncate">
                    {mode === 'edit' ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                  </h2>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable - RESPONSIVE */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              
              {/* Erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
                >
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-red-700">{error}</span>
                </motion.div>
              )}

              {/* Ligne 1: Titre + Rôle Synergia - RESPONSIVE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                {/* Titre */}
                <div className="lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Répondre aux avis Google"
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                    required
                  />
                </div>

                {/* Rôle Synergia */}
                <div className="lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Catégorie Synergia
                  </label>
                  <select
                    name="requiredRole"
                    value={formData.requiredRole}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Aucune catégorie spécifique</option>
                    {Object.values(SYNERGIA_ROLES).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description - RESPONSIVE */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez la tâche en détail..."
                  rows="3"
                  className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              {/* Ligne 2: Priorité + Statut - RESPONSIVE */}
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {/* Priorité */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <Flag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Statut
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="validation_pending">En validation</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
              </div>

              {/* Ligne 3: Dates - RESPONSIVE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                {/* Date de planification */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Date de planification
                  </label>
                  <input
                    type="date"
                    name="plannedDate"
                    value={formData.plannedDate}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* Date limite */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Date limite
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Ligne 4: Temps estimé + XP - RESPONSIVE */}
              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {/* Temps estimé */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Temps estimé
                  </label>
                  <input
                    type="text"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleInputChange}
                    placeholder="Ex: 2h"
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* XP (readonly) */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    readOnly
                    className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Tags - RESPONSIVE */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Ajouter un tag..."
                    className="flex-1 p-2 sm:p-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    +
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-indigo-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Récurrence - RESPONSIVE */}
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                <input
                  type="checkbox"
                  id="recurring"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleInputChange}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600"
                />
                <label htmlFor="recurring" className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1 sm:gap-2">
                  <Repeat className="w-3 h-3 sm:w-4 sm:h-4" />
                  Tâche récurrente
                </label>
                {formData.recurring && (
                  <select
                    name="recurringPattern"
                    value={formData.recurringPattern}
                    onChange={handleInputChange}
                    className="ml-auto p-1 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded"
                  >
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                )}
              </div>

              {/* Notes - RESPONSIVE */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notes supplémentaires..."
                  rows="2"
                  className="w-full p-2 sm:p-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

            </form>
          </div>

          {/* Footer - RESPONSIVE */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
              <div className="text-xs text-gray-500 text-center sm:text-left order-2 sm:order-1">
                Les XP sont calculés automatiquement
              </div>
              
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim()}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 sm:gap-2 justify-center text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">{mode === 'edit' ? 'Modification...' : 'Création...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mode === 'edit' ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewTaskModal;
