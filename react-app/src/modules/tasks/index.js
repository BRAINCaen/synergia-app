// ==========================================
// 📁 react-app/src/modules/tasks/index.js
// EXPORTS CORRIGÉS - Sans conflits
// ==========================================

// ✅ Export default seulement pour éviter les conflits
export { default as TaskForm } from './TaskForm.jsx';
export { default as TaskCard } from './TaskCard.jsx';

// ✅ Pas d'exports nommés supplémentaires
console.log('✅ Modules tasks - Exports propres sans conflits');
