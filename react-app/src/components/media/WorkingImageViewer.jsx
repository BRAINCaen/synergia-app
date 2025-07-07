// ==========================================
// 📁 react-app/src/components/media/WorkingImageViewer.jsx
// VIEWER D'IMAGE QUI FONCTIONNE AVEC FIREBASE STORAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { 
  ImageIcon, 
  Loader, 
  AlertTriangle,
  ExternalLink,
  Download,
  RefreshCw,
  Maximize2
} from 'lucide-react';

/**
 * 🖼️ VIEWER D'IMAGE QUI FONCTIONNE AVEC FIREBASE
 */
const WorkingImageViewer = ({ 
  imageUrl, 
  alt = "Image", 
  className = "",
  showControls = true
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Télécharger et convertir l'image en blob
  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    const downloadImage = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🖼️ Téléchargement image Firebase:', imageUrl);

        // ✅ Si ce n'est pas une URL Firebase, l'utiliser directement
        if (!imageUrl.includes('firebasestorage.googleapis.com')) {
          setBlobUrl(imageUrl);
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
        
        // ✅ Ajouter le token à l'URL
        const separator = imageUrl.includes('?') ? '&' : '?';
        const authenticatedUrl = `${imageUrl}${separator}auth=${token}`;

        // ✅ Télécharger l'image
        const response = await fetch(authenticatedUrl);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        console.log('✅ Image téléchargée et convertie en blob');
        setBlobUrl(blobUrl);
        setLoading(false);

      } catch (error) {
        console.error('❌ Erreur téléchargement image:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    downloadImage();

    // ✅ Nettoyer le blob URL au démontage
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imageUrl]);

  // ✅ Réessayer le téléchargement
  const retryDownload = () => {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setError(null);
    // Le useEffect se redéclenchera
  };

  // ✅ Télécharger le fichier
  const downloadFile = () => {
    if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // ✅ Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  // ✅ Ouvrir en modal/zoom
  const handleImageClick = () => {
    openInNewTab();
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
    <div className={`relative group rounded-lg overflow-hidden ${className}`}>
      
      {/* ✅ Image avec blob URL */}
      <img
        src={blobUrl}
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
            <span>Image • Cliquer pour agrandir</span>
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

          {/* Contrôles en haut à droite */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={downloadFile}
              className="bg-black bg-opacity-60 text-white p-1.5 rounded hover:bg-opacity-80 transition-all"
              title="Télécharger l'image"
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
        </div>
      )}
    </div>
  );
};

export default WorkingImageViewer;
