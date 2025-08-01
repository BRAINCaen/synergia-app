// ==========================================
// 📁 react-app/src/shared/components/ToastNotification.jsx
// BACKUP VERSION - Provider de notifications existant étendu
// ==========================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X, Star } from 'lucide-react';

// Context pour les toasts
const ToastContext = createContext();

// Configuration des types de toast
const toastConfigs = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-500'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-600', 
    textColor: 'text-white',
    borderColor: 'border-red-500'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-600',
    textColor: 'text-white', 
    borderColor: 'border-yellow-500'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-500'
  },
  xp: {
    icon: Star,
    bgColor: 'bg-purple-600',
    textColor: 'text-white',
    borderColor: 'border-purple-500'
  }
};

// Hook pour utiliser les toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback pour compatibilité
    console.warn('⚠️ useToast utilisé en dehors du ToastProvider, fallback activé');
    return {
      success: (message) => console.log('✅', message),
      error: (message) => console.error('❌', message),
      warning: (message) => console.warn('⚠️', message),
      info: (message) => console.info('ℹ️', message),
      xp: (amount, source) => console.log(`🌟 +${amount} XP - ${source}`)
    };
  }
  return context;
};

// Composant Toast individuel
const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = toastConfigs[toast.type] || toastConfigs.info;
  const Icon = config.icon;

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-dismiss
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(toast.id), 300);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${config.bgColor} border ${config.borderColor} text-white px-6 py-4 rounded-lg shadow-lg border flex items-start space-x-3 max-w-sm`}
      >
        <span className="text-xl flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-semibold text-sm mb-1 flex items-center">
              {toast.title}
              {toast.type === 'xp' && toast.xpAmount && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded text-xs">
                  +{toast.xpAmount} XP
                </span>
              )}
            </h4>
          )}
          <p className={`text-sm ${toast.title ? 'opacity-90' : ''}`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${config.textColor}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Conteneur des toasts
const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Provider principal
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration || 5000,
      xpAmount: options.xpAmount
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Méthodes de convenance
  const success = useCallback((message, options) => 
    addToast('success', message, options), [addToast]);
  
  const error = useCallback((message, options) => 
    addToast('error', message, options), [addToast]);
  
  const warning = useCallback((message, options) => 
    addToast('warning', message, options), [addToast]);
  
  const info = useCallback((message, options) => 
    addToast('info', message, options), [addToast]);

  const xp = useCallback((amount, source = 'Action', options = {}) => 
    addToast('xp', `Vous avez gagné ${amount} XP !`, { 
      title: source, 
      xpAmount: amount, 
      ...options 
    }), [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    xp
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

// Export par défaut
export default ToastProvider;
