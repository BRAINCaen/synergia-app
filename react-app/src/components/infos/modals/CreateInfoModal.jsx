// ==========================================
// components/infos/modals/CreateInfoModal.jsx
// MODAL CREATION/EDITION INFORMATION
// ==========================================

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, Upload, AlertCircle, Loader, Send, Camera, Video
} from 'lucide-react';
import infosService from '../../../core/services/infosService.js';

const CreateInfoModal = ({ info, user, onClose }) => {
  const [text, setText] = useState(info?.text || '');
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState(info?.mediaList?.map(m => ({ url: m.url, type: m.type })) || (info?.media ? [{ url: info.media.url, type: info.media.type }] : []));
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validFiles = [];
    const newPreviews = [];

    selectedFiles.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        console.warn('Fichier ignore (type non supporte):', file.name);
        return;
      }

      console.log('Fichier selectionne:', {
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });

      validFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          url: e.target.result,
          type: isVideo ? 'video' : 'image',
          name: file.name
        });
        if (newPreviews.length === validFiles.length) {
          setFilePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length === 0) {
      setError('Seules les images et videos sont acceptees');
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && files.length === 0 && filePreviews.length === 0) {
      setError('Veuillez ajouter du texte ou au moins un fichier');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus('');
      setError('');

      console.log('[MODAL] Debut de la soumission');

      let mediaList = info?.mediaList || (info?.media ? [info.media] : []);

      if (files.length > 0) {
        console.log(`[MODAL] Upload de ${files.length} fichier(s)...`);

        const uploadedMedia = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadStatus(`Upload ${i + 1}/${files.length}: ${file.name}`);

          try {
            const mediaData = await infosService.uploadFile(file, user.uid, (progress) => {
              const globalProgress = ((i / files.length) + (progress / 100 / files.length)) * 100;
              setUploadProgress(globalProgress);
            });
            uploadedMedia.push(mediaData);
            console.log(`[MODAL] Fichier ${i + 1} uploade:`, mediaData.filename);
          } catch (uploadError) {
            console.error(`[MODAL] Erreur upload fichier ${i + 1}:`, uploadError);
            throw new Error(`Erreur upload "${file.name}": ${uploadError.message}`);
          }
        }

        mediaList = [...mediaList, ...uploadedMedia];
        setUploadProgress(100);
        setUploadStatus('Fichiers uploades, enregistrement...');
      }

      console.log('[MODAL] Sauvegarde dans Firestore...');
      setUploadStatus('Enregistrement de l\'information...');

      try {
        const infoData = {
          text: text.trim(),
          media: mediaList[0] || null,
          mediaList: mediaList.length > 0 ? mediaList : null
        };

        if (info) {
          console.log('[MODAL] Mise a jour info:', info.id);
          await infosService.updateInfo(info.id, infoData, user);
        } else {
          console.log('[MODAL] Creation nouvelle info');
          await infosService.createInfo(infoData, user);
        }

        console.log('[MODAL] Information enregistree avec succes');
        setUploadStatus('Termine !');

        setTimeout(() => {
          onClose();
        }, 500);

      } catch (firestoreError) {
        console.error('[MODAL] Erreur Firestore:', firestoreError);
        throw new Error('Erreur lors de l\'enregistrement: ' + firestoreError.message);
      }

    } catch (error) {
      console.error('[MODAL] Erreur globale:', error);
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={uploading ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-purple-950 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            {info ? 'Modifier l\'information' : 'Nouvelle information'}
          </h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </motion.button>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-300 mb-2 font-semibold text-sm sm:text-base">Message</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ecrivez votre information ici..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none text-sm sm:text-base"
            rows={5}
            disabled={uploading}
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-300 mb-2 font-semibold text-sm sm:text-base">
            Fichiers (optionnel) {filePreviews.length > 0 && <span className="text-purple-400">({filePreviews.length})</span>}
          </label>

          {filePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {filePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-black/20 group">
                  {preview.type === 'image' ? (
                    <img src={preview.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <video src={preview.url} className="w-full h-full object-cover" />
                  )}
                  {!uploading && (
                    <motion.button
                      onClick={() => removeFile(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                  {preview.type === 'video' && (
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                      Video
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl p-3 sm:p-4 flex flex-col items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-xs sm:text-sm font-medium">Photo</span>
            </button>

            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl p-3 sm:p-4 flex flex-col items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-xs sm:text-sm font-medium">Video</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl p-3 sm:p-4 flex flex-col items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-xs sm:text-sm font-medium">Galerie</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
            multiple
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-xs sm:text-sm font-semibold">{uploadStatus || 'Preparation...'}</span>
              {uploadProgress > 0 && (
                <span className="text-purple-400 text-xs sm:text-sm font-bold">{Math.round(uploadProgress)}%</span>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span>Ne fermez pas cette fenetre...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1">Erreur</p>
                <p className="text-red-200/80 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <motion.button
            onClick={onClose}
            disabled={uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-white/10 hover:bg-white/15 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Annuler
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            disabled={uploading || (!text.trim() && files.length === 0 && filePreviews.length === 0)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">En cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                {info ? 'Mettre a jour' : 'Publier'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateInfoModal;
