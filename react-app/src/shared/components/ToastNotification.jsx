// ==========================================
// 📁 react-app/src/shared/components/ToastNotification.jsx
// Système de notifications toast complet
// ==========================================

import React, { useState, useEffect, createContext, useContext } from 'react';

// Context pour les toasts
const ToastContext = createContext();

// Hook pour utiliser les toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Types de toast
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  XP: 'xp'
};

// Configuration des toasts
const TOAST_CONFIG = {
  [TOAST_TYPES.SUCCESS]: {
    icon: '✅',
    bgColor: 'bg-green-600',
    borderColor: 'border-green-500',
    duration: 4000
  },
  [TOAST_TYPES.ERROR]: {
    icon: '❌',
    bgColor: 'bg-red-600',
    borderColor: 'border-red-500',
    duration: 6000
  },
  [TOAST_TYPES.WARNING]: {
    icon: '⚠️',
    bgColor: 'bg-orange-600',
    borderColor: 'border-orange-500',
    duration: 5000
  },
  [TOAST_TYPES.INFO]: {
    icon: 'ℹ️',
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-500',
    duration: 4000
  },
  [TOAST_TYPES.XP]: {
    icon: '🎯',
    bgColor: 'bg-purple-600',
    borderColor: 'border-purple-500',
    duration: 3000
  }
};

// Composant Toast individuel
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG[TOAST_TYPES.INFO];

  useEffect(() => {
    // Animation d'entrée
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto-suppression
    const removeTimer = setTimeout(() => {
      handleRemove();
    }, config.duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [config.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg p-4 mb-3 max-w-sm
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icône */}
        <span className="text-xl flex-shrink-0 mt-0.5">
          {config.icon}
        </span>
        
        {/* Contenu */}
        <div className="flex-1 text-white">
          {toast.title && (
            <p className="font-semibold text-sm mb-1">{toast.title}</p>
          )}
          <p className="text-sm opacity-90">{toast.message}</p>
          
          {/* XP gain spécial */}
          {toast.type === TOAST_TYPES.XP && toast.xpGain && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs bg-black bg-opacity-30 px-2 py-1 rounded">
                +{toast.xpGain} XP
              </span>
              {toast.levelUp && (
                <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">
                  Level Up! 🎉
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Bouton fermer */}
        <button
          onClick={handleRemove}
          className="text-white hover:text-gray-200 text-lg leading-none ml-2"
        >
          ✕
        </button>
      </div>
      
      {/* Barre de progression */}
      <div className="mt-3 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white bg-opacity-30 rounded-full transition-all duration-100 ease-linear"
          style={{
            animation: `toast-progress ${config.duration}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

// Provider des toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type,
      message,
      title: options.title,
      xpGain: options.xpGain,
      levelUp: options.levelUp,
      ...options
    };

    setToasts(prev => [...prev, toast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Méthodes pratiques
  const toast = {
    success: (message, options) => addToast(TOAST_TYPES.SUCCESS, message, options),
    error: (message, options) => addToast(TOAST_TYPES.ERROR, message, options),
    warning: (message, options) => addToast(TOAST_TYPES.WARNING, message, options),
    info: (message, options) => addToast(TOAST_TYPES.INFO, message, options),
    xp: (message, options) => addToast(TOAST_TYPES.XP, message, options)
  };

  const contextValue = {
    toast,
    removeToast,
    clearAllToasts,
    toasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Container des toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
          <div className="pointer-events-auto">
            {toasts.map(toast => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onRemove={removeToast}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Styles CSS pour la barre de progression */}
      <style jsx global>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export { TOAST_TYPES };
