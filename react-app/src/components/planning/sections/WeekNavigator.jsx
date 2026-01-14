// ==========================================
// 📁 components/planning/sections/WeekNavigator.jsx
// NAVIGATION ENTRE LES SEMAINES
// ==========================================

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeekNavigator = ({
  currentWeek,
  weekDates,
  onPreviousWeek,
  onNextWeek,
  onToday,
  getWeekNumber
}) => {
  const formatWeekRange = () => {
    if (!weekDates || weekDates.length === 0) return '';
    const start = new Date(weekDates[0]);
    const end = new Date(weekDates[weekDates.length - 1]);

    const options = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
  };

  const weekInfo = getWeekNumber ? getWeekNumber(currentWeek) : { weekNumber: 0, year: 0 };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 sm:mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousWeek}
          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onToday}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Aujourd'hui
        </button>

        <button
          onClick={onNextWeek}
          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Semaine {weekInfo.weekNumber}
        </h2>
        <p className="text-gray-400 text-sm">{formatWeekRange()}</p>
      </div>

      <div className="text-gray-400 text-sm">
        {weekInfo.year}
      </div>
    </div>
  );
};

export default WeekNavigator;
