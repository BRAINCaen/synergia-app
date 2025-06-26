// ==========================================
// 📁 react-app/src/shared/components/ui/Input.jsx
// Composant Input CRÉÉ pour résoudre erreur build
// ==========================================

import React from 'react';

const Input = React.forwardRef(({
  className = '',
  type = 'text',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  ...props
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = `
    block w-full px-3 py-2 
    border border-gray-300 rounded-lg
    text-sm text-gray-900
    placeholder:text-gray-500
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `;
  
  const errorClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : '';
  
  const finalClasses = `${baseClasses} ${errorClasses} ${className}`.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={finalClasses}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;
