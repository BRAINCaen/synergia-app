// FormationsTab - Training management for GodMod
import React, { useMemo } from 'react';
import { GraduationCap, Edit, Trash2 } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';

const FormationsTab = ({ formations, users, searchTerm, onEdit, onDelete, onSave }) => {
  const filtered = useMemo(() => {
    return formations.filter(f =>
      f.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [formations, searchTerm]);

  return (
    <div>
      <SectionHeader icon={GraduationCap} title="Gestion des Formations" count={filtered.length} />
      <div className="space-y-3">
        {filtered.map(f => (
          <DataCard key={f.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">{f.title}</div>
                <div className="text-sm text-gray-400">{f.description}</div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-purple-400">{f.type}</span>
                  <span className="text-gray-500">{f.participants?.length || 0} participants</span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton icon={Edit} onClick={() => onEdit(f)} color="blue" />
                <ActionButton icon={Trash2} onClick={() => onDelete(f.id)} color="red" />
              </div>
            </div>
          </DataCard>
        ))}
      </div>
    </div>
  );
};

export default FormationsTab;
