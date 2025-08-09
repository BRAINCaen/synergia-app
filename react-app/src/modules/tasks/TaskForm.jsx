// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// CORRECTION - XP AUTOMATIQUE OBLIGATOIRE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Save, 
  FileText, 
  Target, 
  Calendar, 
  Repeat, 
  Trophy, 
  User, 
  Folder,
  AlertTriangle,
  Loader,
  Info,
  Upload,
  Paperclip
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectService } from '../../core/services/projectService.js';
import { mediaUploadService } from '../../core/services/mediaUploadService.js';

// Configuration des difficultés avec XP AUTOMATIQUE
const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Facile', xp: 10, color: 'text-green-600', description: 'Tâche simple, moins de 30 min' },
  { value: 'medium', label: 'Moyen', xp: 25, color: 'text-yellow-600', description: 'Tâche standard, 1-2 heures' },
  { value: 'hard', label: 'Difficile', xp: 50, color: 'text-orange-600', description: 'Tâche complexe, demi-journée' },
  { value: 'expert', label: 'Expert', xp: 100, color: 'text-red-600', description: 'Tâche très complexe, journée entière' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Faible', color: 'text-gray-600' },
  { value: 'medium', label: 'Moyenne', color: 'text-blue-600' },
  { value: 'high', label: 'Élevée', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
];

const RECURRENCE_OPTIONS = {
  none: { label: 'Aucune', value: 'none' },
  daily: { label: 'Quotidienne', value: 'daily' },
  weekly: { label: 'Hebdomadaire', value: 'weekly' },
  monthly: { label: 'Mensuelle', value: 'monthly' }
};

const TaskForm = ({ isOpen, onClose, onSubmit, initialData, submitting = false }) => {
  const { user } = useAuthStore();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    priority: 'medium',
    xpReward: 25, // Sera calculé automatiquement
    estimatedTime: 1,
    dueDate: '',
    assignedTo: [],
    projectId: '',
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    notes: ''
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ CALCUL AUTOMATIQUE XP - PLUS DE PERSONNALISATION POSSIBLE
  useEffect(() => {
    const difficultyOption = DIFFICULTY_OPTIONS.find(d => d.value === formData.difficulty);
    if (difficultyOption) {
      setFormData(prev => ({ ...prev, xpReward: difficultyOption.xp }));
    }
  }, [formData.difficulty]);

  // Initialisation des données lors de l'édition
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium',
        priority: initialData.priority || 'medium',
        estimatedTime: initialData.estimatedTime || 1,
        assignedTo: initialData.assignedTo || [],
        projectId: initialData.projectId || '',
        isRecurring: initialData.isRecurring || false,
        recurrenceType: initialData.recurrenceType || 'none',
        recurrenceInterval: initialData.recurrenceInterval || 1,
        notes: initialData.notes || '',
        dueDate: initialData.dueDate ? 
          (initialData.dueDate.toDate ? 
            initialData.dueDate.toDate().toISOString().split('T')[0] : 
            new Date(initialData.dueDate).toISOString().split('T')[0]
          ) : '',
        recurrenceEndDate: initialData.recurrenceEndDate ?
          (initialData.recurrenceEndDate.toDate ?
            initialData.recurrenceEndDate.toDate().toISOString().split('T')[0] :
            new Date(initialData.recurrenceEndDate).toISOString().split('T')[0]
          ) : ''
      }));
      
      // ✅ FORCER LE RECALCUL XP SELON LA DIFFICULTÉ
      const difficultyOption = DIFFICULTY_OPTIONS.find(d => d.value === (initialData.difficulty || 'medium'));
      if (difficultyOption) {
        setFormData(prev => ({ ...prev, xpReward: difficultyOption.xp }));
      }
    }
  }, [initialData]);

  // Charger les projets
  useEffect(() => {
    if (user?.uid) {
      loadProjects();
    }
  }, [user?.uid]);

  const loadProjects = async () => {
    try {
      const userProjects = await projectService.getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
    }
  };

  // Upload de fichier média
  const uploadMediaFile = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploading(true);
      console.log('📤 Upload média:', selectedFile.name);
      
      const uploadResult = await mediaUploadService.uploadFile(selectedFile, {
        folder: 'tasks',
        userId: user.uid,
        taskTitle: formData.title
      });
      
      console.log('✅ Média uploadé:', uploadResult);
      return {
        url: uploadResult.url,
        type: selectedFile.type.startsWith('image/') ? 'image' : 
              selectedFile.type.startsWith('video/') ? 'video' : 'file',
        filename: selectedFile.name,
        size: selectedFile.size
      };
      
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      
      if (error.message?.includes('too large')) {
        setError('Fichier trop volumineux (max 10MB)');
      } else {
        console.warn('⚠️ Upload échoué, tâche créée sans média');
        setError('Upload échoué, la tâche sera créée sans média.');
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || loading || uploading) return;

    // Validation des champs obligatoires
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!formData.description.trim()) {
      setError('La description est obligatoire');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Upload du média si présent
      const mediaAttachment = await uploadMediaFile();

      // ✅ DONNÉES FINALES AVEC XP AUTOMATIQUE
      const taskDataToSubmit = {
        ...formData,
        xpReward: DIFFICULTY_OPTIONS.find(d => d.value === formData.difficulty)?.xp || 25, // FORCÉ AUTO
        createdBy: user.uid,
        createdAt: new Date(),
        status: 'todo',
        ...(mediaAttachment && { mediaAttachment })
      };

      // Conversion des dates
      if (formData.dueDate) {
        taskDataToSubmit.dueDate = new Date(formData.dueDate);
      }
      if (formData.recurrenceEndDate) {
        taskDataToSubmit.recurrenceEndDate = new Date(formData.recurrenceEndDate);
      }

      console.log('📝 Soumission tâche avec XP auto:', taskDataToSubmit);
      await onSubmit(taskDataToSubmit);

    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Fichier trop volumineux (max 10MB)');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const FilePreview = ({ file, onRemove }) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    return (
      <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isImage ? (
              <img 
                src={URL.createObjectURL(file)} 
                alt="Preview" 
                className="w-12 h-12 object-cover rounded"
              />
            ) : isVideo ? (
              <video 
                src={URL.createObjectURL(file)} 
                className="w-12 h-12 object-cover rounded"
                muted
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                {initialData ? <Save className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                </h2>
                <p className="text-sm text-gray-600">
                  {initialData ? 'Modifiez les détails de cette tâche' : 'XP calculé automatiquement selon la difficulté'}
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Informations de base
              </h3>
              
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Donnez un titre clair et descriptif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez précisément ce qui doit être fait, les étapes, les ressources nécessaires..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={loading || uploading}
                  required
                />
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                    required
                  >
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.xp} XP) - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Temps estimé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temps estimé (heures)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseFloat(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading || uploading}
                />
              </div>
            </div>

            {/* ✅ AFFICHAGE XP AUTOMATIQUE (LECTURE SEULE) */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-gray-900">Récompense XP (Automatique)</h3>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                  {formData.xpReward} XP
                </div>
                <div className="text-sm text-gray-600">
                  Calculé automatiquement selon la difficulté sélectionnée
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                💡 L'XP est déterminé par la difficulté : Facile (10 XP), Moyen (25 XP), Difficile (50 XP), Expert (100 XP)
              </p>
            </div>

            {/* Planning */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Planning
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date limite */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date limite (optionnelle)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                </div>

                {/* Projet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lier à un projet (optionnel)
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  >
                    <option value="">Aucun projet</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Récurrence */}
            {!initialData && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isRecurring: e.target.checked,
                      recurrenceType: e.target.checked ? 'weekly' : 'none'
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    <Repeat className="w-4 h-4 inline mr-1" />
                    Tâche récurrente
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fréquence
                        </label>
                        <select
                          value={formData.recurrenceType}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={loading || uploading}
                        >
                          {Object.entries(RECURRENCE_OPTIONS).filter(([key]) => key !== 'none').map(([key, option]) => (
                            <option key={key} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intervalle
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={formData.recurrenceInterval}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={loading || uploading}
                        />
                      </div>
                    </div>

                    {formData.recurrenceType !== 'none' && (
                      <div className="p-3 bg-blue-100 border border-blue-200 rounded text-sm text-blue-800">
                        <Info className="w-4 h-4 inline mr-1" />
                        Cette tâche se répétera {RECURRENCE_OPTIONS[formData.recurrenceType]?.label.toLowerCase()}
                        {formData.recurrenceInterval > 1 && ` (tous les ${formData.recurrenceInterval})`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Upload média */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-blue-600" />
                Fichier joint (optionnel)
              </h3>
              
              <div>
                <input
                  type="file"
                  id="mediaFile"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                  disabled={loading || uploading}
                />
                
                <button
                  type="button"
                  onClick={() => document.getElementById('mediaFile').click()}
                  disabled={loading || uploading}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Cliquez pour ajouter un fichier
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 10MB • JPG, PNG, MP4, PDF, DOC
                  </p>
                </button>

                {selectedFile && (
                  <FilePreview 
                    file={selectedFile} 
                    onRemove={() => setSelectedFile(null)} 
                  />
                )}
              </div>
            </div>

            {/* Notes supplémentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes supplémentaires (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations complémentaires, contexte, références..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading || uploading}
              />
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || uploading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || uploading || !formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading || uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {uploading ? 'Upload en cours...' : (initialData ? 'Modification...' : 'Création...')}
                  </>
                ) : (
                  <>
                    {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {initialData ? 'Modifier la tâche' : 'Créer la tâche'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
