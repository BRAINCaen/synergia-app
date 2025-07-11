// react-app/src/modules/analytics/components/ProgressChart.jsx
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const ProgressChart = ({ data, height = 300 }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">
            {new Date(label).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <div className="space-y-1">
            {payload.map((entry) => (
              <div key={entry.dataKey} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-white text-sm">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9ca3af"
          fontSize={12}
          tickFormatter={formatDate}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12}
        />
        <Tooltip content={customTooltip} />
        <Line 
          type="monotone" 
          dataKey="completed" 
          stroke="#10b981" 
          strokeWidth={3}
          name="Complétées"
          dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#064e3b' }}
          activeDot={{ r: 6, fill: '#10b981' }}
        />
        <Line 
          type="monotone" 
          dataKey="created" 
          stroke="#3b82f6" 
          strokeWidth={3}
          name="Créées"
          dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#1e3a8a' }}
          activeDot={{ r: 6, fill: '#3b82f6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
