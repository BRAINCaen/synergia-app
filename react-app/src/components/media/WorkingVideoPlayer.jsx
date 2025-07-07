// ==========================================
// 📁 react-app/src/components/media/WorkingVideoPlayer.jsx
// LECTEUR VIDÉO QUI FONCTIONNE VRAIMENT AVEC FIREBASE STORAGE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Loader, 
  AlertTriangle,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';

/**
 * 🎬 LECTEUR VIDÉO QUI FONCTIONNE AVEC FIREBASE
 */
const WorkingVideoPlayer = ({ 
  videoUrl, 
  className = "",
  controls = true
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const videoRef = useRef(null);

  // ✅ Télécharger et convertir la vidéo en blob
  useEffect(() => {
    if (!videoUrl) {
      setLoading(false);
      return;
    }

    const downloadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        setDownloadProgress(0);

        console.log('🎬 Téléchargement vidéo Firebase:', videoUrl);

        // ✅ Obtenir le token Firebase
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        const token = await user.getIdToken();
        
        // ✅ Ajouter le token à l'URL
        const separator = videoUrl.includes('?') ? '&' : '?';
        const authenticatedUrl = `${videoUrl}${separator}auth=${token}`;

        // ✅ Télécharger avec fetch et suivi du progrès
        const response = await fetch(authenticatedUrl);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          loaded += value.length;
          
          if (total) {
            const progress = Math.round((loaded / total) * 100);
            setDownloadProgress(progress);
          }
        }

        // ✅ Créer un blob à partir des chunks
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);
        
        console.log('✅ Vidéo téléchargée et convertie en blob');
        setBlobUrl(blobUrl);
        setLoading(false);

      } catch (error) {
        console.error('❌ Erreur téléchargement vidéo:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    downloadVideo();

    // ✅ Nettoyer le blob URL au démontage
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [videoUrl]);

  // ✅ Réessayer le téléchargement
  const retryDownload = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setError(null);
    setDownloadProgress(0);
    // Le useEffect se redéclenchera
  };

  // ✅ Télécharger le fichier
  const downloadFile = () => {
    if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `video_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // ✅ Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  // ✅ État de chargement
  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-gray-600 text-sm mb-2">
          Téléchargement de la vidéo...
        </p>
        {downloadProgress > 0 && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progression</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ✅ État d'erreur
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
        <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
        <p className="text-red-800 font-medium mb-1">Erreur de chargement</p>
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={retryDownload}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
          <button
            onClick={openInNewTab}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ouvrir le lien
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      
      {/* ✅ Lecteur vidéo avec blob URL */}
      <video
        ref={videoRef}
        src={blobUrl}
        className="w-full h-full object-contain"
        controls={controls}
        preload="metadata"
        onLoadStart={() => console.log('🎬 Début lecture vidéo')}
        onLoadedData={() => console.log('✅ Vidéo prête à jouer')}
        onCanPlay={() => console.log('✅ Vidéo peut être lue')}
        onError={(e) => {
          console.error('❌ Erreur lecture vidéo:', e);
          setError('Erreur de lecture de la vidéo');
        }}
      />

      {/* ✅ Contrôles supplémentaires */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={downloadFile}
          className="bg-black bg-opacity-60 text-white p-1.5 rounded hover:bg-opacity-80 transition-all"
          title="Télécharger la vidéo"
        >
          <Download className="w-3 h-3" />
        </button>
        
        <button
          onClick={openInNewTab}
          className="bg-black bg-opacity-60 text-white p-1.5 rounded hover:bg-opacity-80 transition-all"
          title="Ouvrir dans un nouvel onglet"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* ✅ Indicateur de type */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <Play className="w-3 h-3" />
        <span>Vidéo • Contrôles disponibles</span>
      </div>
    </div>
  );
};

export default WorkingVideoPlayer;
