import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/helpers'
import Button from './Button'

const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  size = 'md',
  className,
  footer,
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  useEffect(() => {
    if (isOpen) {
      // Empêcher le scroll du body quand la modal est ouverte
      document.body.style.overflow = 'hidden'
      
      // Gérer la touche Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape' && onClose) {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.style.overflow = 'auto'
        document.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        {/* Overlay avec animation */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in" />
        
        {/* Modal */}
        <div 
          className={cn(
            'relative w-full bg-white rounded-lg shadow-xl animate-slide-in-up',
            sizes[size],
            className
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Modal de confirmation
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex space-x-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  )
}

export default Modal
