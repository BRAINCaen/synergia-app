// HistoryTab - Event history for GodMod
import React, { useMemo } from 'react';
import { Clock, Zap, Award, Target, Gift } from 'lucide-react';
import { SectionHeader, DataCard } from '../common.jsx';

const HistoryTab = ({ events, users, searchTerm }) => {
  const filtered = useMemo(() => {
    return events.filter(e => {
      const user = users.find(u => u.id === e.userId);
      return user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             e.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             e.description?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [events, users, searchTerm]);

  const getUserName = (userId) => users.find(u => u.id === userId)?.displayName || 'Système';

  const getEventIcon = (type) => {
    switch (type) {
      case 'xp_gain': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'badge_earned': return <Award className="w-4 h-4 text-purple-400" />;
      case 'quest_completed': return <Target className="w-4 h-4 text-green-400" />;
      case 'reward_claimed': return <Gift className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div>
      <SectionHeader icon={Clock} title="Historique des événements" count={filtered.length} />
      <div className="space-y-2">
        {filtered.slice(0, 100).map((e, idx) => (
          <DataCard key={e.id || idx}>
            <div className="flex items-center gap-3">
              {getEventIcon(e.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">{getUserName(e.userId)}</span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-gray-400 text-sm">{e.description || e.type}</span>
                </div>
                {e.xpAmount && (
                  <span className="text-yellow-500 text-xs">+{e.xpAmount} XP</span>
                )}
              </div>
              <span className="text-gray-500 text-xs">
                {e.timestamp?.toDate?.()?.toLocaleString?.() || '-'}
              </span>
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
};

export default HistoryTab;
