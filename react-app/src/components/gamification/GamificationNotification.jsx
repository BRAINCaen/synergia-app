// src/shared/components/gamification/GamificationNotification.jsx
import React, { useEffect } from 'react';
import { X, Star, Award, TrendingUp } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore.js';

const GamificationNotification = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useGameStore();

  // Auto-masquer les notifications après 5 secondes
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.timestamp) {
        const timeElapsed = Date.now() - new Date(notification.timestamp).getTime();
        if (timeElapsed > 5000) {
          markNotificationAsRead(notification.id);
        }
      }
    });
  }, [notifications, markNotificationAsRead]);

  if (notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type, icon) => {
    switch (type) {
      case 'levelUp':
        return <Star className="w-6 h-6 text-yellow-400" />;
      case 'badge':
        return <Award className="w-6 h-6 text-purple-400" />;
      case 'xp':
        return <TrendingUp className="w-6 h-6 text-green-400" />;
      default:
        return <span className="text-2xl">{icon}</span>;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'levelUp':
        return 'border-yellow-400 bg-yellow-900/20';
      case 'badge':
        return 'border-purple-400 bg-purple-900/20';
      case 'xp':
        return 'border-green-400 bg-green-900/20';
      default:
        return 'border-blue-400 bg-blue-900/20';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => ( // Afficher max 3 notifications
        <div
          key={notification.id}
          className={`
            border-l-4 rounded-lg p-4 shadow-lg backdrop-blur-sm
            bg-gray-800/90 border-gray-600 text-white
            transform transition-all duration-300 ease-in-out
            animate-slide-in-right
            ${getNotificationStyle(notification.type)}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type, notification.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {notification.message}
                </p>
                {notification.xpGained && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-600/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{notification.xpGained} XP
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => markNotificationAsRead(notification.id)}
              className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      ))}
      
      {notifications.length > 3 && (
        <div className="text-center">
          <button
            onClick={clearAllNotifications}
            className="text-xs text-gray-400 hover:text-white transition-colors underline"
          >
            Masquer toutes les notifications ({notifications.length})
          </button>
        </div>
      )}
    </div>
  );
};

// Animation CSS à ajouter dans globals.css
const animationStyles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;

export default GamificationNotification;
