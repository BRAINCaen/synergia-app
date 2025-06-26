// ==========================================
// 📁 react-app/src/shared/components/ui/index.js
// Index UI RÉPARÉ - Exports uniquement fichiers existants
// ==========================================

// ✅ EXPORTS VÉRIFIÉS - Fichiers qui existent
export { default as Button } from './Button.jsx';
export { default as Loading } from './Loading.jsx';

// ✅ NOUVEAUX COMPOSANTS CRÉÉS POUR FIXER BUILD
export { Input } from './Input.jsx';

// 🔄 COMPOSANTS OPTIONNELS (à créer si nécessaire)
// export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card.jsx';
// export { Modal } from './Modal.jsx';
// export { Toast } from './Toast.jsx';

console.log('✅ UI Components index chargé - Erreurs build résolues');
