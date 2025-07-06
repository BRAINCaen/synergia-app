// ==========================================
// 📁 react-app/src/components/media/AuthenticatedMediaViewer.jsx
// VIEWER UNIFIÉ POUR IMAGES ET VIDÉOS AVEC AUTHENTIFICATION FIREBASE
// ==========================================

import React from 'react';
import AuthenticatedVideoPlayer from './AuthenticatedVideoPlayer.jsx';
import AuthenticatedImage from './AuthenticatedImage.jsx';
import { FileImage, Video, AlertTriangle } from 'lucide-react';

/**
 * 🎬🖼️ VIEWER UNIFIÉ POUR MÉDIAS AUTHENTIFIÉS
 */
const AuthenticatedMediaViewer = ({ 
  mediaUrl, 
  mediaType = null,
  className = "",
  controls = true,
  showControls = true,
  autoDetectType = true,
  fallbackComponent = null
}) => {

  // ✅ Détection automatique du type de média
  const detectMediaType = (url) => {
    if (!url) return null;
    
    const lowercaseUrl = url.toLowerCase();
    
    // Extensions vidéo
    if (lowercaseUrl.includes('.mp4') || 
        lowercaseUrl.includes('.mov') || 
        lowercaseUrl.includes('.avi') || 
        lowercaseUrl.includes('.webm') || 
        lowercaseUrl.includes('.mkv') ||
        lowercaseUrl.includes('video/')) {
      return 'video';
    }
    
    // Extensions image
    if (lowercaseUrl.includes('.jpg') || 
        lowercaseUrl.includes('.jpeg') || 
        lowercaseUrl.includes('.png') || 
        lowercaseUrl.includes('.gif') || 
        lowercaseUrl.includes('.webp') || 
        lowercaseUrl.includes('.bmp') ||
        lowercaseUrl.includes('image/')) {
      return 'image';
    }
    
    // Par défaut, supposer que c'est une image
    return 'image';
  };

  // ✅ Déterminer le type de média
  const finalMediaType = mediaType || (autoDetectType ? detectMediaType(mediaUrl) : 'image');

  // ✅ Pas d'URL fournie
  if (!mediaUrl) {
    return fallbackComponent || (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileImage className="w-6 h-6 text-gray-400" />
          <Video className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500">Aucun média fourni</p>
      </div>
    );
  }

  // ✅ Affichage conditionnel selon le type
  if (finalMediaType === 'video') {
    return (
      <AuthenticatedVideoPlayer
        videoUrl={mediaUrl}
        className={className}
        controls={controls}
        autoPlay={false}
        muted={true}
      />
    );
  } else if (finalMediaType === 'image') {
    return (
      <AuthenticatedImage
        imageUrl={mediaUrl}
        alt="Média de tâche"
        className={className}
        showControls={showControls}
      />
    );
  } else {
    // ✅ Type non supporté
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center ${className}`}>
        <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-yellow-800 font-medium mb-1">Type de média non supporté</p>
        <p className="text-yellow-600 text-sm mb-3">Type détecté: {finalMediaType}</p>
        <a 
          href={mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
        >
          Ouvrir le fichier
        </a>
      </div>
    );
  }
};

/**
 * 🎬 COMPOSANT SPÉCIALISÉ POUR LES TÂCHES
 */
export const TaskMediaViewer = ({ task, className = "" }) => {
  // ✅ Priorité aux nouveaux champs, fallback sur les anciens
  const mediaUrl = task.mediaUrl || task.photoUrl;
  const mediaType = task.mediaType || (task.photoUrl ? 'image' : null);
  const hasMedia = task.hasMedia || task.hasPhoto;

  if (!hasMedia || !mediaUrl) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileImage className="w-6 h-6 text-gray-400" />
          <Video className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500">Aucun média fourni</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
        {mediaType === 'video' ? (
          <>
            <Video className="w-4 h-4" />
            🎥 Vidéo de preuve
          </>
        ) : (
          <>
            <FileImage className="w-4 h-4" />
            📸 Photo de preuve
          </>
        )}
      </h4>
      
      <AuthenticatedMediaViewer
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        className="w-full max-h-64 rounded-lg border border-gray-300"
      />
      
      {/* Informations supplémentaires */}
      <div className="mt-2 text-xs text-gray-500">
        {task.mediaMethod && (
          <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
            📡 {task.mediaMethod === 'firebase' ? 'Firebase Storage' : 
                task.mediaMethod === 'external' ? 'Lien externe' : 
                task.mediaMethod}
          </span>
        )}
        
        {task.mediaSize && (
          <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
            📁 {task.mediaSize}
          </span>
        )}
        
        {task.submittedAt && (
          <span className="inline-block bg-gray-100 px-2 py-1 rounded">
            📅 {new Date(task.submittedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default AuthenticatedMediaViewer;
