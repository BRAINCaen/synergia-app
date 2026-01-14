// InterviewsTab - 360 Interview management for GodMod
import React, { useMemo } from 'react';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';

const InterviewsTab = ({ interviews, users, searchTerm, onEdit, onDelete, onSave }) => {
  const filtered = useMemo(() => {
    return interviews.filter(i =>
      i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.find(u => u.id === i.targetUserId)?.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [interviews, users, searchTerm]);

  const getUserName = (userId) => users.find(u => u.id === userId)?.displayName || 'Inconnu';

  return (
    <div>
      <SectionHeader icon={MessageSquare} title="Entretiens 360°" count={filtered.length} />
      <div className="space-y-3">
        {filtered.map(i => (
          <DataCard key={i.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">{i.title || 'Entretien 360'}</div>
                <div className="text-sm text-gray-400">Cible: {getUserName(i.targetUserId)}</div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    i.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    i.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{i.status}</span>
                  <span className="text-gray-500">{i.responses?.length || 0} réponses</span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton icon={Edit} onClick={() => onEdit(i)} color="blue" />
                <ActionButton icon={Trash2} onClick={() => onDelete(i.id)} color="red" />
              </div>
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
};

export default InterviewsTab;
