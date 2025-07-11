// src/shared/components/ui/Toast.jsx
// Système de notifications toast complet
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

// Context pour les toasts
const ToastContext = createContext();

// Types de toast
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
  }
};

// Hook pour utiliser les toasts
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans un ToastProvider');
  }
  return context;
};

// Composant Toast individuel
const Toast = ({ toast, onRemove }) => {
  const { icon: Icon, bgColor, borderColor, iconColor } = TOAST_TYPES[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 mb-3 transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-start">
        <Icon className={`${iconColor} w-5 h-5 mr-3 mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-white font-medium text-sm mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-gray-100 text-sm">
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
          onClick={() => onRemove(toast.id)}
          className="text-gray-300 hover:text-white transition-colors ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Container des toasts
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// Provider des toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Ajouter un toast
  const addToast = (type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration || 5000,
      action: options.action
    };

    setToasts(prev => [...prev, toast]);
    return id;
  };

  // Supprimer un toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Méthodes utilitaires
  const toast = {
    success: (message, options) => addToast('success', message, options),
    error: (message, options) => addToast('error', message, options),
    warning: (message, options) => addToast('warning', message, options),
    info: (message, options) => addToast('info', message, options),
    
    // Méthodes spécialisées pour Synergia
    taskCreated: (taskTitle) => addToast('success', `Tâche "${taskTitle}" créée avec succès`, {
      title: 'Tâche créée',
      duration: 4000
    }),
    
    taskCompleted: (taskTitle, xpGained) => addToast('success', `+${xpGained} XP gagné pour "${taskTitle}"`, {
      title: 'Tâche complétée',
      duration: 6000
    }),
    
    projectCreated: (projectTitle) => addToast('success', `Projet "${projectTitle}" créé avec succès`, {
      title: 'Projet créé',
      duration: 4000
    }),
    
    levelUp: (newLevel) => addToast('success', `🎉 Vous êtes maintenant niveau ${newLevel} !`, {
      title: 'Niveau supérieur',
      duration: 8000
    }),
    
    badgeUnlocked: (badgeName) => addToast('success', `🏆 Badge "${badgeName}" débloqué !`, {
      title: 'Nouveau badge',
      duration: 7000
    }),
    
    profileUpdated: () => addToast('success', 'Profil mis à jour avec succès', {
      title: 'Profil sauvegardé',
      duration: 3000
    }),
    
    connectionError: () => addToast('error', 'Problème de connexion. Vérifiez votre réseau.', {
      title: 'Erreur de connexion',
      duration: 6000
    }),
    
    saveError: (itemType = 'élément') => addToast('error', `Impossible de sauvegarder ${itemType}. Réessayez.`, {
      title: 'Erreur de sauvegarde',
      duration: 5000
    }),
    
    deleteConfirm: (itemName, onConfirm) => addToast('warning', `Êtes-vous sûr de vouloir supprimer "${itemName}" ?`, {
      title: 'Confirmation',
      duration: 10000,
      action: {
        label: 'Confirmer',
        onClick: onConfirm
      }
    }),
    
    // Supprimer un toast spécifique
    remove: removeToast
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    toast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook pour les actions courantes avec toasts
export const useToastActions = () => {
  const { toast } = useToast();

  return {
    // Actions pour les tâches
    handleTaskCreate: async (createFn, taskData) => {
      try {
        const result = await createFn(taskData);
        toast.taskCreated(taskData.title);
        return result;
      } catch (error) {
        toast.saveError('la tâche');
        throw error;
      }
    },

    handleTaskComplete: async (completeFn, taskId, taskData) => {
      try {
        const result = await completeFn(taskId, taskData);
        const xpGained = result.xpGained || 20;
        toast.taskCompleted(taskData.title, xpGained);
        return result;
      } catch (error) {
        toast.error('Impossible de marquer la tâche comme complétée');
        throw error;
      }
    },

    handleTaskDelete: async (deleteFn, taskId, taskTitle) => {
      try {
        await deleteFn(taskId);
        toast.success(`Tâche "${taskTitle}" supprimée`);
      } catch (error) {
        toast.error('Impossible de supprimer la tâche');
        throw error;
      }
    },

    // Actions pour les projets
    handleProjectCreate: async (createFn, projectData) => {
      try {
        const result = await createFn(projectData);
        toast.projectCreated(projectData.title);
        return result;
      } catch (error) {
        toast.saveError('le projet');
        throw error;
      }
    },

    handleProjectUpdate: async (updateFn, projectId, projectData) => {
      try {
        const result = await updateFn(projectId, projectData);
        toast.success(`Projet "${projectData.title}" mis à jour`);
        return result;
      } catch (error) {
        toast.saveError('le projet');
        throw error;
      }
    },

    // Actions pour le profil
    handleProfileUpdate: async (updateFn, profileData) => {
      try {
        const result = await updateFn(profileData);
        toast.profileUpdated();
        return result;
      } catch (error) {
        toast.saveError('le profil');
        throw error;
      }
    },

    // Confirmation de suppression
    confirmDelete: (itemName, onConfirm) => {
      toast.deleteConfirm(itemName, onConfirm);
    },

    // Gestion des erreurs réseau
    handleNetworkError: (error) => {
      if (error.code === 'network-request-failed' || !navigator.onLine) {
        toast.connectionError();
      } else {
        toast.error('Une erreur inattendue s\'est produite');
      }
    }
  };
};

export default ToastProvider;
