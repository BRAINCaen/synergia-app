// ==========================================
// 📁 react-app/src/shared/components/ToastNotification.jsx
// Système de notifications toast moderne
// ==========================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Contexte pour les toasts
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
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    textColor: 'text-green-800'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    textColor: 'text-yellow-800'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800'
  }
};

// Composant Toast individuel
const Toast = ({ toast, onClose }) => {
  const config = TOAST_TYPES[toast.type];
  const Icon = config.icon;

  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md w-full
      ${config.bgColor} ${config.borderColor}
      transform transition-all duration-300 ease-in-out
      hover:scale-105
    `}>
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className={`font-medium ${config.textColor} mb-1`}>
            {toast.title}
          </h4>
        )}
        <p className={`text-sm ${config.textColor} ${toast.title ? 'opacity-90' : ''}`}>
          {toast.message}
        </p>
      </div>
      
      <button
        onClick={() => onClose(toast.id)}
        className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${config.textColor}`}
      >
        <X className="h-4 w-4" />
      </button>
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
      duration: options.duration || 5000
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

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

// Export du hook principal
export default useToast;

// ==========================================
// 📁 react-app/src/shared/stores/notificationStore.js  
// Store Zustand pour notifications (optionnel)
// ==========================================

import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  
  addNotification: (type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration || 5000,
      timestamp: new Date()
    };
    
    set(state => ({
      notifications: [...state.notifications, notification]
    }));
    
    // Auto-remove
    if (notification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration);
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearAll: () => {
    set({ notifications: [] });
  },
  
  // Méthodes de convenance
  success: (message, options) => get().addNotification('success', message, options),
  error: (message, options) => get().addNotification('error', message, options),
  warning: (message, options) => get().addNotification('warning', message, options),
  info: (message, options) => get().addNotification('info', message, options)
}));
