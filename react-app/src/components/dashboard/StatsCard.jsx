// ==========================================
// 📁 react-app/src/components/dashboard/StatsCard.jsx
// COMPOSANT CARTE DE STATISTIQUES RÉUTILISABLE
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * 📊 COMPOSANT CARTE DE STATISTIQUES
 * Affiche une statistique avec icône, tendance et animations
 */
const StatsCard = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  color = 'bg-gradient-to-r from-blue-500 to-purple-500', 
  icon: Icon, 
  details,
  onClick,
  loading = false,
  className = ''
}) => {
  // Déterminer l'icône de tendance
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // Déterminer la couleur du texte de changement
  const getChangeColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 
        hover:bg-white/10 transition-all duration-300 cursor-pointer
        ${onClick ? 'hover:shadow-lg hover:shadow-blue-500/20' : ''}
        ${className}
      `}
    >
      {loading ? (
        // État de chargement
        <div className="animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
              <div>
                <div className="w-20 h-4 bg-gray-600 rounded mb-2"></div>
                <div className="w-16 h-8 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
          <div className="w-24 h-4 bg-gray-600 rounded"></div>
        </div>
      ) : (
        // Contenu normal
        <>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {Icon && (
                  <div className={`p-3 ${color} rounded-lg shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm font-medium">{title}</p>
                  <motion.p 
                    key={value} // Recharger l'animation si la valeur change
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-white text-2xl font-bold"
                  >
                    {value}
                  </motion.p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {change && (
                  <p className={`text-sm font-medium ${getChangeColor()}`}>
                    {change}
                  </p>
                )}
                {getTrendIcon()}
              </div>
              
              {details && (
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                  {details}
                </p>
              )}
            </div>
          </div>

          {/* Indicateur de cliquabilité */}
          {onClick && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center text-gray-400 text-xs">
                <span>Cliquer pour plus de détails</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2"
                >
                  →
                </motion.div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default StatsCard;
