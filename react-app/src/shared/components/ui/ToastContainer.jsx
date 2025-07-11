// src/shared/components/ui/ToastContainer.jsx
import React from 'react';
import useNotificationStore from '../../stores/notificationStore.js';

const ToastContainer = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 5).map((notification) => (
        <Toast 
          key={notification.id} 
          notification={notification} 
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ notification, onClose }) => {
  const { type, title, message } = notification;
  
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-800 border-green-600 text-green-100';
      case 'error':
        return 'bg-red-800 border-red-600 text-red-100';
      case 'warning':
        return 'bg-yellow-800 border-yellow-600 text-yellow-100';
      default:
        return 'bg-blue-800 border-blue-600 text-blue-100';
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
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`
      ${getToastStyles()}
      border rounded-lg p-4 shadow-lg
      transform transition-all duration-300 ease-in-out
      hover:scale-105 cursor-pointer
      animate-slide-in-right
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <div className="flex-1">
            {title && (
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
            )}
            {message && (
              <p className="text-sm opacity-90">{message}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 transition-opacity ml-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ToastContainer;
