// ==========================================
// 📁 react-app/src/components/ui/Modal.jsx
// COMPOSANT MODAL - VERSION RESPONSIVE
// ==========================================

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * 🏠 COMPOSANT MODAL PRINCIPAL
 * Modal réutilisable avec backdrop et fermeture ESC
 */
const Modal = ({ 
  isOpen = false, 
  onClose, 
  children, 
  title,
  className = '',
  closeOnBackdrop = true,
  closeOnEsc = true,
  size = 'md'
}) => {
  
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-[375px] sm:max-w-[95vw] md:max-w-md',
    md: 'max-w-[375px] sm:max-w-[95vw] md:max-w-lg',
    lg: 'max-w-[375px] sm:max-w-[95vw] md:max-w-2xl',
    xl: 'max-w-[375px] sm:max-w-[95vw] md:max-w-4xl'
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-start justify-start sm:items-center sm:justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      <div className={`
        relative w-full ${sizeClasses[size]} 
        bg-white rounded-none sm:rounded-lg shadow-xl 
        transform transition-all
        h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden flex flex-col
        ${className}
      `}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className={title ? 'flex-1 overflow-y-auto p-6' : 'flex-1 overflow-y-auto p-6'}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

/**
 * 🎯 HOOK POUR GÉRER L'ÉTAT MODAL
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
};

/**
 * 🔔 MODAL DE CONFIRMATION
 */
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}) => {
  
  const variantClasses = {
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-orange-600 hover:bg-orange-700',
    danger: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${variantClasses[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export { Modal };
export default Modal;
