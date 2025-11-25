import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  title = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-200';
  
  const variantClasses = {
    primary: disabled ? 'bg-gray-300 text-gray-500' : 'bg-primary hover:bg-primary-dark text-white',
    secondary: disabled ? 'bg-gray-300 text-gray-500' : 'bg-secondary hover:bg-secondary-dark text-white',
    success: disabled ? 'bg-gray-300 text-gray-500' : 'bg-success hover:bg-green-600 text-white',
    danger: disabled ? 'bg-gray-300 text-gray-500' : 'bg-danger hover:bg-red-600 text-white',
    warning: disabled ? 'bg-gray-300 text-gray-500' : 'bg-warning hover:bg-orange-600 text-white',
    outline: disabled ? 'border-2 border-gray-300 text-gray-400' : 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: disabled ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

export default Button;