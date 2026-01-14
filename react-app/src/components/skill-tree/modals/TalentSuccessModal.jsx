// ==========================================
// components/skill-tree/modals/TalentSuccessModal.jsx
// MODAL SUCCES TALENT
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';

const TalentSuccessModal = ({ talent, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-8 max-w-md w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="relative inline-block mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-5xl">{talent?.emoji}</span>
          </div>

          {/* Particules */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos(i * Math.PI / 4) * 60,
                y: Math.sin(i * Math.PI / 4) * 60
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-400 rounded-full"
            />
          ))}
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">Nouveau Talent!</h2>
        <h3 className="text-xl text-emerald-300 mb-4">{talent?.name}</h3>
        <p className="text-gray-300 mb-6">{talent?.description}</p>

        <button
          onClick={onClose}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Genial!
        </button>
      </motion.div>
    </motion.div>
  );
};

export default TalentSuccessModal;
