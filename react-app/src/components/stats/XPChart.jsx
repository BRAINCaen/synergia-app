// ==========================================
// 📁 react-app/src/components/stats/XPChart.jsx
// GRAPHIQUE XP AVANCÉ - SYNERGIA v4.0 - MODULE 7
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * 📊 GRAPHIQUE XP EN BARRES
 */
const XPChart = ({ data = [], height = 120, showLabels = true, showValues = true }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Pas de données disponibles
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.xpGained || 0), 1);

  // Calculer la tendance
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstAvg = firstHalf.reduce((s, d) => s + (d.xpGained || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, d) => s + (d.xpGained || 0), 0) / secondHalf.length;
  const trend = secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'stable';

  return (
    <div className="space-y-3">
      {/* Tendance */}
      <div className="flex items-center gap-2">
        {trend === 'up' && (
          <>
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Tendance positive</span>
          </>
        )}
        {trend === 'down' && (
          <>
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400 font-medium">Tendance négative</span>
          </>
        )}
        {trend === 'stable' && (
          <>
            <Minus className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Tendance stable</span>
          </>
        )}
      </div>

      {/* Graphique */}
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((item, index) => {
          const percentage = (item.xpGained || 0) / maxValue * 100;
          const isToday = index === data.length - 1;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              {/* Valeur au survol */}
              {showValues && (
                <motion.span
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="text-[10px] text-gray-400 font-medium"
                >
                  {item.xpGained || 0}
                </motion.span>
              )}

              {/* Barre */}
              <motion.div
                className={`w-full rounded-t-md cursor-pointer transition-all ${
                  isToday
                    ? 'bg-gradient-to-t from-yellow-500 to-amber-400'
                    : 'bg-gradient-to-t from-blue-600 to-purple-500 hover:from-blue-500 hover:to-purple-400'
                }`}
                style={{ minHeight: 4 }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(percentage, 3)}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                title={`${item.dayName || item.date}: ${item.xpGained || 0} XP`}
              />

              {/* Label */}
              {showLabels && (
                <span className={`text-[10px] mt-1 ${isToday ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                  {item.dayName || ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 📈 GRAPHIQUE LIGNE POUR 30 JOURS
 */
export const XPLineChart = ({ data = [], height = 100 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
        Pas de données
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.xpGained || 0), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.xpGained || 0) / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Créer le path pour l'aire
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div style={{ height }} className="relative">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Grille */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        {/* Lignes de grille horizontales */}
        {[25, 50, 75].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(75, 85, 99, 0.3)"
            strokeWidth="0.5"
          />
        ))}

        {/* Aire sous la courbe */}
        <motion.polygon
          points={areaPoints}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Ligne */}
        <motion.polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
      </svg>

      {/* Labels min/max */}
      <div className="absolute top-0 right-0 text-[10px] text-purple-400 font-medium">
        {maxValue} XP
      </div>
      <div className="absolute bottom-0 right-0 text-[10px] text-gray-500">
        0 XP
      </div>
    </div>
  );
};

/**
 * 🥧 GRAPHIQUE CIRCULAIRE (SOURCES D'XP)
 */
export const XPSourcesPieChart = ({ data = {}, size = 120 }) => {
  const entries = Object.entries(data).filter(([_, value]) => value > 0);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-gray-500 text-sm">Aucune donnée</span>
      </div>
    );
  }

  const total = entries.reduce((sum, [_, value]) => sum + value, 0);
  const radius = (size - 20) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  const colors = {
    quest_completed: '#10B981',
    boost_received: '#F59E0B',
    boost_sent: '#F97316',
    badge_earned: '#8B5CF6',
    level_up: '#EC4899',
    daily_login: '#3B82F6',
    streak_bonus: '#EF4444',
    team_reward: '#06B6D4',
    admin_bonus: '#84CC16',
    other: '#6B7280'
  };

  const labels = {
    quest_completed: 'Quêtes',
    boost_received: 'Boosts reçus',
    boost_sent: 'Boosts envoyés',
    badge_earned: 'Badges',
    level_up: 'Niveaux',
    daily_login: 'Connexions',
    streak_bonus: 'Séries',
    team_reward: 'Équipe',
    admin_bonus: 'Bonus admin',
    other: 'Autres'
  };

  let currentAngle = -90;

  const arcs = entries.map(([key, value]) => {
    const percentage = value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      key,
      path: pathData,
      color: colors[key] || colors.other,
      label: labels[key] || key,
      value,
      percentage: Math.round(percentage * 100)
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {arcs.map((arc, i) => (
          <motion.path
            key={arc.key}
            d={arc.path}
            fill={arc.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="hover:brightness-110 transition-all cursor-pointer"
          />
        ))}
        {/* Centre blanc */}
        <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="#1F2937" />
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="fill-white text-xs font-bold"
        >
          {total.toLocaleString()}
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="fill-gray-400 text-[8px]"
        >
          XP total
        </text>
      </svg>

      {/* Légende */}
      <div className="flex flex-col gap-1">
        {arcs.slice(0, 5).map(arc => (
          <div key={arc.key} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: arc.color }} />
            <span className="text-gray-400">{arc.label}</span>
            <span className="text-white font-medium">{arc.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default XPChart;
