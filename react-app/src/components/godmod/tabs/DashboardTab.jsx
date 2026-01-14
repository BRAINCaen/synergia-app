// ==========================================
// 📁 components/godmod/tabs/DashboardTab.jsx
// TAB DASHBOARD GODMOD
// ==========================================

import React, { useMemo } from 'react';
import {
  Users, Zap, Award, Target, Clock, Flag,
  GraduationCap, MessageSquare, Gift, UserPlus,
  Medal, BarChart3
} from 'lucide-react';

const SectionHeader = ({ icon: Icon, title, count }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-white flex items-center gap-2">
      <Icon className="w-5 h-5 text-purple-400" />
      {title}
    </h3>
    {count !== undefined && (
      <span className="text-sm text-gray-400">{count} elements</span>
    )}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-${color}-500/10 border border-${color}-500/30 rounded-xl p-4`}>
    <Icon className={`w-6 h-6 text-${color}-400 mb-2`} />
    <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

const DataCard = ({ children }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
    {children}
  </div>
);

const DashboardTab = ({ stats, users }) => {
  const topUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.gamification?.totalXp || 0) - (a.gamification?.totalXp || 0))
      .slice(0, 10);
  }, [users]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={BarChart3} title="Vue d'ensemble" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} color="blue" />
        <StatCard icon={Zap} label="XP Total" value={stats.totalXp.toLocaleString()} color="yellow" />
        <StatCard icon={Award} label="Badges" value={stats.totalBadges} color="purple" />
        <StatCard icon={Target} label="Quêtes actives" value={stats.activeQuests} color="green" />
        <StatCard icon={Clock} label="En attente" value={stats.pendingValidations} color="orange" />
        <StatCard icon={Flag} label="Campagnes" value={stats.activeCampaigns} color="red" />
        <StatCard icon={GraduationCap} label="Formations" value={stats.activeFormations} color="cyan" />
        <StatCard icon={MessageSquare} label="Entretiens" value={stats.totalInterviews} color="pink" />
        <StatCard icon={Gift} label="Récompenses" value={stats.totalRewards} color="indigo" />
        <StatCard icon={UserPlus} label="Parrainages" value={stats.totalSponsorships} color="emerald" />
      </div>

      {/* Top Users */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-yellow-500" />
          Top 10 Utilisateurs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topUsers.map((u, idx) => (
            <DataCard key={u.id}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-yellow-500 text-black' :
                  idx === 1 ? 'bg-gray-300 text-black' :
                  idx === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{u.displayName || 'Sans nom'}</div>
                  <div className="text-sm text-gray-400">{u.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-500 font-bold">{(u.gamification?.totalXp || 0).toLocaleString()} XP</div>
                  <div className="text-xs text-gray-500">Niv. {u.gamification?.level || 1}</div>
                </div>
              </div>
            </DataCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
