// ==========================================
// 📁 react-app/src/components/tasks/index.js
// CORRECTION COMPLÈTE - SUPPRESSION DUPLICATION TASKFORM
// ==========================================

// ❌ SUPPRESSION COMPLÈTE de TaskForm pour éviter duplication
// ✅ Export UNIQUEMENT de TaskCard depuis modules
export { default as TaskCard } from '../../modules/tasks/TaskCard.jsx';

// 📝 NOTE : TaskForm est disponible depuis modules/tasks/TaskForm.jsx
// Import correct dans les pages : import TaskForm from '../modules/tasks/TaskForm.jsx';

console.log('✅ Components/tasks index - TaskForm supprimé, TaskCard OK');
