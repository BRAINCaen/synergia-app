import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const AlertsSection = ({ alerts, setAlerts }) => {
  return (
    <motion.div
      key="alerts"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Définissez les alertes basées sur votre convention collective</p>
            <p className="text-gray-400">Ces alertes s'affichent sur le planning pour vous guider lors de la planification</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={alert.active}
                    onChange={(e) => {
                      const updatedAlerts = alerts.map(a =>
                        a.id === alert.id ? { ...a, active: e.target.checked } : a
                      );
                      setAlerts(updatedAlerts);
                    }}
                    className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{alert.label}</span>
                    {alert.blocking && (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">Bloquante</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 ml-8">{alert.description}</p>
                {alert.value && (
                  <div className="flex items-center gap-2 mt-2 ml-8">
                    <input
                      type="number"
                      value={alert.value}
                      onChange={(e) => {
                        const updatedAlerts = alerts.map(a =>
                          a.id === alert.id ? { ...a, value: parseInt(e.target.value) } : a
                        );
                        setAlerts(updatedAlerts);
                      }}
                      className="w-20 px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      disabled={!alert.active}
                    />
                    <span className="text-sm text-gray-400">
                      {alert.id.includes('hours') ? 'heures' : alert.id === 'consecutive_days' ? 'jours' : alert.id === 'break' ? 'minutes' : 'heures'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AlertsSection;
