// SponsorshipsTab - Sponsorship management for GodMod
import React, { useMemo } from 'react';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';

const SponsorshipsTab = ({ sponsorships, users, searchTerm, onEdit, onDelete, onSave }) => {
  const filtered = useMemo(() => {
    return sponsorships.filter(s => {
      const sponsor = users.find(u => u.id === s.sponsorId);
      const sponsored = users.find(u => u.id === s.sponsoredId);
      return sponsor?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             sponsored?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sponsorships, users, searchTerm]);

  const getUserName = (userId) => users.find(u => u.id === userId)?.displayName || 'Inconnu';

  return (
    <div>
      <SectionHeader icon={UserPlus} title="Parrainages" count={filtered.length} />
      <div className="space-y-3">
        {filtered.map(s => (
          <DataCard key={s.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{getUserName(s.sponsorId)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-400">{getUserName(s.sponsoredId)}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    s.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    s.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{s.status}</span>
                  <span className="text-gray-500">Depuis: {s.startDate?.toDate?.()?.toLocaleDateString?.() || '-'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton icon={Edit} onClick={() => onEdit(s)} color="blue" />
                <ActionButton icon={Trash2} onClick={() => onDelete(s.id)} color="red" />
              </div>
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
};

export default SponsorshipsTab;
