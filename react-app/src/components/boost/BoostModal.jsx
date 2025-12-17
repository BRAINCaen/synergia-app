// ==========================================
// react-app/src/components/boost/BoostModal.jsx
// Modal de selection et envoi d'un Boost
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Send, Sparkles, CheckCircle } from 'lucide-react';
import { boostService, BOOST_TYPES } from '../../core/services/boostService';

const BoostModal = ({
  targetUser,
  currentUser,
  onClose,
  onBoostSent
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSendBoost = async () => {
    if (!selectedType) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await boostService.sendBoost(
        currentUser,
        targetUser,
        selectedType,
        message
      );

      setSuccess(true);

      // Animation de succes puis fermeture
      setTimeout(() => {
        if (onBoostSent) {
          onBoostSent(result);
        }
      }, 1500);

    } catch (err) {
      console.error('Erreur envoi Boost:', err);
      setError(err.message || 'Erreur lors de l\'envoi du Boost');
    } finally {
      setIsLoading(false);
    }
  };

  const boostTypes = Object.values(BOOST_TYPES);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-gray-900/95 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Zap size={24} className="text-white fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Envoyer un Boost</h2>
              <p className="text-sm text-gray-400">
                a {targetUser.displayName || 'cet Aventurier'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {success ? (
            <SuccessView type={selectedType} targetUser={targetUser} />
          ) : (
            <motion.div
              className="p-6 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Selection du type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Choisissez le type de Boost
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {boostTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-300
                        ${selectedType === type.id
                          ? `border-transparent bg-gradient-to-r ${type.color} shadow-lg`
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-3xl mb-2">{type.emoji}</div>
                      <div className={`font-medium ${selectedType === type.id ? 'text-white' : 'text-gray-200'}`}>
                        {type.label}
                      </div>
                      <div className={`text-xs mt-1 ${selectedType === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {type.description}
                      </div>

                      {/* Indicateur de selection */}
                      {selectedType === type.id && (
                        <motion.div
                          className="absolute top-2 right-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle size={20} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Message optionnel */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ajoute un petit mot d'encouragement..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {message.length}/200
                </div>
              </div>

              {/* XP Info */}
              <div className="flex items-center justify-center gap-6 py-3 bg-gray-800/30 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">+5 XP</div>
                  <div className="text-xs text-gray-500">pour {targetUser.displayName?.split(' ')[0] || 'lui'}</div>
                </div>
                <div className="w-px h-10 bg-gray-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">+2 XP</div>
                  <div className="text-xs text-gray-500">pour vous</div>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <motion.div
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Bouton d'envoi */}
              <motion.button
                onClick={handleSendBoost}
                disabled={!selectedType || isLoading}
                className={`
                  w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2
                  transition-all duration-300
                  ${selectedType && !isLoading
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={selectedType && !isLoading ? { scale: 1.02 } : {}}
                whileTap={selectedType && !isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Envoyer le Boost
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Vue de succes
const SuccessView = ({ type, targetUser }) => {
  const boostType = BOOST_TYPES[type];

  return (
    <motion.div
      className="p-8 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Animation celebratoire */}
      <motion.div
        className="relative inline-block mb-4"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{
          duration: 0.6,
          times: [0, 0.5, 1]
        }}
      >
        <div className="text-6xl">{boostType?.emoji}</div>

        {/* Particules */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{
              x: 0,
              y: 0,
              opacity: 1
            }}
            animate={{
              x: Math.cos((i * 60) * Math.PI / 180) * 50,
              y: Math.sin((i * 60) * Math.PI / 180) * 50,
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.2
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-white mb-2">
          Boost envoye !
        </h3>
        <p className="text-gray-400">
          {targetUser.displayName || 'L\'Aventurier'} a recu votre Boost {boostType?.label}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
          <Sparkles size={18} />
          <span className="font-medium">+5 XP pour {targetUser.displayName?.split(' ')[0] || 'lui'}, +2 XP pour vous</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BoostModal;
