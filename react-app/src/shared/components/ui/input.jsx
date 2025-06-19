// src/shared/components/ui/Input.jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
  
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  
  const inputClasses = `${baseClasses} ${errorClasses} ${className}`;
  
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-400 text-sm">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
