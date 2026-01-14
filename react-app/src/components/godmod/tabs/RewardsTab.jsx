// RewardsTab - Reward management for GodMod
import React, { useMemo } from 'react';
import { Gift, Edit, Trash2 } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';

const RewardsTab = ({ rewards, searchTerm, onEdit, onDelete, onSave }) => {
  const filtered = useMemo(() => {
    return rewards.filter(r =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rewards, searchTerm]);

  return (
    <div>
      <SectionHeader icon={Gift} title="Gestion des Récompenses" count={filtered.length} />
      <div className="space-y-3">
        {filtered.map(r => (
          <DataCard key={r.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{r.emoji || '🎁'}</span>
                <div>
                  <div className="text-white font-semibold">{r.name}</div>
                  <div className="text-sm text-gray-400">{r.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-yellow-500">{r.pointsCost || 0} points</span>
                    <span className="text-gray-500">Stock: {r.stock ?? '∞'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      r.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>{r.available ? 'Disponible' : 'Indisponible'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton icon={Edit} onClick={() => onEdit(r)} color="blue" />
                <ActionButton icon={Trash2} onClick={() => onDelete(r.id)} color="red" />
              </div>
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
};

export default RewardsTab;
