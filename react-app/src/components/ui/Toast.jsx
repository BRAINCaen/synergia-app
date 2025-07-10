// ==========================================
// 📁 react-app/src/shared/components/ui/Toast.jsx
// SYSTÈME DE NOTIFICATIONS TOAST COMPLET
// ==========================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// Context pour les toasts
const ToastContext = createContext();

/**
 * 🎯 HOOK useToast
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * 🎨 COMPOSANT Toast individuel
 */
const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-500 border-green-400',
    error: 'bg-red-500 border-red-400',
    warning: 'bg-yellow-500 border-yellow-400',
    info: 'bg-blue-500 border-blue-400'
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      layout
      className={`
        ${colors[toast.type]} 
        text-white p-4 rounded-lg shadow-lg border-l-4 
        max-w-md w-full backdrop-blur-sm
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {toast.title && (
              <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
            )}
            <p className="text-sm opacity-90">{toast.message}</p>
            {toast.description && (
              <p className="text-xs opacity-75 mt-1">{toast.description}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-3 flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Barre de progression pour l'auto-dismiss */}
      {toast.duration && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
        />
      )}
    </motion.div>
  );
};

/**
 * 🎯 PROVIDER ToastProvider
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Ajouter un toast
  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove après duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  // Supprimer un toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Supprimer tous les toasts
  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Fonctions de convenance
  const success = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      ...options
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      duration: 7000, // Erreurs restent plus longtemps
      ...options
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      ...options
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Container des toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

/**
 * 🎯 COMPOSANT ToastContainer (pour compatibilité)
 */
export const ToastContainer = () => {
  // Ce composant est maintenant inclus dans ToastProvider
  return null;
};

export default ToastProvider;
