// react-app/src/modules/analytics/components/ProgressChart.jsx
import React from 'react';

const ProgressChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-400">
          📊 Aucune donnée disponible
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value || d.completed || 0));

  return (
    <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.slice(0, 10).map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-xs text-gray-400 text-right">
              {item.date || item.label || item.name}
            </div>
            <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ 
                  width: `${maxValue > 0 ? ((item.value || item.completed || 0) / maxValue) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="w-12 text-xs text-white text-right">
              {item.value || item.completed || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;
