// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx - CORRECTION BUG LIGNE 1869
// PARTIE DU FORMULAIRE SCHEDULEFORM - CORRIGER SYNTAXE JSX
// ==========================================

// 🔧 CORRECTION : Remplacer la section autour de la ligne 1869 par ce code corrigé

{/* FORMULAIRE DE PROGRAMMATION D'ENTRETIEN - SECTION CORRIGÉE */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Type d'entretien *
    </label>
    <select
      value={scheduleForm.type}
      onChange={(e) => setScheduleForm(prev => ({
        ...prev, 
        type: e.target.value, 
        duration: INTERVIEW_TYPES[e.target.value]?.duration || 30
      }))}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    >
      {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
        <option key={key} value={key}>{type.icon} {type.name}</option>
      ))}
    </select>
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Date *
    </label>
    <input
      type="date"
      value={scheduleForm.scheduledDate}
      onChange={(e) => setScheduleForm(prev => ({...prev, scheduledDate: e.target.value}))}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      required
      min={new Date().toISOString().split('T')[0]}
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Heure *
    </label>
    <input
      type="time"
      value={scheduleForm.scheduledTime}
      onChange={(e) => setScheduleForm(prev => ({...prev, scheduledTime: e.target.value}))}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      required
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Durée (minutes)
    </label>
    <select
      value={scheduleForm.duration}
      onChange={(e) => setScheduleForm(prev => ({...prev, duration: parseInt(e.target.value)}))}
      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    >
      <option value={15}>15 minutes</option>
      <option value={30}>30 minutes</option>
      <option value={45}>45 minutes</option>
      <option value={60}>60 minutes</option>
      <option value={90}>90 minutes</option>
      <option value={120}>120 minutes</option>
    </select>
  </div>
</div>

<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Lieu
  </label>
  <input
    type="text"
    value={scheduleForm.location}
    onChange={(e) => setScheduleForm(prev => ({...prev, location: e.target.value}))}
    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    placeholder="Bureau référent, Salle de réunion..."
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Objectifs de l'entretien
  </label>
  <textarea
    value={scheduleForm.objectives}
    onChange={(e) => setScheduleForm(prev => ({...prev, objectives: e.target.value}))}
    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    placeholder="Décrivez les objectifs et points à aborder..."
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Notes additionnelles
  </label>
  <textarea
    value={scheduleForm.notes}
    onChange={(e) => setScheduleForm(prev => ({...prev, notes: e.target.value}))}
    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    placeholder="Notes ou informations complémentaires..."
  />
</div>

{/* BOUTONS D'ACTION */}
<div className="flex space-x-3">
  <button
    type="submit"
    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
  >
    📅 Programmer l'entretien
  </button>
  <button
    type="button"
    onClick={() => {
      setShowScheduleForm(false);
      setSelectedTemplate(null);
    }}
    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
  >
    Annuler
  </button>
</div>
