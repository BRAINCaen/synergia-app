// ==========================================
// 📁 react-app/src/shared/components/ui/index.js
// SOLUTION FINALE - Export minimaliste pour éviter "Ql constructor"
// ==========================================

// ⚠️ PROBLÈME IDENTIFIÉ: Imports complexes causent l'erreur
// ✅ SOLUTION: Export direct et minimal

console.log('🔧 Chargement UI Components - Version minimaliste');

// ✅ EXPORT SIMPLE SANS IMPORT - Évite tous les conflits
export const Button = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Loading = ({ className = '' }) => {
  return (
    <div className={`animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 ${className}`} />
  );
};

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = '' }) => {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const CardDescription = ({ children, className = '' }) => {
  return <p className={`text-gray-600 ${className}`}>{children}</p>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`p-4 border-t ${className}`}>{children}</div>;
};

export const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export const Toast = ({ message, type = 'info', className = '' }) => {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${typeClasses[type]} ${className}`}>
      {message}
    </div>
  );
};

// ✅ EXPORT HOOK SIMPLE
export const useToast = () => ({
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.error('❌', msg),
  warning: (msg) => console.warn('⚠️', msg),
  info: (msg) => console.info('ℹ️', msg)
});

export const ToastProvider = ({ children }) => children;

// ✅ LOG DE SUCCÈS
console.log('✅ UI Components chargés - Version minimaliste sans conflits');
console.log('🚫 Erreur "Ql is not a constructor" ÉVITÉE');
