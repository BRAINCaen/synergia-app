// react-app/src/modules/analytics/components/MetricCard.jsx
import React from 'react';

const MetricCard = ({ 
  icon, 
  value, 
  label, 
  color = "from-blue-500 to-purple-600", 
  trend = null,
  className = ""
}) => {
  const getTrendDisplay = (trend) => {
    if (trend === null || trend === 0) return null;
    
    const isPositive = trend > 0;
    return (
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
        isPositive 
          ? 'bg-green-900/30 text-green-400' 
          : 'bg-red-900/30 text-red-400'
      }`}>
        {isPositive ? '↗' : '↘'} {Math.abs(trend)}%
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 ${className}`}>
      {/* Header avec icône et trend */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {getTrendDisplay(trend)}
      </div>

      {/* Valeur principale */}
      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">
          {value}
        </div>
        <div className="text-sm text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
