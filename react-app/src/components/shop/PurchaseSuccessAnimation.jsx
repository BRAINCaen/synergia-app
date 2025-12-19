// ==========================================
// 📁 react-app/src/components/shop/PurchaseSuccessAnimation.jsx
// ANIMATION SUCCÈS ACHAT - SYNERGIA v4.0 - MODULE 5
// ==========================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Gift, Star } from 'lucide-react';

/**
 * 🎉 ANIMATION DE SUCCÈS D'ACHAT
 * Affiche une animation festive après un achat réussi
 */
const PurchaseSuccessAnimation = ({
  isVisible,
  reward,
  onComplete
}) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (isVisible) {
      // Générer des confettis
      const particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6', '#10B981'][Math.floor(Math.random() * 6)],
          size: 4 + Math.random() * 8,
          rotation: Math.random() * 360
        });
      }
      setConfetti(particles);

      // Auto-fermer après 3 secondes
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] overflow-hidden"
        onClick={onComplete}
      >
        {/* Confettis */}
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            initial={{
              top: '50%',
              left: `${particle.x}%`,
              opacity: 1,
              scale: 0
            }}
            animate={{
              top: ['50%', '-10%'],
              opacity: [1, 1, 0],
              scale: [0, 1, 1],
              rotate: [0, particle.rotation]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut'
            }}
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
          />
        ))}

        {/* Étoiles scintillantes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              rotate: [0, 180]
            }}
            transition={{
              duration: 1.5,
              delay: 0.3 + i * 0.1,
              repeat: 1
            }}
            style={{
              top: `${30 + Math.random() * 40}%`,
              left: `${20 + Math.random() * 60}%`
            }}
          >
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </motion.div>
        ))}

        {/* Contenu principal */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cercle lumineux derrière */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-3xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1.5 }}
            transition={{ duration: 0.5 }}
          />

          {/* Carte de succès */}
          <motion.div
            className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-green-500/50 rounded-3xl p-8 text-center shadow-2xl shadow-green-500/20"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Badge succès */}
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>

            {/* Titre */}
            <motion.h2
              className="text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Demande envoyée !
            </motion.h2>

            {/* Icône récompense */}
            {reward && (
              <motion.div
                className="my-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <span className="text-6xl">{reward.icon}</span>
              </motion.div>
            )}

            {/* Nom de la récompense */}
            {reward && (
              <motion.p
                className="text-lg text-gray-300 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-white font-semibold">{reward.name}</span>
              </motion.p>
            )}

            {/* Message */}
            <motion.p
              className="text-sm text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Un administrateur va valider votre demande.
              <br />
              Vous serez notifié de la décision !
            </motion.p>

            {/* Sparkles */}
            <motion.div
              className="flex justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -5, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>

            {/* Bouton fermer */}
            <motion.button
              className="mt-6 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg"
              onClick={onComplete}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Super !
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurchaseSuccessAnimation;
