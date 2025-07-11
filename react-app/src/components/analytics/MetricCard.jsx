// react-app/src/modules/analytics/components/MetricCard.jsx
import React from 'react';

const MetricCard = ({ title, value, icon, color = 'blue', subtitle, trend }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  return (
    <div className={`p-6 rounded-xl border backdrop-blur-sm ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon && <div className="text-xl">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      {trend && (
        <div className={`text-xs mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.positive ? '↗' : '↘'} {trend.value}%
        </div>
      )}
    </div>
  );
};

export default MetricCard;
