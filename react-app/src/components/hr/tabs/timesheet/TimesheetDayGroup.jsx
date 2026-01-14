import React from 'react';
import { Calendar, UserCheck, UserX, X } from 'lucide-react';

const TimesheetDayGroup = ({
  dayKey,
  dayEntries,
  selectedUserId,
  getEmployeeName,
  deleteTimeEntry,
  calculateDayTotal,
  formatHour
}) => {
  const dayDate = new Date(dayKey);
  const dayTotal = calculateDayTotal(dayEntries);

  return (
    <div className="bg-gray-800/30 rounded-xl p-4">
      {/* En-tête du jour */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold">
              {dayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-gray-400 text-sm">{dayEntries.length} pointage(s)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-400">{dayTotal}</p>
          <p className="text-xs text-gray-400">Total journée</p>
        </div>
      </div>

      {/* Liste des pointages du jour */}
      <div className="space-y-2">
        {dayEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${entry.type === 'arrival' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {entry.type === 'arrival' ? (
                  <UserCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <UserX className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {entry.type === 'arrival' ? 'Arrivée' : 'Départ'}
                </div>
                {selectedUserId === 'all' && (
                  <div className="text-xs text-gray-400">
                    {getEmployeeName(entry.userId)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white">{formatHour(entry.timestamp)}</span>
              <button
                onClick={() => deleteTimeEntry(entry.id)}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Supprimer"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimesheetDayGroup;
