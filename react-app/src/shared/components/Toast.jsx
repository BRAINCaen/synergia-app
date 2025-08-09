// ==========================================
// 📁 react-app/src/shared/components/Toast.jsx
// COMPOSANT TOAST POUR NOTIFICATIONS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * 🍞 SYSTÈME DE NOTIFICATIONS TOAST
 */
class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
    this.nextId = 1;
  }

  show(message, type = 'info', duration = 4000) {
    const toast = {
      id: this.nextId++,
      message,
      type,
      duration,
      timestamp: Date.now()
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto-remove après duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }

    return toast.id;
  }

  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback([...this.toasts]));
  }

  // Méthodes de convenance
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Instance singleton
const toastManager = new ToastManager();

/**
 * 🎨 COMPOSANT TOAST INDIVIDUAL
 */
const ToastItem = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50';
      case 'error':
        return 'bg-red-500/20 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 border-blue-500/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className={`${getBackgroundColor()} backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-sm w-full`}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-white text-sm font-medium flex-1">
          {toast.message}
        </p>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * 📱 COMPOSANT CONTENEUR TOAST
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const handleRemove = (id) => {
    toastManager.remove(id);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={handleRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * 🎯 COMPOSANT TOAST PRINCIPAL
 */
const Toast = () => {
  return <ToastContainer />;
};

// Attacher les méthodes statiques au composant
Toast.show = toastManager.show.bind(toastManager);
Toast.success = toastManager.success.bind(toastManager);
Toast.error = toastManager.error.bind(toastManager);
Toast.warning = toastManager.warning.bind(toastManager);
Toast.info = toastManager.info.bind(toastManager);
Toast.remove = toastManager.remove.bind(toastManager);
Toast.clear = toastManager.clear.bind(toastManager);

export default Toast;
