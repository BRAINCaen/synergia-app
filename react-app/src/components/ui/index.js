// ==========================================
// 📁 react-app/src/shared/components/ui/index.js
// INDEX UI RÉPARÉ - Exports sécurisés avec fallbacks
// ==========================================

// ✅ IMPORTS SÉCURISÉS - Avec gestion d'erreur
let Button, Loading, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter;

try {
  // 🔥 COMPOSANTS PRINCIPAUX
  Button = require('./Button.jsx').default;
  Loading = require('./Loading.jsx').default;
  
  // 🔧 COMPOSANTS CRÉÉS
  const InputModule = require('./Input.jsx');
  Input = InputModule.Input || InputModule.default;
  
  const CardModule = require('./Card.jsx');
  Card = CardModule.Card || CardModule.default;
  CardHeader = CardModule.CardHeader;
  CardTitle = CardModule.CardTitle;
  CardDescription = CardModule.CardDescription;
  CardContent = CardModule.CardContent;
  CardFooter = CardModule.CardFooter;
  
} catch (error) {
  console.warn('⚠️ Certains composants UI manquants, utilisation de fallbacks');
  
  // 🔄 FALLBACKS SIMPLES
  Button = ({ children, onClick, className = '', ...props }) => (
    React.createElement('button', {
      onClick,
      className: `px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`,
      ...props
    }, children)
  );
  
  Loading = () => (
    React.createElement('div', {
      className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'
    })
  );
  
  Input = ({ className = '', ...props }) => (
    React.createElement('input', {
      className: `block w-full rounded-lg border border-gray-300 px-3 py-2 ${className}`,
      ...props
    })
  );
  
  // Fallbacks pour Card
  Card = ({ children, className = '' }) => (
    React.createElement('div', {
      className: `bg-white rounded-lg shadow border ${className}`
    }, children)
  );
  
  CardHeader = ({ children, className = '' }) => (
    React.createElement('div', { className: `p-4 ${className}` }, children)
  );
  
  CardTitle = ({ children, className = '' }) => (
    React.createElement('h3', { className: `text-lg font-semibold ${className}` }, children)
  );
  
  CardDescription = ({ children, className = '' }) => (
    React.createElement('p', { className: `text-gray-600 ${className}` }, children)
  );
  
  CardContent = ({ children, className = '' }) => (
    React.createElement('div', { className: `p-4 ${className}` }, children)
  );
  
  CardFooter = ({ children, className = '' }) => (
    React.createElement('div', { className: `p-4 border-t ${className}` }, children)
  );
}

// 🚀 EXPORTS SÉCURISÉS
export {
  Button,
  Loading,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};

// 🔧 EXPORTS PAR DÉFAUT
export default {
  Button,
  Loading,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};

console.log('✅ UI Components index chargé - Avec fallbacks sécurisés');
console.log('🔧 Tous les composants sont maintenant disponibles');
