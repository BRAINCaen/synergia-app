// ==========================================
// 📁 components/hr/GlassCard.jsx
// COMPOSANT CARTE GLASSMORPHISM RÉUTILISABLE
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

export default GlassCard;
