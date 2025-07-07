// ==========================================
// 📁 react-app/src/shared/components/ui/index.js
// SOLUTION D'URGENCE - Version ultra-minimale pour éliminer "Ql constructor"
// ==========================================

// 🚨 VERSION D'URGENCE - Import React requis
import React from 'react';

console.log('🆘 UI Components - Version d\'urgence ultra-minimale');

// ✅ COMPOSANTS SIMPLES SANS PROPS COMPLEXES
export const Button = ({ children, ...props }) => 
  React.createElement('button', { ...props, style: { padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' } }, children);

export const Loading = () => 
  React.createElement('div', { style: { width: '32px', height: '32px', border: '2px solid #ccc', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' } });

export const Input = (props) => 
  React.createElement('input', { ...props, style: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' } });

// ✅ FALLBACKS ULTRA-SIMPLES POUR ÉVITER LES ERREURS
export const Card = ({ children }) => React.createElement('div', { style: { padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' } }, children);
export const CardHeader = ({ children }) => React.createElement('div', { style: { marginBottom: '12px' } }, children);
export const CardTitle = ({ children }) => React.createElement('h3', { style: { fontSize: '18px', fontWeight: 'bold', margin: '0' } }, children);
export const CardContent = ({ children }) => React.createElement('div', {}, children);
export const CardDescription = ({ children }) => React.createElement('p', { style: { color: '#6b7280', margin: '4px 0' } }, children);
export const CardFooter = ({ children }) => React.createElement('div', { style: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' } }, children);

export const Modal = ({ isOpen, children }) => isOpen ? React.createElement('div', { style: { position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '50' } }, React.createElement('div', { style: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%' } }, children)) : null;

export const Toast = ({ message }) => React.createElement('div', { style: { padding: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '6px', color: '#1e40af' } }, message);

// ✅ HOOKS SIMPLES
export const useToast = () => ({
  success: (msg) => console.log('✅ Toast:', msg),
  error: (msg) => console.error('❌ Toast:', msg),
  warning: (msg) => console.warn('⚠️ Toast:', msg),
  info: (msg) => console.info('ℹ️ Toast:', msg)
});

export const ToastProvider = ({ children }) => children;

// ✅ CSS KEYFRAMES POUR L'ANIMATION
if (typeof window !== 'undefined' && !document.querySelector('#emergency-ui-styles')) {
  const style = document.createElement('style');
  style.id = 'emergency-ui-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

console.log('🆘 UI Components chargés - Version d\'urgence sans conflits');
console.log('🎯 Tous exports définis avec React.createElement pour éviter JSX');
console.log('🚫 AUCUN import externe - AUCUN conflit possible');
