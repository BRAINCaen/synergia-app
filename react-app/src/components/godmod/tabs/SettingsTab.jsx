// SettingsTab - System settings for GodMod
import React, { useState } from 'react';
import { Settings, RefreshCw, Database, Shield, Zap } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';

const SettingsTab = ({ users, onRefresh }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await onRefresh();
    setSyncing(false);
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.lastActive && new Date(u.lastActive.toDate?.() || u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    totalXp: users.reduce((sum, u) => sum + (u.gamification?.totalXp || 0), 0),
    totalBadges: users.reduce((sum, u) => sum + (u.gamification?.badges?.length || 0), 0)
  };

  return (
    <div>
      <SectionHeader icon={Settings} title="Paramètres Système" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DataCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-sm text-gray-400">Utilisateurs total</div>
            </div>
          </div>
        </DataCard>

        <DataCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
              <div className="text-sm text-gray-400">Actifs (7j)</div>
            </div>
          </div>
        </DataCard>

        <DataCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalXp.toLocaleString()}</div>
              <div className="text-sm text-gray-400">XP Total distribués</div>
            </div>
          </div>
        </DataCard>

        <DataCard>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalBadges}</div>
              <div className="text-sm text-gray-400">Badges attribués</div>
            </div>
          </div>
        </DataCard>
      </div>

      <DataCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Synchronisation des données</h3>
            <p className="text-sm text-gray-400">Rafraîchir toutes les données depuis Firebase</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        </div>
      </DataCard>
    </div>
  );
};

export default SettingsTab;
