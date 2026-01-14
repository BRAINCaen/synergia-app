// ==========================================
// 📁 components/godmod/common.jsx
// COMPOSANTS PARTAGÉS GODMOD
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';

export const SectionHeader = ({ icon: Icon, title, count }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-white flex items-center gap-2">
      <Icon className="w-5 h-5 text-purple-400" />
      {title}
    </h3>
    {count !== undefined && (
      <span className="text-sm text-gray-400">{count} éléments</span>
    )}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-${color}-500/10 border border-${color}-500/30 rounded-xl p-4`}>
    <Icon className={`w-6 h-6 text-${color}-400 mb-2`} />
    <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

export const DataCard = ({ children, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const TabContent = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

export const ActionButton = ({ icon: Icon, label, onClick, color = 'gray', size = 'sm' }) => (
  <button
    onClick={onClick}
    className={`p-${size === 'sm' ? '1.5' : '2'} hover:bg-${color}-500/20 text-${color}-400 rounded-lg transition-colors`}
    title={label}
  >
    <Icon className={`w-${size === 'sm' ? '4' : '5'} h-${size === 'sm' ? '4' : '5'}`} />
  </button>
);

export const Badge = ({ children, color = 'gray' }) => (
  <span className={`px-2 py-0.5 rounded text-xs bg-${color}-500/20 text-${color}-400`}>
    {children}
  </span>
);

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12">
    <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
    <h3 className="text-white font-medium mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);
