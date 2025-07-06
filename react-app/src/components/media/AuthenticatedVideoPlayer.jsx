// ==========================================
// 📁 react-app/src/components/media/AuthenticatedVideoPlayer.jsx
// LECTEUR VIDÉO QUI FONCTIONNE AVEC FIREBASE STORAGE AUTHENTIFIÉ
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
  ExternalLink 
} from 'lucide-react';

/**
 * 🎬 LECTEUR VIDÉO AUTHENTIFIÉ FIREBASE
 */
const AuthenticatedVideoPlayer = ({ 
  videoUrl, 
  className = "",
  controls = true,
  autoPlay = false,
  muted = false,
  poster = null
}) => {
  const [authenticatedUrl, setAuthenticatedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const videoRef = useRef(null);

  // ✅ Créer une URL authentifiée pour Firebase Storage
  useEffect(() => {
    if (!videoUrl) {
      setLoading(false);
      return;
    }

    const createAuthenticatedUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Si c'est déjà une URL avec token, l'utiliser directement
        if (videoUrl.includes('token=') || !videoUrl.includes('firebasestorage.googleapis.com')) {
          setAuthenticatedUrl(videoUrl);
          setLoading(false);
          return;
        }

        // ✅ Obtenir le token Firebase
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        const token = await user.getIdToken();
        
        // ✅ Ajouter le token à l'URL Firebase Storage
        const separator = videoUrl.includes('?') ? '&' : '?';
        const authenticatedUrlWithToken = `${videoUrl}${separator}auth=${token}`;
        
        console.log('🎬 URL vidéo authentifiée créée');
        
        setAuthenticatedUrl(authenticatedUrlWithToken);
        setLoading(false);

      } catch (error) {
        console.error('❌ Erreur création URL authentifiée:', error);
        setError('Impossible de charger la vidéo');
        setLoading(false);
      }
    };

    createAuthenticatedUrl();
  }, [videoUrl]);

  // ✅ Gestion de la lecture/pause
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // ✅ Gestion du son
  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // ✅ Ouvrir en mode plein écran
  const openFullscreen = () => {
    if (!videoRef.current) return;

    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    } else if (videoRef.current.msRequestFullscreen) {
      videoRef.current.msRequestFullscreen();
    }
  };

  // ✅ Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    if (authenticatedUrl) {
      window.open(authenticatedUrl, '_blank');
    }
  };

  // ✅ État de chargement
  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Chargement de la vidéo...</p>
        </div>
      </div>
    );
  }

  // ✅ État d'erreur
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-800 font-medium mb-1">Erreur de chargement</p>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          {videoUrl && (
            <button
              onClick={openInNewTab}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Ouvrir dans un nouvel onglet
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      
      {/* ✅ Lecteur vidéo */}
      <video
        ref={videoRef}
        src={authenticatedUrl}
        className="w-full h-full object-contain"
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadStart={() => console.log('🎬 Début de chargement vidéo')}
        onLoadedData={() => console.log('✅ Vidéo chargée avec succès')}
        onError={(e) => {
          console.error('❌ Erreur lecture vidéo:', e);
          setError('Erreur de lecture de la vidéo');
        }}
      />

      {/* ✅ Contrôles personnalisés (si pas de contrôles natifs) */}
      {!controls && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
          
          {/* Bouton play/pause central */}
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-60 text-white p-4 rounded-full hover:bg-opacity-80 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          {/* Contrôles en bas */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="bg-black bg-opacity-60 text-white p-2 rounded hover:bg-opacity-80 transition-all"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={openFullscreen}
              className="bg-black bg-opacity-60 text-white p-2 rounded hover:bg-opacity-80 transition-all"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={openInNewTab}
              className="bg-black bg-opacity-60 text-white p-2 rounded hover:bg-opacity-80 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ✅ Indicateur de type de média */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <Play className="w-3 h-3" />
        <span>Vidéo</span>
      </div>

      {/* ✅ Bouton ouverture nouvel onglet */}
      <button
        onClick={openInNewTab}
        className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-1.5 rounded hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100"
        title="Ouvrir dans un nouvel onglet"
      >
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};

export default AuthenticatedVideoPlayer;
