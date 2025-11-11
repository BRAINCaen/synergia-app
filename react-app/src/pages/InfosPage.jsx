// ==========================================
// 📁 react-app/src/pages/InfosPage.jsx
// PAGE INFORMATIONS ÉQUIPE AVEC LAYOUT
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, Plus, Upload, X, Edit, Trash2, Check, AlertCircle, 
  Loader, Send, CheckCircle, Eye, Bell
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import infosService from '../core/services/infosService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const InfosPage = () => {
  const { user } = useAuthStore();
  const [infos, setInfos] = useState([]);
  const [unvalidatedCount, setUnvalidatedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const [listenerId, setListenerId] = useState(null);
  
  const isAdmin = infosService.isAdmin(user);

  useEffect(() => {
    if (!user) return;

    const id = infosService.listenToInfos((updatedInfos) => {
      setInfos(updatedInfos);
      const count = updatedInfos.filter(info => !info.validatedBy?.[user.uid]).length;
      setUnvalidatedCount(count);
      setLoading(false);
    });

    setListenerId(id);
    return () => {
      if (id) infosService.stopListening(id);
    };
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Chargement des informations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Info className="w-8 h-8 text-purple-400" />
                  Informations Équipe
                </h1>
                <p className="text-white/60">
                  Partagez des informations importantes avec toute l'équipe
                </p>
              </div>

              {unvalidatedCount > 0 && (
                <div className="flex items-center gap-3 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-xl px-4 py-2">
                  <Bell className="w-5 h-5 text-orange-400 animate-pulse" />
                  <span className="text-white font-semibold">
                    {unvalidatedCount} nouvelle{unvalidatedCount > 1 ? 's' : ''} info{unvalidatedCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <button
                onClick={() => { setEditingInfo(null); setShowCreateModal(true); }}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Info
              </button>
            </div>
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {infos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center"
                >
                  <Info className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">Aucune information pour le moment</p>
                </motion.div>
              ) : (
                infos.map((info) => (
                  <InfoCard
                    key={info.id}
                    info={info}
                    user={user}
                    isAdmin={isAdmin}
                    onEdit={(i) => { setEditingInfo(i); setShowCreateModal(true); }}
                    onDelete={async (id) => {
                      if (window.confirm('Supprimer cette information ?')) {
                        await infosService.deleteInfo(id, user);
                      }
                    }}
                    onValidate={async (id) => await infosService.validateInfo(id, user.uid)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {showCreateModal && (
            <CreateInfoModal
              info={editingInfo}
              user={user}
              onClose={() => { setShowCreateModal(false); setEditingInfo(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

const InfoCard = ({ info, user, isAdmin, onEdit, onDelete, onValidate }) => {
  const isAuthor = info.authorId === user.uid;
  const isValidated = info.validatedBy?.[user.uid];
  const canEdit = isAdmin || isAuthor;
  const canDelete = isAdmin || isAuthor;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white/10 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
        isValidated ? 'border-white/20' : 'border-purple-400/50 shadow-lg shadow-purple-500/20'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* ✅ AVATAR AVEC PHOTO DE PROFIL */}
          {info.authorAvatar ? (
            <img 
              src={info.authorAvatar} 
              alt={info.authorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-purple-500/50">
              {info.authorName?.charAt(0) || '?'}
            </div>
          )}
          
          <div>
            <p className="text-white font-semibold">{info.authorName}</p>
            <p className="text-white/40 text-sm">
              {info.createdAt?.toDate?.()?.toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button onClick={() => onEdit(info)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Edit className="w-4 h-4 text-white/60" />
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(info.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {info.text && <p className="text-white mb-4 whitespace-pre-wrap">{info.text}</p>}

      {info.media && (
        <div className="mb-4 rounded-xl overflow-hidden">
          {info.media.type === 'image' ? (
            <img src={info.media.url} alt="Image" className="w-full max-h-96 object-contain bg-black/20" />
          ) : (
            <video src={info.media.url} controls className="w-full max-h-96 bg-black/20" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Eye className="w-4 h-4" />
          <span>{info.validationCount || 0} vue{info.validationCount > 1 ? 's' : ''}</span>
        </div>

        {!isValidated ? (
          <button
            onClick={() => onValidate(info.id)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300"
          >
            <Check className="w-4 h-4" />
            Marquer comme vu
          </button>
        ) : (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Validé</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CreateInfoModal = ({ info, user, onClose }) => {
  const [text, setText] = useState(info?.text || '');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(info?.media?.url || null);
  const [fileType, setFileType] = useState(info?.media?.type || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Seules les images et vidéos sont acceptées');
      return;
    }

    console.log('📤 Fichier sélectionné:', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    setFile(selectedFile);
    setFileType(isVideo ? 'video' : 'image');
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file && !info?.media) {
      setError('Veuillez ajouter du texte ou un fichier');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus('');
      setError('');

      console.log('🚀 [MODAL] Début de la soumission');

      let mediaData = info?.media || null;

      // Upload du fichier si présent
      if (file) {
        console.log('📤 [MODAL] Upload du fichier...');
        setUploadStatus('Upload du fichier en cours...');
        
        try {
          mediaData = await infosService.uploadFile(file, user.uid, (progress) => {
            console.log('📊 [MODAL] Progression:', progress.toFixed(1) + '%');
            setUploadProgress(progress);
          });
          
          console.log('✅ [MODAL] Upload terminé:', mediaData);
          setUploadStatus('Fichier uploadé, création de l\'information...');
        } catch (uploadError) {
          console.error('❌ [MODAL] Erreur upload fichier:', uploadError);
          throw new Error('Erreur lors de l\'upload du fichier: ' + uploadError.message);
        }
      }

      // Création ou mise à jour de l'info
      console.log('💾 [MODAL] Sauvegarde dans Firestore...');
      setUploadStatus('Enregistrement de l\'information...');

      try {
        if (info) {
          console.log('✏️ [MODAL] Mise à jour info:', info.id);
          await infosService.updateInfo(info.id, { text: text.trim(), media: mediaData }, user);
        } else {
          console.log('➕ [MODAL] Création nouvelle info');
          await infosService.createInfo({ text: text.trim(), media: mediaData }, user);
        }
        
        console.log('✅ [MODAL] Information enregistrée avec succès');
        setUploadStatus('Terminé !');
        
        // Petit délai pour montrer le succès
        setTimeout(() => {
          onClose();
        }, 500);
        
      } catch (firestoreError) {
        console.error('❌ [MODAL] Erreur Firestore:', firestoreError);
        throw new Error('Erreur lors de l\'enregistrement: ' + firestoreError.message);
      }

    } catch (error) {
      console.error('❌ [MODAL] Erreur globale:', error);
      setError(error.message || 'Erreur lors de la soumission');
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={uploading ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-purple-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {info ? 'Modifier l\'information' : 'Nouvelle information'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
            disabled={uploading}
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-white/80 mb-2 font-semibold">Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez votre information ici..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors resize-none"
            rows={6}
            disabled={uploading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-white/80 mb-2 font-semibold">Fichier (optionnel)</label>
          
          {filePreview ? (
            <div className="relative rounded-xl overflow-hidden bg-black/20">
              {fileType === 'image' ? (
                <img src={filePreview} alt="Preview" className="w-full max-h-64 object-contain" />
              ) : (
                <video src={filePreview} controls className="w-full max-h-64" />
              )}
              {!uploading && (
                <button
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                    setFileType(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-white/10 border-2 border-dashed border-white/30 hover:border-purple-400 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-12 h-12 text-white/60" />
              <p className="text-white/80 font-semibold">Cliquez pour ajouter une image ou vidéo</p>
              <p className="text-white/40 text-sm">Aucune limite de taille</p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* BARRE DE PROGRESSION */}
        {uploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm font-semibold">{uploadStatus || 'Préparation...'}</span>
              {uploadProgress > 0 && (
                <span className="text-purple-400 text-sm font-bold">{Math.round(uploadProgress)}%</span>
              )}
            </div>
            
            {uploadProgress > 0 && (
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
            
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Ne fermez pas cette fenêtre...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-200 text-sm font-semibold mb-1">Erreur</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || (!text.trim() && !file && !info?.media)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {info ? 'Mettre à jour' : 'Publier'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfosPage;
