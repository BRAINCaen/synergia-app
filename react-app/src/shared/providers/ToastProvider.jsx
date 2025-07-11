// ==========================================
// 📁 react-app/src/shared/providers/ToastProvider.jsx
// Provider de notifications toast - FICHIER MANQUANT CRÉÉ
// ==========================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

// Context pour les toasts
const ToastContext = createContext();

// Types de toast avec leurs styles
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-600',
    borderColor: 'border-green-500',
    iconColor: 'text-green-400'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-600',
    borderColor: 'border-red-500',
    iconColor: 'text-red-400'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-600',
    borderColor: 'border-yellow-500',
    iconColor: 'text-yellow-400'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-400'
  },
  xp: {
    icon: CheckCircle,
    bgColor: 'bg-purple-600',
    borderColor: 'border-purple-500',
    iconColor: 'text-purple-400'
  }
};

// Hook pour utiliser les toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback si pas dans un provider
    return {
      success: (msg) => console.log('✅ Toast:', msg),
      error: (msg) => console.error('❌ Toast:', msg),
      warning: (msg) => console.warn('⚠️ Toast:', msg),
      info: (msg) => console.info('ℹ️ Toast:', msg),
      xp: (amount, source) => console.log(`🌟 +${amount} XP - ${source}`)
    };
  }
  return context;
};

// Composant Toast individuel
const Toast = ({ toast, onClose }) => {
  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out animate-in slide-in-from-right-5`}>
      <div className="flex items-start space-x-3">
        <Icon className={`${config.iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-white font-medium text-sm mb-1 flex items-center">
              {toast.title}
              {toast.type === 'xp' && toast.xpAmount && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded text-xs">
                  +{toast.xpAmount} XP
                </span>
              )}
            </h4>
          )}
          <p className="text-white/90 text-sm">
            {toast.message}
          </p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-white underline text-sm hover:no-underline transition-all"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onClose(toast.id)}
          className="text-white/70 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Container des toasts
const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
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
      action: options.action,
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

export default ToastProvider;
