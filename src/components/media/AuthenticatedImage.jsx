// ==========================================
// 📁 react-app/src/components/media/AuthenticatedImage.jsx
// IMAGE AUTHENTIFIÉE FIREBASE STORAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { 
  ImageIcon, 
  Loader, 
  AlertTriangle,
  ExternalLink,
  Maximize2 
} from 'lucide-react';

/**
 * 🖼️ IMAGE AUTHENTIFIÉE FIREBASE
 */
const AuthenticatedImage = ({ 
  imageUrl, 
  alt = "Image", 
  className = "",
  onClick = null,
  showControls = true
}) => {
  const [authenticatedUrl, setAuthenticatedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Créer une URL authentifiée pour Firebase Storage
  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    const createAuthenticatedUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Si c'est déjà une URL avec token, l'utiliser directement
        if (imageUrl.includes('token=') || !imageUrl.includes('firebasestorage.googleapis.com')) {
          setAuthenticatedUrl(imageUrl);
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
        const separator = imageUrl.includes('?') ? '&' : '?';
        const authenticatedUrlWithToken = `${imageUrl}${separator}auth=${token}`;
        
        console.log('🖼️ URL image authentifiée créée');
        
        setAuthenticatedUrl(authenticatedUrlWithToken);
        setLoading(false);

      } catch (error) {
        console.error('❌ Erreur création URL image authentifiée:', error);
        setError('Impossible de charger l\'image');
        setLoading(false);
      }
    };

    createAuthenticatedUrl();
  }, [imageUrl]);

  // ✅ Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    if (authenticatedUrl) {
      window.open(authenticatedUrl, '_blank');
    }
  };

  // ✅ Ouvrir en modal/zoom
  const handleImageClick = () => {
    if (onClick) {
      onClick(authenticatedUrl);
    } else {
      openInNewTab();
    }
  };

  // ✅ État de chargement
  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Chargement de l'image...</p>
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
          {imageUrl && (
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
    <div className={`relative group rounded-lg overflow-hidden ${className}`}>
      
      {/* ✅ Image */}
      <img
        src={authenticatedUrl}
        alt={alt}
        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleImageClick}
        onLoad={() => console.log('✅ Image chargée avec succès')}
        onError={(e) => {
          console.error('❌ Erreur chargement image:', e);
          setError('Erreur de chargement de l\'image');
        }}
      />

      {/* ✅ Contrôles (si activés) */}
      {showControls && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
          
          {/* Indicateur de type */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span>Image</span>
          </div>

          {/* Contrôles en overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleImageClick}
              className="bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all"
              title="Agrandir l'image"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Bouton nouvel onglet */}
          <button
            onClick={openInNewTab}
            className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-1.5 rounded hover:bg-opacity-80 transition-all opacity-0 group-hover:opacity-100"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthenticatedImage;
