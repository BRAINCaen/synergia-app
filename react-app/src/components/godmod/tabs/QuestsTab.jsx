// QuestsTab - Quest management for GodMod
import React, { useMemo } from 'react';
import { Target, Edit, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';

const QuestsTab = ({ quests, validations, users, searchTerm, onEdit, onDelete, onRefresh }) => {
  const filtered = useMemo(() => {
    return quests.filter(q =>
      q.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quests, searchTerm]);

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.displayName || 'Inconnu';
  };

  return (
    <div>
      <SectionHeader
        icon={Target}
        title="Gestion des Quêtes"
        count={filtered.length}
        action={
          <button
            onClick={onRefresh}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        }
      />

      <div className="space-y-3">
        {filtered.map(q => {
          const qValidations = validations.filter(v => v.taskId === q.id);
          return (
            <DataCard key={q.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{q.emoji || '🎯'}</span>
                    <div className="text-white font-semibold">{q.title}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      q.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      q.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{q.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-yellow-500">+{q.xpReward || 0} XP</span>
                    <span className="text-gray-500">{q.type}</span>
                    {qValidations.length > 0 && (
                      <span className="text-purple-400">{qValidations.length} validation(s)</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <ActionButton icon={Edit} onClick={() => onEdit(q)} color="blue" />
                  <ActionButton icon={Trash2} onClick={() => onDelete(q.id)} color="red" />
                </div>
              </div>
            </DataCard>
          );
        })}
      </div>
    </div>
  );
};

export default QuestsTab;
