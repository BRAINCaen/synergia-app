// react-app/src/modules/analytics/pages/Analytics.jsx
import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default Analytics;
