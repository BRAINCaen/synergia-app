// ==========================================
// 📁 components/mentoring/sections/StatsCards.jsx
// CARTES STATISTIQUES MENTORING
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Sessions Mentor',
      value: stats.asMentor.completed,
      total: stats.asMentor.total,
      emoji: '🎓',
      iconBg: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      label: 'Sessions Mentee',
      value: stats.asMentee.completed,
      total: stats.asMentee.total,
      emoji: '📚',
      iconBg: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      label: 'Temps Total',
      value: `${Math.round(stats.overall.totalMinutes / 60)}h`,
      subtext: `${stats.overall.totalMinutes} min`,
      emoji: '⏱️',
      iconBg: 'bg-emerald-500/20',
      textColor: 'text-emerald-400'
    },
    {
      label: 'XP Gagne',
      value: stats.overall.totalXP,
      emoji: '⚡',
      iconBg: 'bg-amber-500/20',
      textColor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 ${card.iconBg} rounded-xl`}>
              <span className="text-xl sm:text-2xl">{card.emoji}</span>
            </div>
            {card.total !== undefined && (
              <span className="text-[10px] sm:text-xs bg-white/10 border border-white/10 px-2 py-0.5 rounded-full text-gray-400">
                {card.total} total
              </span>
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${card.textColor}`}>{card.value}</div>
          <div className="text-xs sm:text-sm text-gray-400">{card.label}</div>
          {card.subtext && (
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{card.subtext}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
