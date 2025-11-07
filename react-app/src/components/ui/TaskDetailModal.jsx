// ==========================================
// 📁 react-app/src/components/ui/TaskDetailModal.jsx
// MODAL DÉTAILS QUÊTE - AVEC FORMULAIRE DE SOUMISSION INTÉGRÉ ⚔️
// ==========================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle, 
  FileText, 
  MessageCircle,
  User,
  Eye,
  Upload,
  Camera,
  Video,
  Send,
  Loader,
  AlertTriangle,
  Trophy,
  Scroll,
  Image as ImageIcon,
  Play,
  Trash2
} from 'lucide-react';

// Imports Firebase
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// Imports services
import { useAuthStore } from '../../shared/stores/authStore.js';
import { taskValidationService } from '../../core/services/taskValidationService.js';

/**
 * 📊 SECTION COMMENTAIRES
 */
const CommentsSection = ({ task, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Charger les commentaires en temps réel
  useEffect(() => {
    if (!task?.id) return;

    console.log('💬 [COMMENTS] Configuration listener pour:', task.id);
    
    const commentsQuery = query(
      collection(db, 'tasks', task.id, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const loadedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`💬 [COMMENTS] ${loadedComments.length} commentaires chargés`);
      setComments(loadedComments);
      setLoadingComments(false);
    }, (error) => {
      console.error('❌ [COMMENTS] Erreur:', error);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [task?.id]);

  // Ajouter un commentaire
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser?.uid || submitting) return;

    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'tasks', task.id, 'comments'), {
        content: newComment.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email || 'Utilisateur',
        createdAt: serverTimestamp()
      });
      
      console.log('✅ [COMMENT] Commentaire ajouté');
      setNewComment('');
    } catch (error) {
      console.error('❌ [COMMENT] Erreur:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  // Formater la date
  const formatCommentDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Formulaire nouveau commentaire */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          rows={3}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <MessageCircle className="w-4 h-4" />
          )}
          <span>{submitting ? 'Envoi...' : 'Commenter'}</span>
        </button>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-3">
        {loadingComments ? (
          <div className="text-center py-4">
            <Loader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun commentaire pour le moment
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-medium text-white">
                    {comment.authorName || 'Utilisateur'}
                  </span>
                  <div className="text-xs text-gray-400">
                    {formatCommentDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * ⚔️ SECTION SOUMISSION POUR VALIDATION
 */
const SubmissionSection = ({ task, currentUser, onSubmissionSuccess }) => {
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const expectedXP = task?.xpReward || 25;

  // Gérer la sélection de fichier
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier la taille (max 50MB pour permettre vidéos)
    if (file.size > 50 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 50MB)');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Seuls les images et vidéos sont acceptées');
      return;
    }

    setSelectedFile(file);
    setFileType(isImage ? 'image' : 'video');
    setError('');

    // Prévisualisation pour les images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Supprimer le fichier
  const handleFileRemove = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Soumettre la validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Veuillez ajouter un commentaire décrivant votre travail');
      return;
    }
    
    if (!currentUser?.uid) {
      setError('Utilisateur non connecté');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      console.log('📤 [SUBMISSION] Soumission validation:', {
        taskId: task.id,
        userId: currentUser.uid,
        hasFile: !!selectedFile
      });

      // Préparer les données de validation
      const validationData = {
        taskId: task.id,
        userId: currentUser.uid,
        taskTitle: task.title,
        projectId: task.projectId,
        difficulty: task.difficulty || 'normal',
        comment: comment.trim(),
        photoFile: fileType === 'image' ? selectedFile : null,
        videoFile: fileType === 'video' ? selectedFile : null
      };

      // Appeler le service de validation
      const result = await taskValidationService.submitTaskForValidation(validationData);

      console.log('✅ [SUBMISSION] Résultat:', result);

      if (result.success) {
        setSuccess(true);
        
        // Notifier le parent
        if (onSubmissionSuccess) {
          onSubmissionSuccess({
            taskId: task.id,
            validationId: result.validationId,
            xpAmount: result.xpAmount
          });
        }

        // Attendre 2 secondes puis réinitialiser
        setTimeout(() => {
          setSuccess(false);
          setComment('');
          handleFileRemove();
        }, 2000);

      } else {
        setError(result.message || 'Erreur lors de la soumission');
      }

    } catch (error) {
      console.error('❌ [SUBMISSION] Erreur:', error);
      setError(error.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Message de succès */}
      {success && (
        <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-green-300 font-medium">✅ Quête soumise pour validation !</p>
            <p className="text-green-400 text-sm">
              Vous recevrez {expectedXP} XP une fois validée par un Maître du Jeu
            </p>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      {/* Formulaire */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info XP */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 text-sm">
              Récompense : <strong>{expectedXP} XP</strong> après validation
            </span>
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Décrivez votre travail *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Expliquez ce que vous avez fait pour accomplir cette quête..."
              className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              disabled={submitting}
              required
            />
          </div>

          {/* Upload fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Preuve (photo/vidéo) - optionnel
            </label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mx-auto w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  disabled={submitting}
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                </button>
                <p className="mt-2 text-sm text-gray-400">
                  Cliquez pour ajouter une photo ou vidéo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max 50MB • JPG, PNG, MP4, MOV, etc.
                </p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                {/* Prévisualisation image */}
                {fileType === 'image' && filePreview && (
                  <img
                    src={filePreview}
                    alt="Prévisualisation"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Info vidéo */}
                {fileType === 'video' && (
                  <div className="flex items-center gap-3 mb-3 bg-gray-900 p-3 rounded-lg">
                    <Play className="w-8 h-8 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}

                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={handleFileRemove}
                  className="flex items-center gap-2 px-3 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                  disabled={submitting}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>

          {/* Bouton soumettre */}
          <button
            type="submit"
            disabled={!comment.trim() || submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Validation en cours...</span>
              </>
            ) : (
              <>
                <Scroll className="w-5 h-5" />
                <Trophy className="w-5 h-5" />
                <span>⚔️ Valider la Quête</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

/**
 * 📋 COMPOSANT PRINCIPAL : MODAL DÉTAILS QUÊTE
 */
const TaskDetailModal = ({ 
  task, 
  isOpen, 
  onClose,
  onEdit,
  onDelete,
  currentUser
}) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('details');
  const effectiveUser = currentUser || user;

  // Déterminer si l'utilisateur est assigné
  const assignedTo = Array.isArray(task?.assignedTo) ? task.assignedTo : (task?.assignedTo ? [task.assignedTo] : []);
  const isAssignedToMe = assignedTo.includes(effectiveUser?.uid);
  const canSubmit = isAssignedToMe && 
                    task?.status === 'in_progress' && 
                    task?.status !== 'validation_pending' &&
                    task?.status !== 'completed';

  // Handler succès soumission
  const handleSubmissionSuccess = useCallback((result) => {
    console.log('✅ [MODAL] Soumission réussie:', result);
    // Le modal reste ouvert pour que l'utilisateur voie le message de succès
  }, []);

  // Formater les dates
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-none sm:rounded-xl w-full max-w-[375px] sm:max-w-4xl min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-hidden flex flex-col border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm px-4 sm:px-6 py-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">
                  {task.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {/* Badge statut */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-600 text-white' :
                    task.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    task.status === 'validation_pending' ? 'bg-yellow-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {task.status === 'completed' ? '✅ Terminée' :
                     task.status === 'in_progress' ? '🚀 En cours' :
                     task.status === 'validation_pending' ? '⏳ En validation' :
                     '📋 À faire'}
                  </span>

                  {/* Badge priorité */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-600 text-white' :
                    task.priority === 'medium' ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {task.priority === 'high' ? '🔴 Haute' :
                     task.priority === 'medium' ? '🟡 Moyenne' :
                     '🟢 Basse'}
                  </span>

                  {/* Badge XP */}
                  {task.xpReward && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-700/50">
                      ⚡ {task.xpReward} XP
                    </span>
                  )}
                </div>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Indicateur assignation */}
            {isAssignedToMe && (
              <div className="mt-3 px-3 py-2 bg-green-900/30 border border-green-600/50 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">
                  ✅ Vous êtes assigné à cette quête
                </span>
              </div>
            )}
          </div>

          {/* Onglets */}
          <div className="bg-gray-900/50 border-b border-gray-700 flex-shrink-0">
            <div className="flex px-4 sm:px-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Détails
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'text-blue-400 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Commentaires
              </button>

              {/* Onglet soumission si l'utilisateur peut soumettre */}
              {canSubmit && (
                <button
                  onClick={() => setActiveTab('submission')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'submission'
                      ? 'text-green-400 border-green-400'
                      : 'text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4 inline mr-2" />
                  ⚔️ Valider
                </button>
              )}
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Onglet Détails */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-300">Description</h3>
                  <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {task.description || 'Aucune description'}
                  </p>
                </div>

                {/* Métadonnées */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date limite */}
                  {task.dueDate && (
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Échéance</span>
                      </div>
                      <p className="text-white font-medium">{formatDate(task.dueDate)}</p>
                    </div>
                  )}

                  {/* Temps estimé */}
                  {task.estimatedHours && (
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Durée estimée</span>
                      </div>
                      <p className="text-white font-medium">{task.estimatedHours}h</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {task.notes && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-gray-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h3>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <p className="text-gray-300 whitespace-pre-wrap">{task.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Commentaires */}
            {activeTab === 'comments' && (
              <CommentsSection task={task} currentUser={effectiveUser} />
            )}

            {/* Onglet Soumission */}
            {activeTab === 'submission' && canSubmit && (
              <SubmissionSection 
                task={task} 
                currentUser={effectiveUser}
                onSubmissionSuccess={handleSubmissionSuccess}
              />
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-900/50 border-t border-gray-700 p-4 sm:p-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>

              {/* Boutons supplémentaires pour le créateur */}
              {task.createdBy === effectiveUser?.uid && (
                <>
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(task);
                        onClose();
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette quête ?')) {
                          onDelete(task);
                          onClose();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetailModal;
