// CampaignsTab - Campaign management for GodMod
import React, { useMemo } from 'react';
import { Flag, Edit, Trash2 } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';

const CampaignsTab = ({ campaigns, users, searchTerm, onEdit, onDelete, onSave }) => {
  const filtered = useMemo(() => {
    return campaigns.filter(c =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [campaigns, searchTerm]);

  return (
    <div>
      <SectionHeader icon={Flag} title="Gestion des Campagnes" count={filtered.length} />
      <div className="space-y-3">
        {filtered.map(c => (
          <DataCard key={c.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">{c.title}</div>
                <div className="text-sm text-gray-400">{c.description}</div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>{c.status}</span>
                  <span className="text-gray-500">{c.members?.length || 0} membres</span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton icon={Edit} onClick={() => onEdit(c)} color="blue" />
                <ActionButton icon={Trash2} onClick={() => onDelete(c.id)} color="red" />
              </div>
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
};

export default CampaignsTab;
