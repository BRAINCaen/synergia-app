// ===================================================================
// 🍞 AMÉLIORATION DU SYSTÈME TOAST EXISTANT
// Fichier: react-app/src/shared/components/ui/Toast.jsx
// ===================================================================

import React, { useState, useEffect, createContext, useContext } from 'react';

// Context pour les toasts globaux
const ToastContext = createContext();

// Composant Toast amélioré (garde votre base existante)
const Toast = ({ message, type = 'success', duration = 3000, onClose, title, xpAmount }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      case 'info':
        return 'bg-blue-600 border-blue-500';
      case 'xp':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500';
      default:
        return 'bg-green-600 border-green-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'xp':
        return '🎯';
      default:
        return '✅';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${getTypeStyles()} text-white px-6 py-4 rounded-lg shadow-lg border flex items-start space-x-3 max-w-sm`}
      >
        <span className="text-xl flex-shrink-0 mt-0.5">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1 flex items-center">
              {title}
              {type === 'xp' && xpAmount && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded text-xs">
                  +{xpAmount} XP
                </span>
              )}
            </h4>
          )}
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:text-gray-200 text-xl leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Provider global pour les toasts (nouveau)
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'success',
      duration: 3000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // API de toasts améliorée
  const toast = {
    success: (title, message, options = {}) => 
      addToast({ type: 'success', title, message, duration: 3000, ...options }),
    
    error: (title, message, options = {}) => 
      addToast({ type: 'error', title, message, duration: 6000, ...options }),
    
    warning: (title, message, options = {}) => 
      addToast({ type: 'warning', title, message, duration: 5000, ...options }),
    
    info: (title, message, options = {}) => 
      addToast({ type: 'info', title, message, duration: 4000, ...options }),

    // Nouveau : Toast spécial pour XP
    xp: (xpAmount, source = 'Action', options = {}) => 
      addToast({ 
        type: 'xp', 
        title: `+${xpAmount} XP gagnés !`, 
        message: source,
        xpAmount,
        duration: 3000,
        ...options 
      }),

    // Toast simple (compatibilité avec votre version existante)
    simple: (message, type = 'success', duration = 3000) =>
      addToast({ message, type, duration }),
    
    // Actions de gestion
    remove: removeToast,
    clear: clearAllToasts
  };

  // Container des toasts
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message || toast.title}
          title={toast.title}
          type={toast.type}
          duration={toast.duration}
          xpAmount={toast.xpAmount}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook amélioré pour utiliser les toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  
  // Si utilisé dans un Provider, retourner le context
  if (context) {
    return context;
  }
  
  // Sinon, retourner votre version locale existante (compatibilité)
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    addToast,
    ToastContainer,
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
    
    // Nouvelles méthodes
    xp: (xpAmount, source = 'Action') => 
      addToast(`+${xpAmount} XP • ${source}`, 'xp', 3000)
  };
};

export default Toast;
