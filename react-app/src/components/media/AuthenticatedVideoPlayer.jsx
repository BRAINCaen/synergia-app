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
  ExternalLink,
  RotateCcw,
  Download
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
  poster = null,
  onLoadError = null,
  onLoadSuccess = null
}) => {
  const [authenticatedUrl, setAuthenticatedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

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
          if (onLoadSuccess) onLoadSuccess(videoUrl);
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
        const authenticatedVideoUrl = `${videoUrl}${separator}auth=${token}`;
        
        console.log('🎬 URL vidéo authentifiée créée');
        
        setAuthenticatedUrl(authenticatedVideoUrl);
        setLoading(false);
        if (onLoadSuccess) onLoadSuccess(authenticatedVideoUrl);
        
      } catch (error) {
        console.error('❌ Erreur création URL authentifiée:', error);
        setError(error.message);
        setLoading(false);
        if (onLoadError) onLoadError(error);
      }
    };

    createAuthenticatedUrl();
  }, [videoUrl, onLoadError, onLoadSuccess]);

  // ✅ Gestion des événements vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      console.log('✅ Métadonnées vidéo chargées, durée:', video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleError = (e) => {
      console.error('❌ Erreur lecture vidéo:', e);
      setError('Erreur de lecture vidéo');
      if (onLoadError) onLoadError(e);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
    };
  }, [authenticatedUrl, onLoadError]);

  // ✅ Masquer les contrôles automatiquement
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isFullscreen) {
        setShowControls(false);
      }
    }, 3000);
  };

  // ✅ Contrôles de lecture
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    resetControlsTimeout();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    resetControlsTimeout();
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    if (newVolume === 0) {
      video.muted = true;
    } else if (video.muted) {
      video.muted = false;
    }
    resetControlsTimeout();
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    
    video.currentTime = newTime;
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
    setIsFullscreen(!isFullscreen);
    resetControlsTimeout();
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const retryLoad = () => {
    setError(null);
    setLoading(true);
    
    // Forcer un nouveau chargement
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  };

  const downloadVideo = () => {
    if (authenticatedUrl) {
      const link = document.createElement('a');
      link.href = authenticatedUrl;
      link.download = 'video.mp4';
      link.click();
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className={`relative bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Chargement de la vidéo...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className={`relative bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-white text-sm mb-4">Erreur: {error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={retryLoad}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" />
              Réessayer
            </button>
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Lecteur vidéo
  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Vidéo */}
      <video
        ref={videoRef}
        src={authenticatedUrl}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onLoadStart={() => console.log('🎬 Début du chargement vidéo')}
        onCanPlay={() => console.log('✅ Vidéo prête à être lue')}
      />

      {/* Contrôles personnalisés */}
      {controls && (
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Bouton play central */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition-all"
              >
                <Play className="w-8 h-8 ml-1" />
              </button>
            </div>
          )}

          {/* Barre de contrôles en bas */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-4">
            {/* Barre de progression */}
            <div 
              className="w-full h-1 bg-gray-600 rounded-full mb-3 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button onClick={togglePlay} className="hover:text-red-400 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="hover:text-red-400 transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-full outline-none slider"
                  />
                </div>

                {/* Temps */}
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Télécharger */}
                <button 
                  onClick={downloadVideo}
                  className="hover:text-red-400 transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>

                {/* Plein écran */}
                <button 
                  onClick={toggleFullscreen}
                  className="hover:text-red-400 transition-colors"
                  title="Plein écran"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedVideoPlayer;
