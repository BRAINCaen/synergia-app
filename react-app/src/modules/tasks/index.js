// ==========================================
// 📁 react-app/src/modules/tasks/index.js
// EXPORTS SÉCURISÉS SANS CONFLITS
// ==========================================

// ✅ Exports par défaut uniques
export { default as TaskForm } from './TaskForm.jsx';
export { default as TaskCard } from './TaskCard.jsx';

// ✅ Exports nommés alternatifs pour compatibilité
export TaskForm from './TaskForm.jsx';
export TaskCard from './TaskCard.jsx';

console.log('✅ Modules tasks - Exports sécurisés sans conflits');
