// ==========================================
// react-app/src/components/boost/BoostButton.jsx
// Bouton pour envoyer un Boost a un Aventurier
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import BoostModal from './BoostModal';

const BoostButton = ({
  targetUser,
  currentUser,
  variant = 'default', // 'default', 'small', 'icon'
  className = '',
  onBoostSent
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Ne pas afficher si c'est le meme utilisateur
  if (!targetUser || !currentUser || targetUser.uid === currentUser.uid) {
    return null;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleBoostSent = (result) => {
    setShowModal(false);
    if (onBoostSent) {
      onBoostSent(result);
    }
  };

  // Variantes du bouton
  const variants = {
    default: {
      button: `
        flex items-center gap-2 px-4 py-2
        bg-gradient-to-r from-yellow-500 to-orange-500
        hover:from-yellow-400 hover:to-orange-400
        text-white font-medium rounded-xl
        shadow-lg shadow-orange-500/25
        transition-all duration-300
      `,
      text: 'Envoyer un Boost',
      iconSize: 18
    },
    small: {
      button: `
        flex items-center gap-1.5 px-3 py-1.5
        bg-gradient-to-r from-yellow-500 to-orange-500
        hover:from-yellow-400 hover:to-orange-400
        text-white text-sm font-medium rounded-lg
        shadow-md shadow-orange-500/20
        transition-all duration-300
      `,
      text: 'Boost',
      iconSize: 14
    },
    icon: {
      button: `
        p-2
        bg-gradient-to-r from-yellow-500 to-orange-500
        hover:from-yellow-400 hover:to-orange-400
        text-white rounded-full
        shadow-lg shadow-orange-500/25
        transition-all duration-300
      `,
      text: null,
      iconSize: 18
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <>
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${currentVariant.button} ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Envoyer un Boost a ${targetUser.displayName || 'cet Aventurier'}`}
      >
        <motion.div
          animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Zap size={currentVariant.iconSize} className="fill-current" />
        </motion.div>

        {currentVariant.text && (
          <span>{currentVariant.text}</span>
        )}

        {/* Particules au hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles size={12} className="text-yellow-200" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Modal de selection du Boost */}
      <AnimatePresence>
        {showModal && (
          <BoostModal
            targetUser={targetUser}
            currentUser={currentUser}
            onClose={() => setShowModal(false)}
            onBoostSent={handleBoostSent}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BoostButton;
