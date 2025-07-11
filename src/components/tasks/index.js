// ==========================================
// 📁 react-app/src/components/tasks/index.js
// INDEX DU DOSSIER - PONT vers modules existants
// ==========================================

// ✅ Re-export des composants depuis modules/tasks
export { default as TaskForm } from './TaskForm.jsx';
export { default as TaskCard } from '../../modules/tasks/TaskCard.jsx';

console.log('✅ Components/tasks index - Pont vers modules configuré');
