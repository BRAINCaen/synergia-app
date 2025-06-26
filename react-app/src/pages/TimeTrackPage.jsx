// ==========================================
// 📁 react-app/src/pages/TimeTrackPage.jsx
// Page Pointage - Suivi du temps de travail
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Calendar, 
  BarChart3, 
  Timer,
  Download,
  Filter,
  CheckCircle
} from 'lucide-react';

const TimeTrackPage = () => {
  const { user } = useAuthStore();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(0);

  // Timer en cours
  useEffect(() => {
    let interval;
    if (isTracking && currentSession) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  // Données simulées de pointage
  useEffect(() => {
    const mockEntries = [
      {
        id: '1',
        date: '2025-06-27',
        startTime: '09:00',
        endTime: '12:30',
        duration: 210, // minutes
        task: 'Développement feature login',
        project: 'Synergia v3.5',
        status: 'completed'
      },
      {
        id: '2',
        date: '2025-06-27',
        startTime: '14:00',
        endTime: '17:15',
        duration: 195,
        task: 'Correction bugs navigation',
        project: 'Synergia v3.5',
        status: 'completed'
      },
      {
        id: '3',
        date: '2025-06-26',
        startTime: '08:30',
        endTime: '12:00',
        duration: 210,
        task: 'Réunion équipe planning',
        project: 'Management',
        status: 'completed'
      },
      {
        id: '4',
        date: '2025-06-26',
        startTime: '13:30',
        endTime: '18:00',
        duration: 270,
        task: 'Développement ProfilePage',
        project: 'Synergia v3.5',
        status: 'completed'
      }
    ];
    setTimeEntries(mockEntries);
  }, []);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStartTracking = () => {
    const newSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      task: '',
      project: 'Synergia v3.5'
    };
    setCurrentSession(newSession);
    setIsTracking(true);
    setCurrentTime(0);
  };

  const handlePauseTracking = () => {
    setIsTracking(false);
  };

  const handleResumeTracking = () => {
    setIsTracking(true);
  };

  const handleStopTracking = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime - currentSession.startTime) / 1000 / 60);
      
      const newEntry = {
        id: Date.now().toString(),
        date: endTime.toISOString().split('T')[0],
        startTime: currentSession.startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration,
        task: currentSession.task || 'Tâche sans nom',
        project: currentSession.project,
        status: 'completed'
      };

      setTimeEntries(prev => [newEntry, ...prev]);
      setCurrentSession(null);
      setIsTracking(false);
      setCurrentTime(0);
    }
  };

  const updateCurrentTask = (task) => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, task });
    }
  };

  const getTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeEntries
      .filter(entry => entry.date === today)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const getWeekTotal = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    return timeEntries
      .filter(entry => entry.date >= weekStartStr)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pointage</h1>
          <p className="text-gray-600">
            Suivez votre temps de travail et vos activités
          </p>
        </div>

        {/* Timer principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
              {formatTime(currentTime)}
            </div>
            
            {currentSession && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Décrivez votre tâche..."
                  value={currentSession.task}
                  onChange={(e) => updateCurrentTask(e.target.value)}
                  className="text-lg text-center border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-md w-full"
                />
                <p className="text-sm text-gray-500 mt-2">Projet: {currentSession.project}</p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {!isTracking && !currentSession && (
                <button
                  onClick={handleStartTracking}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play size={20} />
                  Démarrer
                </button>
              )}

              {isTracking && (
                <button
                  onClick={handlePauseTracking}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Pause size={20} />
                  Pause
                </button>
              )}

              {!isTracking && currentSession && (
                <button
                  onClick={handleResumeTracking}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play size={20} />
                  Reprendre
                </button>
              )}

              {currentSession && (
                <button
                  onClick={handleStopTracking}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square size={20} />
                  Arrêter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Timer className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(getTodayTotal() + Math.floor(currentTime / 60))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Cette semaine</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(getWeekTotal())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Moyenne/jour</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(Math.floor(getWeekTotal() / 7))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions et filtres */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <Calendar size={16} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Filter size={16} />
              Filtrer
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        {/* Historique des entrées */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Historique de pointage</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tâche
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.startTime} - {entry.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(entry.duration)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.task}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        Terminé
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackPage;
